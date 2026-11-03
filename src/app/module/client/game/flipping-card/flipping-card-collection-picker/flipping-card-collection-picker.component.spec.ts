import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { of, throwError } from 'rxjs';

import { FlippingCardCollectionPickerComponent } from './flipping-card-collection-picker.component';
import { UserDishCollectionService } from '@/app/service/user-dish-collection.service';
import { DishService } from '@/app/service/dish.service';
import { AuthService } from '@/app/service/auth.service';
import { GameStateService } from '@/app/state/game-state.service';
import { ToastService } from '@/app/shared/service/toast.service';
import { UserDishCollection } from '@/types/user-dish-collection.type';
import { Dish } from '@/types/dish.type';

// ── Stub child component ──────────────────────────────────────────────────────
@Component({ selector: 'app-empty', template: '', standalone: true })
class EmptyStub {}

// ── Helpers ───────────────────────────────────────────────────────────────────
const makeProfile = (id: string) => ({ _id: id } as any);

const makeCollection = (overrides: Partial<UserDishCollection> = {}): UserDishCollection =>
  ({
    _id: 'col1',
    name: 'My Faves',
    dishSlugs: ['slug1', 'slug2'],
    color: '#ff0000',
    icon: 'star',
    ...overrides,
  } as unknown as UserDishCollection);

const makeDish = (slug: string): Dish =>
  ({ _id: slug, slug, name: slug } as unknown as Dish);

