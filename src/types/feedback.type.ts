// src/types/feedback.type.ts
import { PagingDto } from './base.type';

export type Feedback = {
  id: string;
  userId?: string;
  userName?: string;
  email: string;
  rating: number;
  comment: string;
  page?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateFeedbackDto = {
  userName?: string;
  email: string;
  rating: number;
  comment: string;
  page?: string;
  userAgent?: string;
};

export type UpdateFeedbackDto = {
  rating?: number;
  comment?: string;
};

export type FeedbackListDto = {
  rating?: number;
  email?: string;
} & PagingDto;

export type FeedbackPaginationResponse = {
  data: Feedback[];
  metadata: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
};
