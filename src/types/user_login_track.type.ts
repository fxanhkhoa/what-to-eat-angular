import { PagingDto } from './base.type';

export type UserLoginTrack = {
  userId: string;
  loginAt: string; // ISO string, use Date if you want auto-conversion
  ip: string;
  userAgent: string;
};

export type QueryUserLoginTrackDto = {
  userId?: string;
} & PagingDto;
