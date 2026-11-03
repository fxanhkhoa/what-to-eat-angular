import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { AdminIngredientListComponent } from './admin-ingredient-list.component';
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

describe('AdminIngredientListComponent', () => {
  let component: AdminIngredientListComponent;
  let fixture: ComponentFixture<AdminIngredientListComponent>;
  let ingredientServiceMock: jasmine.SpyObj<IngredientService>;
  let toastServiceMock: jasmine.SpyObj<ToastService>;
  let dialogMock: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    ingredientServiceMock = jasmine.createSpyObj('IngredientService', [
      'findAll',
      'delete',
    ]);
    ingredientServiceMock.findAll.and.returnValue(
      of({ data: [mockIngredient], count: 1 })
    );
    ingredientServiceMock.delete.and.returnValue(of(void 0 as any));

    toastServiceMock = jasmine.createSpyObj('ToastService', [
      'showSuccess',
      'showError',
      'showConfirm',
    ]);
    toastServiceMock.showConfirm.and.returnValue({
      afterClosed: () => of(false),
    } as any);

    dialogMock = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [AdminIngredientListComponent],
      providers: [
        { provide: IngredientService, useValue: ingredientServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: (_key: string) => null },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminIngredientListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── Initial state ────────────────────────────────────────────────────────

  it('should have the expected displayed columns', () => {
    expect(component.displayedColumns).toContain('slug');
    expect(component.displayedColumns).toContain('title');
    expect(component.displayedColumns).toContain('action');
  });

  it('should start with isLoading = false after data loads', () => {
    expect(component.isLoading()).toBeFalse();
  });

  // ─── loadData ─────────────────────────────────────────────────────────────

  it('should load data on init and populate dataSource', () => {
    expect(ingredientServiceMock.findAll).toHaveBeenCalled();
    expect(component.dataSource.data.length).toBe(1);
    expect(component.dataSource.data[0].slug).toBe('beef');
  });

  it('should extract unique categories from loaded data', () => {
    expect(component.availableCategories).toContain('MEAT');
  });

  it('should set dataSource to empty array when count is 0', () => {
    ingredientServiceMock.findAll.and.returnValue(of({ data: [], count: 0 }));
    component.loadData();
    expect(component.dataSource.data.length).toBe(0);
  });

  it('should pass keyword to service when provided', () => {
    component.loadData('beef');
    expect(ingredientServiceMock.findAll).toHaveBeenCalledWith(
      jasmine.objectContaining({ keyword: 'beef' })
    );
  });

  // ─── searchControl changes ────────────────────────────────────────────────

  it('should call loadData with no keyword when searchControl is cleared', fakeAsync(() => {
    ingredientServiceMock.findAll.calls.reset();
    component.searchControl.setValue('');
    tick(300);
    expect(ingredientServiceMock.findAll).toHaveBeenCalled();
  }));

  it('should call loadData with keyword when searchControl has a value', fakeAsync(() => {
    ingredientServiceMock.findAll.calls.reset();
    component.searchControl.setValue('pork');
    tick(300);
    expect(ingredientServiceMock.findAll).toHaveBeenCalledWith(
      jasmine.objectContaining({ keyword: 'pork' })
    );
  }));

  // ─── applyFilter ──────────────────────────────────────────────────────────

  it('should trim and lowercase the filter value', () => {
    component.applyFilter('  BEEF  ');
    expect(component.dataSource.filter).toBe('beef');
  });

  // ─── filterByCategory ────────────────────────────────────────────────────

  it('should reset filter predicate when category is empty', () => {
    component.filterByCategory('');
    expect(component.dataSource.filter).toBe('');
  });

  it('should set a custom filter predicate when a category is provided', () => {
    component.dataSource.data = [mockIngredient];
    component.filterByCategory('MEAT');
    // The filter string is set to the category
    expect(component.dataSource.filter).toBe('MEAT');
    // An ingredient matching the category should pass the predicate
    expect(component.dataSource.filterPredicate(mockIngredient, 'MEAT')).toBeTrue();
  });

  it('should exclude items that do not match the category', () => {
    component.dataSource.data = [mockIngredient];
    component.filterByCategory('VEGETABLE');
    expect(component.dataSource.filterPredicate(mockIngredient, 'VEGETABLE')).toBeFalse();
  });

  // ─── clearFilters ────────────────────────────────────────────────────────

  it('should reset searchControl, categoryFilter, and dataSource filter', () => {
    component.searchControl.setValue('beef');
    component.categoryFilter.setValue('MEAT');
    component.dataSource.filter = 'beef';

    component.clearFilters();

    expect(component.searchControl.value).toBe('');
    expect(component.categoryFilter.value).toBe('');
    expect(component.dataSource.filter).toBe('');
  });

  // ─── getTitle ─────────────────────────────────────────────────────────────

  it('should return the English title when available', () => {
    expect(component.getTitle(mockIngredient.title)).toBe('Beef');
  });

  it('should return the first available title when no English title exists', () => {
    const titles = [{ lang: 'vi', data: 'Thịt Bò' }];
    expect(component.getTitle(titles)).toBe('Thịt Bò');
  });

  it('should return "N/A" for an empty titles array', () => {
    expect(component.getTitle([])).toBe('N/A');
  });

  // ─── onDelete ─────────────────────────────────────────────────────────────

  it('should call showConfirm when deleting an ingredient', () => {
    component.onDelete('ing-1');
    expect(toastServiceMock.showConfirm).toHaveBeenCalled();
  });

  it('should NOT call delete when user cancels the confirmation', () => {
    toastServiceMock.showConfirm.and.returnValue({
      afterClosed: () => of(false),
    } as any);
    component.onDelete('ing-1');
    expect(ingredientServiceMock.delete).not.toHaveBeenCalled();
  });

  it('should call ingredientService.delete when user confirms', () => {
    toastServiceMock.showConfirm.and.returnValue({
      afterClosed: () => of(true),
    } as any);
    component.onDelete('ing-1');
    expect(ingredientServiceMock.delete).toHaveBeenCalledWith('ing-1');
  });

  it('should show success toast and reload data after deletion', () => {
    toastServiceMock.showConfirm.and.returnValue({
      afterClosed: () => of(true),
    } as any);
    ingredientServiceMock.findAll.calls.reset();
    component.onDelete('ing-1');
    expect(toastServiceMock.showSuccess).toHaveBeenCalled();
    expect(ingredientServiceMock.findAll).toHaveBeenCalled();
  });

  // ─── previewImage ────────────────────────────────────────────────────────

  it('should open the image dialog with the provided URL', () => {
    component.previewImage('https://example.com/beef.jpg');
    expect(dialogMock.open).toHaveBeenCalled();
  });

  // ─── handleImageError ────────────────────────────────────────────────────

  it('should set a placeholder src and add error class on image error', () => {
    const img = document.createElement('img');
    component.handleImageError({ target: img });
    expect(img.src).toContain('placeholder.png');
    expect(img.classList.contains('error-image')).toBeTrue();
  });

  // ─── sortingDataAccessor ──────────────────────────────────────────────────

  it('should return English title for title sort property', () => {
    const result = component.dataSource.sortingDataAccessor(
      mockIngredient,
      'title'
    );
    expect(result).toBe('Beef');
  });

  it('should return joined categories for ingredientCategory sort property', () => {
    const result = component.dataSource.sortingDataAccessor(
      mockIngredient,
      'ingredientCategory'
    );
    expect(result).toBe('MEAT');
  });

  it('should return the raw field value for other sort properties', () => {
    const result = component.dataSource.sortingDataAccessor(
      mockIngredient,
      'slug'
    );
    expect(result).toBe('beef');
  });
});
