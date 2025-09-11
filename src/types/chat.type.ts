import { ChatRoom } from "./room.type";

export type ChatMessage = {
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

export type ChatUser = {
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
  POLL = 'poll',
}

export enum ChatRoomType {
  VOTE_GAME = '',
  GENERAL = 'general',
  DIRECT = 'direct',
  GROUP = 'group',
}

export type SendMessageRequest = {
  content: string;
  type: ChatMessageType;
  room: string;
  timestamp: number;
}

export type JoinChatRoomRequest = {
  senderId: string;
  senderName: string;
  roomId: string;
  roomType: ChatRoomType;
  timestamp: number;
}

export type TypingIndicatorRequest = {
  senderId: string;
  senderName: string;
  room: string;
}

export type MessageHistoryRequest = {
  room: string;
  limit: number;
  before: number;
}

export type MessageReactionRequest = {
  messageId: string;
  reaction: string;
  room: string;
  timestamp: number;
}

export type ChatRoomUpdated = {
  onlineUsers: string[];
  room: ChatRoom;
};
