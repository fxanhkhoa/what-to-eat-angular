import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { FormGroup } from '@angular/forms';

import { AdminIngredientUpdateComponent } from './admin-ingredient-update.component';
import { IngredientService } from '@/app/service/ingredient.service';
import { ToastService } from '@/app/shared/service/toast.service';
import { Ingredient } from '@/types/ingredient.type';

const mockIngredient: Ingredient = {
  _id: 'ing-1',
  slug: 'beef',
  title: [
    { lang: 'en', data: 'Beef' },
    { lang: 'vi', data: 'Thịt Bò' },
  ],
  measure: 'g',
  calories: 250,
  carbohydrate: 0,
  fat: 15,
  ingredientCategory: ['MEAT'],
  weight: 100,
  protein: 26,
  cholesterol: 70,
  sodium: 60,
  images: ['https://example.com/beef.jpg'],
  deleted: false,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('AdminIngredientUpdateComponent', () => {
  let component: AdminIngredientUpdateComponent;
  let fixture: ComponentFixture<AdminIngredientUpdateComponent>;
  let ingredientServiceMock: jasmine.SpyObj<IngredientService>;
  let toastServiceMock: jasmine.SpyObj<ToastService>;
  let routerMock: jasmine.SpyObj<Router>;
  let paramsSubject: Subject<any>;

  beforeEach(async () => {
    paramsSubject = new Subject<any>();

    ingredientServiceMock = jasmine.createSpyObj('IngredientService', [
      'findOne',
      'create',
      'update',
    ]);
    ingredientServiceMock.findOne.and.returnValue(of(mockIngredient));
    ingredientServiceMock.create.and.returnValue(of(mockIngredient));
    ingredientServiceMock.update.and.returnValue(of(mockIngredient));

    toastServiceMock = jasmine.createSpyObj('ToastService', ['showSuccess', 'showError']);

    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [AdminIngredientUpdateComponent],
      providers: [
        { provide: IngredientService, useValue: ingredientServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: { params: paramsSubject.asObservable() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminIngredientUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── Form Initialization ───────────────────────────────────────────────────

  describe('initForm()', () => {
    it('should create form with all expected controls', () => {
      expect(component.ingredientForm.get('slug')).toBeTruthy();
      expect(component.ingredientForm.get('measure')).toBeTruthy();
      expect(component.ingredientForm.get('calories')).toBeTruthy();
      expect(component.ingredientForm.get('carbohydrate')).toBeTruthy();
      expect(component.ingredientForm.get('fat')).toBeTruthy();
      expect(component.ingredientForm.get('ingredientCategory')).toBeTruthy();
      expect(component.ingredientForm.get('weight')).toBeTruthy();
      expect(component.ingredientForm.get('protein')).toBeTruthy();
      expect(component.ingredientForm.get('cholesterol')).toBeTruthy();
      expect(component.ingredientForm.get('sodium')).toBeTruthy();
    });

    it('should require slug', () => {
      component.ingredientForm.get('slug')?.setValue('');
      expect(component.ingredientForm.get('slug')?.valid).toBeFalse();
    });

    it('should validate slug pattern (lowercase, digits, hyphens only)', () => {
      component.ingredientForm.get('slug')?.setValue('Invalid Slug!');
      expect(component.ingredientForm.get('slug')?.valid).toBeFalse();

      component.ingredientForm.get('slug')?.setValue('valid-slug-123');
      expect(component.ingredientForm.get('slug')?.valid).toBeTrue();
    });

    it('should require ingredientCategory', () => {
      component.ingredientForm.get('ingredientCategory')?.setValue([]);
      expect(component.ingredientForm.get('ingredientCategory')?.valid).toBeFalse();
    });

    it('should initialize title and images as empty FormArrays', () => {
      expect(component.titleArray.length).toBe(0);
      expect(component.imagesArray.length).toBe(0);
    });
  });

  // ─── FormArray getters ─────────────────────────────────────────────────────

  describe('titleArray getter', () => {
    it('should return the title FormArray', () => {
      expect(component.titleArray).toBe(
        component.ingredientForm.get('title') as any
      );
    });
  });

  describe('imagesArray getter', () => {
    it('should return the images FormArray', () => {
      expect(component.imagesArray).toBe(
        component.ingredientForm.get('images') as any
      );
    });
  });

  // ─── createLanguageControl ────────────────────────────────────────────────

  describe('createLanguageControl()', () => {
    it('should create a FormGroup with lang and data controls', () => {
      const group = component.createLanguageControl({ lang: 'en', data: 'Beef' });
      expect(group.get('lang')?.value).toBe('en');
      expect(group.get('data')?.value).toBe('Beef');
    });

    it('should default to empty strings when called without arguments', () => {
      const group = component.createLanguageControl();
      expect(group.get('lang')?.value).toBe('');
      expect(group.get('data')?.value).toBe('');
    });
  });

  // ─── addLanguage / removeLanguage ─────────────────────────────────────────

  describe('addLanguage()', () => {
    it('should add a new language control to titleArray', () => {
      const before = component.titleArray.length;
      component.addLanguage();
      expect(component.titleArray.length).toBe(before + 1);
    });
  });

  describe('removeLanguage()', () => {
    it('should remove the language control at the given index', () => {
      component.addLanguage();
      component.addLanguage();
      const before = component.titleArray.length;
      component.removeLanguage(0);
      expect(component.titleArray.length).toBe(before - 1);
    });
  });

  // ─── addImage / removeImage ───────────────────────────────────────────────

  describe('addImage()', () => {
    it('should add an empty image control', () => {
      const before = component.imagesArray.length;
      component.addImage();
      expect(component.imagesArray.length).toBe(before + 1);
    });
  });

  describe('removeImage()', () => {
    it('should remove the image control at the given index', () => {
      component.addImage();
      component.addImage();
      const before = component.imagesArray.length;
      component.removeImage(0);
      expect(component.imagesArray.length).toBe(before - 1);
    });
  });

  // ─── markFormGroupTouched ─────────────────────────────────────────────────

  describe('markFormGroupTouched()', () => {
    it('should mark all controls as touched', () => {
      component.markFormGroupTouched(component.ingredientForm);
      Object.values(component.ingredientForm.controls).forEach((ctrl) => {
        expect(ctrl.touched).toBeTrue();
      });
    });
  });

  // ─── onCancel ────────────────────────────────────────────────────────────

  describe('onCancel()', () => {
    it('should navigate to /admin/ingredient', () => {
      component.onCancel();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/admin/ingredient']);
    });
  });

  // ─── onSubmit ─────────────────────────────────────────────────────────────

  describe('onSubmit()', () => {
    it('should mark form as touched when form is invalid', () => {
      spyOn(component, 'markFormGroupTouched').and.callThrough();
      component.ingredientForm.get('slug')?.setValue('');
      component.onSubmit();
      expect(component.markFormGroupTouched).toHaveBeenCalledWith(
        component.ingredientForm
      );
    });

    it('should call ingredientService.create when form is valid and no ingredientId', () => {
      fillValidForm();
      (component as any).ingredientId = undefined;
      component.onSubmit();
      expect(ingredientServiceMock.create).toHaveBeenCalled();
    });

    it('should call ingredientService.update when form is valid and ingredientId is set', () => {
      fillValidForm();
      (component as any).ingredientId = 'ing-1';
      component.onSubmit();
      expect(ingredientServiceMock.update).toHaveBeenCalledWith(
        'ing-1',
        jasmine.objectContaining({ id: 'ing-1' })
      );
    });

    it('should navigate to /admin/ingredient after successful create', () => {
      fillValidForm();
      (component as any).ingredientId = undefined;
      component.onSubmit();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/admin/ingredient']);
    });

    it('should navigate to /admin/ingredient after successful update', () => {
      fillValidForm();
      (component as any).ingredientId = 'ing-1';
      component.onSubmit();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/admin/ingredient']);
    });

    it('should show success toast after successful create', () => {
      fillValidForm();
      (component as any).ingredientId = undefined;
      component.onSubmit();
      expect(toastServiceMock.showSuccess).toHaveBeenCalled();
    });

    it('should show success toast after successful update', () => {
      fillValidForm();
      (component as any).ingredientId = 'ing-1';
      component.onSubmit();
      expect(toastServiceMock.showSuccess).toHaveBeenCalled();
    });

  });

  // ─── ngOnInit with route params ───────────────────────────────────────────

  describe('ngOnInit() with route params', () => {
    it('should NOT call ingredientService.findOne when id is "create"', () => {
      ingredientServiceMock.findOne.calls.reset();
      paramsSubject.next({ id: 'create' });
      expect(ingredientServiceMock.findOne).not.toHaveBeenCalled();
    });

    it('should call ingredientService.findOne with the route id', () => {
      paramsSubject.next({ id: 'ing-1' });
      expect(ingredientServiceMock.findOne).toHaveBeenCalledWith('ing-1');
    });

    it('should patch the form with the fetched ingredient', () => {
      paramsSubject.next({ id: 'ing-1' });
      expect(component.ingredientForm.get('slug')?.value).toBe(mockIngredient.slug);
    });

    it('should populate titleArray from the fetched ingredient', () => {
      paramsSubject.next({ id: 'ing-1' });
      expect(component.titleArray.length).toBe(mockIngredient.title.length);
    });

    it('should populate imagesArray from the fetched ingredient', () => {
      paramsSubject.next({ id: 'ing-1' });
      expect(component.imagesArray.length).toBe(mockIngredient.images.length);
    });

    it('should set ingredientId from the route params', () => {
      paramsSubject.next({ id: 'ing-1' });
      expect((component as any).ingredientId).toBe('ing-1');
    });
  });

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function fillValidForm() {
    component.ingredientForm.get('slug')?.setValue('beef');
    component.ingredientForm.get('ingredientCategory')?.setValue(['MEAT']);
  }
});
