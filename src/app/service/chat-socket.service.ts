import { inject, Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { SocketService } from './socket.service'; // Use existing socket service
import {
  ChatMessage,
  ChatUser,
  ChatMessageType,
  ChatRoomType,
  SendMessageRequest,
  JoinChatRoomRequest,
  TypingIndicatorRequest,
  MessageHistoryRequest,
  MessageReactionRequest,
  ChatRoomUpdated,
} from '@/types/chat.type';

@Injectable({
  providedIn: 'root',
})
export class ChatSocketService {
  private socketService = inject(SocketService);
  private currentChatRoom: string | null = null;
  private typingTimer: any = null;

  // Published properties (using BehaviorSubject for reactive state)
  public messages$ = new BehaviorSubject<ChatMessage[]>([]);
  public onlineUsers$ = new BehaviorSubject<ChatUser[]>([]);
  public typingUsers$ = new BehaviorSubject<string[]>([]);
  public newMessage$ = new Subject<ChatMessage>();
  public connectionError$ = new BehaviorSubject<string | null>(null);
  public isConnected$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.initializeConnection();
  }

  // Initialize socket connection using existing SocketService
  private initializeConnection(): void {
    // Use the existing socket service
    this.setupSocketListeners();
    this.observeConnectionStatus();
    this.setStatusFirstTime();
  }

  private setStatusFirstTime(): void {
    this.isConnected$.next(this.socketService.getSocket()?.connected || false);
  }

  // Setup all socket event listeners
  private setupSocketListeners(): void {
    const socket = this.socketService.getSocket();
    if (!socket) return;

    // Chat message events
    socket.on('message_received', (message: ChatMessage) => {
      this.handleNewMessage(message);
    });

    socket.on('message_history', (data: { messages: ChatMessage[] }) => {
      this.handleMessageHistory(data.messages);
    });

    // User presence events
    socket.on('user_joined_chat', (user: any) => {
      this.handleUserJoinedChat(user);
    });

    socket.on('user_left_chat', (data: { userId: string }) => {
      this.handleUserLeftChat(data.userId);
    });

    // Typing events
    socket.on(
      'user_typing_start',
      (data: { userId: string; userName: string }) => {
        this.handleUserStartedTyping(data.userId);
      }
    );

    socket.on('user_typing_stop', (data: { userId: string }) => {
      this.handleUserStoppedTyping(data.userId);
    });

    // Reaction events
    socket.on(
      'message_reaction_updated',
      (data: { messageId: string; reactions: { [key: string]: number } }) => {
        this.handleMessageReactionUpdated(data.messageId, data.reactions);
      }
    );

    // Room events
    socket.on('chat_room_updated', (data: ChatRoomUpdated) => {
      data.onlineUsers.forEach((userId) => {
        if (!this.onlineUsers$.value.find((user) => user.id === userId)) {
          this.onlineUsers$.next([
            ...this.onlineUsers$.value,
            { id: userId, name: '', isOnline: true },
          ]);
        }
      });
    });
  }

  // Observe connection status
  private observeConnectionStatus(): void {
    this.socketService.getConnectionState().subscribe((state) => {
      const isConnected = state === 'connected';
      this.isConnected$.next(isConnected);

      if (isConnected) {
        this.connectionError$.next(null);
      } else if (state === 'error') {
        this.connectionError$.next('Connection failed');
      } else if (state === 'disconnected') {
        this.connectionError$.next('Chat disconnected');
        this.onlineUsers$.next([]);
        this.typingUsers$.next([]);
      }
    });
  }

  // Public methods for chat functionality

  /**
   * Join a chat room
   */
  joinChatRoom(
    roomId: string,
    roomType: ChatRoomType = ChatRoomType.VOTE_GAME,
    senderId: string,
    senderName: string
  ): void {
    const socket = this.socketService.getSocket();
    if (!socket) return;

    const roomName = `${roomType}${roomId}`;

    if (this.currentChatRoom) {
      this.leaveChatRoom(senderId);
    }

    this.currentChatRoom = roomName;

    const joinData: JoinChatRoomRequest = {
      senderId,
      senderName,
      roomId,
      roomType,
      timestamp: Date.now() / 1000,
    };

    socket.emit('join_chat_room', joinData);
  }

  /**
   * Leave current chat room
   */
  leaveChatRoom(senderId: string, roomName?: string): void {
    const socket = this.socketService.getSocket();
    if (!socket) return;

    const room = roomName || this.currentChatRoom;
    if (!room) return;

    socket.emit('leave_chat_room', { room, senderId });

    if (room === this.currentChatRoom) {
      this.currentChatRoom = null;
      this.messages$.next([]);
      this.onlineUsers$.next([]);
      this.typingUsers$.next([]);
    }

    console.log('Left chat room:', room);
  }

  /**
   * Send a message
   */
  sendMessage(
    content: string,
    messageType: ChatMessageType = ChatMessageType.TEXT,
    userData: {
      senderId: string;
      senderName?: string | null;
      senderAvatar?: string | null;
    }
  ): void {
    const socket = this.socketService.getSocket();
    if (!socket || !this.currentChatRoom || !content.trim()) return;

    const messageData: SendMessageRequest = {
      content: content.trim(),
      type: messageType,
      room: this.currentChatRoom,
      timestamp: Date.now() / 1000,
      ...userData,
    };

    socket.emit('send_message', messageData);
    console.log('Sent message to room:', this.currentChatRoom);
  }

  /**
   * Start typing indicator
   */
  startTyping(senderId: string, senderName: string): void {
    const socket = this.socketService.getSocket();
    if (!socket || !this.currentChatRoom) return;

    const typingData: TypingIndicatorRequest = {
      senderId: senderId,
      senderName: senderName,
      room: this.currentChatRoom,
    };

    socket.emit('typing_start', typingData);

    // Auto-stop typing after 3 seconds
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
    this.typingTimer = setTimeout(() => {
      this.stopTyping(senderId, senderName);
    }, 3000);
  }

  /**
   * Stop typing indicator
   */
  stopTyping(senderId: string, senderName: string): void {
    const socket = this.socketService.getSocket();
    if (!socket || !this.currentChatRoom) return;

    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
      this.typingTimer = null;
    }

    const typingData: TypingIndicatorRequest = {
      senderId,
      senderName,
      room: this.currentChatRoom,
    };

    socket.emit('typing_stop', typingData);
  }

  /**
   * Load message history
   */
  loadMessageHistory(limit: number = 50): void {
    const socket = this.socketService.getSocket();
    if (!socket || !this.currentChatRoom) return;

    const currentMessages = this.messages$.value;
    const historyData: MessageHistoryRequest = {
      room: this.currentChatRoom,
      limit,
      before:
        currentMessages && currentMessages.length > 0
          ? currentMessages[0].timestamp
          : Date.now() / 1000,
    };

    socket.emit('get_message_history', historyData);
  }

  /**
   * React to a message
   */
  reactToMessage(messageId: string, reaction: string): void {
    const socket = this.socketService.getSocket();
    if (!socket || !this.currentChatRoom) return;

    const reactionData: MessageReactionRequest = {
      messageId,
      reaction,
      room: this.currentChatRoom,
      timestamp: Date.now() / 1000,
    };

    socket.emit('message_reaction', reactionData);
    console.log('Reacted to message:', messageId, 'with', reaction);
  }

  // Event handlers

  private handleNewMessage(message: ChatMessage): void {
    const currentMessages = this.messages$.value;
    const updatedMessages = [...currentMessages, message].sort(
      (a, b) => a.timestamp - b.timestamp
    );

    this.messages$.next(updatedMessages);
    this.newMessage$.next(message);

    console.log('Received new message from:', message.senderName);
  }

  private handleMessageHistory(historyMessages: ChatMessage[]): void {
    const currentMessages = this.messages$.value;

    // Filter out duplicates and prepend history messages
    const uniqueMessages = historyMessages
      ? historyMessages.filter(
          (historyMsg) =>
            !currentMessages.some((msg) => msg.id === historyMsg.id)
        )
      : [];

    const allMessages = [...uniqueMessages, ...currentMessages].sort(
      (a, b) => a.timestamp - b.timestamp
    );
    this.messages$.next(allMessages);

    console.log(
      'Loaded message history:',
      historyMessages ? historyMessages.length : 0,
      'messages'
    );
  }

  private handleUserJoinedChat(userData: any): void {
    const currentUsers = this.onlineUsers$.value;
    const user: ChatUser = {
      id: userData.userId,
      name: userData.userName || 'Anonymous',
      avatar: userData.avatar,
      isOnline: true,
    };

    if (!currentUsers.some((u) => u.id === user.id)) {
      this.onlineUsers$.next([...currentUsers, user]);
    }

    console.log('User joined chat:', user.name);
  }

  private handleUserLeftChat(userId: string): void {
    const currentUsers = this.onlineUsers$.value;
    const updatedUsers = currentUsers.filter((u) => u.id !== userId);
    this.onlineUsers$.next(updatedUsers);

    const currentTyping = this.typingUsers$.value;
    const updatedTyping = currentTyping.filter((id) => id !== userId);
    this.typingUsers$.next(updatedTyping);

    console.log('User left chat:', userId);
  }

  private handleUserStartedTyping(userId: string): void {
    const currentTyping = this.typingUsers$.value;
    if (!currentTyping.includes(userId)) {
      this.typingUsers$.next([...currentTyping, userId]);
    }
  }

  private handleUserStoppedTyping(userId: string): void {
    const currentTyping = this.typingUsers$.value;
    const updatedTyping = currentTyping.filter((id) => id !== userId);
    this.typingUsers$.next(updatedTyping);
  }

  private handleMessageReactionUpdated(
    messageId: string,
    reactions: { [key: string]: number }
  ): void {
    const currentMessages = this.messages$.value;
    const updatedMessages = currentMessages.map((message) =>
      message.id === messageId ? { ...message, reactions } : message
    );
    this.messages$.next(updatedMessages);

    console.log('Updated reactions for message:', messageId);
  }

  private rejoinChatRoomAfterReconnection(
    senderId: string,
    senderName: string
  ): void {
    if (!this.currentChatRoom) return;

    // Extract room type and ID from current room name
    const voteGameMatch = this.currentChatRoom.match(/^(.+?)(\d+)$/);
    if (voteGameMatch) {
      const roomType =
        (voteGameMatch[1] as ChatRoomType) || ChatRoomType.VOTE_GAME;
      const roomId = voteGameMatch[2];

      this.joinChatRoom(roomId, roomType, senderId, senderName);
      this.loadMessageHistory();

      console.log(
        'Rejoined chat room after reconnection:',
        this.currentChatRoom
      );
    }
  }

  // Utility methods

  getCurrentRoom(): string | null {
    return this.currentChatRoom;
  }

  isConnected(): boolean {
    return this.isConnected$.value;
  }

  // Clean up on destroy
  disconnect(senderId: string): void {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }

    // Leave current chat room if any
    if (this.currentChatRoom) {
      this.leaveChatRoom(senderId);
    }

    this.currentChatRoom = null;
    this.messages$.next([]);
    this.onlineUsers$.next([]);
    this.typingUsers$.next([]);
    this.isConnected$.next(false);
  }
}
