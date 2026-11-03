import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { VotingCollectionPickerComponent } from './voting-collection-picker.component';
import { UserDishCollectionService } from '@/app/service/user-dish-collection.service';
import { DishService } from '@/app/service/dish.service';
import { AuthService } from '@/app/service/auth.service';
import { ToastService } from '@/app/shared/service/toast.service';
import { UserDishCollection } from '@/types/user-dish-collection.type';
import { Dish } from '@/types/dish.type';

// ---- Stubs ---------------------------------------------------------------

@Component({ selector: 'app-empty', standalone: true, template: '' })
class EmptyStub {}

// ---- Helpers -------------------------------------------------------------

function makeCollection(overrides: Partial<UserDishCollection> = {}): UserDishCollection {
  return {
    _id: 'col-1',
    userId: 'user-1',
    name: 'My Collection',
    dishSlugs: ['slug-a', 'slug-b'],
    isPublic: false,
    sortOrder: 0,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  } as UserDishCollection;
}

function makeDish(overrides: Partial<Dish> = {}): Dish {
  return {
    _id: 'dish-1',
    slug: 'slug-a',
    title: [],
    shortDescription: [],
    content: [],
    tags: [],
    mealCategories: [],
    ingredientCategories: [],
    videos: [],
    ingredients: [],
    relatedDishes: [],
    labels: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  } as Dish;
}

// ---- Suite ---------------------------------------------------------------

