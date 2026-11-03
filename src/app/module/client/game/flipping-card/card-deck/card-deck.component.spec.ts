import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component, Input, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';

import { CardDeckComponent } from './card-deck.component';
import { Dish } from '@/types/dish.type';
import { GameStateService } from '@/app/state/game-state.service';
import { GameState } from '@/types/game.type';
import { BehaviorSubject } from 'rxjs';

// ── Stub child component ──────────────────────────────────────────────────────
@Component({ selector: 'app-card', template: '', standalone: true })
class CardStub {
  @Input() card: any;
  @Input() shuffling: boolean = false;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const makeDish = (id: string): Dish =>
  ({
    _id: id,
    slug: id,
    thumbnail: '/img/test.jpg',
    title: [{ lang: 'en', data: `Dish ${id}` }],
  } as unknown as Dish);

const EMPTY_GAME_STATE: GameState = {
  wheelOfFortune: { selectedItem: null, items: [] },
  flippingCard: { selectedItem: null, items: [] },
};

describe('CardDeckComponent', () => {
  let component: CardDeckComponent;
  let fixture: ComponentFixture<CardDeckComponent>;
  let gameStateServiceSpy: jasmine.SpyObj<GameStateService>;

  beforeEach(async () => {
    const gameState$ = new BehaviorSubject<GameState>({ ...EMPTY_GAME_STATE });
    gameStateServiceSpy = jasmine.createSpyObj('GameStateService', [
      'getGameState',
      'updateFlippingCardState',
    ]);
    gameStateServiceSpy.getGameState.and.returnValue(gameState$.asObservable());
    gameStateServiceSpy.updateFlippingCardState.and.stub();

    await TestBed.configureTestingModule({
      imports: [CardDeckComponent, NoopAnimationsModule],
      providers: [
        { provide: GameStateService, useValue: gameStateServiceSpy },
        { provide: LOCALE_ID, useValue: 'en' },
      ],
    })
      .overrideComponent(CardDeckComponent, {
        set: { imports: [CommonModule, CardStub, MatButtonModule] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CardDeckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Initial state ─────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('should initialise cards to empty array', () => {
      expect(component.cards()).toEqual([]);
    });

    it('should initialise shuffling to false', () => {
      expect(component.shuffling()).toBeFalse();
    });

    it('should initialise loading to false', () => {
      expect(component.loading()).toBeFalse();
    });
  });

  // ── items @Input setter ───────────────────────────────────────────────────

  describe('items setter', () => {
    it('should map dishes to cards with flipped: false', () => {
      component.items = [makeDish('a'), makeDish('b')];
      expect(component.cards().length).toBe(2);
      component.cards().forEach((c) => expect(c.flipped).toBeFalse());
    });

    it('should replace previous cards when set again', () => {
      component.items = [makeDish('a'), makeDish('b')];
      component.items = [makeDish('c')];
      expect(component.cards().length).toBe(1);
      expect(component.cards()[0]._id).toBe('c');
    });

    it('should set cards to empty array when given an empty list', () => {
      component.items = [];
      expect(component.cards()).toEqual([]);
    });
  });

  // ── shuffleDeck ───────────────────────────────────────────────────────────

  describe('shuffleDeck', () => {
    it('should preserve all cards after a shuffle', () => {
      spyOn(component, 'shuffleDeckAnimation'); // avoid null DOM element
      const dishes = [makeDish('s1'), makeDish('s2'), makeDish('s3')];
      component.items = dishes;
      component.shuffleDeck();
      expect(component.cards().length).toBe(3);
      const ids = component.cards().map((c) => c._id);
      dishes.forEach((d) => expect(ids).toContain(d._id));
    });
  });

  // ── flipCard ──────────────────────────────────────────────────────────────

  describe('flipCard', () => {
    it('should toggle flipped from false to true', () => {
      component.items = [makeDish('f1')];
      const card = component.cards()[0];
      component.flipCard(card);
      expect(card.flipped).toBeTrue();
    });

    it('should toggle flipped from true to false', () => {
      component.items = [makeDish('f1')];
      const card = component.cards()[0];
      card.flipped = true;
      component.flipCard(card);
      expect(card.flipped).toBeFalse();
    });
  });

  // ── flipCardAnimation ─────────────────────────────────────────────────────

  describe('flipCardAnimation', () => {
    it('should add the flip class and remove it after 1.5s', fakeAsync(() => {
      const el = document.createElement('div');
      component.flipCardAnimation(el);
      expect(el.classList.contains('flip')).toBeTrue();
      tick(1500);
      expect(el.classList.contains('flip')).toBeFalse();
    }));
  });

  // ── shuffleDeckAnimation ──────────────────────────────────────────────────

  describe('shuffleDeckAnimation', () => {
    it('should set shuffling to true immediately', fakeAsync(() => {
      const el = document.createElement('div');
      component.shuffleDeckAnimation(el);
      expect(component.shuffling()).toBeTrue();
      tick(1000);
    }));

    it('should add shuffle-animation class to element', fakeAsync(() => {
      const el = document.createElement('div');
      component.shuffleDeckAnimation(el);
      expect(el.classList.contains('shuffle-animation')).toBeTrue();
      tick(1000);
    }));

    it('should remove shuffle-animation class and set shuffling to false after 1s', fakeAsync(() => {
      const el = document.createElement('div');
      component.shuffleDeckAnimation(el);
      tick(1000);
      expect(el.classList.contains('shuffle-animation')).toBeFalse();
      expect(component.shuffling()).toBeFalse();
    }));
  });

  // ── initializeDeck ────────────────────────────────────────────────────────

  describe('initializeDeck', () => {
    it('should call shuffleDeck', () => {
      spyOn(component, 'shuffleDeck');
      component.initializeDeck();
      expect(component.shuffleDeck).toHaveBeenCalled();
    });
  });

  // ── ngOnDestroy ───────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should complete without errors', () => {
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  // ── Template ──────────────────────────────────────────────────────────────

  describe('template', () => {
    it('should render one app-card per card', () => {
      component.items = [makeDish('t1'), makeDish('t2'), makeDish('t3')];
      fixture.detectChanges();
      const cards = fixture.nativeElement.querySelectorAll('app-card');
      expect(cards.length).toBe(3);
    });

    it('should render no app-card elements when cards is empty', () => {
      component.items = [];
      fixture.detectChanges();
      const cards = fixture.nativeElement.querySelectorAll('app-card');
      expect(cards.length).toBe(0);
    });

    it('should render a shuffle button', () => {
      const btn = fixture.nativeElement.querySelector('button');
      expect(btn).toBeTruthy();
    });
  });
});
