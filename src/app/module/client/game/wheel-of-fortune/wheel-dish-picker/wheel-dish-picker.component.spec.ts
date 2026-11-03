import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, EventEmitter, Input, NO_ERRORS_SCHEMA, Output } from '@angular/core';
import { of } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { WheelDishPickerComponent } from './wheel-dish-picker.component';
import { DishService } from '@/app/service/dish.service';
import { GameStateService } from '@/app/state/game-state.service';
import { ToastService } from '@/app/shared/service/toast.service';
import { Dish } from '@/types/dish.type';
import { GameState } from '@/types/game.type';

@Component({ selector: 'app-dish-filter', template: '', standalone: true })
class DishFilterStub {
  @Output() search = new EventEmitter<any>();
}

@Component({ selector: 'app-dish-card', template: '', standalone: true })
class DishCardStub {
  @Input() dish: any;
  @Input() newTab = false;
}

@Component({ selector: 'app-empty', template: '', standalone: true })
class EmptyStub {}

function makeDish(id: string): Dish {
  return { _id: id, slug: `dish-${id}`, title: [] } as unknown as Dish;
}

function makeGameState(items: Dish[] = []): GameState {
  return {
    wheelOfFortune: { selectedItem: null, items },
    flippingCard: { selectedItem: null, items: [] },
  };
}

