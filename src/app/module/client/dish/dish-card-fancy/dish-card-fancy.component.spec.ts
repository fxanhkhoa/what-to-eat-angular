import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { DishCardFancyComponent } from './dish-card-fancy.component';
import { UserFavoriteService } from '@/app/service/user-favorite.service';
import { ToastService } from '@/app/shared/service/toast.service';
import { ShareBottomSheetComponent } from '@/app/shared/components/share-bottom-sheet/share-bottom-sheet.component';
import { Dish } from '@/types/dish.type';

const mockDish: Dish = {
  _id: 'dish-1',
  slug: 'bun-bo-hue',
  title: [{ lang: 'en', data: 'Bun Bo Hue' }],
  shortDescription: [{ lang: 'en', data: 'A spicy Vietnamese beef noodle soup' }],
  content: [{ lang: 'en', data: 'Full content here' }],
  tags: ['vietnamese', 'spicy'],
  preparationTime: 15,
  cookingTime: 45,
  difficultLevel: 'MEDIUM',
  mealCategories: ['LUNCH'],
  ingredientCategories: [],
  thumbnail: '/assets/images/bun-bo.jpg',
  videos: [],
  ingredients: [],
  relatedDishes: [],
  labels: [],
  deleted: false,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('DishCardFancyComponent', () => {
  let component: DishCardFancyComponent;
  let fixture: ComponentFixture<DishCardFancyComponent>;
  let userFavoriteSpy: jasmine.SpyObj<UserFavoriteService>;
  let toastSpy: jasmine.SpyObj<ToastService>;
  let bottomSheetSpy: jasmine.SpyObj<MatBottomSheet>;

  beforeEach(async () => {
    userFavoriteSpy = jasmine.createSpyObj('UserFavoriteService', [
      'checkIsFavorite',
      'addFavorite',
      'removeFavorite',
    ]);
    userFavoriteSpy.checkIsFavorite.and.returnValue(of({ isFavorite: false }));
    userFavoriteSpy.addFavorite.and.returnValue(of({} as any));
    userFavoriteSpy.removeFavorite.and.returnValue(of({}));

    toastSpy = jasmine.createSpyObj('ToastService', ['showSuccess', 'showError']);
    bottomSheetSpy = jasmine.createSpyObj('MatBottomSheet', ['open']);

    await TestBed.configureTestingModule({
      imports: [DishCardFancyComponent, RouterModule.forRoot([]), NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        { provide: UserFavoriteService, useValue: userFavoriteSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: MatBottomSheet, useValue: bottomSheetSpy },
        { provide: LOCALE_ID, useValue: 'en' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DishCardFancyComponent);
    component = fixture.componentInstance;
    component.dish = mockDish;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should default isFavorite to false', () => {
      expect(component.isFavorite()).toBeFalse();
    });

    it('should default isLoadingFavorite to false', () => {
      expect(component.isLoadingFavorite()).toBeFalse();
    });

    it('should default isWinner to false', () => {
      expect(component.isWinner).toBeFalse();
    });

    it('should have 4 background images in backgroundList', () => {
      expect(component.backgroundList.length).toBe(4);
    });

    it('should default selectedBackground to empty string', () => {
      expect(component.selectedBackground()).toBe('');
    });
  });

  describe('ngOnInit', () => {
    it('should set selectedBackground to a non-empty CSS style string', () => {
      fixture.detectChanges();
      const bg = component.selectedBackground();
      expect(bg).toContain('background-image: url(');
      expect(bg).toContain('!important');
    });

    it('should set selectedBackground from one of the backgroundList images', () => {
      fixture.detectChanges();
      const bg = component.selectedBackground();
      const matchesOne = component.backgroundList.some((url) => bg.includes(url));
      expect(matchesOne).toBeTrue();
    });

    it('should call checkIsFavorite with the dish slug', () => {
      fixture.detectChanges();
      expect(userFavoriteSpy.checkIsFavorite).toHaveBeenCalledWith('bun-bo-hue');
    });

    it('should set isFavorite to true when service returns true', () => {
      userFavoriteSpy.checkIsFavorite.and.returnValue(of({ isFavorite: true }));
      fixture.detectChanges();
      expect(component.isFavorite()).toBeTrue();
    });

    it('should set isFavorite to false when service returns false', () => {
      userFavoriteSpy.checkIsFavorite.and.returnValue(of({ isFavorite: false }));
      fixture.detectChanges();
      expect(component.isFavorite()).toBeFalse();
    });

    it('should set isFavorite to false when checkIsFavorite errors', () => {
      userFavoriteSpy.checkIsFavorite.and.returnValue(throwError(() => new Error('Unauthorized')));
      fixture.detectChanges();
      expect(component.isFavorite()).toBeFalse();
    });
  });

  describe('toggleFavorite — add to favorites', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.isFavorite.set(false);
    });

    it('should call addFavorite with correct DTO', () => {
      component.toggleFavorite(new MouseEvent('click'));
      expect(userFavoriteSpy.addFavorite).toHaveBeenCalledWith({
        userId: '',
        dishId: 'dish-1',
        dishSlug: 'bun-bo-hue',
      });
    });

    it('should set isFavorite to true on success', () => {
      component.toggleFavorite(new MouseEvent('click'));
      expect(component.isFavorite()).toBeTrue();
    });

    it('should show success toast with "Added to favorites"', () => {
      component.toggleFavorite(new MouseEvent('click'));
      expect(toastSpy.showSuccess).toHaveBeenCalledWith('Success', 'Added to favorites');
    });

    it('should reset isLoadingFavorite to false on success', () => {
      component.toggleFavorite(new MouseEvent('click'));
      expect(component.isLoadingFavorite()).toBeFalse();
    });

    it('should show error toast when addFavorite fails', () => {
      userFavoriteSpy.addFavorite.and.returnValue(throwError(() => new Error()));
      component.toggleFavorite(new MouseEvent('click'));
      expect(toastSpy.showError).toHaveBeenCalledWith('Error', 'Failed to add to favorites');
    });

    it('should reset isLoadingFavorite to false on add error', () => {
      userFavoriteSpy.addFavorite.and.returnValue(throwError(() => new Error()));
      component.toggleFavorite(new MouseEvent('click'));
      expect(component.isLoadingFavorite()).toBeFalse();
    });

    it('should call stopPropagation on the event', () => {
      const event = new MouseEvent('click');
      spyOn(event, 'stopPropagation');
      component.toggleFavorite(event);
      expect(event.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('toggleFavorite — remove from favorites', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.isFavorite.set(true);
    });

    it('should call removeFavorite with the dish slug', () => {
      component.toggleFavorite(new MouseEvent('click'));
      expect(userFavoriteSpy.removeFavorite).toHaveBeenCalledWith('bun-bo-hue');
    });

    it('should set isFavorite to false on success', () => {
      component.toggleFavorite(new MouseEvent('click'));
      expect(component.isFavorite()).toBeFalse();
    });

    it('should show success toast with "Removed from favorites"', () => {
      component.toggleFavorite(new MouseEvent('click'));
      expect(toastSpy.showSuccess).toHaveBeenCalledWith('Success', 'Removed from favorites');
    });

    it('should reset isLoadingFavorite to false on success', () => {
      component.toggleFavorite(new MouseEvent('click'));
      expect(component.isLoadingFavorite()).toBeFalse();
    });

    it('should show error toast when removeFavorite fails', () => {
      userFavoriteSpy.removeFavorite.and.returnValue(throwError(() => new Error()));
      component.toggleFavorite(new MouseEvent('click'));
      expect(toastSpy.showError).toHaveBeenCalledWith('Error', 'Failed to remove from favorites');
    });

    it('should reset isLoadingFavorite to false on remove error', () => {
      userFavoriteSpy.removeFavorite.and.returnValue(throwError(() => new Error()));
      component.toggleFavorite(new MouseEvent('click'));
      expect(component.isLoadingFavorite()).toBeFalse();
    });
  });

  describe('openShareSheet', () => {
    beforeEach(() => fixture.detectChanges());

    it('should open the bottom sheet with the dish data', () => {
      component.openShareSheet(new MouseEvent('click'));
      expect(bottomSheetSpy.open).toHaveBeenCalled();
      const call = bottomSheetSpy.open.calls.mostRecent();
      expect(call.args[0] as unknown).toBe(ShareBottomSheetComponent);
      expect(call.args[1]).toEqual({ data: { dish: mockDish } });
    });

    it('should call stopPropagation on the event', () => {
      const event = new MouseEvent('click');
      spyOn(event, 'stopPropagation');
      component.openShareSheet(event);
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should call preventDefault on the event', () => {
      const event = new MouseEvent('click');
      spyOn(event, 'preventDefault');
      component.openShareSheet(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('template rendering', () => {
    it('should NOT show the winner badge when isWinner is false', () => {
      component.isWinner = false;
      fixture.detectChanges();
      const badge = fixture.nativeElement.querySelector('.winner-badge');
      expect(badge).toBeNull();
    });

    it('should show the winner badge when isWinner is true', () => {
      component.isWinner = true;
      fixture.detectChanges();
      const badge = fixture.nativeElement.querySelector('.winner-badge');
      expect(badge).toBeTruthy();
    });

    it('should show favorite_border icon when not a favorite', () => {
      component.isFavorite.set(false);
      fixture.detectChanges();
      const icons: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('mat-icon');
      const icon = Array.from(icons).find(
        (el) => el.textContent?.trim() === 'favorite_border'
      );
      expect(icon).toBeTruthy();
    });

    it('should show favorite icon when dish is a favorite', () => {
      fixture.detectChanges(); // let ngOnInit + checkIsFavorite run first
      component.isFavorite.set(true);
      fixture.detectChanges(); // re-render with updated signal
      const button: HTMLElement = fixture.nativeElement.querySelector(
        'button[aria-label="Remove from favorites"]'
      );
      expect(button).toBeTruthy();
    });

    it('should apply selectedBackground as inline style', () => {
      fixture.detectChanges();
      const container: HTMLElement = fixture.nativeElement.querySelector('[style]');
      expect(container?.getAttribute('style')).toContain('background-image');
    });
  });
});
