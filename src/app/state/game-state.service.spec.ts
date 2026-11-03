import { TestBed } from '@angular/core/testing';
import { GameStateService } from './game-state.service';
import { GameState } from '@/types/game.type';
import { Dish } from '@/types/dish.type';

const mockDish: Dish = {
  _id: 'd1',
  slug: 'pho',
  title: [{ lang: 'en', data: 'Pho' }],
  shortDescription: [],
  content: [],
  tags: [],
  mealCategories: [],
  ingredientCategories: [],
  videos: [],
  ingredients: [],
  relatedDishes: [],
  labels: [],
  deleted: false,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const mockDish2: Dish = { ...mockDish, _id: 'd2', slug: 'bun-bo' };

describe('GameStateService', () => {
  let service: GameStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameStateService);
  });

  // ── creation ──────────────────────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── getGameState() — initial state ────────────────────────────────────────

  it('should emit the initial state with empty wheel and card items', (done) => {
    service.getGameState().subscribe((state) => {
      expect(state.wheelOfFortune.selectedItem).toBeNull();
      expect(state.wheelOfFortune.items).toEqual([]);
      expect(state.flippingCard.selectedItem).toBeNull();
      expect(state.flippingCard.items).toEqual([]);
      done();
    });
  });

  it('should return an Observable', () => {
    const obs = service.getGameState();
    expect(typeof obs.subscribe).toBe('function');
  });

  // ── updateWheelOfFortuneState() ───────────────────────────────────────────

  it('should update the wheel of fortune state', (done) => {
    const newWheelState = { selectedItem: mockDish, items: [mockDish, mockDish2] };
    service.updateWheelOfFortuneState(newWheelState);

    service.getGameState().subscribe((state) => {
      expect(state.wheelOfFortune).toEqual(newWheelState);
      done();
    });
  });

  it('should preserve the flipping card state when updating wheel state', (done) => {
    const cardState = { selectedItem: mockDish2, items: [mockDish2] };
    service.updateFlippingCardState(cardState);

    service.updateWheelOfFortuneState({ selectedItem: mockDish, items: [mockDish] });

    service.getGameState().subscribe((state) => {
      expect(state.flippingCard).toEqual(cardState);
      done();
    });
  });

  it('should allow clearing the wheel selected item', (done) => {
    service.updateWheelOfFortuneState({ selectedItem: mockDish, items: [mockDish] });
    service.updateWheelOfFortuneState({ selectedItem: null, items: [] });

    service.getGameState().subscribe((state) => {
      expect(state.wheelOfFortune.selectedItem).toBeNull();
      expect(state.wheelOfFortune.items).toEqual([]);
      done();
    });
  });

  it('should update the wheel selected item', (done) => {
    service.updateWheelOfFortuneState({ selectedItem: mockDish, items: [mockDish] });

    service.getGameState().subscribe((state) => {
      expect(state.wheelOfFortune.selectedItem).toEqual(mockDish);
      done();
    });
  });

  // ── updateFlippingCardState() ─────────────────────────────────────────────

  it('should update the flipping card state', (done) => {
    const newCardState = { selectedItem: mockDish2, items: [mockDish, mockDish2] };
    service.updateFlippingCardState(newCardState);

    service.getGameState().subscribe((state) => {
      expect(state.flippingCard).toEqual(newCardState);
      done();
    });
  });

  it('should preserve the wheel state when updating card state', (done) => {
    const wheelState = { selectedItem: mockDish, items: [mockDish] };
    service.updateWheelOfFortuneState(wheelState);

    service.updateFlippingCardState({ selectedItem: mockDish2, items: [mockDish2] });

    service.getGameState().subscribe((state) => {
      expect(state.wheelOfFortune).toEqual(wheelState);
      done();
    });
  });

  it('should allow clearing the card selected item', (done) => {
    service.updateFlippingCardState({ selectedItem: mockDish, items: [mockDish] });
    service.updateFlippingCardState({ selectedItem: null, items: [] });

    service.getGameState().subscribe((state) => {
      expect(state.flippingCard.selectedItem).toBeNull();
      expect(state.flippingCard.items).toEqual([]);
      done();
    });
  });

  it('should update the card selected item', (done) => {
    service.updateFlippingCardState({ selectedItem: mockDish2, items: [mockDish2] });

    service.getGameState().subscribe((state) => {
      expect(state.flippingCard.selectedItem).toEqual(mockDish2);
      done();
    });
  });

  // ── independent updates ───────────────────────────────────────────────────

  it('should emit a new state object on each update', () => {
    const emitted: GameState[] = [];
    service.getGameState().subscribe((s) => emitted.push(s));

    service.updateWheelOfFortuneState({ selectedItem: mockDish, items: [mockDish] });
    service.updateFlippingCardState({ selectedItem: mockDish2, items: [mockDish2] });

    // initial + 2 updates
    expect(emitted.length).toBe(3);
    expect(emitted[1].wheelOfFortune.selectedItem).toEqual(mockDish);
    expect(emitted[2].flippingCard.selectedItem).toEqual(mockDish2);
  });
});
