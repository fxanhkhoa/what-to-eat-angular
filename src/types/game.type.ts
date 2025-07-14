import { Dish } from './dish.type';

export type GameItem = {
  imageUrl: string;
  text: string;
};

export type WheelOfFortuneState = {
  selectedItem: Dish | null;
  items: Dish[];
};

export type GameState = {
  wheelOfFortune: WheelOfFortuneState;
};
