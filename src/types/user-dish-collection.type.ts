import { BaseType, PagingDto } from './base.type';

// UserDishCollection represents a user's custom collection of dishes for specific occasions
export type UserDishCollection = {
  userId: string;
  name: string;
  description?: string;
  occasion?: string; // e.g., "birthday", "anniversary", "holiday", "party"
  eventDate?: string; // ISO 8601 date string
  dishSlugs: string[];
  tags?: string[];
  isPublic: boolean;
  color?: string; // Optional color for UI display
  icon?: string; // Optional icon name for UI display
  sortOrder: number;
} & BaseType;

// QueryUserDishCollectionDto is used for querying user dish collections
export type QueryUserDishCollectionDto = {
  userId?: string;
  occasion?: string;
  tags?: string[];
  isPublic?: boolean;
  keyword?: string; // Search in name and description
} & PagingDto;

// CreateUserDishCollectionDto is used for creating a new dish collection
export type CreateUserDishCollectionDto = {
  userId: string;
  name: string;
  description?: string;
  occasion?: string;
  eventDate?: string; // ISO 8601 date string
  dishSlugs: string[];
  tags?: string[];
  isPublic: boolean;
  color?: string;
  icon?: string;
  sortOrder: number;
};

// UpdateUserDishCollectionDto is used for updating a dish collection
export type UpdateUserDishCollectionDto = {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  occasion?: string;
  eventDate?: string; // ISO 8601 date string
  dishSlugs: string[];
  tags?: string[];
  isPublic: boolean;
  color?: string;
  icon?: string;
  sortOrder: number;
};

// AddDishToCollectionDto is used for adding a dish to a collection
export type AddDishToCollectionDto = {
  userId: string;
  collectionId: string;
  dishSlug: string;
};

// RemoveDishFromCollectionDto is used for removing a dish from a collection
export type RemoveDishFromCollectionDto = {
  userId: string;
  collectionId: string;
  dishSlug: string;
};

// ReorderDishesInCollectionDto is used for reordering dishes within a collection
export type ReorderDishesInCollectionDto = {
  userId: string;
  collectionId: string;
  dishSlugs: string[]; // New order of dish slugs
};

// DuplicateCollectionDto is used for duplicating an existing collection
export type DuplicateCollectionDto = {
  userId: string;
  collectionId: string;
  newName: string;
  copyPublic: boolean; // Whether to copy the public setting
};

// ShareCollectionDto is used for sharing a collection
export type ShareCollectionDto = {
  userId: string;
  collectionId: string;
  shareWithUserIds?: string[]; // Optional: specific users to share with
};
