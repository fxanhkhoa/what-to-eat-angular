import { Dish } from '@/types/dish.type';
import {
  FlippingCardState,
  GameState,
  WheelOfFortuneState,
} from '@/types/game.type';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  private gameState = new BehaviorSubject<GameState>({
    wheelOfFortune: { selectedItem: null, items: [] },
    flippingCard: { selectedItem: null, items: [] },
  });

  constructor() {}

  getGameState() {
    return this.gameState.asObservable();
  }
  
  updateWheelOfFortuneState(state: WheelOfFortuneState) {
    const currentState = this.gameState.getValue();
    const newState = { ...currentState, wheelOfFortune: state };
    this.gameState.next(newState);
  }

  updateFlippingCardState(state: FlippingCardState) {
    const currentState = this.gameState.getValue();
    const newState = { ...currentState, flippingCard: state };
    this.gameState.next(newState);
  }
}
