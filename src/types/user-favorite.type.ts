import { BaseType, PagingDto } from './base.type';

export type UserFavorite = {
  userId: string;
  dishId: string;
  dishSlug: string;
} & BaseType;

export type CreateUserFavoriteDto = {
  userId: string;
  dishId: string;
  dishSlug: string;
};

export type QueryUserFavoriteDto = {
  userId?: string;
  dishSlug?: string;
} & PagingDto;
