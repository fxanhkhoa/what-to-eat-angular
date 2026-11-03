import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { BehaviorSubject, of } from 'rxjs';

import { FlippingCardPickerComponent } from './flipping-card-picker.component';
import { GameStateService } from '@/app/state/game-state.service';
import { DishService } from '@/app/service/dish.service';
import { ToastService } from '@/app/shared/service/toast.service';
import { Dish, QueryDishDto } from '@/types/dish.type';
import { GameState } from '@/types/game.type';

// ── Stub child components ─────────────────────────────────────────────────────
@Component({ selector: 'app-dish-filter', template: '', standalone: true })
class DishFilterStub {
  @Output() search = new EventEmitter<QueryDishDto>();
}

@Component({ selector: 'app-dish-card', template: '', standalone: true })
class DishCardStub {
  @Input() dish: any;
  @Input() newTab: boolean = false;
}

@Component({ selector: 'app-empty', template: '', standalone: true })
class EmptyStub {}

// ── Helpers ───────────────────────────────────────────────────────────────────
const makeDish = (id: string): Dish =>
  ({ _id: id, slug: id, name: id } as unknown as Dish);

const EMPTY_GAME_STATE: GameState = {
  wheelOfFortune: { selectedItem: null, items: [] },
  flippingCard: { selectedItem: null, items: [] },
};

const STUB_IMPORTS = [
  CommonModule,
  DishFilterStub,
  DishCardStub,
  EmptyStub,
  MatButtonModule,
  MatIconModule,
  MatProgressSpinnerModule,
  MatExpansionModule,
  MatPaginatorModule,
];

