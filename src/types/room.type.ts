// Chat Room Types
export enum ChatRoomType {
  VOTE_GAME = 'voteGame',
  GENERAL = 'general',
  DIRECT = 'direct',
  GROUP = 'group',
}

export interface ChatRoom {
  id?: string; // MongoDB ObjectId as string
  name: string;
  type: ChatRoomType | string; // Can be enum or custom string
  roomId: string; // External reference ID (e.g., vote game ID)
  participants: string[]; // User IDs
  onlineUsers: string[];
  typingUsers: string[];
  createdAt: Date | string; // Can be Date object or ISO string
  updatedAt: Date | string;
  deleted: boolean;
}

// Additional types for chat room operations
export interface CreateChatRoomRequest {
  name: string;
  type: ChatRoomType | string;
  roomId: string;
  participants?: string[];
}

export interface UpdateChatRoomRequest {
  name?: string;
  participants?: string[];
  onlineUsers?: string[];
  typingUsers?: string[];
}

export interface ChatRoomQuery {
  type?: ChatRoomType | string;
  roomId?: string;
  participant?: string; // User ID to find rooms they're in
  limit?: number;
  offset?: number;
}
