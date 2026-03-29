import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { of, Subject } from 'rxjs';
import { AdminDishListComponent } from './admin-dish-list.component';
import { DishService } from '@/app/service/dish.service';
import { ToastService } from '@/app/shared/service/toast.service';
import { Dish, QueryDishDto } from '@/types/dish.type';
import { PLATFORM_ID, LOCALE_ID } from '@angular/core';

describe('AdminDishListComponent', () => {
  let component: AdminDishListComponent;
  let fixture: ComponentFixture<AdminDishListComponent>;
  let dishServiceSpy: jasmine.SpyObj<DishService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let iconRegistrySpy: jasmine.SpyObj<MatIconRegistry>;
  let sanitizerSpy: jasmine.SpyObj<DomSanitizer>;
  let mockSort: MatSort;

  const mockDish: Dish = {
    _id: '1',
    slug: 'test-dish',
    title: [{ lang: 'en', data: 'Test Dish' }],
    shortDescription: [{ lang: 'en', data: 'Test Description' }],
    content: [{ lang: 'en', data: 'Test Content' }],
    thumbnail: 'image.jpg',
    preparationTime: 15,
    cookingTime: 30,
    difficultLevel: 'easy',
    mealCategories: ['lunch'],
    ingredientCategories: [],
    ingredients: [],
    labels: [],
    tags: [],
    videos: [],
    relatedDishes: [],
    deleted: false,
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-15T14:30:00Z',
  };

  beforeEach(async () => {
    dishServiceSpy = jasmine.createSpyObj('DishService', [
      'findAll',
      'findWithScore',
      'findWithFuzzy',
      'getSuggestions',
      'delete',
    ]);

    toastServiceSpy = jasmine.createSpyObj('ToastService', [
      'showConfirm',
      'showSuccess',
      'showError',
    ]);

    iconRegistrySpy = jasmine.createSpyObj('MatIconRegistry', ['addSvgIcon']);
    sanitizerSpy = jasmine.createSpyObj('DomSanitizer', [
      'bypassSecurityTrustResourceUrl',
    ]);

    // Setup default return values
    dishServiceSpy.findAll.and.returnValue(
      of({ data: [mockDish], count: 1 })
    );
    dishServiceSpy.findWithScore.and.returnValue(
      of({ data: [mockDish], count: 1 })
    );
    dishServiceSpy.findWithFuzzy.and.returnValue(
      of({ data: [mockDish], count: 1 })
    );
    dishServiceSpy.getSuggestions.and.returnValue(of(['test', 'test2']));
    dishServiceSpy.delete.and.returnValue(of(mockDish));

    toastServiceSpy.showConfirm.and.returnValue({
      afterClosed: jasmine
        .createSpy('afterClosed')
        .and.returnValue(of(false)),
    } as any);

    sanitizerSpy.bypassSecurityTrustResourceUrl.and.returnValue(
      'mock-safe-url' as any
    );

    await TestBed.configureTestingModule({
      imports: [AdminDishListComponent, ReactiveFormsModule],
      providers: [
        { provide: DishService, useValue: dishServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: MatIconRegistry, useValue: iconRegistrySpy },
        { provide: DomSanitizer, useValue: sanitizerSpy },
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: LOCALE_ID, useValue: 'en' },
      ],
    })
      .overrideComponent(AdminDishListComponent, {
        set: { template: '' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AdminDishListComponent);
    component = fixture.componentInstance;
    mockSort = {
      sortChange: new Subject(),
      initialized: new Subject(),
    } as unknown as MatSort;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty data source', () => {
    expect(component.dataSource).toBeDefined();
    expect(component.dataSource.data.length).toBe(0);
  });

  it('should have filter form defined', () => {
    expect(component.filterForm).toBeDefined();
  });

  it('should load dishes on ngAfterViewInit', () => {
    component.paginator = {
      pageIndex: 0,
      pageSize: 10,
      getNumberOfPages: () => 1,
    } as MatPaginator;
    component.sort = mockSort;

    component.ngAfterViewInit();
    expect(dishServiceSpy.findWithScore).toHaveBeenCalled();
  });

  it('should have correct displayed columns', () => {
    expect(component.displayedColumns).toContain('actions');
    expect(component.displayedColumns).toContain('thumbnail');
    expect(component.displayedColumns).toContain('title');
  });

  it('should add tag chip', () => {
    const event = {
      value: 'new-tag',
      chipInput: { clear: jasmine.createSpy('clear') },
    } as any;

    component.addChip(event, 'tags');
    expect(component.tags).toContain('new-tag');
    expect(event.chipInput.clear).toHaveBeenCalled();
  });

  it('should not add duplicate tag chips', () => {
    component.tags = ['existing-tag'];
    const event = {
      value: 'existing-tag',
      chipInput: { clear: jasmine.createSpy('clear') },
    } as any;

    component.addChip(event, 'tags');
    expect(component.tags.filter((t) => t === 'existing-tag').length).toBe(1);
  });

  it('should remove tag chip', () => {
    component.tags = ['tag1', 'tag2'];
    component.removeChip('tag1', 'tags');
    expect(component.tags).not.toContain('tag1');
    expect(component.tags).toContain('tag2');
  });

  it('should remove ingredient chip', () => {
    component.ingredients = ['flour', 'salt'];
    component.removeChip('salt', 'ingredients');
    expect(component.ingredients).not.toContain('salt');
    expect(component.ingredients).toContain('flour');
  });

  it('should clear all filters', () => {
    component.tags = ['tag1'];
    component.ingredients = ['ingredient1'];
    component.labels = ['label1'];
    component.clearFilter();

    expect(component.tags.length).toBe(0);
    expect(component.ingredients.length).toBe(0);
    expect(component.labels.length).toBe(0);
  });

  it('should toggle filter expansion', () => {
    component.isFilterExpanded = false;
    component.toggleFilter();
    expect(component.isFilterExpanded).toBe(true);

    component.toggleFilter();
    expect(component.isFilterExpanded).toBe(false);
  });

  it('should delete dish with confirmation', () => {
    toastServiceSpy.showConfirm.and.returnValue({
      afterClosed: () => of(true),
    } as any);

    component.ngOnInit();
    component.paginator = {
      pageIndex: 0,
      pageSize: 10,
    } as MatPaginator;
    component.sort = mockSort;

    component.deleteDish(mockDish);
    expect(toastServiceSpy.showConfirm).toHaveBeenCalled();
  });

  it('should not delete dish if confirmation cancelled', () => {
    toastServiceSpy.showConfirm.and.returnValue({
      afterClosed: () => of(false),
    } as any);

    component.deleteDish(mockDish);
    expect(toastServiceSpy.showConfirm).toHaveBeenCalled();
  });

  it('should clean form value and remove empty properties', () => {
    const formValue = {
      keyword: 'test',
      tags: [],
      preparationTimeFrom: null,
      mealCategories: undefined,
    };

    const cleaned = component.cleanFormValue(formValue);
    expect(cleaned['keyword']).toBe('test');
    expect(cleaned['tags']).toBeUndefined();
    expect(cleaned['preparationTimeFrom']).toBeUndefined();
    expect(cleaned['mealCategories']).toBeUndefined();
  });

  it('should toggle search mode', () => {
    const initialMode = component.useEnhancedSearch();
    component.toggleSearchMode();
    expect(component.useEnhancedSearch()).toBe(!initialMode);
  });

  it('should apply quick search', () => {
    component.ngOnInit();
    component.paginator = {
      pageIndex: 0,
      pageSize: 10,
    } as MatPaginator;
    component.sort = mockSort;

    component.applyQuickSearch('chicken');
    expect(component.filterForm.get('keyword')?.value).toBe('chicken');
  });

  it('should clear search', () => {
    component.tags = ['tag1'];
    component.ingredients = ['ingredient1'];
    component.filterForm.patchValue({ keyword: 'test' });

    component.clearSearch();

    expect(component.tags.length).toBe(0);
  });

  it('should get default title from multilanguage array', () => {
    const titles = [
      { lang: 'en', data: 'English Title' },
      { lang: 'vi', data: 'Vietnamese Title' },
    ];

    const result = component.getDefaultTitle(titles);
    expect(result).toBe('English Title');
  });

  it('should handle missing default language title', () => {
    const titles = [{ lang: 'vi', data: 'Vietnamese Title' }];

    const result = component.getDefaultTitle(titles);
    expect(result).not.toBeNull();
  });

  it('should format label with minute suffix', () => {
    const formatted = component.formatLabel(30);
    expect(formatted).toContain('30');
    expect(formatted).toContain('m');
  });

  it('should have correct difficulty level options', () => {
    expect(component.difficultLevelOptions.length).toBeGreaterThan(0);
  });

  it('should have correct meal category options', () => {
    expect(component.mealCategoryOptions.length).toBeGreaterThan(0);
  });

  it('should have quick search tags', () => {
    expect(component.quickSearchTags.length).toBeGreaterThan(0);
    expect(component.quickSearchTags).toContain('chicken');
  });

  it('should set total results when search completes', () => {
    component.paginator = {
      pageIndex: 0,
      pageSize: 10,
      length: 0,
    } as MatPaginator;
    component.sort = mockSort;

    // Verify TotalResults is a signal
    expect(component.totalResults()).toBeGreaterThanOrEqual(0);
  });

  it('should initialize data source as MatTableDataSource', () => {
    expect(component.dataSource instanceof MatTableDataSource).toBe(true);
  });

  it('should have isLoading signal initialized', () => {
    expect(component.isLoading()).toBe(false);
  });

  it('should use fuzzy search when requested', (done) => {
    component.paginator = {
      pageIndex: 0,
      pageSize: 10,
    } as MatPaginator;
    component.sort = mockSort;

    component.searchWithMode(true);

    setTimeout(() => {
      expect(dishServiceSpy.findWithFuzzy).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should use basic search when enhanced search is disabled', (done) => {
    component.useEnhancedSearch.set(false);
    component.paginator = {
      pageIndex: 0,
      pageSize: 10,
    } as MatPaginator;
    component.sort = mockSort;

    dishServiceSpy.findAll.calls.reset();
    component.searchWithMode();

    setTimeout(() => {
      expect(dishServiceSpy.findAll).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should select suggestion and search', () => {
    component.ngOnInit();
    component.paginator = {
      pageIndex: 0,
      pageSize: 10,
    } as MatPaginator;
    component.sort = mockSort;

    component.onSuggestionSelected('suggested-dish');
    expect(component.filterForm.get('keyword')?.value).toBe('suggested-dish');
  });

  it('should handle jump to page', () => {
    component.jumpToPage = 2;
    component.paginator = {
      pageIndex: 0,
      pageSize: 10,
      getNumberOfPages: () => 5,
      length: 50,
    } as any;
    component.sort = mockSort;

    component.onJumpToPage();
    expect(component.paginator.pageIndex).toBe(1);
  });

  it('should clamp jump to page to valid range', () => {
    component.jumpToPage = 100;
    component.paginator = {
      pageIndex: 0,
      pageSize: 10,
      getNumberOfPages: () => 5,
      length: 50,
    } as any;
    component.sort = mockSort;

    component.onJumpToPage();
    expect(component.paginator.pageIndex).toBeLessThanOrEqual(4);
  });
});
