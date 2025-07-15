import { MultiLanguagePipe } from '@/app/pipe/multi-language.pipe';
import { GameStateService } from '@/app/state/game-state.service';
import { Dish } from '@/types/dish.type';
import { CommonModule } from '@angular/common';
import { Component, inject, Input, LOCALE_ID, signal } from '@angular/core';
import { take } from 'rxjs';

@Component({
  selector: 'app-card',
  imports: [MultiLanguagePipe, CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  @Input() card!: Dish;
  @Input() set shuffling(value: boolean) {
    if (value) {
      this.isShuffling.set(true);
      this.isFlipped = true;
    } else {
      this.isShuffling.set(false);
    }
  }

  private gameStateService = inject(GameStateService);
  localeId = inject(LOCALE_ID);

  isShuffling = signal(false);
  isFlipped: boolean = true;

  flipCard() {
    this.isFlipped = !this.isFlipped;
    this.gameStateService
      .getGameState()
      .pipe(take(1))
      .subscribe((gameState) => {
        this.gameStateService.updateFlippingCardState({
          ...gameState.flippingCard,
          selectedItem: this.card,
        });
      });
  }

  getCardValue() {
    return this.isFlipped
      ? this.card.title.find((e) => e.lang === this.localeId)?.data
      : 'Card is face down';
  }
}
