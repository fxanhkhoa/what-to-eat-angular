import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { WheelCollectionPickerComponent } from './wheel-collection-picker.component';
import { UserDishCollectionService } from '@/app/service/user-dish-collection.service';
import { DishService } from '@/app/service/dish.service';
import { AuthService } from '@/app/service/auth.service';
import { GameStateService } from '@/app/state/game-state.service';
import { ToastService } from '@/app/shared/service/toast.service';
import { UserDishCollection } from '@/types/user-dish-collection.type';
import { Dish } from '@/types/dish.type';

@Component({ selector: 'app-empty', template: '', standalone: true })
class EmptyStub {}

function makeCollection(overrides: Partial<UserDishCollection> = {}): UserDishCollection {
  return {
    _id: 'col-1',
    userId: 'user-1',
    name: 'Favourites',
    dishSlugs: ['pho-bo', 'bun-cha'],
    isPublic: false,
    sortOrder: 0,
    ...overrides,
  } as UserDishCollection;
}

function makeDish(slug: string): Dish {
  return { _id: slug, slug, title: [] } as unknown as Dish;
}

describe('WheelCollectionPickerComponent', () => {
  let component: WheelCollectionPickerComponent;
  let fixture: ComponentFixture<WheelCollectionPickerComponent>;
  let collectionService: jasmine.SpyObj<UserDishCollectionService>;
  let dishService: jasmine.SpyObj<DishService>;
  let authService: jasmine.SpyObj<AuthService>;
  let gameStateService: jasmine.SpyObj<GameStateService>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    collectionService = jasmine.createSpyObj('UserDishCollectionService', ['findAll']);
    collectionService.findAll.and.returnValue(
      of({ data: [makeCollection()], count: 1 })
    );

    dishService = jasmine.createSpyObj('DishService', ['findBySlug']);
    dishService.findBySlug.and.callFake((slug: string) => of(makeDish(slug)));

    authService = jasmine.createSpyObj('AuthService', ['getProfile']);
    authService.getProfile.and.returnValue(of({ _id: 'user-1' } as any));

    gameStateService = jasmine.createSpyObj('GameStateService', [
      'updateWheelOfFortuneState',
    ]);

    toastService = jasmine.createSpyObj('ToastService', [
      'showSuccess',
      'showWarning',
    ]);

    await TestBed.configureTestingModule({
      imports: [WheelCollectionPickerComponent],
      providers: [
        { provide: UserDishCollectionService, useValue: collectionService },
        { provide: DishService, useValue: dishService },
        { provide: AuthService, useValue: authService },
        { provide: GameStateService, useValue: gameStateService },
        { provide: ToastService, useValue: toastService },
      ],
    })
      .overrideComponent(WheelCollectionPickerComponent, {
        set: { imports: [EmptyStub], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(WheelCollectionPickerComponent);
    component = fixture.componentInstance;
  });

  // ---- creation -----------------------------------------------------------

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialise collections to []', () => {
    expect(component.collections()).toEqual([]);
  });

  it('should initialise loading to false', () => {
    expect(component.loading()).toBeFalse();
  });

  it('should initialise loadingDishes to false', () => {
    expect(component.loadingDishes()).toBeFalse();
  });

  it('should initialise userId to empty string', () => {
    expect(component.userId()).toBe('');
  });

  // ---- ngOnInit -----------------------------------------------------------

  describe('ngOnInit', () => {
    it('should call authService.getProfile()', () => {
      fixture.detectChanges();
      expect(authService.getProfile).toHaveBeenCalled();
    });

    it('should set userId from profile._id', () => {
      fixture.detectChanges();
      expect(component.userId()).toBe('user-1');
    });

    it('should call loadCollections when profile has _id', () => {
      spyOn(component, 'loadCollections');
      component.ngOnInit();
      expect(component.loadCollections).toHaveBeenCalled();
    });

    it('should NOT call loadCollections when profile has no _id', () => {
      authService.getProfile.and.returnValue(of({ _id: undefined } as any));
      spyOn(component, 'loadCollections');
      component.ngOnInit();
      expect(component.loadCollections).not.toHaveBeenCalled();
    });

    it('should NOT call loadCollections when profile is null', () => {
      authService.getProfile.and.returnValue(of(null as any));
      spyOn(component, 'loadCollections');
      component.ngOnInit();
      expect(component.loadCollections).not.toHaveBeenCalled();
    });
  });

  // ---- loadCollections() --------------------------------------------------

  describe('loadCollections()', () => {
    beforeEach(() => fixture.detectChanges());

    it('should call collectionService.findAll with the userId', () => {
      expect(collectionService.findAll).toHaveBeenCalledWith(
        jasmine.objectContaining({ userId: 'user-1' })
      );
    });

    it('should set collections from response data', () => {
      expect(component.collections().length).toBe(1);
      expect(component.collections()[0]._id).toBe('col-1');
    });

    it('should set loading to false after successful load', () => {
      expect(component.loading()).toBeFalse();
    });

    it('should set collections to [] on error', () => {
      collectionService.findAll.and.returnValue(throwError(() => new Error('fail')));
      component.loadCollections();
      expect(component.collections()).toEqual([]);
    });

    it('should set loading to false on error', () => {
      collectionService.findAll.and.returnValue(throwError(() => new Error('fail')));
      component.loadCollections();
      expect(component.loading()).toBeFalse();
    });

    it('should handle response with empty data array', () => {
      collectionService.findAll.and.returnValue(of({ data: [], count: 0 }));
      component.loadCollections();
      expect(component.collections()).toEqual([]);
    });
  });

  // ---- selectCollection() — empty collection ------------------------------

  describe('selectCollection() — empty dishSlugs', () => {
    beforeEach(() => fixture.detectChanges());

    it('should show warning toast when collection has no dishSlugs', () => {
      component.selectCollection(makeCollection({ dishSlugs: [] }));
      expect(toastService.showWarning).toHaveBeenCalled();
    });

    it('should show warning toast when dishSlugs is undefined', () => {
      component.selectCollection(makeCollection({ dishSlugs: undefined as any }));
      expect(toastService.showWarning).toHaveBeenCalled();
    });

    it('should NOT call dishService.findBySlug when collection is empty', () => {
      dishService.findBySlug.calls.reset();
      component.selectCollection(makeCollection({ dishSlugs: [] }));
      expect(dishService.findBySlug).not.toHaveBeenCalled();
    });
  });

  // ---- selectCollection() — success ---------------------------------------

  describe('selectCollection() — with dishes', () => {
    const collection = makeCollection({ dishSlugs: ['pho-bo', 'bun-cha'] });

    beforeEach(() => fixture.detectChanges());

    it('should call findBySlug for each slug', () => {
      component.selectCollection(collection);
      expect(dishService.findBySlug).toHaveBeenCalledWith('pho-bo');
      expect(dishService.findBySlug).toHaveBeenCalledWith('bun-cha');
    });

    it('should call replaceWheelDishes after all dishes are loaded', () => {
      spyOn(component, 'replaceWheelDishes');
      component.selectCollection(collection);
      expect(component.replaceWheelDishes).toHaveBeenCalledWith(
        jasmine.arrayContaining([
          jasmine.objectContaining({ slug: 'pho-bo' }),
          jasmine.objectContaining({ slug: 'bun-cha' }),
        ]),
        collection.name
      );
    });

    it('should set loadingDishes to false after all loaded', () => {
      component.selectCollection(collection);
      expect(component.loadingDishes()).toBeFalse();
    });
  });

  // ---- selectCollection() — partial failure --------------------------------

  describe('selectCollection() — some slugs fail', () => {
    beforeEach(() => fixture.detectChanges());

    it('should still call replaceWheelDishes with successfully loaded dishes', () => {
      dishService.findBySlug.and.callFake((slug: string) => {
        if (slug === 'pho-bo') return of(makeDish('pho-bo'));
        return throwError(() => new Error('not found'));
      });
      spyOn(component, 'replaceWheelDishes');
      component.selectCollection(makeCollection({ dishSlugs: ['pho-bo', 'bad-slug'] }));
      expect(component.replaceWheelDishes).toHaveBeenCalledWith(
        jasmine.arrayContaining([jasmine.objectContaining({ slug: 'pho-bo' })]),
        jasmine.any(String)
      );
    });

    it('should set loadingDishes to false even when all slugs fail', () => {
      dishService.findBySlug.and.returnValue(throwError(() => new Error('fail')));
      component.selectCollection(makeCollection({ dishSlugs: ['bad'] }));
      expect(component.loadingDishes()).toBeFalse();
    });

    it('should not call replaceWheelDishes when every slug fails', () => {
      dishService.findBySlug.and.returnValue(throwError(() => new Error('fail')));
      spyOn(component, 'replaceWheelDishes');
      component.selectCollection(makeCollection({ dishSlugs: ['x'] }));
      expect(component.replaceWheelDishes).not.toHaveBeenCalled();
    });
  });

  // ---- replaceWheelDishes() -----------------------------------------------

  describe('replaceWheelDishes()', () => {
    beforeEach(() => fixture.detectChanges());

    it('should call updateWheelOfFortuneState with the dishes', () => {
      const dishes = [makeDish('pho-bo')];
      component.replaceWheelDishes(dishes, 'Favourites');
      expect(gameStateService.updateWheelOfFortuneState).toHaveBeenCalledWith(
        jasmine.objectContaining({ selectedItem: null, items: dishes })
      );
    });

    it('should show success toast', () => {
      component.replaceWheelDishes([makeDish('pho-bo')], 'Favourites');
      expect(toastService.showSuccess).toHaveBeenCalled();
    });
  });

  // ---- getCollectionIcon() ------------------------------------------------

  describe('getCollectionIcon()', () => {
    it('should return the icon when provided', () => {
      expect(component.getCollectionIcon('star')).toBe('star');
    });

    it('should return "cake" when icon is undefined', () => {
      expect(component.getCollectionIcon(undefined)).toBe('cake');
    });

    it('should return "cake" when icon is empty string', () => {
      expect(component.getCollectionIcon('')).toBe('cake');
    });
  });

  // ---- getCollectionColor() -----------------------------------------------

  describe('getCollectionColor()', () => {
    it('should return the color when provided', () => {
      expect(component.getCollectionColor('#ff0000')).toBe('#ff0000');
    });

    it('should return "#3b82f6" when color is undefined', () => {
      expect(component.getCollectionColor(undefined)).toBe('#3b82f6');
    });

    it('should return "#3b82f6" when color is empty string', () => {
      expect(component.getCollectionColor('')).toBe('#3b82f6');
    });
  });

  // ---- template -----------------------------------------------------------

  describe('template', () => {
    it('should show main spinner when loading is true', () => {
      fixture.detectChanges();
      component.loading.set(true);
      fixture.detectChanges();
      const spinners = fixture.debugElement.queryAll(By.css('mat-spinner'));
      expect(spinners.length).toBeGreaterThan(0);
    });

    it('should show loadingDishes spinner when loadingDishes is true', () => {
      fixture.detectChanges();
      component.loading.set(false);
      component.loadingDishes.set(true);
      fixture.detectChanges();
      const spinners = fixture.debugElement.queryAll(By.css('mat-spinner'));
      expect(spinners.length).toBeGreaterThan(0);
    });

    it('should show app-empty when not loading and no collections', () => {
      collectionService.findAll.and.returnValue(of({ data: [], count: 0 }));
      fixture.detectChanges();
      const empty = fixture.debugElement.query(By.css('app-empty'));
      expect(empty).not.toBeNull();
    });

    it('should render one mat-card per collection', () => {
      fixture.detectChanges();
      const cards = fixture.debugElement.queryAll(By.css('mat-card'));
      expect(cards.length).toBe(1);
    });

    it('should call selectCollection when mat-card is clicked', () => {
      fixture.detectChanges();
      spyOn(component, 'selectCollection');
      const card = fixture.debugElement.query(By.css('mat-card'));
      card.nativeElement.click();
      expect(component.selectCollection).toHaveBeenCalledWith(component.collections()[0]);
    });
  });
});