describe('FlippingCardPickerComponent', () => {
  let component: FlippingCardPickerComponent;
  let fixture: ComponentFixture<FlippingCardPickerComponent>;
  let gameStateServiceSpy: jasmine.SpyObj<GameStateService>;
  let dishServiceSpy: jasmine.SpyObj<DishService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let gameState$: BehaviorSubject<GameState>;

  beforeEach(async () => {
    gameState$ = new BehaviorSubject<GameState>({ ...EMPTY_GAME_STATE });
    gameStateServiceSpy = jasmine.createSpyObj('GameStateService', [
      'getGameState',
      'updateFlippingCardState',
    ]);
    gameStateServiceSpy.getGameState.and.returnValue(gameState$.asObservable());
    gameStateServiceSpy.updateFlippingCardState.and.stub();

    dishServiceSpy = jasmine.createSpyObj('DishService', ['findAll']);
    dishServiceSpy.findAll.and.returnValue(of({ data: [], count: 0 } as any));

    toastServiceSpy = jasmine.createSpyObj('ToastService', ['showSuccess']);

    await TestBed.configureTestingModule({
      imports: [FlippingCardPickerComponent, NoopAnimationsModule],
      providers: [
        { provide: GameStateService, useValue: gameStateServiceSpy },
        { provide: DishService, useValue: dishServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
      ],
    })
      .overrideComponent(FlippingCardPickerComponent, { set: { imports: STUB_IMPORTS } })
      .compileComponents();

    fixture = TestBed.createComponent(FlippingCardPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Initial state ─────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('should initialise currentPage to 1', () => {
      expect(component.currentPage()).toBe(1);
    });

    it('should initialise limit to 10', () => {
      expect(component.limit()).toBe(10);
    });

    it('should initialise total to 0', () => {
      expect(component.total()).toBe(0);
    });

    it('should initialise loading to false after ngOnInit', () => {
      expect(component.loading()).toBeFalse();
    });

    it('should initialise dishes to empty array', () => {
      expect(component.dishes()).toEqual([]);
    });
  });

  // ── ngOnInit ──────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should call getDishes on init', () => {
      expect(dishServiceSpy.findAll).toHaveBeenCalled();
    });

    it('should call findAll with default page and limit', () => {
      expect(dishServiceSpy.findAll).toHaveBeenCalledWith(
        jasmine.objectContaining({ page: 1, limit: 10 })
      );
    });
  });

  // ── getDishes ─────────────────────────────────────────────────────────────

  describe('getDishes', () => {
    it('should populate dishes from service response', () => {
      const dishes = [makeDish('d1'), makeDish('d2')];
      dishServiceSpy.findAll.and.returnValue(of({ data: dishes, count: 2 } as any));
      component.getDishes();
      expect(component.dishes()).toEqual(dishes);
    });

    it('should set total from service response', () => {
      dishServiceSpy.findAll.and.returnValue(of({ data: [], count: 42 } as any));
      component.getDishes();
      expect(component.total()).toBe(42);
    });

    it('should set loading to false after fetch', () => {
      dishServiceSpy.findAll.and.returnValue(of({ data: [], count: 0 } as any));
      component.getDishes();
      expect(component.loading()).toBeFalse();
    });

    it('should merge dto into findAll call', () => {
      component.dto = { keyword: 'pho' };
      component.getDishes();
      expect(dishServiceSpy.findAll).toHaveBeenCalledWith(
        jasmine.objectContaining({ keyword: 'pho', page: 1, limit: 10 })
      );
    });
  });

  // ── paginatorChange ───────────────────────────────────────────────────────

  describe('paginatorChange', () => {
    it('should update currentPage to pageIndex + 1', () => {
      component.paginatorChange({ pageIndex: 2, pageSize: 10, length: 100 } as PageEvent);
      expect(component.currentPage()).toBe(3);
    });

    it('should update limit from pageSize', () => {
      component.paginatorChange({ pageIndex: 0, pageSize: 25, length: 100 } as PageEvent);
      expect(component.limit()).toBe(25);
    });

    it('should call getDishes after paginator change', () => {
      dishServiceSpy.findAll.calls.reset();
      component.paginatorChange({ pageIndex: 1, pageSize: 10, length: 100 } as PageEvent);
      expect(dishServiceSpy.findAll).toHaveBeenCalledWith(
        jasmine.objectContaining({ page: 2, limit: 10 })
      );
    });
  });

  // ── onSearch ──────────────────────────────────────────────────────────────

  describe('onSearch', () => {
    it('should update dto and call getDishes', () => {
      dishServiceSpy.findAll.calls.reset();
      component.onSearch({ keyword: 'bun bo' });
      expect(component.dto).toEqual({ keyword: 'bun bo' });
      expect(dishServiceSpy.findAll).toHaveBeenCalledWith(
        jasmine.objectContaining({ keyword: 'bun bo' })
      );
    });
  });

  // ── addDish ───────────────────────────────────────────────────────────────

  describe('addDish', () => {
    it('should call updateFlippingCardState with the dish appended to items', () => {
      const existingDish = makeDish('e1');
      gameState$.next({
        ...EMPTY_GAME_STATE,
        flippingCard: { selectedItem: null, items: [existingDish] },
      });
      const newDish = makeDish('new');
      component.addDish(newDish);
      expect(gameStateServiceSpy.updateFlippingCardState).toHaveBeenCalledWith(
        jasmine.objectContaining({
          items: jasmine.arrayContaining([existingDish, newDish]),
        })
      );
    });

    it('should show a success toast after adding', () => {
      component.addDish(makeDish('d1'));
      expect(toastServiceSpy.showSuccess).toHaveBeenCalled();
    });

    it('should preserve selectedItem when adding a dish', () => {
      component.addDish(makeDish('d1'));
      expect(gameStateServiceSpy.updateFlippingCardState).toHaveBeenCalledWith(
        jasmine.objectContaining({ selectedItem: null })
      );
    });
  });

  // ── Template ──────────────────────────────────────────────────────────────

  describe('template', () => {
    it('should render a dish card for each dish', () => {
      dishServiceSpy.findAll.and.returnValue(
        of({ data: [makeDish('t1'), makeDish('t2')], count: 2 } as any)
      );
      component.getDishes();
      fixture.detectChanges();
      const cards = fixture.nativeElement.querySelectorAll('app-dish-card');
      expect(cards.length).toBe(2);
    });

    it('should render the empty component when dishes is empty', () => {
      dishServiceSpy.findAll.and.returnValue(of({ data: [], count: 0 } as any));
      component.getDishes();
      fixture.detectChanges();
      const empty = fixture.nativeElement.querySelector('app-empty');
      expect(empty).toBeTruthy();
    });

    it('should render a paginator', () => {
      const paginator = fixture.nativeElement.querySelector('mat-paginator');
      expect(paginator).toBeTruthy();
    });
  });
});
