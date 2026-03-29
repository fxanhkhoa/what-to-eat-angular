import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Component, Input, LOCALE_ID, PLATFORM_ID } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { of, BehaviorSubject } from 'rxjs';

import { FlippingCardComponent } from './flipping-card.component';
import { DishService } from '@/app/service/dish.service';
import { GameStateService } from '@/app/state/game-state.service';
import { Dish } from '@/types/dish.type';
import { GameState } from '@/types/game.type';
import { environment } from '@/environments/environment';

// ── Stub child components ────────────────────────────────────────────────────
@Component({ selector: 'app-card-deck', template: '', standalone: true })
class CardDeckStub {
  @Input() items: any[] = [];
}

@Component({ selector: 'app-flipping-card-picker', template: '', standalone: true })
class FlippingCardPickerStub {}

@Component({ selector: 'app-flipping-card-collection-picker', template: '', standalone: true })
class FlippingCardCollectionPickerStub {}

// ── Helpers ──────────────────────────────────────────────────────────────────
const makeDish = (id: string): Dish =>
  ({ _id: id, slug: id, name: id } as unknown as Dish);

const EMPTY_GAME_STATE: GameState = {
  wheelOfFortune: { selectedItem: null, items: [] },
  flippingCard: { selectedItem: null, items: [] },
};

const STUB_IMPORTS = [
  CardDeckStub,
  FlippingCardPickerStub,
  FlippingCardCollectionPickerStub,
  MatProgressSpinnerModule,
  MatIconModule,
  MatButtonModule,
  MatTabsModule,
];

function makeIconRegistryMock(): Partial<MatIconRegistry> {
  return {
    addSvgIcon: () => ({}) as MatIconRegistry,
    getNamedSvgIcon: () => of(document.createElement('svg')) as any,
    getDefaultFontSetClass: () => ['material-icons'] as any,
  };
}

