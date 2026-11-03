import { BaseType, PagingDto } from './base.type';

export type UserDishInteraction = {
  userId: string;
  dishId: string;
  dishSlug: string;
  viewCount: number;
  lastViewedAt?: string;
  cooked: boolean;
  cookedCount: number;
  lastCookedAt?: string;
  rating?: number;
  ratedAt?: string;
  sharedCount: number;
  lastSharedAt?: string;
  interactionScore: number;
} & BaseType;

export type QueryUserDishInteractionDto = {
  userId?: string;
  dishSlug?: string;
  cooked?: boolean;
  minRating?: number;
} & PagingDto;

export type RecordDishViewDto = {
  userId: string;
  dishId: string;
  dishSlug: string;
};

export type RecordDishCookedDto = {
  userId: string;
  dishId: string;
  dishSlug: string;
};

export type RateDishDto = {
  userId: string;
  dishId: string;
  dishSlug: string;
  rating: number; // 1-5
};

export type RecordDishSharedDto = {
  userId: string;
  dishId: string;
  dishSlug: string;
};
