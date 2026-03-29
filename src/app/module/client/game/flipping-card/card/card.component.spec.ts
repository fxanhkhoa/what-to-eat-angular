import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, BehaviorSubject } from 'rxjs';

import { CardComponent } from './card.component';
import { GameStateService } from '@/app/state/game-state.service';
import { Dish } from '@/types/dish.type';
import { GameState } from '@/types/game.type';

// ── Helpers ──────────────────────────────────────────────────────────────────
const makeDish = (id: string): Dish =>
  ({
    _id: id,
    slug: id,
    thumbnail: '/img/test.jpg',
    title: [
      { lang: 'en', data: `Dish EN ${id}` },
      { lang: 'vi', data: `Dish VI ${id}` },
    ],
  } as unknown as Dish);

const EMPTY_GAME_STATE: GameState = {
  wheelOfFortune: { selectedItem: null, items: [] },
  flippingCard: { selectedItem: null, items: [] },
};

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;
  let gameStateServiceSpy: jasmine.SpyObj<GameStateService>;
  let gameState$: BehaviorSubject<GameState>;

  beforeEach(async () => {
    gameState$ = new BehaviorSubject<GameState>({ ...EMPTY_GAME_STATE });
    gameStateServiceSpy = jasmine.createSpyObj('GameStateService', [
      'getGameState',
      'updateFlippingCardState',
    ]);
    gameStateServiceSpy.getGameState.and.returnValue(gameState$.asObservable());
    gameStateServiceSpy.updateFlippingCardState.and.stub();

    await TestBed.configureTestingModule({
      imports: [CardComponent, NoopAnimationsModule],
      providers: [
        { provide: GameStateService, useValue: gameStateServiceSpy },
        { provide: LOCALE_ID, useValue: 'en' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    component.card = makeDish('d1');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Initial state ───────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('should default isFlipped to true', () => {
      expect(component.isFlipped).toBeTrue();
    });

    it('should default isShuffling to false', () => {
      expect(component.isShuffling()).toBeFalse();
    });
  });

  // ── shuffling @Input setter ─────────────────────────────────────────────────

  describe('shuffling setter', () => {
    it('should set isShuffling to true and isFlipped to true when value is true', () => {
      component.shuffling = true;
      expect(component.isShuffling()).toBeTrue();
      expect(component.isFlipped).toBeTrue();
    });

    it('should set isShuffling to false when value is false', () => {
      component.shuffling = true;
      component.shuffling = false;
      expect(component.isShuffling()).toBeFalse();
    });

    it('should not change isFlipped when value is false', () => {
      component.isFlipped = false;
      component.shuffling = false;
      expect(component.isFlipped).toBeFalse();
    });
  });

  // ── flipCard ────────────────────────────────────────────────────────────────

  describe('flipCard', () => {
    it('should toggle isFlipped from true to false', () => {
      component.isFlipped = true;
      component.flipCard();
      expect(component.isFlipped).toBeFalse();
    });

    it('should toggle isFlipped from false to true', () => {
      component.isFlipped = false;
      component.flipCard();
      expect(component.isFlipped).toBeTrue();
    });

    it('should call getGameState once', () => {
      component.flipCard();
      expect(gameStateServiceSpy.getGameState).toHaveBeenCalled();
    });

    it('should call updateFlippingCardState with the current card as selectedItem', () => {
      const dish = makeDish('flip1');
      component.card = dish;
      component.flipCard();
      expect(gameStateServiceSpy.updateFlippingCardState).toHaveBeenCalledWith(
        jasmine.objectContaining({ selectedItem: dish })
      );
    });

    it('should preserve existing flippingCard state fields when updating', () => {
      const existingItems = [makeDish('e1')];
      gameState$.next({
        ...EMPTY_GAME_STATE,
        flippingCard: { selectedItem: null, items: existingItems },
      });
      component.flipCard();
      expect(gameStateServiceSpy.updateFlippingCardState).toHaveBeenCalledWith(
        jasmine.objectContaining({ items: existingItems })
      );
    });
  });

  // ── getCardValue ────────────────────────────────────────────────────────────

  describe('getCardValue', () => {
    it('should return the English title when isFlipped is true and locale is en', () => {
      component.isFlipped = true;
      expect(component.getCardValue()).toBe('Dish EN d1');
    });

    it('should return "Card is face down" when isFlipped is false', () => {
      component.isFlipped = false;
      expect(component.getCardValue()).toBe('Card is face down');
    });

    it('should return undefined for a locale with no matching title entry', () => {
      component.isFlipped = true;
      (component as any).localeId = 'fr';
      expect(component.getCardValue()).toBeUndefined();
    });

    it('should return the Vietnamese title when localeId is overridden to vi', () => {
      component.isFlipped = true;
      (component as any).localeId = 'vi';
      expect(component.getCardValue()).toBe('Dish VI d1');
    });
  });

  // ── Template ────────────────────────────────────────────────────────────────

  describe('template', () => {
    it('should render the card thumbnail', () => {
      const img = fixture.nativeElement.querySelector('.card-front img');
      expect(img).toBeTruthy();
      expect(img.getAttribute('src')).toBe('/img/test.jpg');
    });

    it('should apply the "flipped" CSS class when isFlipped is true', () => {
      component.isFlipped = true;
      fixture.detectChanges();
      const card = fixture.nativeElement.querySelector('.card');
      expect(card.classList.contains('flipped')).toBeTrue();
    });

    it('should not apply the "flipped" CSS class when isFlipped is false', () => {
      component.isFlipped = false;
      fixture.detectChanges();
      const card = fixture.nativeElement.querySelector('.card');
      expect(card.classList.contains('flipped')).toBeFalse();
    });

    it('should show the card-result title when isFlipped is false', () => {
      component.isFlipped = false;
      fixture.detectChanges();
      const result = fixture.nativeElement.querySelector('.card-result p');
      expect(result).toBeTruthy();
      expect(result.textContent).toContain('Dish EN d1');
    });

    it('should hide the card-result when isFlipped is true', () => {
      component.isFlipped = true;
      fixture.detectChanges();
      const result = fixture.nativeElement.querySelector('.card-result');
      expect(result).toBeNull();
    });
  });
});
