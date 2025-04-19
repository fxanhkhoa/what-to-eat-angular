import { BaseType } from './base.type';

export type ResultToken = {
  token: string;
  refreshToken: string;
};

export type JWTTokenPayload = {
  id: string;
  email: string;
  role_name: string;
  google_id: string;
  name: string;
};

export type RetrievedTokenFromRefreshToken = Omit<ResultToken, 'refreshToken'>;

export type RolePermission = {
  name: string;
  permission: string[];
  description?: string;
} & BaseType;
