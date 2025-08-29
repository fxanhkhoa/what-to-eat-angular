import { BaseType } from './base.type';

export type User = {
  email: string;
  password?: string | null;
  name?: string | null;
  dateOfBirth?: string | null; // ISO string
  address?: string | null;
  phone?: string | null;
  googleID?: string | null;
  facebookID?: string | null;
  appleID?: string | null;
  githubID?: string | null;
  avatar?: string | null;
  roleName: string;
} & BaseType;

export interface QueryUserDto {
  keyword: string;
  email: string;
  phoneNumber: string;
  roleName: string[];
}

export interface CreateUserDto {
  email: string;
  password?: string | null;
  name?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  phone?: string | null;
  googleID?: string | null;
  facebookID?: string | null;
  appleID?: string | null;
  githubID?: string | null;
  avatar?: string | null;
}

export interface UpdateUserDto {
  id: string;
  email: string;
  name?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  phone?: string | null;
  googleID?: string | null;
  facebookID?: string | null;
  appleID?: string | null;
  githubID?: string | null;
  avatar?: string | null;
}
