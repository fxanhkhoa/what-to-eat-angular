// Types for Dish Analytics API response

export interface DishAvgTimes {
  _id: string | null;
  avgCookingTime: number;
  avgPreparationTime: number;
}

export interface DishCategoryDistribution {
  _id: string | null;
  count: number;
}

export interface DishDifficultyLevel {
  _id: string | null;
  count: number;
}

export interface DishAnalyze {
  avgTimes: DishAvgTimes[];
  categoryDistribution: DishCategoryDistribution[];
  difficultyLevels: DishDifficultyLevel[];
}
