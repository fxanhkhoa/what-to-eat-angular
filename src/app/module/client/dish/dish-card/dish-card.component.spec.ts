import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { DishCardComponent } from './dish-card.component';
import { UserFavoriteService } from '@/app/service/user-favorite.service';
import { ToastService } from '@/app/shared/service/toast.service';
import { ShareBottomSheetComponent } from '@/app/shared/components/share-bottom-sheet/share-bottom-sheet.component';
import { Dish } from '@/types/dish.type';
import { DIFFICULT_LEVELS } from '@/enum/dish.enum';

const mockDish: Dish = {
  _id: 'dish-1',
  slug: 'pho-bo',
  title: [{ lang: 'en', data: 'Beef Pho' }],
  shortDescription: [{ lang: 'en', data: 'A classic Vietnamese noodle soup' }],
  content: [{ lang: 'en', data: 'Content here' }],
  tags: ['vietnamese', 'noodle'],
  preparationTime: 10,
  cookingTime: 30,
  difficultLevel: DIFFICULT_LEVELS.MEDIUM,
  mealCategories: ['BREAKFAST'],
  ingredientCategories: [],
  thumbnail: '/assets/pho.jpg',
  videos: [],
  ingredients: [],
  relatedDishes: [],
  labels: [],
  deleted: false,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('DishCardComponent', () => {
  let component: DishCardComponent;
  let fixture: ComponentFixture<DishCardComponent>;
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
      imports: [DishCardComponent, RouterModule.forRoot([]), NoopAnimationsModule],
      providers: [
        { provide: UserFavoriteService, useValue: userFavoriteSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: MatBottomSheet, useValue: bottomSheetSpy },
        { provide: LOCALE_ID, useValue: 'en' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DishCardComponent);
    component = fixture.componentInstance;
    component.dish = mockDish;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call checkIsFavorite with dish slug on init', () => {
      fixture.detectChanges();
      expect(userFavoriteSpy.checkIsFavorite).toHaveBeenCalledWith('pho-bo');
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

  describe('initial state', () => {
    it('should have isFavorite initialized to false', () => {
      expect(component.isFavorite()).toBeFalse();
    });

    it('should have isLoadingFavorite initialized to false', () => {
      expect(component.isLoadingFavorite()).toBeFalse();
    });

    it('should expose DIFFICULT_LEVELS constant', () => {
      expect(component.DIFFICULT_LEVELS).toBe(DIFFICULT_LEVELS);
    });

    it('should default newTab to false', () => {
      expect(component.newTab).toBeFalse();
    });
  });

  describe('getTotalTime', () => {
    beforeEach(() => fixture.detectChanges());

    it('should return sum of preparationTime and cookingTime', () => {
      expect(component.getTotalTime()).toBe(40);
    });

    it('should return 0 when both times are undefined', () => {
      component.dish = { ...mockDish, preparationTime: undefined, cookingTime: undefined };
      expect(component.getTotalTime()).toBe(0);
    });

    it('should handle missing preparationTime only', () => {
      component.dish = { ...mockDish, preparationTime: undefined, cookingTime: 20 };
      expect(component.getTotalTime()).toBe(20);
    });

    it('should handle missing cookingTime only', () => {
      component.dish = { ...mockDish, preparationTime: 15, cookingTime: undefined };
      expect(component.getTotalTime()).toBe(15);
    });
  });

  describe('toggleFavorite — add to favorites', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.isFavorite.set(false);
    });

    it('should call addFavorite with correct dto', () => {
      component.toggleFavorite(new MouseEvent('click'));
      expect(userFavoriteSpy.addFavorite).toHaveBeenCalledWith({
        userId: '',
        dishId: 'dish-1',
        dishSlug: 'pho-bo',
      });
    });

    it('should set isFavorite to true after successful add', () => {
      component.toggleFavorite(new MouseEvent('click'));
      expect(component.isFavorite()).toBeTrue();
    });

    it('should show success toast after adding', () => {
      component.toggleFavorite(new MouseEvent('click'));
      expect(toastSpy.showSuccess).toHaveBeenCalledWith('Success', 'Added to favorites');
    });

    it('should set isLoadingFavorite to false after successful add', () => {
      component.toggleFavorite(new MouseEvent('click'));
      expect(component.isLoadingFavorite()).toBeFalse();
    });

    it('should show error toast when addFavorite fails', () => {
      userFavoriteSpy.addFavorite.and.returnValue(throwError(() => new Error('Server error')));
      component.toggleFavorite(new MouseEvent('click'));
      expect(toastSpy.showError).toHaveBeenCalledWith('Error', 'Failed to add to favorites');
    });

    it('should reset isLoadingFavorite to false when addFavorite errors', () => {
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

    it('should call removeFavorite with dish slug', () => {
      component.toggleFavorite(new MouseEvent('click'));
      expect(userFavoriteSpy.removeFavorite).toHaveBeenCalledWith('pho-bo');
    });

    it('should set isFavorite to false after removal', () => {
      component.toggleFavorite(new MouseEvent('click'));
      expect(component.isFavorite()).toBeFalse();
    });

    it('should show success toast after removing', () => {
      component.toggleFavorite(new MouseEvent('click'));
      expect(toastSpy.showSuccess).toHaveBeenCalledWith('Success', 'Removed from favorites');
    });

    it('should set isLoadingFavorite to false after successful remove', () => {
      component.toggleFavorite(new MouseEvent('click'));
      expect(component.isLoadingFavorite()).toBeFalse();
    });

    it('should show error toast when removeFavorite fails', () => {
      userFavoriteSpy.removeFavorite.and.returnValue(throwError(() => new Error()));
      component.toggleFavorite(new MouseEvent('click'));
      expect(toastSpy.showError).toHaveBeenCalledWith('Error', 'Failed to remove from favorites');
    });

    it('should reset isLoadingFavorite to false when removeFavorite errors', () => {
      userFavoriteSpy.removeFavorite.and.returnValue(throwError(() => new Error()));
      component.toggleFavorite(new MouseEvent('click'));
      expect(component.isLoadingFavorite()).toBeFalse();
    });
  });

  describe('openShareSheet', () => {
    beforeEach(() => fixture.detectChanges());

    it('should open bottom sheet with ShareBottomSheetComponent', () => {
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
    beforeEach(() => fixture.detectChanges());

    it('should render the dish thumbnail image', () => {
      const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
      expect(img.src).toContain('/assets/pho.jpg');
    });

    it('should render the total cooking time', () => {
      const text: string = fixture.nativeElement.textContent;
      expect(text).toContain('40 min');
    });

    it('should render the difficulty level', () => {
      const text: string = fixture.nativeElement.textContent;
      expect(text).toContain('Medium');
    });

    it('should show favorite_border icon when not a favorite', () => {
      component.isFavorite.set(false);
      fixture.detectChanges();
      const icon: HTMLElement = fixture.nativeElement.querySelector('mat-icon');
      expect(icon?.textContent?.trim()).toBe('favorite_border');
    });

    it('should show favorite icon when dish is a favorite', () => {
      component.isFavorite.set(true);
      fixture.detectChanges();
      const icons: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('mat-icon');
      const favoriteIcon = Array.from(icons).find(
        (el) => el.textContent?.trim() === 'favorite'
      );
      expect(favoriteIcon).toBeTruthy();
    });
  });
});
