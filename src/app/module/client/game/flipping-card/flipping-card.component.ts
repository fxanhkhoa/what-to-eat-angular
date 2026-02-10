import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
  DOCUMENT,
  LOCALE_ID,
} from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
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
import { MatTabsModule } from '@angular/material/tabs';
import { FlippingCardPickerComponent } from './flipping-card-picker/flipping-card-picker.component';
import { FlippingCardCollectionPickerComponent } from './flipping-card-collection-picker/flipping-card-collection-picker.component';
import { environment } from '@/environments/environment';

@Component({
  selector: 'app-flipping-card',
  imports: [
    CardDeckComponent,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    FlippingCardPickerComponent,
    FlippingCardCollectionPickerComponent,
  ],
  templateUrl: './flipping-card.component.html',
  styleUrl: './flipping-card.component.scss',
})
export class FlippingCardComponent implements OnDestroy, OnInit {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private document = inject(DOCUMENT);
  private localeId = inject(LOCALE_ID);

  ngOnDestroy(): void {
    this.removeCanonicalLink();
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
    this.setupSEO();
    this.initializeGame();
  }

  initializeGame(): void {
    if (isPlatformServer(this.platformId)) {
      this.cards.set([]);
      return;
    }
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

  private setupSEO(): void {
    const isVietnamese = this.localeId === 'vi';

    if (isVietnamese) {
      this.titleService.setTitle(
        'Trò Chơi Lật Thẻ - Tìm Món Ăn Ngẫu Nhiên | What to Eat'
      );

      this.metaService.updateTag({
        name: 'description',
        content:
          'Chơi trò lật thẻ thú vị để khám phá món ăn mới. Thử thách trí nhớ và tìm ra những món ăn ngon được giấu sau các lá bài.',
      });

      this.metaService.updateTag({
        name: 'keywords',
        content:
          'trò chơi lật thẻ, game món ăn, trò chơi ẩm thực, game tìm món ăn, lật bài, trò chơi trí nhớ, game việt nam',
      });

      // Open Graph tags
      this.metaService.updateTag({
        property: 'og:title',
        content: 'Trò Chơi Lật Thẻ - Tìm Món Ăn Ngẫu Nhiên',
      });

      this.metaService.updateTag({
        property: 'og:description',
        content:
          'Chơi trò lật thẻ thú vị để khám phá món ăn mới. Thử thách trí nhớ và tìm ra những món ăn ngon được giấu sau các lá bài.',
      });

      // Twitter Card tags
      this.metaService.updateTag({
        name: 'twitter:title',
        content: 'Trò Chơi Lật Thẻ - Tìm Món Ăn Ngẫu Nhiên',
      });

      this.metaService.updateTag({
        name: 'twitter:description',
        content:
          'Chơi trò lật thẻ thú vị để khám phá món ăn mới. Thử thách trí nhớ và tìm ra những món ăn ngon.',
      });
    } else {
      this.titleService.setTitle(
        'Flipping Card Game - Discover Random Dishes | What to Eat'
      );

      this.metaService.updateTag({
        name: 'description',
        content:
          'Play the exciting card flipping game to discover new dishes. Challenge your memory and find delicious foods hidden behind the cards.',
      });

      this.metaService.updateTag({
        name: 'keywords',
        content:
          'flipping card game, food game, culinary game, dish discovery game, card matching, memory game, food finder',
      });

      // Open Graph tags
      this.metaService.updateTag({
        property: 'og:title',
        content: 'Flipping Card Game - Discover Random Dishes',
      });

      this.metaService.updateTag({
        property: 'og:description',
        content:
          'Play the exciting card flipping game to discover new dishes. Challenge your memory and find delicious foods hidden behind the cards.',
      });

      // Twitter Card tags
      this.metaService.updateTag({
        name: 'twitter:title',
        content: 'Flipping Card Game - Discover Random Dishes',
      });

      this.metaService.updateTag({
        name: 'twitter:description',
        content:
          'Play the exciting card flipping game to discover new dishes. Challenge your memory and find delicious foods.',
      });
    }

    // Common meta tags
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({
      property: 'og:site_name',
      content: 'What to Eat',
    });
    this.metaService.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this.metaService.updateTag({ name: 'robots', content: 'index, follow' });

    this.addOrUpdateCanonicalLink();
    this.addHrefLangLinks();
  }

  private addOrUpdateCanonicalLink() {
    // Remove existing canonical link if it exists
    const existingCanonical = this.document.querySelector(
      'link[rel="canonical"]'
    );
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Add new canonical link with proper URL based on locale and dish slug
    const link = this.document.createElement('link');
    link.setAttribute('rel', 'canonical');

    // Get dish slug from current route
    const baseUrl = environment.BASE_URL;
    let canonicalUrl = baseUrl;

    if (this.localeId.startsWith('vi')) {
      canonicalUrl = `${baseUrl}/vi/flipping-card`;
    } else {
      canonicalUrl = `${baseUrl}/en/flipping-card`;
    }

    link.setAttribute('href', canonicalUrl);
    this.document.head.appendChild(link);
  }

  private addHrefLangLinks() {
    // Remove existing hreflang links if they exist
    const existingHrefLangs = this.document.querySelectorAll(
      'link[rel="alternate"][hreflang]'
    );
    existingHrefLangs.forEach((link) => link.remove());

    const baseUrl = environment.BASE_URL;

    // Add Vietnamese version
    const viLink = this.document.createElement('link');
    viLink.setAttribute('rel', 'alternate');
    viLink.setAttribute('hreflang', 'vi');
    viLink.setAttribute('href', `${baseUrl}/vi/flipping-card`);
    this.document.head.appendChild(viLink);

    // Add English version
    const enLink = this.document.createElement('link');
    enLink.setAttribute('rel', 'alternate');
    enLink.setAttribute('hreflang', 'en');
    enLink.setAttribute('href', `${baseUrl}/en/flipping-card`);
    this.document.head.appendChild(enLink);

    // Add x-default for default language
    const defaultLink = this.document.createElement('link');
    defaultLink.setAttribute('rel', 'alternate');
    defaultLink.setAttribute('hreflang', 'x-default');
    defaultLink.setAttribute('href', `${baseUrl}/en/flipping-card`);
    this.document.head.appendChild(defaultLink);
  }

  private removeCanonicalLink(): void {
    const head = this.document.querySelector('head');
    const existingCanonical = head?.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      head?.removeChild(existingCanonical);
    }
  }
}
