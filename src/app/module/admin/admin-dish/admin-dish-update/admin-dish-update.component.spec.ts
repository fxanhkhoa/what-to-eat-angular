import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { LOCALE_ID } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

import { AdminDishUpdateComponent } from './admin-dish-update.component';
import { DishService } from '@/app/service/dish.service';
import { IngredientService } from '@/app/service/ingredient.service';
import { ToastService } from '@/app/shared/service/toast.service';
import { Dish } from '@/types/dish.type';
import { Ingredient } from '@/types/ingredient.type';

const mockDish: Dish = {
  _id: 'dish-1',
  slug: 'pho-bo',
  title: [{ lang: 'en-US', data: 'Beef Pho' }],
  shortDescription: [{ lang: 'en-US', data: 'A noodle soup' }],
  content: [{ lang: 'en-US', data: 'Content here' }],
  tags: ['soup', 'noodle'],
  preparationTime: 30,
  cookingTime: 60,
  difficultLevel: 'MEDIUM',
  mealCategories: ['BREAKFAST'],
  ingredientCategories: ['MEAT'],
  thumbnail: 'https://example.com/image.jpg',
  videos: ['https://youtube.com/watch?v=abc123'],
  ingredients: [{ ingredientId: 'ing-1', slug: 'beef', quantity: 200, note: '' }],
  relatedDishes: [],
  labels: ['popular'],
  deleted: false,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const mockIngredient: Ingredient = {
  _id: 'ing-1',
  slug: 'beef',
  title: [{ lang: 'en-US', data: 'Beef' }],
  measure: 'g',
  calories: 250,
  carbohydrate: 0,
  fat: 15,
  ingredientCategory: ['MEAT'],
  weight: 100,
  protein: 26,
  cholesterol: 70,
  sodium: 60,
  images: [],
  deleted: false,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('AdminDishUpdateComponent', () => {
  let component: AdminDishUpdateComponent;
  let fixture: ComponentFixture<AdminDishUpdateComponent>;
  let dishServiceMock: jasmine.SpyObj<DishService>;
  let ingredientServiceMock: jasmine.SpyObj<IngredientService>;
  let toastServiceMock: jasmine.SpyObj<ToastService>;
  let dialogMock: jasmine.SpyObj<MatDialog>;
  let routerMock: jasmine.SpyObj<Router>;
  let paramsSubject: Subject<any>;

  beforeEach(async () => {
    paramsSubject = new Subject<any>();

    dishServiceMock = jasmine.createSpyObj('DishService', [
      'findOne',
      'findWithScore',
      'create',
      'update',
    ]);
    dishServiceMock.findOne.and.returnValue(of(mockDish));
    dishServiceMock.findWithScore.and.returnValue(of({ data: [], count: 0 }));
    dishServiceMock.create.and.returnValue(of(mockDish));
    dishServiceMock.update.and.returnValue(of(mockDish));

    ingredientServiceMock = jasmine.createSpyObj('IngredientService', ['findOne', 'findAll']);
    ingredientServiceMock.findOne.and.returnValue(of(mockIngredient));
    ingredientServiceMock.findAll.and.returnValue(of({ data: [mockIngredient], count: 1 }));

    toastServiceMock = jasmine.createSpyObj('ToastService', ['showSuccess', 'showError']);

    dialogMock = jasmine.createSpyObj('MatDialog', ['open']);

    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [AdminDishUpdateComponent],
      providers: [
        { provide: DishService, useValue: dishServiceMock },
        { provide: IngredientService, useValue: ingredientServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: { params: paramsSubject.asObservable() },
        },
        { provide: LOCALE_ID, useValue: 'en-US' },
        {
          provide: DomSanitizer,
          useValue: {
            bypassSecurityTrustResourceUrl: (url: string) => url,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDishUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── Form Initialization ───────────────────────────────────────────────────

  describe('initForm()', () => {
    it('should create the form with all expected controls', () => {
      expect(component.dishForm.get('slug')).toBeTruthy();
      expect(component.dishForm.get('tags')).toBeTruthy();
      expect(component.dishForm.get('thumbnail')).toBeTruthy();
      expect(component.dishForm.get('mealCategories')).toBeTruthy();
      expect(component.dishForm.get('ingredientCategories')).toBeTruthy();
      expect(component.dishForm.get('labels')).toBeTruthy();
      expect(component.dishForm.get('relatedDishes')).toBeTruthy();
    });

    it('should initialize title, shortDescription, and content as FormArrays', () => {
      expect(component.titleArray.length).toBeGreaterThan(0);
      expect(component.shortDescriptionArray.length).toBeGreaterThan(0);
      expect(component.contentArray.length).toBeGreaterThan(0);
    });

    it('should initialize with at least one ingredient row', () => {
      expect(component.ingredientsArray.length).toBeGreaterThan(0);
    });

    it('should initialize videos array with one empty control', () => {
      expect(component.videosArray.length).toBe(1);
    });

    it('should require slug field', () => {
      component.dishForm.get('slug')?.setValue('');
      expect(component.dishForm.get('slug')?.valid).toBeFalse();
    });
  });

  // ─── Form Array Getters ────────────────────────────────────────────────────

  describe('Form array getters', () => {
    it('titleArray should return the title FormArray', () => {
      expect(component.titleArray).toBe(component.dishForm.get('title') as any);
    });

    it('shortDescriptionArray should return the shortDescription FormArray', () => {
      expect(component.shortDescriptionArray).toBe(
        component.dishForm.get('shortDescription') as any
      );
    });

    it('contentArray should return the content FormArray', () => {
      expect(component.contentArray).toBe(component.dishForm.get('content') as any);
    });

    it('videosArray should return the videos FormArray', () => {
      expect(component.videosArray).toBe(component.dishForm.get('videos') as any);
    });

    it('ingredientsArray should return the ingredients FormArray', () => {
      expect(component.ingredientsArray).toBe(component.dishForm.get('ingredients') as any);
    });
  });

  // ─── Language Fields ───────────────────────────────────────────────────────

  describe('addLanguageField()', () => {
    it('should add a new group to the specified field array', () => {
      const before = component.titleArray.length;
      component.addLanguageField('title', 'fr');
      expect(component.titleArray.length).toBe(before + 1);
    });

    it('should populate lang and data in the new group', () => {
      component.addLanguageField('title', 'de', 'Rindfleisch Pho');
      const last = component.titleArray.at(component.titleArray.length - 1);
      expect(last.get('lang')?.value).toBe('de');
      expect(last.get('data')?.value).toBe('Rindfleisch Pho');
    });
  });

  describe('removeLanguageField()', () => {
    it('should remove a language field when more than one exists', () => {
      component.addLanguageField('title', 'fr');
      const before = component.titleArray.length;
      component.removeLanguageField('title', 0);
      expect(component.titleArray.length).toBe(before - 1);
    });

    it('should NOT remove the last language field', () => {
      // Clear down to one item
      while (component.titleArray.length > 1) {
        component.titleArray.removeAt(0);
      }
      component.removeLanguageField('title', 0);
      expect(component.titleArray.length).toBe(1);
    });
  });

  // ─── Videos ───────────────────────────────────────────────────────────────

  describe('addVideo()', () => {
    it('should add an empty video control', () => {
      const before = component.videosArray.length;
      component.addVideo();
      expect(component.videosArray.length).toBe(before + 1);
    });
  });

  describe('removeVideo()', () => {
    it('should remove a video control at the given index', () => {
      component.addVideo();
      const before = component.videosArray.length;
      component.removeVideo(0);
      expect(component.videosArray.length).toBe(before - 1);
    });
  });

  // ─── Ingredients ──────────────────────────────────────────────────────────

  describe('addIngredient()', () => {
    it('should add a new ingredient group to the array', () => {
      const before = component.ingredientsArray.length;
      component.addIngredient();
      expect(component.ingredientsArray.length).toBe(before + 1);
    });

    it('should populate ingredient group with provided values', () => {
      component.addIngredient(
        { ingredientId: 'ing-1', slug: 'beef', quantity: 150, note: 'sliced' },
        mockIngredient
      );
      const last = component.ingredientsArray.at(component.ingredientsArray.length - 1);
      expect(last.get('quantity')?.value).toBe(150);
      expect(last.get('note')?.value).toBe('sliced');
      expect(last.get('ingredient')?.value).toBe(mockIngredient);
    });
  });

  describe('removeIngredient()', () => {
    it('should remove an ingredient at the given index', () => {
      component.addIngredient();
      const before = component.ingredientsArray.length;
      component.removeIngredient(0);
      expect(component.ingredientsArray.length).toBe(before - 1);
    });
  });

  // ─── Tags ─────────────────────────────────────────────────────────────────

  describe('removeTag()', () => {
    it('should remove the specified tag', () => {
      component.dishForm.get('tags')?.setValue(['soup', 'noodle']);
      component.removeTag('soup');
      expect(component.dishForm.get('tags')?.value).toEqual(['noodle']);
    });
  });

  describe('updateTags()', () => {
    it('should add a tag from chip input event', () => {
      component.dishForm.get('tags')?.setValue(['soup']);
      const event = { value: 'noodle', chipInput: { clear: jasmine.createSpy() } } as unknown as MatChipInputEvent;
      component.updateTags(event);
      expect(component.dishForm.get('tags')?.value).toContain('noodle');
    });
  });

  // ─── Labels ───────────────────────────────────────────────────────────────

  describe('removeLabel()', () => {
    it('should remove the specified label', () => {
      component.dishForm.get('labels')?.setValue(['popular', 'spicy']);
      component.removeLabel('popular');
      expect(component.dishForm.get('labels')?.value).toEqual(['spicy']);
    });
  });

  describe('updateLabel()', () => {
    it('should add a label from chip input event', () => {
      component.dishForm.get('labels')?.setValue([]);
      const event = { value: 'spicy', chipInput: { clear: jasmine.createSpy() } } as unknown as MatChipInputEvent;
      component.updateLabel(event);
      expect(component.dishForm.get('labels')?.value).toContain('spicy');
    });
  });

  // ─── Meal Categories ──────────────────────────────────────────────────────

  describe('removeCategory()', () => {
    it('should remove the specified meal category', () => {
      component.dishForm.get('mealCategories')?.setValue(['BREAKFAST', 'LUNCH']);
      component.removeCategory('BREAKFAST');
      expect(component.dishForm.get('mealCategories')?.value).toEqual(['LUNCH']);
    });
  });

  describe('updateMealCategories()', () => {
    it('should append a new meal category', () => {
      component.dishForm.get('mealCategories')?.setValue(['BREAKFAST']);
      const event = { value: 'LUNCH' } as MatChipInputEvent;
      component.updateMealCategories(event);
      expect(component.dishForm.get('mealCategories')?.value).toContain('LUNCH');
    });
  });

  // ─── Ingredient Categories ────────────────────────────────────────────────

  describe('removeIngredientCategory()', () => {
    it('should remove the specified ingredient category', () => {
      component.dishForm.get('ingredientCategories')?.setValue(['MEAT', 'VEGETABLE']);
      component.removeIngredientCategory('MEAT');
      expect(component.dishForm.get('ingredientCategories')?.value).toEqual(['VEGETABLE']);
    });
  });

  describe('updateIngredientCategories()', () => {
    it('should append a new ingredient category', () => {
      component.dishForm.get('ingredientCategories')?.setValue([]);
      const event = { value: 'SEAFOOD' } as MatChipInputEvent;
      component.updateIngredientCategories(event);
      expect(component.dishForm.get('ingredientCategories')?.value).toContain('SEAFOOD');
    });
  });

  // ─── Related Dishes ───────────────────────────────────────────────────────

  describe('removeRelatedDish()', () => {
    it('should remove the specified related dish from selectedRelatedDishes', () => {
      component.selectedRelatedDishes = [mockDish];
      component.removeRelatedDish(mockDish);
      expect(component.selectedRelatedDishes.length).toBe(0);
    });

    it('should update the relatedDishes form control after removal', () => {
      component.selectedRelatedDishes = [mockDish];
      component.removeRelatedDish(mockDish);
      expect(component.dishForm.get('relatedDishes')?.value).toEqual([]);
    });
  });

  describe('selectedRelatedDish()', () => {
    it('should add the selected dish and reset the input', () => {
      const nativeInputMock = document.createElement('input');
      (component as any).relatedDishInput = { nativeElement: nativeInputMock };

      const event = { option: { value: mockDish } } as MatAutocompleteSelectedEvent;
      component.selectedRelatedDish(event);

      expect(component.selectedRelatedDishes).toContain(mockDish);
      expect(nativeInputMock.value).toBe('');
    });
  });

  // ─── getVideoEmbedUrl ──────────────────────────────────────────────────────

  describe('getVideoEmbedUrl()', () => {
    it('should return null for empty url', () => {
      expect(component.getVideoEmbedUrl('')).toBeNull();
    });

    it('should return a YouTube embed URL for a standard watch link', () => {
      const result = component.getVideoEmbedUrl('https://www.youtube.com/watch?v=abc123xyz00') as string;
      expect(result).toContain('youtube.com/embed/abc123xyz00');
    });

    it('should return a YouTube embed URL for a short youtu.be link', () => {
      const result = component.getVideoEmbedUrl('https://youtu.be/abc123xyz00') as string;
      expect(result).toContain('youtube.com/embed/abc123xyz00');
    });

    it('should return a Vimeo embed URL', () => {
      const result = component.getVideoEmbedUrl('https://vimeo.com/123456789') as string;
      expect(result).toContain('player.vimeo.com/video/123456789');
    });

    it('should return null for an unrecognized URL', () => {
      expect(component.getVideoEmbedUrl('https://dailymotion.com/video/xyz')).toBeNull();
    });
  });

  // ─── previewImage ──────────────────────────────────────────────────────────

  describe('previewImage()', () => {
    it('should open the image dialog with the provided URL', () => {
      component.previewImage('https://example.com/image.jpg');
      expect(dialogMock.open).toHaveBeenCalled();
    });
  });

  // ─── previewVideo ──────────────────────────────────────────────────────────

  describe('previewVideo()', () => {
    it('should do nothing for an empty url', () => {
      component.previewVideo('');
      expect(dialogMock.open).not.toHaveBeenCalled();
    });

    it('should open the video dialog for a valid YouTube URL', () => {
      component.previewVideo('https://www.youtube.com/watch?v=abc123xyz00');
      expect(dialogMock.open).toHaveBeenCalled();
    });
  });

  // ─── displayIngredient ────────────────────────────────────────────────────

  describe('displayIngredient()', () => {
    it('should return empty string for null/undefined ingredient', () => {
      expect(component.displayIngredient(null as any)).toBe('');
    });

    it('should return the title matching the current locale', () => {
      const result = component.displayIngredient(mockIngredient);
      expect(result).toBe('Beef');
    });

    it('should return empty string when ingredient has no title array', () => {
      const broken = { ...mockIngredient, title: null as any };
      expect(component.displayIngredient(broken)).toBe('');
    });
  });

  // ─── markFormGroupTouched ─────────────────────────────────────────────────

  describe('markFormGroupTouched()', () => {
    it('should mark all controls in the form group as touched', () => {
      component.markFormGroupTouched(component.dishForm);
      Object.values(component.dishForm.controls).forEach((control) => {
        expect(control.touched).toBeTrue();
      });
    });
  });

  // ─── onSubmit ─────────────────────────────────────────────────────────────

  describe('onSubmit()', () => {
    it('should mark form as touched when form is invalid', () => {
      component.dishForm.get('slug')?.setValue('');
      spyOn(component, 'markFormGroupTouched').and.callThrough();
      component.onSubmit();
      expect(component.markFormGroupTouched).toHaveBeenCalledWith(component.dishForm);
    });

    it('should call dishService.create when form is valid and no dishId', () => {
      fillValidForm();
      (component as any).dishId = undefined;
      component.onSubmit();
      expect(dishServiceMock.create).toHaveBeenCalled();
    });

    it('should call dishService.update when form is valid and dishId is set', () => {
      fillValidForm();
      (component as any).dishId = 'dish-1';
      component.onSubmit();
      expect(dishServiceMock.update).toHaveBeenCalledWith('dish-1', jasmine.any(Object));
    });

    it('should navigate to admin/dish after successful create', () => {
      fillValidForm();
      (component as any).dishId = undefined;
      component.onSubmit();
      expect(routerMock.navigate).toHaveBeenCalledWith(['admin', 'dish']);
    });

    it('should navigate to admin/dish after successful update', () => {
      fillValidForm();
      (component as any).dishId = 'dish-1';
      component.onSubmit();
      expect(routerMock.navigate).toHaveBeenCalledWith(['admin', 'dish']);
    });
  });

  // ─── ngOnInit with route params ──────────────────────────────────────────

  describe('ngOnInit() with route params', () => {
    it('should NOT call dishService.findOne when id is "create"', () => {
      dishServiceMock.findOne.calls.reset();
      paramsSubject.next({ id: 'create' });
      expect(dishServiceMock.findOne).not.toHaveBeenCalled();
    });

    it('should call dishService.findOne when a real id is given', () => {
      paramsSubject.next({ id: 'dish-1' });
      expect(dishServiceMock.findOne).toHaveBeenCalledWith('dish-1');
    });

    it('should patch the form with the fetched dish data', () => {
      paramsSubject.next({ id: 'dish-1' });
      expect(component.dishForm.get('slug')?.value).toBe(mockDish.slug);
    });
  });

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function fillValidForm() {
    component.dishForm.get('slug')?.setValue('test-dish');
    // Ensure all ingredient rows have a valid ingredient and quantity
    component.ingredientsArray.controls.forEach((ctrl) => {
      ctrl.get('quantity')?.setValue(100);
      ctrl.get('ingredient')?.setValue(mockIngredient);
    });
  }
});
