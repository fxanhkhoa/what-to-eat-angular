import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { ChatSocketService } from './chat-socket.service';
import { SocketService } from './socket.service';
import { ChatMessageType, ChatRoomType } from '@/types/chat.type';

function makeMessage(id: string, timestamp = 1000): any {
  return {
    id,
    content: 'hello',
    senderId: 'u1',
    senderName: 'User1',
    type: ChatMessageType.TEXT,
    timestamp,
    reactions: {},
    roomId: 'room-1',
  };
}

describe('ChatSocketService', () => {
  let service: ChatSocketService;
  let socketEvents: Record<string, Function>;
  let emittedEvents: { event: string; data: any }[];
  let mockSocket: any;
  let connectionState$: Subject<string>;

  beforeEach(() => {
    socketEvents = {};
    emittedEvents = [];
    connectionState$ = new Subject<string>();
    mockSocket = {
      connected: false,
      on: (event: string, handler: Function) => {
        socketEvents[event] = handler;
      },
      emit: (event: string, data: any) => {
        emittedEvents.push({ event, data });
      },
    };

    const socketServiceStub = {
      getSocket: () => mockSocket,
      getConnectionState: () => connectionState$.asObservable(),
    };

    TestBed.configureTestingModule({
      providers: [
        ChatSocketService,
        { provide: SocketService, useValue: socketServiceStub },
      ],
    });

    service = TestBed.inject(ChatSocketService);
  });

  // ── creation / initial state ───────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize messages$ as empty', () => {
    expect(service.messages$.value).toEqual([]);
  });

  it('should initialize onlineUsers$ as empty', () => {
    expect(service.onlineUsers$.value).toEqual([]);
  });

  it('should initialize typingUsers$ as empty', () => {
    expect(service.typingUsers$.value).toEqual([]);
  });

  it('should initialize connectionError$ as null', () => {
    expect(service.connectionError$.value).toBeNull();
  });

  it('should initialize isConnected$ from socket.connected (false)', () => {
    expect(service.isConnected$.value).toBe(false);
  });

  it('should initialize getCurrentRoom() as null', () => {
    expect(service.getCurrentRoom()).toBeNull();
  });

  // ── observeConnectionStatus ────────────────────────────────────────────────

  it('should set isConnected$ true when state is "connected"', () => {
    connectionState$.next('connected');
    expect(service.isConnected$.value).toBe(true);
  });

  it('should clear connectionError$ when state is "connected"', () => {
    connectionState$.next('error');
    connectionState$.next('connected');
    expect(service.connectionError$.value).toBeNull();
  });

  it('should set connectionError$ to "Connection failed" when state is "error"', () => {
    connectionState$.next('error');
    expect(service.connectionError$.value).toBe('Connection failed');
  });

  it('should set connectionError$ to "Chat disconnected" when state is "disconnected"', () => {
    connectionState$.next('disconnected');
    expect(service.connectionError$.value).toBe('Chat disconnected');
  });

  it('should clear onlineUsers$ and typingUsers$ when state is "disconnected"', () => {
    service.onlineUsers$.next([{ id: 'u1', name: 'Alice', isOnline: true }]);
    service.typingUsers$.next(['u1']);
    connectionState$.next('disconnected');
    expect(service.onlineUsers$.value).toEqual([]);
    expect(service.typingUsers$.value).toEqual([]);
  });

  it('should set isConnected$ false when state is "disconnected"', () => {
    connectionState$.next('connected');
    connectionState$.next('disconnected');
    expect(service.isConnected$.value).toBe(false);
  });

  // ── socket event: message_received ────────────────────────────────────────

  it('should add message to messages$ on message_received', () => {
    const msg = makeMessage('m1', 1000);
    socketEvents['message_received'](msg);
    expect(service.messages$.value).toContain(msg);
  });

  it('should emit on newMessage$ on message_received', (done) => {
    const msg = makeMessage('m1', 1000);
    service.newMessage$.subscribe((m) => {
      expect(m).toEqual(msg);
      done();
    });
    socketEvents['message_received'](msg);
  });

  it('should sort messages by timestamp after message_received', () => {
    socketEvents['message_received'](makeMessage('b', 2000));
    socketEvents['message_received'](makeMessage('a', 1000));
    expect(service.messages$.value[0].id).toBe('a');
    expect(service.messages$.value[1].id).toBe('b');
  });

  // ── socket event: message_history ─────────────────────────────────────────

  it('should load history messages and sort by timestamp', () => {
    socketEvents['message_history']({
      messages: [makeMessage('h2', 800), makeMessage('h1', 500)],
    });
    expect(service.messages$.value.length).toBe(2);
    expect(service.messages$.value[0].id).toBe('h1');
  });

  it('should deduplicate history messages already in messages$', () => {
    const dup = makeMessage('dup', 500);
    service.messages$.next([dup]);
    socketEvents['message_history']({ messages: [dup, makeMessage('new', 600)] });
    expect(service.messages$.value.filter((m) => m.id === 'dup').length).toBe(1);
    expect(service.messages$.value.length).toBe(2);
  });

  it('should handle null history messages gracefully', () => {
    socketEvents['message_history']({ messages: null });
    expect(service.messages$.value).toEqual([]);
  });

  // ── socket event: user_joined_chat ────────────────────────────────────────

  it('should add user to onlineUsers$ on user_joined_chat', () => {
    socketEvents['user_joined_chat']({ userId: 'u1', userName: 'Alice' });
    expect(service.onlineUsers$.value.length).toBe(1);
    expect(service.onlineUsers$.value[0].id).toBe('u1');
    expect(service.onlineUsers$.value[0].name).toBe('Alice');
  });

  it('should use "Anonymous" when userName is missing in user_joined_chat', () => {
    socketEvents['user_joined_chat']({ userId: 'u1' });
    expect(service.onlineUsers$.value[0].name).toBe('Anonymous');
  });

  it('should not add duplicate user on user_joined_chat', () => {
    socketEvents['user_joined_chat']({ userId: 'u1', userName: 'Alice' });
    socketEvents['user_joined_chat']({ userId: 'u1', userName: 'Alice' });
    expect(service.onlineUsers$.value.length).toBe(1);
  });

  it('should mark joined user as online', () => {
    socketEvents['user_joined_chat']({ userId: 'u1', userName: 'Alice' });
    expect(service.onlineUsers$.value[0].isOnline).toBe(true);
  });

  // ── socket event: user_left_chat ──────────────────────────────────────────

  it('should remove user from onlineUsers$ on user_left_chat', () => {
    socketEvents['user_joined_chat']({ userId: 'u1', userName: 'Alice' });
    socketEvents['user_left_chat']({ userId: 'u1' });
    expect(service.onlineUsers$.value.length).toBe(0);
  });

  it('should remove user from typingUsers$ on user_left_chat', () => {
    service.typingUsers$.next(['u1', 'u2']);
    socketEvents['user_left_chat']({ userId: 'u1' });
    expect(service.typingUsers$.value).toEqual(['u2']);
  });

  it('should not affect other users when a different user leaves', () => {
    socketEvents['user_joined_chat']({ userId: 'u1', userName: 'Alice' });
    socketEvents['user_joined_chat']({ userId: 'u2', userName: 'Bob' });
    socketEvents['user_left_chat']({ userId: 'u2' });
    expect(service.onlineUsers$.value.length).toBe(1);
    expect(service.onlineUsers$.value[0].id).toBe('u1');
  });

  // ── socket event: user_typing_start / stop ────────────────────────────────

  it('should add userId to typingUsers$ on user_typing_start', () => {
    socketEvents['user_typing_start']({ userId: 'u1', userName: 'Alice' });
    expect(service.typingUsers$.value).toContain('u1');
  });

  it('should not add duplicate userId to typingUsers$', () => {
    socketEvents['user_typing_start']({ userId: 'u1', userName: 'Alice' });
    socketEvents['user_typing_start']({ userId: 'u1', userName: 'Alice' });
    expect(service.typingUsers$.value.length).toBe(1);
  });

  it('should remove userId from typingUsers$ on user_typing_stop', () => {
    service.typingUsers$.next(['u1', 'u2']);
    socketEvents['user_typing_stop']({ userId: 'u1' });
    expect(service.typingUsers$.value).toEqual(['u2']);
  });

  // ── socket event: message_reaction_updated ────────────────────────────────

  it('should update reactions for the matching message', () => {
    service.messages$.next([makeMessage('m1')]);
    socketEvents['message_reaction_updated']({ messageId: 'm1', reactions: { '👍': 3 } });
    expect(service.messages$.value[0].reactions).toEqual({ '👍': 3 });
  });

  it('should not modify other messages when reaction is updated', () => {
    service.messages$.next([makeMessage('m1'), makeMessage('m2')]);
    socketEvents['message_reaction_updated']({ messageId: 'm1', reactions: { '❤️': 1 } });
    expect(service.messages$.value[1].reactions).toEqual({});
  });

  // ── socket event: chat_room_updated ───────────────────────────────────────

  it('should add new online users from chat_room_updated', () => {
    socketEvents['chat_room_updated']({ onlineUsers: ['u1', 'u2'], room: {} });
    expect(service.onlineUsers$.value.length).toBe(2);
  });

  it('should not duplicate online users from chat_room_updated', () => {
    socketEvents['chat_room_updated']({ onlineUsers: ['u1'], room: {} });
    socketEvents['chat_room_updated']({ onlineUsers: ['u1'], room: {} });
    expect(service.onlineUsers$.value.length).toBe(1);
  });

  it('should set isOnline true and empty name for users from chat_room_updated', () => {
    socketEvents['chat_room_updated']({ onlineUsers: ['u1'], room: {} });
    const user = service.onlineUsers$.value[0];
    expect(user.isOnline).toBe(true);
    expect(user.name).toBe('');
  });

  // ── joinChatRoom() ────────────────────────────────────────────────────────

  it('should emit join_chat_room and set currentChatRoom', () => {
    service.joinChatRoom('123', ChatRoomType.VOTE_GAME, 'u1', 'Alice');
    const joinEmit = emittedEvents.find((e) => e.event === 'join_chat_room');
    expect(joinEmit).toBeDefined();
    expect(service.getCurrentRoom()).toBe('123'); // VOTE_GAME prefix is ''
  });

  it('should set currentChatRoom to roomType+roomId', () => {
    service.joinChatRoom('42', ChatRoomType.GENERAL, 'u1', 'Alice');
    expect(service.getCurrentRoom()).toBe('general42');
  });

  it('should include correct join data in emit', () => {
    service.joinChatRoom('99', ChatRoomType.VOTE_GAME, 'u1', 'Alice');
    const joinEmit = emittedEvents.find((e) => e.event === 'join_chat_room')!;
    expect(joinEmit.data.senderId).toBe('u1');
    expect(joinEmit.data.senderName).toBe('Alice');
    expect(joinEmit.data.roomId).toBe('99');
    expect(joinEmit.data.roomType).toBe(ChatRoomType.VOTE_GAME);
  });

  it('should leave previous room before joining a new one', () => {
    service.joinChatRoom('room1', ChatRoomType.VOTE_GAME, 'u1', 'Alice');
    emittedEvents = [];
    service.joinChatRoom('room2', ChatRoomType.VOTE_GAME, 'u1', 'Alice');
    expect(emittedEvents.find((e) => e.event === 'leave_chat_room')).toBeDefined();
  });

  // ── leaveChatRoom() ───────────────────────────────────────────────────────

  it('should emit leave_chat_room', () => {
    service.joinChatRoom('room1', ChatRoomType.VOTE_GAME, 'u1', 'Alice');
    emittedEvents = [];
    service.leaveChatRoom('u1');
    expect(emittedEvents.find((e) => e.event === 'leave_chat_room')).toBeDefined();
  });

  it('should reset messages$, onlineUsers$, typingUsers$ after leaving current room', () => {
    service.joinChatRoom('room1', ChatRoomType.VOTE_GAME, 'u1', 'Alice');
    service.messages$.next([makeMessage('m1')]);
    service.onlineUsers$.next([{ id: 'u1', name: 'Alice', isOnline: true }]);
    service.typingUsers$.next(['u1']);
    service.leaveChatRoom('u1');
    expect(service.messages$.value).toEqual([]);
    expect(service.onlineUsers$.value).toEqual([]);
    expect(service.typingUsers$.value).toEqual([]);
  });

  it('should set currentChatRoom to null after leaving', () => {
    service.joinChatRoom('room1', ChatRoomType.VOTE_GAME, 'u1', 'Alice');
    service.leaveChatRoom('u1');
    expect(service.getCurrentRoom()).toBeNull();
  });

  it('should NOT reset state when leaving a different (non-current) room', () => {
    service.joinChatRoom('room1', ChatRoomType.VOTE_GAME, 'u1', 'Alice');
    service.messages$.next([makeMessage('m1')]);
    service.leaveChatRoom('u1', 'other-room');
    expect(service.messages$.value.length).toBe(1);
  });

  it('should do nothing when leaveChatRoom called with no current room', () => {
    expect(() => service.leaveChatRoom('u1')).not.toThrow();
    expect(emittedEvents.find((e) => e.event === 'leave_chat_room')).toBeUndefined();
  });

  // ── sendMessage() ─────────────────────────────────────────────────────────

  it('should emit send_message with correct content', () => {
    service.joinChatRoom('room1', ChatRoomType.VOTE_GAME, 'u1', 'Alice');
    emittedEvents = [];
    service.sendMessage('Hello', ChatMessageType.TEXT, { senderId: 'u1', senderName: 'Alice' });
    const sendEmit = emittedEvents.find((e) => e.event === 'send_message');
    expect(sendEmit).toBeDefined();
    expect(sendEmit!.data.content).toBe('Hello');
  });

  it('should trim whitespace from message content', () => {
    service.joinChatRoom('room1', ChatRoomType.VOTE_GAME, 'u1', 'Alice');
    emittedEvents = [];
    service.sendMessage('  Hi  ', ChatMessageType.TEXT, { senderId: 'u1' });
    const sendEmit = emittedEvents.find((e) => e.event === 'send_message');
    expect(sendEmit!.data.content).toBe('Hi');
  });

  it('should not emit send_message for whitespace-only content', () => {
    service.joinChatRoom('room1', ChatRoomType.VOTE_GAME, 'u1', 'Alice');
    emittedEvents = [];
    service.sendMessage('   ', ChatMessageType.TEXT, { senderId: 'u1' });
    expect(emittedEvents.find((e) => e.event === 'send_message')).toBeUndefined();
  });

  it('should not emit send_message when no currentChatRoom', () => {
    service.sendMessage('Hello', ChatMessageType.TEXT, { senderId: 'u1' });
    expect(emittedEvents.find((e) => e.event === 'send_message')).toBeUndefined();
  });

  it('should include senderId in send_message data', () => {
    service.joinChatRoom('room1', ChatRoomType.VOTE_GAME, 'u1', 'Alice');
    emittedEvents = [];
    service.sendMessage('Hi', ChatMessageType.TEXT, { senderId: 'u1', senderName: 'Alice' });
    const sendEmit = emittedEvents.find((e) => e.event === 'send_message')!;
    expect(sendEmit.data.senderId).toBe('u1');
  });

  // ── startTyping() / stopTyping() ──────────────────────────────────────────

  it('should emit typing_start when in a room', () => {
    service.joinChatRoom('room1', ChatRoomType.VOTE_GAME, 'u1', 'Alice');
    emittedEvents = [];
    service.startTyping('u1', 'Alice');
    expect(emittedEvents.find((e) => e.event === 'typing_start')).toBeDefined();
  });

  it('should not emit typing_start when no currentChatRoom', () => {
    service.startTyping('u1', 'Alice');
    expect(emittedEvents.find((e) => e.event === 'typing_start')).toBeUndefined();
  });

  it('should auto-stop typing after 3 seconds', fakeAsync(() => {
    service.joinChatRoom('room1', ChatRoomType.VOTE_GAME, 'u1', 'Alice');
    emittedEvents = [];
    service.startTyping('u1', 'Alice');
    tick(3000);
    expect(emittedEvents.find((e) => e.event === 'typing_stop')).toBeDefined();
  }));

  it('should emit typing_stop when stopTyping called manually', () => {
    service.joinChatRoom('room1', ChatRoomType.VOTE_GAME, 'u1', 'Alice');
    emittedEvents = [];
    service.stopTyping('u1', 'Alice');
    expect(emittedEvents.find((e) => e.event === 'typing_stop')).toBeDefined();
  });

  it('should not emit typing_stop when no currentChatRoom', () => {
    service.stopTyping('u1', 'Alice');
    expect(emittedEvents.find((e) => e.event === 'typing_stop')).toBeUndefined();
  });

  // ── loadMessageHistory() ──────────────────────────────────────────────────

  it('should emit get_message_history with correct room and limit', () => {
    service.joinChatRoom('room1', ChatRoomType.VOTE_GAME, 'u1', 'Alice');
    emittedEvents = [];
    service.loadMessageHistory(20);
    const histEmit = emittedEvents.find((e) => e.event === 'get_message_history');
    expect(histEmit).toBeDefined();
    expect(histEmit!.data.limit).toBe(20);
    expect(histEmit!.data.room).toBe('room1');
  });

  it('should use first message timestamp as "before" when messages exist', () => {
    service.joinChatRoom('room1', ChatRoomType.VOTE_GAME, 'u1', 'Alice');
    service.messages$.next([makeMessage('m1', 500), makeMessage('m2', 1000)]);
    emittedEvents = [];
    service.loadMessageHistory();
    const histEmit = emittedEvents.find((e) => e.event === 'get_message_history')!;
    expect(histEmit.data.before).toBe(500);
  });

  it('should not emit get_message_history when no currentChatRoom', () => {
    service.loadMessageHistory();
    expect(emittedEvents.find((e) => e.event === 'get_message_history')).toBeUndefined();
  });

  // ── reactToMessage() ──────────────────────────────────────────────────────

  it('should emit message_reaction with correct data', () => {
    service.joinChatRoom('room1', ChatRoomType.VOTE_GAME, 'u1', 'Alice');
    emittedEvents = [];
    service.reactToMessage('m1', '👍');
    const reactionEmit = emittedEvents.find((e) => e.event === 'message_reaction');
    expect(reactionEmit).toBeDefined();
    expect(reactionEmit!.data.messageId).toBe('m1');
    expect(reactionEmit!.data.reaction).toBe('👍');
  });

  it('should not emit message_reaction when no currentChatRoom', () => {
    service.reactToMessage('m1', '👍');
    expect(emittedEvents.find((e) => e.event === 'message_reaction')).toBeUndefined();
  });

  // ── isConnected() ─────────────────────────────────────────────────────────

  it('should return false from isConnected() initially', () => {
    expect(service.isConnected()).toBe(false);
  });

  it('should return true from isConnected() after connected state', () => {
    connectionState$.next('connected');
    expect(service.isConnected()).toBe(true);
  });

  // ── disconnect() ──────────────────────────────────────────────────────────

  it('should reset all state on disconnect()', () => {
    service.joinChatRoom('room1', ChatRoomType.VOTE_GAME, 'u1', 'Alice');
    service.messages$.next([makeMessage('m1')]);
    service.onlineUsers$.next([{ id: 'u1', name: 'Alice', isOnline: true }]);
    service.typingUsers$.next(['u1']);
    connectionState$.next('connected');

    service.disconnect('u1');

    expect(service.messages$.value).toEqual([]);
    expect(service.onlineUsers$.value).toEqual([]);
    expect(service.typingUsers$.value).toEqual([]);
    expect(service.isConnected$.value).toBe(false);
    expect(service.getCurrentRoom()).toBeNull();
  });

  it('should emit leave_chat_room on disconnect() when in a room', () => {
    service.joinChatRoom('room1', ChatRoomType.VOTE_GAME, 'u1', 'Alice');
    emittedEvents = [];
    service.disconnect('u1');
    expect(emittedEvents.find((e) => e.event === 'leave_chat_room')).toBeDefined();
  });

  it('should not throw when disconnect() called with no current room', () => {
    expect(() => service.disconnect('u1')).not.toThrow();
  });
});