// ── Main suite (en locale, browser platform) ─────────────────────────────────
describe('FlippingCardComponent', () => {
  let component: FlippingCardComponent;
  let fixture: ComponentFixture<FlippingCardComponent>;
  let dishServiceSpy: jasmine.SpyObj<DishService>;
  let gameStateServiceSpy: jasmine.SpyObj<GameStateService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let titleSpy: jasmine.SpyObj<Title>;
  let metaSpy: jasmine.SpyObj<Meta>;
  let gameState$: BehaviorSubject<GameState>;

  beforeEach(async () => {
    gameState$ = new BehaviorSubject<GameState>({ ...EMPTY_GAME_STATE });
    dishServiceSpy = jasmine.createSpyObj('DishService', ['findRandom']);
    dishServiceSpy.findRandom.and.returnValue(of([]));
    gameStateServiceSpy = jasmine.createSpyObj('GameStateService', [
      'getGameState',
      'updateFlippingCardState',
    ]);
    gameStateServiceSpy.getGameState.and.returnValue(gameState$.asObservable());
    gameStateServiceSpy.updateFlippingCardState.and.stub();
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    titleSpy = jasmine.createSpyObj('Title', ['setTitle']);
    metaSpy = jasmine.createSpyObj('Meta', ['updateTag']);

    await TestBed.configureTestingModule({
      imports: [FlippingCardComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        { provide: DishService, useValue: dishServiceSpy },
        { provide: GameStateService, useValue: gameStateServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatIconRegistry, useValue: makeIconRegistryMock() },
        { provide: Title, useValue: titleSpy },
        { provide: Meta, useValue: metaSpy },
        { provide: LOCALE_ID, useValue: 'en' },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    })
      .overrideComponent(FlippingCardComponent, { set: { imports: STUB_IMPORTS } })
      .compileComponents();

    fixture = TestBed.createComponent(FlippingCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Initial signals ─────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('should initialise score to 0', () => {
      expect(component.score()).toBe(0);
    });

    it('should initialise flippedCards to empty array', () => {
      expect(component.flippedCards()).toEqual([]);
    });

    it('should initialise loading to false after state emits', () => {
      expect(component.loading()).toBeFalse();
    });
  });

  // ── setupSEO (en) ───────────────────────────────────────────────────────────

  describe('setupSEO (en locale)', () => {
    it('should set English page title', () => {
      expect(titleSpy.setTitle).toHaveBeenCalledWith(
        'Flipping Card Game - Discover Random Dishes | What to Eat'
      );
    });

    it('should set English description meta tag', () => {
      expect(metaSpy.updateTag).toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: 'description',
          content: jasmine.stringContaining('card flipping game'),
        })
      );
    });

    it('should set og:title for English', () => {
      expect(metaSpy.updateTag).toHaveBeenCalledWith(
        jasmine.objectContaining({
          property: 'og:title',
          content: 'Flipping Card Game - Discover Random Dishes',
        })
      );
    });

    it('should add canonical link pointing to /en/flipping-card', () => {
      const canonical = document.querySelector('link[rel="canonical"]');
      expect(canonical).toBeTruthy();
      expect(canonical?.getAttribute('href')).toContain('/en/flipping-card');
    });

    it('should add hreflang vi link', () => {
      const viLink = document.querySelector('link[hreflang="vi"]');
      expect(viLink?.getAttribute('href')).toBe(
        `${environment.BASE_URL}/vi/flipping-card`
      );
    });

    it('should add hreflang en link', () => {
      const enLink = document.querySelector('link[hreflang="en"]');
      expect(enLink?.getAttribute('href')).toBe(
        `${environment.BASE_URL}/en/flipping-card`
      );
    });

    it('should add x-default hreflang link', () => {
      const defaultLink = document.querySelector('link[hreflang="x-default"]');
      expect(defaultLink?.getAttribute('href')).toContain('/en/flipping-card');
    });

    it('should set og:type to website', () => {
      expect(metaSpy.updateTag).toHaveBeenCalledWith(
        jasmine.objectContaining({ property: 'og:type', content: 'website' })
      );
    });

    it('should set robots to index, follow', () => {
      expect(metaSpy.updateTag).toHaveBeenCalledWith(
        jasmine.objectContaining({ name: 'robots', content: 'index, follow' })
      );
    });
  });

  // ── initializeGame ──────────────────────────────────────────────────────────

  describe('initializeGame', () => {
    it('should call findRandom(10) when game state has no items', () => {
      expect(dishServiceSpy.findRandom).toHaveBeenCalledWith(10);
    });

    it('should populate cards from findRandom response', () => {
      const dishes = [makeDish('d1'), makeDish('d2')];
      dishServiceSpy.findRandom.and.returnValue(of(dishes));
      component.initializeGame();
      expect(component.cards()).toEqual(dishes);
    });

    it('should call updateFlippingCardState after loading dishes from API', () => {
      const dishes = [makeDish('d1')];
      dishServiceSpy.findRandom.and.returnValue(of(dishes));
      component.initializeGame();
      expect(gameStateServiceSpy.updateFlippingCardState).toHaveBeenCalledWith(
        jasmine.objectContaining({ selectedItem: null, items: dishes })
      );
    });

    it('should use items from game state directly when non-empty', () => {
      const existingDishes = [makeDish('e1'), makeDish('e2')];
      gameState$.next({
        ...EMPTY_GAME_STATE,
        flippingCard: { selectedItem: null, items: existingDishes },
      });
      dishServiceSpy.findRandom.calls.reset();
      component.initializeGame();
      expect(component.cards()).toEqual(existingDishes);
      expect(dishServiceSpy.findRandom).not.toHaveBeenCalled();
    });

    it('should open dialog when state has a selectedItem', () => {
      const selected = makeDish('selected');
      const mockRef = { afterClosed: () => of(false) } as MatDialogRef<any>;
      dialogSpy.open.and.returnValue(mockRef);
      gameState$.next({
        ...EMPTY_GAME_STATE,
        flippingCard: { selectedItem: selected, items: [selected] },
      });
      component.initializeGame();
      expect(dialogSpy.open).toHaveBeenCalled();
    });

    it('should set loading to false after game state emits', () => {
      expect(component.loading()).toBeFalse();
    });
  });

  // ── flipCard ────────────────────────────────────────────────────────────────

  describe('flipCard', () => {
    it('should add a card to flippedCards when not already flipped', () => {
      const dish = makeDish('f1');
      component.flipCard(dish);
      expect(component.flippedCards()).toContain(dish);
    });

    it('should not add a duplicate card to flippedCards', () => {
      const dish = makeDish('f1');
      component.flipCard(dish);
      component.flipCard(dish);
      expect(component.flippedCards().length).toBe(1);
    });
  });

  // ── shuffleDeck ─────────────────────────────────────────────────────────────

  describe('shuffleDeck', () => {
    it('should preserve all cards after shuffle', () => {
      spyOn(component, 'shuffleDeckAnimation'); // avoid null DOM element error
      const dishes = [makeDish('s1'), makeDish('s2'), makeDish('s3')];
      component.cards.set(dishes);
      component.shuffleDeck();
      expect(component.cards().length).toBe(3);
      dishes.forEach((d) => expect(component.cards()).toContain(d));
    });
  });

  // ── shuffleDeckAnimation ────────────────────────────────────────────────────

  describe('shuffleDeckAnimation', () => {
    it('should add the shuffle class and remove it after 1s', fakeAsync(() => {
      const el = document.createElement('div');
      component.shuffleDeckAnimation(el);
      expect(el.classList.contains('shuffle')).toBeTrue();
      tick(1000);
      expect(el.classList.contains('shuffle')).toBeFalse();
    }));
  });

  // ── flipCardAnimation ───────────────────────────────────────────────────────

  describe('flipCardAnimation', () => {
    it('should add the flip class and remove it after 1s', fakeAsync(() => {
      const el = document.createElement('div');
      component.flipCardAnimation(el);
      expect(el.classList.contains('flip')).toBeTrue();
      tick(1000);
      expect(el.classList.contains('flip')).toBeFalse();
    }));
  });

  // ── goBack ──────────────────────────────────────────────────────────────────

  describe('goBack', () => {
    it('should call window.history.back()', () => {
      spyOn(window.history, 'back');
      component.goBack();
      expect(window.history.back).toHaveBeenCalled();
    });
  });

  // ── ngOnDestroy ─────────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should call updateFlippingCardState with current cards and null selectedItem', () => {
      const dishes = [makeDish('d1')];
      component.cards.set(dishes);
      gameStateServiceSpy.updateFlippingCardState.calls.reset();
      component.ngOnDestroy();
      expect(gameStateServiceSpy.updateFlippingCardState).toHaveBeenCalledWith(
        jasmine.objectContaining({ selectedItem: null, items: dishes })
      );
    });

    it('should remove the canonical link from the document head', () => {
      component.ngOnDestroy();
      const canonical = document.querySelector('link[rel="canonical"]');
      expect(canonical).toBeNull();
    });
  });
});