describe('FlippingCardCollectionPickerComponent', () => {
  let component: FlippingCardCollectionPickerComponent;
  let fixture: ComponentFixture<FlippingCardCollectionPickerComponent>;

  let collectionServiceSpy: jasmine.SpyObj<UserDishCollectionService>;
  let dishServiceSpy: jasmine.SpyObj<DishService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let gameStateServiceSpy: jasmine.SpyObj<GameStateService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    collectionServiceSpy = jasmine.createSpyObj('UserDishCollectionService', ['findAll']);
    collectionServiceSpy.findAll.and.returnValue(of({ data: [] } as any));

    dishServiceSpy = jasmine.createSpyObj('DishService', ['findBySlug']);
    dishServiceSpy.findBySlug.and.returnValue(of(makeDish('slug1')));

    authServiceSpy = jasmine.createSpyObj('AuthService', ['getProfile']);
    authServiceSpy.getProfile.and.returnValue(of(null));

    gameStateServiceSpy = jasmine.createSpyObj('GameStateService', ['updateFlippingCardState']);
    gameStateServiceSpy.updateFlippingCardState.and.stub();

    toastServiceSpy = jasmine.createSpyObj('ToastService', ['showWarning', 'showSuccess']);

    await TestBed.configureTestingModule({
      imports: [FlippingCardCollectionPickerComponent, NoopAnimationsModule],
      providers: [
        { provide: UserDishCollectionService, useValue: collectionServiceSpy },
        { provide: DishService, useValue: dishServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: GameStateService, useValue: gameStateServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
      ],
    })
      .overrideComponent(FlippingCardCollectionPickerComponent, {
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

    fixture = TestBed.createComponent(FlippingCardCollectionPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Initial state ─────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('should initialise collections to empty array', () => {
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
  });

  // ── ngOnInit / getProfile ─────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should not load collections when profile is null', () => {
      authServiceSpy.getProfile.and.returnValue(of(null));
      component.ngOnInit();
      expect(collectionServiceSpy.findAll).not.toHaveBeenCalled();
    });

    it('should not load collections when profile has no _id', () => {
      authServiceSpy.getProfile.and.returnValue(of({} as any));
      component.ngOnInit();
      expect(collectionServiceSpy.findAll).not.toHaveBeenCalled();
    });

    it('should set userId from profile and load collections', () => {
      authServiceSpy.getProfile.and.returnValue(of(makeProfile('user123')));
      collectionServiceSpy.findAll.and.returnValue(of({ data: [] } as any));
      component.ngOnInit();
      expect(component.userId()).toBe('user123');
      expect(collectionServiceSpy.findAll).toHaveBeenCalled();
    });
  });

  // ── loadCollections ───────────────────────────────────────────────────────

  describe('loadCollections', () => {
    beforeEach(() => {
      component['userId'].set('user1');
    });

    it('should populate collections from service response', () => {
      const cols = [makeCollection()];
      collectionServiceSpy.findAll.and.returnValue(of({ data: cols } as any));
      component.loadCollections();
      expect(component.collections()).toEqual(cols);
    });

    it('should set collections to empty array when data is null', () => {
      collectionServiceSpy.findAll.and.returnValue(of({ data: null } as any));
      component.loadCollections();
      expect(component.collections()).toEqual([]);
    });

    it('should set loading to false after success', () => {
      collectionServiceSpy.findAll.and.returnValue(of({ data: [] } as any));
      component.loadCollections();
      expect(component.loading()).toBeFalse();
    });

    it('should set collections to empty array on error', () => {
      collectionServiceSpy.findAll.and.returnValue(throwError(() => new Error('fail')));
      component.loadCollections();
      expect(component.collections()).toEqual([]);
    });

    it('should set loading to false on error', () => {
      collectionServiceSpy.findAll.and.returnValue(throwError(() => new Error('fail')));
      component.loadCollections();
      expect(component.loading()).toBeFalse();
    });

    it('should call findAll with userId', () => {
      collectionServiceSpy.findAll.and.returnValue(of({ data: [] } as any));
      component.loadCollections();
      expect(collectionServiceSpy.findAll).toHaveBeenCalledWith({ userId: 'user1' });
    });
  });

  // ── selectCollection ──────────────────────────────────────────────────────

  describe('selectCollection', () => {
    it('should show a warning toast when collection has no dishSlugs', () => {
      component.selectCollection(makeCollection({ dishSlugs: [] }));
      expect(toastServiceSpy.showWarning).toHaveBeenCalled();
      expect(dishServiceSpy.findBySlug).not.toHaveBeenCalled();
    });

    it('should show a warning toast when dishSlugs is undefined', () => {
      component.selectCollection(makeCollection({ dishSlugs: undefined as any }));
      expect(toastServiceSpy.showWarning).toHaveBeenCalled();
    });

    it('should call findBySlug for each slug in the collection', () => {
      const col = makeCollection({ dishSlugs: ['s1', 's2'] });
      dishServiceSpy.findBySlug.and.callFake((slug) => of(makeDish(slug)));
      component.selectCollection(col);
      expect(dishServiceSpy.findBySlug).toHaveBeenCalledTimes(2);
      expect(dishServiceSpy.findBySlug).toHaveBeenCalledWith('s1');
      expect(dishServiceSpy.findBySlug).toHaveBeenCalledWith('s2');
    });

    it('should call replaceCardDishes when all slugs are loaded', () => {
      spyOn(component, 'replaceCardDishes');
      const col = makeCollection({ dishSlugs: ['s1', 's2'] });
      dishServiceSpy.findBySlug.and.callFake((slug) => of(makeDish(slug)));
      component.selectCollection(col);
      expect(component.replaceCardDishes).toHaveBeenCalledWith(
        jasmine.arrayContaining([jasmine.objectContaining({ slug: 's1' }), jasmine.objectContaining({ slug: 's2' })]),
        'My Faves'
      );
    });

    it('should set loadingDishes to false when all slugs are loaded', () => {
      const col = makeCollection({ dishSlugs: ['s1'] });
      dishServiceSpy.findBySlug.and.returnValue(of(makeDish('s1')));
      component.selectCollection(col);
      expect(component.loadingDishes()).toBeFalse();
    });

    it('should still call replaceCardDishes on partial error if some dishes loaded', () => {
      spyOn(component, 'replaceCardDishes');
      const col = makeCollection({ dishSlugs: ['ok', 'bad'] });
      dishServiceSpy.findBySlug.and.callFake((slug) =>
        slug === 'ok' ? of(makeDish('ok')) : throwError(() => new Error('not found'))
      );
      component.selectCollection(col);
      expect(component.replaceCardDishes).toHaveBeenCalledWith(
        jasmine.arrayContaining([jasmine.objectContaining({ slug: 'ok' })]),
        'My Faves'
      );
    });

    it('should not call replaceCardDishes when all slugs fail', () => {
      spyOn(component, 'replaceCardDishes');
      const col = makeCollection({ dishSlugs: ['bad'] });
      dishServiceSpy.findBySlug.and.returnValue(throwError(() => new Error('fail')));
      component.selectCollection(col);
      expect(component.replaceCardDishes).not.toHaveBeenCalled();
    });
  });

  // ── replaceCardDishes ─────────────────────────────────────────────────────

  describe('replaceCardDishes', () => {
    it('should call updateFlippingCardState with dishes and null selectedItem', () => {
      const dishes = [makeDish('d1')];
      component.replaceCardDishes(dishes, 'My Col');
      expect(gameStateServiceSpy.updateFlippingCardState).toHaveBeenCalledWith(
        jasmine.objectContaining({ selectedItem: null, items: dishes })
      );
    });

    it('should show a success toast', () => {
      component.replaceCardDishes([makeDish('d1')], 'My Col');
      expect(toastServiceSpy.showSuccess).toHaveBeenCalled();
    });
  });

  // ── getCollectionIcon ─────────────────────────────────────────────────────

  describe('getCollectionIcon', () => {
    it('should return the provided icon', () => {
      expect(component.getCollectionIcon('fire')).toBe('fire');
    });

    it('should return "cake" as default when icon is undefined', () => {
      expect(component.getCollectionIcon(undefined)).toBe('cake');
    });
  });

  // ── getCollectionColor ────────────────────────────────────────────────────

  describe('getCollectionColor', () => {
    it('should return the provided color', () => {
      expect(component.getCollectionColor('#abc123')).toBe('#abc123');
    });

    it('should return "#3b82f6" as default when color is undefined', () => {
      expect(component.getCollectionColor(undefined)).toBe('#3b82f6');
    });
  });
});
