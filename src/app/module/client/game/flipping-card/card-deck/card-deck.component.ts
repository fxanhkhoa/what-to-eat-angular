import { Dish } from '@/types/dish.type';
import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, signal } from '@angular/core';
import { CardComponent } from '@/app/module/client/game/flipping-card/card/card.component';
import { BehaviorSubject } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-card-deck',
  imports: [CommonModule, CardComponent, MatButtonModule],
  templateUrl: './card-deck.component.html',
  styleUrl: './card-deck.component.scss',
})
export class CardDeckComponent implements OnDestroy {
  @Input() set items(values: Dish[]) {
    this.cards.set(values.map((item) => ({ ...item, flipped: false })));
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
  }

  private destroy$ = new BehaviorSubject<boolean>(false);

  cards = signal<Array<Dish & { flipped: boolean }>>([]);
  shuffling = signal<boolean>(false);
  loading = signal<boolean>(false);

  initializeDeck() {
    this.shuffleDeck();
  }

  shuffleDeck() {
    this.shuffleDeckAnimation(
      document.getElementById('card-deck') as HTMLElement
    );
    const cardList = this.cards();
    for (let i = this.cards().length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      // Swap elements at indices i and j
      const temp = cardList[i];
      cardList[i] = cardList[j];
      cardList[j] = temp;
    }
    this.cards.set(cardList);
  }

  flipCard(card: Dish & { flipped: boolean }) {
    card.flipped = !card.flipped;
  }

  flipCardAnimation(cardElement: HTMLElement): void {
    cardElement.classList.add('flip');
    setTimeout(() => {
      cardElement.classList.remove('flip');
    }, 1500); // Duration of the flip animation
  }

  shuffleDeckAnimation(deckElement: HTMLElement): void {
    this.shuffling.set(true);
    deckElement.classList.add('shuffle-animation');
    setTimeout(() => {
      deckElement.classList.remove('shuffle-animation');
      this.shuffling.set(false);
    }, 1000); // Duration of the shuffle animation
  }
}
