import { BaseType, MultiLanguage, PagingDto } from './base.type';

export type Dish = {
  slug: string;
  title: MultiLanguage<string>[];
  shortDescription: MultiLanguage<string>[];
  content: MultiLanguage<string>[];
  tags: string[];
  preparationTime?: number;
  cookingTime?: number;
  difficultLevel?: string;
  mealCategories: string[];
  ingredientCategories: string[];
  thumbnail?: string;
  videos: string[];
  ingredients: IngredientsInDish[];
  relatedDishes: string[];
  labels: string[];
} & BaseType;

export type IngredientsInDish = {
  quantity: number;
  slug: string;
  note: string;
  ingredientId: string;
};

export type CreateDishDto = {
  slug: string;
  title: MultiLanguage<string>[];
  shortDescription: MultiLanguage<string>[];
  content: MultiLanguage<string>[];
  tags: string[];
  preparationTime?: number;
  cookingTime?: number;
  difficultLevel?: string;
  mealCategories: string[];
  ingredientCategories: string[];
  thumbnail?: string;
  videos: string[];
  ingredients: IngredientsInDish[];
  relatedDishes: string[];
  labels: string[];
};

export type UpdateDishDto = {
  id: string;
} & CreateDishDto;

export type QueryDishDto = {
  keyword?: string;
  tags?: string[];
  preparationTimeFrom?: number;
  preparationTimeTo?: number;
  cookingTimeFrom?: number;
  cookingTimeTo?: number;
  difficultLevels?: string[];
  mealCategories?: string[];
  ingredientCategories?: string[];
  ingredients?: string[];
  labels?: string[];
} & PagingDto;
