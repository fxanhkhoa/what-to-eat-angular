export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  type: ChatMessageType;
  timestamp: number;
  reactions: { [reaction: string]: number };
  roomId: string;
  date?: Date;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: number;
}

export enum ChatMessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
  VOTE = 'vote',
  POLL = 'poll'
}

export enum ChatRoomType {
  VOTE_GAME = '',
  GENERAL = 'general',
  DIRECT = 'direct',
  GROUP = 'group'
}

export interface ChatRoom {
  id: string;
  name: string;
  type: ChatRoomType;
  roomId: string;
  participants: string[];
  onlineUsers: string[];
  typingUsers: string[];
}

export interface SendMessageRequest {
  content: string;
  type: ChatMessageType;
  room: string;
  timestamp: number;
}

export interface JoinChatRoomRequest {
  roomId: string;
  roomType: ChatRoomType;
  timestamp: number;
}

export interface TypingIndicatorRequest {
  senderId: string;
  room: string;
}

export interface MessageHistoryRequest {
  room: string;
  limit: number;
  before: number;
}

export interface MessageReactionRequest {
  messageId: string;
  reaction: string;
  room: string;
  timestamp: number;
}