describe('WheelDishPickerComponent', () => {
  let component: WheelDishPickerComponent;
  let fixture: ComponentFixture<WheelDishPickerComponent>;
  let dishService: jasmine.SpyObj<DishService>;
  let gameStateService: jasmine.SpyObj<GameStateService>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    dishService = jasmine.createSpyObj('DishService', ['findAll']);
    dishService.findAll.and.returnValue(
      of({ data: [makeDish('1'), makeDish('2')], count: 20 })
    );

    gameStateService = jasmine.createSpyObj('GameStateService', [
      'getGameState',
      'updateWheelOfFortuneState',
    ]);
    gameStateService.getGameState.and.returnValue(of(makeGameState()));

    toastService = jasmine.createSpyObj('ToastService', ['showSuccess', 'showWarning']);

    await TestBed.configureTestingModule({
      imports: [WheelDishPickerComponent],
      providers: [
        { provide: DishService, useValue: dishService },
        { provide: GameStateService, useValue: gameStateService },
        { provide: ToastService, useValue: toastService },
      ],
    })
      .overrideComponent(WheelDishPickerComponent, {
        set: {
          imports: [DishFilterStub, DishCardStub, EmptyStub],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(WheelDishPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ---- creation -----------------------------------------------------------

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise currentPage to 1', () => {
    expect(component.currentPage()).toBe(1);
  });

  it('should initialise limit to 10', () => {
    expect(component.limit()).toBe(10);
  });

  it('should initialise total to 0 before load (then set after)', () => {
    // After detectChanges ngOnInit ran; total is from the service response
    expect(component.total()).toBe(20);
  });

  it('should initialise loading to false after ngOnInit completes', () => {
    expect(component.loading()).toBeFalse();
  });

  // ---- ngOnInit / getDishes() ---------------------------------------------

  describe('ngOnInit → getDishes()', () => {
    it('should call dishService.findAll on init', () => {
      expect(dishService.findAll).toHaveBeenCalled();
    });

    it('should call findAll with default page and limit', () => {
      expect(dishService.findAll).toHaveBeenCalledWith(
        jasmine.objectContaining({ page: 1, limit: 10 })
      );
    });

    it('should set dishes from response', () => {
      expect(component.dishes().length).toBe(2);
      expect(component.dishes()[0]._id).toBe('1');
    });

    it('should set total from response count', () => {
      expect(component.total()).toBe(20);
    });

    it('should set loading to false after load', () => {
      expect(component.loading()).toBeFalse();
    });
  });

  // ---- getDishes() — includes dto params ----------------------------------

  describe('getDishes() with dto', () => {
    it('should merge dto into the findAll call', () => {
      component.dto = { keyword: 'pho' } as any;
      component.getDishes();
      expect(dishService.findAll).toHaveBeenCalledWith(
        jasmine.objectContaining({ keyword: 'pho', page: 1, limit: 10 })
      );
    });

    it('should use current page and limit signals', () => {
      component.currentPage.set(3);
      component.limit.set(25);
      component.getDishes();
      expect(dishService.findAll).toHaveBeenCalledWith(
        jasmine.objectContaining({ page: 3, limit: 25 })
      );
    });
  });

  // ---- onSearch() --------------------------------------------------------

  describe('onSearch()', () => {
    it('should update dto and call getDishes', () => {
      spyOn(component, 'getDishes');
      const dto = { keyword: 'bun' } as any;
      component.onSearch(dto);
      expect(component.dto).toEqual(dto);
      expect(component.getDishes).toHaveBeenCalled();
    });
  });

  // ---- paginatorChange() --------------------------------------------------

  describe('paginatorChange()', () => {
    it('should update currentPage (pageIndex + 1)', () => {
      component.paginatorChange({ pageIndex: 2, pageSize: 25, length: 100 } as PageEvent);
      expect(component.currentPage()).toBe(3);
    });

    it('should update limit from pageSize', () => {
      component.paginatorChange({ pageIndex: 0, pageSize: 50, length: 100 } as PageEvent);
      expect(component.limit()).toBe(50);
    });

    it('should call getDishes after updating page/limit', () => {
      spyOn(component, 'getDishes');
      component.paginatorChange({ pageIndex: 1, pageSize: 25, length: 100 } as PageEvent);
      expect(component.getDishes).toHaveBeenCalled();
    });
  });

  // ---- addDish() ----------------------------------------------------------

  describe('addDish()', () => {
    const newDish = makeDish('new');

    it('should call gameStateService.getGameState', () => {
      component.addDish(newDish);
      expect(gameStateService.getGameState).toHaveBeenCalled();
    });

    it('should call updateWheelOfFortuneState with the new dish appended', () => {
      const existing = makeDish('existing');
      gameStateService.getGameState.and.returnValue(
        of(makeGameState([existing]))
      );
      component.addDish(newDish);
      expect(gameStateService.updateWheelOfFortuneState).toHaveBeenCalledWith(
        jasmine.objectContaining({
          items: jasmine.arrayContaining([existing, newDish]),
        })
      );
    });

    it('should show success toast after adding a dish', () => {
      component.addDish(newDish);
      expect(toastService.showSuccess).toHaveBeenCalled();
    });

    it('should preserve existing items when adding a new dish', () => {
      const d1 = makeDish('d1');
      const d2 = makeDish('d2');
      gameStateService.getGameState.and.returnValue(of(makeGameState([d1, d2])));
      component.addDish(newDish);
      const call = gameStateService.updateWheelOfFortuneState.calls.mostRecent();
      expect(call.args[0].items.length).toBe(3);
    });
  });

  // ---- template -----------------------------------------------------------

  describe('template', () => {
    it('should show spinner when loading', () => {
      component.loading.set(true);
      fixture.detectChanges();
      const spinner = fixture.debugElement.query(By.css('mat-spinner'));
      expect(spinner).not.toBeNull();
    });

    it('should hide spinner when not loading', () => {
      component.loading.set(false);
      fixture.detectChanges();
      const spinner = fixture.debugElement.query(By.css('mat-spinner'));
      expect(spinner).toBeNull();
    });

    it('should show app-empty when dishes is empty and not loading', () => {
      component.dishes.set([]);
      component.loading.set(false);
      fixture.detectChanges();
      const empty = fixture.debugElement.query(By.css('app-empty'));
      expect(empty).not.toBeNull();
    });

    it('should render one app-dish-card per dish', () => {
      expect(fixture.debugElement.queryAll(By.css('app-dish-card')).length).toBe(2);
    });

    it('should call addDish when Add button is clicked', () => {
      spyOn(component, 'addDish');
      const btn = fixture.debugElement.query(By.css('button[matfab]'));
      btn.nativeElement.click();
      expect(component.addDish).toHaveBeenCalledWith(component.dishes()[0]);
    });

    it('should call onSearch when app-dish-filter emits search event', () => {
      spyOn(component, 'onSearch');
      const filter = fixture.debugElement.query(By.css('app-dish-filter'));
      filter.componentInstance.search.emit({ keyword: 'test' });
      expect(component.onSearch).toHaveBeenCalledWith({ keyword: 'test' });
    });
  });
});
