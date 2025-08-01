// src/types/contact.type.ts
import { BaseType, PagingDto } from './base.type';

export type Contact = {
  email: string;
  name: string;
  message: string;
  deleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  createdAt?: string;
  createdBy?: string;
  _id: string;
} & BaseType;

export type CreateContactDto = {
  email: string;
  name: string;
  message: string;
};

export type UpdateContactDto = {
  _id: string;
} & CreateContactDto;

export type QueryContactDto = {
  keyword?: string;
} & PagingDto;