describe('VotingCollectionPickerComponent', () => {
  let component: VotingCollectionPickerComponent;
  let fixture: ComponentFixture<VotingCollectionPickerComponent>;

  let collectionServiceSpy: jasmine.SpyObj<UserDishCollectionService>;
  let dishServiceSpy: jasmine.SpyObj<DishService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let profileSubject: BehaviorSubject<any>;

  beforeEach(async () => {
    profileSubject = new BehaviorSubject<any>({ _id: 'user-1' });

    collectionServiceSpy = jasmine.createSpyObj('UserDishCollectionService', ['findAll']);
    collectionServiceSpy.findAll.and.returnValue(
      of({ data: [makeCollection()], count: 1 })
    );

    dishServiceSpy = jasmine.createSpyObj('DishService', ['findBySlug']);
    dishServiceSpy.findBySlug.and.returnValue(of(makeDish()));

    authServiceSpy = jasmine.createSpyObj('AuthService', ['getProfile']);
    authServiceSpy.getProfile.and.returnValue(profileSubject.asObservable());

    toastServiceSpy = jasmine.createSpyObj('ToastService', [
      'showSuccess', 'showError', 'showWarning',
    ]);

    await TestBed.configureTestingModule({
      imports: [VotingCollectionPickerComponent, NoopAnimationsModule],
      providers: [
        { provide: UserDishCollectionService, useValue: collectionServiceSpy },
        { provide: DishService, useValue: dishServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
      ],
    })
      .overrideComponent(VotingCollectionPickerComponent, {
        set: {
          imports: [
            CommonModule,
            MatButtonModule,
            MatIconModule,
            MatProgressSpinnerModule,
            MatCardModule,
            EmptyStub,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(VotingCollectionPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ---- Creation ----------------------------------------------------------

  describe('creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize signals with defaults', () => {
      expect(component.loading()).toBeFalse();
      expect(component.loadingDishes()).toBeFalse();
      expect(component.userId()).toBe('user-1');
    });
  });

  // ---- ngOnInit ----------------------------------------------------------

  describe('ngOnInit()', () => {
    it('should set userId from profile', () => {
      expect(component.userId()).toBe('user-1');
    });

    it('should call loadCollections when profile has _id', () => {
      expect(collectionServiceSpy.findAll).toHaveBeenCalled();
    });

    it('should not call loadCollections when profile has no _id', () => {
      // Simulate a component that receives a null profile — verify loadCollections guard
      collectionServiceSpy.findAll.calls.reset();

      // Directly test the guard logic: userId stays empty, so findAll is not called
      authServiceSpy.getProfile.and.returnValue(new BehaviorSubject<any>(null).asObservable());
      spyOn(component, 'loadCollections');
      component.ngOnInit();

      expect(component.loadCollections).not.toHaveBeenCalled();
    });
  });

  // ---- loadCollections ---------------------------------------------------

  describe('loadCollections()', () => {
    it('should set collections from response data', () => {
      const cols = [makeCollection({ _id: 'a' }), makeCollection({ _id: 'b' })];
      collectionServiceSpy.findAll.and.returnValue(of({ data: cols, count: 2 }));
      component.loadCollections();
      expect(component.collections().length).toBe(2);
    });

    it('should set collections to empty array on error', () => {
      collectionServiceSpy.findAll.and.returnValue(throwError(() => new Error('fail')));
      component.loadCollections();
      expect(component.collections()).toEqual([]);
    });

    it('should set loading to false after success', () => {
      component.loadCollections();
      expect(component.loading()).toBeFalse();
    });

    it('should set loading to false after error', () => {
      collectionServiceSpy.findAll.and.returnValue(throwError(() => new Error('fail')));
      component.loadCollections();
      expect(component.loading()).toBeFalse();
    });

    it('should call collectionService.findAll with current userId', () => {
      collectionServiceSpy.findAll.calls.reset();
      component.loadCollections();
      expect(collectionServiceSpy.findAll).toHaveBeenCalledWith(
        jasmine.objectContaining({ userId: 'user-1' })
      );
    });
  });

  // ---- selectCollection --------------------------------------------------

  describe('selectCollection()', () => {
    it('should show warning toast when collection has no dishSlugs', () => {
      const empty = makeCollection({ dishSlugs: [] });
      component.selectCollection(empty);
      expect(toastServiceSpy.showWarning).toHaveBeenCalled();
    });

    it('should not fetch dishes when collection has no dishSlugs', () => {
      dishServiceSpy.findBySlug.calls.reset();
      const empty = makeCollection({ dishSlugs: [] });
      component.selectCollection(empty);
      expect(dishServiceSpy.findBySlug).not.toHaveBeenCalled();
    });

    it('should set loadingDishes to true then false after fetching', () => {
      const col = makeCollection({ dishSlugs: ['slug-a'] });
      component.selectCollection(col);
      expect(component.loadingDishes()).toBeFalse();
    });

    it('should call dishService.findBySlug for each slug', () => {
      dishServiceSpy.findBySlug.calls.reset();
      const col = makeCollection({ dishSlugs: ['slug-a', 'slug-b'] });
      component.selectCollection(col);
      expect(dishServiceSpy.findBySlug).toHaveBeenCalledTimes(2);
    });

    it('should emit dishesSelected after all dishes loaded', () => {
      const emitted: Dish[][] = [];
      component.dishesSelected.subscribe((d) => emitted.push(d));
      const col = makeCollection({ dishSlugs: ['slug-a'] });
      component.selectCollection(col);
      expect(emitted.length).toBe(1);
      expect(emitted[0].length).toBe(1);
    });

    it('should show success toast after loading dishes', () => {
      const col = makeCollection({ dishSlugs: ['slug-a'] });
      component.selectCollection(col);
      expect(toastServiceSpy.showSuccess).toHaveBeenCalled();
    });

    it('should still emit partial dishes when some slugs fail', () => {
      const emitted: Dish[][] = [];
      component.dishesSelected.subscribe((d) => emitted.push(d));

      dishServiceSpy.findBySlug.and.callFake((slug: string) => {
        if (slug === 'slug-a') return of(makeDish({ slug: 'slug-a' }));
        return throwError(() => new Error('not found'));
      });

      const col = makeCollection({ dishSlugs: ['slug-a', 'slug-fail'] });
      component.selectCollection(col);

      expect(emitted.length).toBe(1);
      expect(emitted[0].length).toBe(1);
    });

    it('should not emit when all slugs fail', () => {
      const emitted: Dish[][] = [];
      component.dishesSelected.subscribe((d) => emitted.push(d));

      dishServiceSpy.findBySlug.and.returnValue(throwError(() => new Error('fail')));

      const col = makeCollection({ dishSlugs: ['slug-fail'] });
      component.selectCollection(col);

      expect(emitted.length).toBe(0);
    });
  });

  // ---- addCollectionDishes -----------------------------------------------

  describe('addCollectionDishes()', () => {
    it('should emit dishesSelected with the given dishes', () => {
      const emitted: Dish[][] = [];
      component.dishesSelected.subscribe((d) => emitted.push(d));

      const dishes = [makeDish(), makeDish({ _id: 'dish-2', slug: 'slug-b' })];
      component.addCollectionDishes(dishes, 'Favorites');

      expect(emitted.length).toBe(1);
      expect(emitted[0]).toEqual(dishes);
    });

    it('should show success toast with dish count', () => {
      const dishes = [makeDish()];
      component.addCollectionDishes(dishes, 'Favorites');
      expect(toastServiceSpy.showSuccess).toHaveBeenCalled();
    });
  });

  // ---- getCollectionIcon -------------------------------------------------

  describe('getCollectionIcon()', () => {
    it('should return the icon when provided', () => {
      expect(component.getCollectionIcon('star')).toBe('star');
    });

    it('should return "cake" as default when icon is undefined', () => {
      expect(component.getCollectionIcon(undefined)).toBe('cake');
    });

    it('should return "cake" as default when icon is empty string', () => {
      expect(component.getCollectionIcon('')).toBe('cake');
    });
  });

  // ---- getCollectionColor ------------------------------------------------

  describe('getCollectionColor()', () => {
    it('should return the color when provided', () => {
      expect(component.getCollectionColor('#ff0000')).toBe('#ff0000');
    });

    it('should return "#3b82f6" as default when color is undefined', () => {
      expect(component.getCollectionColor(undefined)).toBe('#3b82f6');
    });

    it('should return "#3b82f6" as default when color is empty string', () => {
      expect(component.getCollectionColor('')).toBe('#3b82f6');
    });
  });

  // ---- Template ----------------------------------------------------------

  describe('template', () => {
    it('should show spinner when loading is true', () => {
      component.loading.set(true);
      fixture.detectChanges();
      const spinner = fixture.debugElement.query(By.css('mat-spinner'));
      expect(spinner).not.toBeNull();
    });

    it('should hide collections grid while loading', () => {
      component.loading.set(true);
      fixture.detectChanges();
      const cards = fixture.debugElement.queryAll(By.css('mat-card'));
      expect(cards.length).toBe(0);
    });

    it('should show loading dishes spinner when loadingDishes is true', () => {
      component.loading.set(false);
      component.loadingDishes.set(true);
      fixture.detectChanges();
      const spinner = fixture.debugElement.query(By.css('mat-spinner'));
      expect(spinner).not.toBeNull();
    });

    it('should show empty component when collections is empty', () => {
      component.loading.set(false);
      component.loadingDishes.set(false);
      component.collections.set([]);
      fixture.detectChanges();
      const empty = fixture.debugElement.query(By.css('app-empty'));
      expect(empty).not.toBeNull();
    });

    it('should render one mat-card per collection', () => {
      component.loading.set(false);
      component.loadingDishes.set(false);
      component.collections.set([makeCollection({ _id: 'a' }), makeCollection({ _id: 'b' })]);
      fixture.detectChanges();
      const cards = fixture.debugElement.queryAll(By.css('mat-card'));
      expect(cards.length).toBe(2);
    });

    it('should call selectCollection when a card is clicked', () => {
      spyOn(component, 'selectCollection');
      component.loading.set(false);
      component.loadingDishes.set(false);
      component.collections.set([makeCollection()]);
      fixture.detectChanges();
      const card = fixture.debugElement.query(By.css('mat-card'));
      card.triggerEventHandler('click', null);
      expect(component.selectCollection).toHaveBeenCalledWith(component.collections()[0]);
    });

    it('should display collection name in template', () => {
      component.loading.set(false);
      component.loadingDishes.set(false);
      component.collections.set([makeCollection({ name: 'Test Collection' })]);
      fixture.detectChanges();
      const text = fixture.nativeElement.textContent;
      expect(text).toContain('Test Collection');
    });

    it('should display dish count for each collection', () => {
      component.loading.set(false);
      component.loadingDishes.set(false);
      component.collections.set([makeCollection({ dishSlugs: ['a', 'b', 'c'] })]);
      fixture.detectChanges();
      const text = fixture.nativeElement.textContent;
      expect(text).toContain('3');
    });
  });
});
