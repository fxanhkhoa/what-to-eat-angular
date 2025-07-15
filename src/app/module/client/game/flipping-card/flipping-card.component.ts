import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CardDeckComponent } from './card-deck/card-deck.component';
import { Dish } from '@/types/dish.type';
import { DishService } from '@/app/service/dish.service';
import { GameStateService } from '@/app/state/game-state.service';
import { finalize, of, Subject, switchMap, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { isPlatformServer } from '@angular/common';
import { SelectedDishModalComponent } from '../selected-dish-modal/selected-dish-modal.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FlippingCardPickerComponent } from './flipping-card-picker/flipping-card-picker.component';

@Component({
  selector: 'app-flipping-card',
  imports: [
    CardDeckComponent,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    FlippingCardPickerComponent,
  ],
  templateUrl: './flipping-card.component.html',
  styleUrl: './flipping-card.component.scss',
})
export class FlippingCardComponent implements OnDestroy, OnInit {
  ngOnDestroy(): void {
    this.destroy$.next(null);

    this.gameStateService.updateFlippingCardState({
      selectedItem: null,
      items: this.cards(),
    });
  }

  private dishService = inject(DishService);
  private gameStateService = inject(GameStateService);
  private dialog = inject(MatDialog);
  private platformId = inject(PLATFORM_ID);

  private destroy$ = new Subject();

  cards = signal<Dish[]>([]);
  flippedCards = signal<Dish[]>([]);
  score = signal<number>(0);
  loading = signal<boolean>(false);

  ngOnInit(): void {
    this.initializeGame();
  }

  initializeGame(): void {
    if (isPlatformServer(this.platformId)) {
      this.cards.set([]);
      return;
    }
    console.log('Initializing Flipping Card Game');
    this.loading.set(true);
    this.gameStateService
      .getGameState()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading.set(false)),
        switchMap((state) => {
          if (state.flippingCard.selectedItem) {
            const result = this.dialog.open(SelectedDishModalComponent, {
              data: state.flippingCard.selectedItem,
              width: '80vw',
            });

            result.afterClosed().subscribe((result) => {
              if (result) {
                const newItems = state.flippingCard.items.filter(
                  (e) => e._id !== state.flippingCard.selectedItem?._id
                );
                this.gameStateService.updateFlippingCardState({
                  selectedItem: null,
                  items: newItems,
                });
              }
            });
          }
          if (state.flippingCard.items.length > 0) {
            this.cards.set(state.flippingCard.items);
            this.loading.set(false);
            return of(null);
          } else {
            return this.dishService.findRandom(10);
          }
        })
      )
      .subscribe((res) => {
        if (!res) return;
        this.cards.set(res);
        this.gameStateService.updateFlippingCardState({
          selectedItem: null,
          items: res,
        });
        setTimeout(() => {
          this.shuffleDeck();
        }, 1000); // Delay to allow the initial state to be set before shuffling
        this.loading.set(false);
      });
  }

  shuffleDeck() {
    this.shuffleDeckAnimation(
      document.getElementById('card-deck') as HTMLElement
    );
    const cardList = this.cards();
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardList[i], cardList[j]] = [cardList[j], cardList[i]];
    }
    this.cards.set(cardList);
  }

  flipCardAnimation(cardElement: HTMLElement): void {
    cardElement.classList.add('flip');
    setTimeout(() => {
      cardElement.classList.remove('flip');
    }, 1000); // Duration of the flip animation
  }

  shuffleDeckAnimation(deckElement: HTMLElement): void {
    deckElement.classList.add('shuffle');
    setTimeout(() => {
      deckElement.classList.remove('shuffle');
    }, 1000); // Duration of the shuffle animation
  }

  flipCard(card: Dish): void {
    if (!this.flippedCards().includes(card)) {
      this.flippedCards.set([...this.flippedCards(), card]);
      // Logic to check for matches or handle game state
      this.checkForMatch();
    }
  }

  checkForMatch(): void {
    if (this.flippedCards.length === 2) {
      // Implement match checking logic
      const [firstCard, secondCard] = this.flippedCards();
      if (firstCard.slug === secondCard.slug) {
        this.score.update((prev) => prev + 1);
      }
      // Reset flipped cards after a short delay
      setTimeout(() => {
        this.flippedCards.set([]);
      }, 1000);
    }
  }

  goBack() {
    window.history.back();
  }
}
