import { Dish } from '@/types/dish.type';
import { GameState, WheelOfFortuneState } from '@/types/game.type';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  private gameState = new BehaviorSubject<GameState>({
    wheelOfFortune: { selectedItem: null, items: [] },
  });

  constructor() {}

  getGameState() {
    return this.gameState.asObservable();
  }

  updateWheelOfFortuneSelectedItem(state: WheelOfFortuneState) {
    const currentState = this.gameState.getValue();
    currentState.wheelOfFortune = state;
    this.gameState.next(currentState);
  }
}
