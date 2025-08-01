import { BaseType, PagingDto } from './base.type';

export type DishVoteItem = {
  slug: string;
  customTitle?: string;
  voteUser: string[];
  voteAnonymous: string[];
  isCustom: boolean;
};

export type DishVote = {
  title: string;
  description: string;
  dishVoteItems: DishVoteItem[];
} & BaseType;

export type DishVoteFilter = {
  keyword?: string;
} & PagingDto;

export type CreateDishVoteDto = {
  title?: string;
  description?: string;
  dishVoteItems: DishVoteItem[];
};

export type UpdateDishVoteDto = {
  _id: string;
  title?: string;
  description?: string;
  dishVoteItems: DishVoteItem[];
};