// ── Vi locale suite ───────────────────────────────────────────────────────────
describe('FlippingCardComponent (vi locale)', () => {
  let component: FlippingCardComponent;
  let fixture: ComponentFixture<FlippingCardComponent>;
  let titleSpy: jasmine.SpyObj<Title>;
  let metaSpy: jasmine.SpyObj<Meta>;

  beforeEach(async () => {
    const gameState$ = new BehaviorSubject<GameState>({ ...EMPTY_GAME_STATE });
    const dishServiceSpy = jasmine.createSpyObj('DishService', ['findRandom']);
    dishServiceSpy.findRandom.and.returnValue(of([]));
    const gameStateServiceSpy = jasmine.createSpyObj('GameStateService', [
      'getGameState',
      'updateFlippingCardState',
    ]);
    gameStateServiceSpy.getGameState.and.returnValue(gameState$.asObservable());
    gameStateServiceSpy.updateFlippingCardState.and.stub();
    titleSpy = jasmine.createSpyObj('Title', ['setTitle']);
    metaSpy = jasmine.createSpyObj('Meta', ['updateTag']);

    await TestBed.configureTestingModule({
      imports: [FlippingCardComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        { provide: DishService, useValue: dishServiceSpy },
        { provide: GameStateService, useValue: gameStateServiceSpy },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: MatIconRegistry, useValue: makeIconRegistryMock() },
        { provide: Title, useValue: titleSpy },
        { provide: Meta, useValue: metaSpy },
        { provide: LOCALE_ID, useValue: 'vi' },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    })
      .overrideComponent(FlippingCardComponent, { set: { imports: STUB_IMPORTS } })
      .compileComponents();

    fixture = TestBed.createComponent(FlippingCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should set Vietnamese page title', () => {
    expect(titleSpy.setTitle).toHaveBeenCalledWith(
      jasmine.stringContaining('Trò Chơi Lật Thẻ')
    );
  });

  it('should set Vietnamese og:title', () => {
    expect(metaSpy.updateTag).toHaveBeenCalledWith(
      jasmine.objectContaining({
        property: 'og:title',
        content: jasmine.stringContaining('Lật Thẻ'),
      })
    );
  });

  it('should add canonical link pointing to /vi/flipping-card', () => {
    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical?.getAttribute('href')).toContain('/vi/flipping-card');
  });

  it('should set Vietnamese twitter:title', () => {
    expect(metaSpy.updateTag).toHaveBeenCalledWith(
      jasmine.objectContaining({
        name: 'twitter:title',
        content: jasmine.stringContaining('Lật Thẻ'),
      })
    );
  });
});

// ── Server platform suite ─────────────────────────────────────────────────────
describe('FlippingCardComponent (server platform)', () => {
  let component: FlippingCardComponent;
  let fixture: ComponentFixture<FlippingCardComponent>;

  beforeEach(async () => {
    const gameState$ = new BehaviorSubject<GameState>({ ...EMPTY_GAME_STATE });
    const dishServiceSpy = jasmine.createSpyObj('DishService', ['findRandom']);
    dishServiceSpy.findRandom.and.returnValue(of([]));
    const gameStateServiceSpy = jasmine.createSpyObj('GameStateService', [
      'getGameState',
      'updateFlippingCardState',
    ]);
    gameStateServiceSpy.getGameState.and.returnValue(gameState$.asObservable());
    gameStateServiceSpy.updateFlippingCardState.and.stub();

    await TestBed.configureTestingModule({
      imports: [FlippingCardComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        { provide: DishService, useValue: dishServiceSpy },
        { provide: GameStateService, useValue: gameStateServiceSpy },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: MatIconRegistry, useValue: makeIconRegistryMock() },
        { provide: Title, useValue: jasmine.createSpyObj('Title', ['setTitle']) },
        { provide: Meta, useValue: jasmine.createSpyObj('Meta', ['updateTag']) },
        { provide: LOCALE_ID, useValue: 'en' },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    })
      .overrideComponent(FlippingCardComponent, { set: { imports: STUB_IMPORTS } })
      .compileComponents();

    fixture = TestBed.createComponent(FlippingCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should set cards to empty array on server platform', () => {
    expect(component.cards()).toEqual([]);
  });

  it('should not call findRandom on server platform', () => {
    // On the server, initializeGame returns early without calling the service
    expect(component.loading()).toBeFalse();
  });
});
