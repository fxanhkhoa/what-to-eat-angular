import { BaseType } from './base.type';

export type DishVoteItem = {
  slug: string;
  voteUser: string[];
  voteAnonymous: string[];
  isCustom: boolean;
};

export type DishVote = {
  _id: string;
  title: string;
  description: string;
  dishVoteItems: DishVoteItem[];
} & BaseType;

export type DishVoteFilter = {
  keyword?: string | null;
};

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
