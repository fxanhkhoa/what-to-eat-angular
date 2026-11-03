import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { UserDishListCreateComponent } from './user-dish-list-create.component';
import { UserDishCollectionService } from '@/app/service/user-dish-collection.service';
import { ToastService } from '@/app/shared/service/toast.service';
import { AuthService } from '@/app/service/auth.service';
import { DishService } from '@/app/service/dish.service';
import { User } from '@/types/user.type';
import { Dish } from '@/types/dish.type';
import { UserDishCollection } from '@/types/user-dish-collection.type';

const mockUser: User = { _id: 'user-1', name: 'Alice' } as any;

const makeDish = (slug: string): Dish =>
  ({
    slug,
    title: [{ lang: 'en', data: `Dish ${slug}` }],
    thumbnail: 'https://img.example.com/t.jpg',
    mealCategories: [],
  }) as any;

const mockCollection: UserDishCollection = {
  _id: 'col-1',
  name: 'Test Collection',
  dishSlugs: ['dish-a', 'dish-b'],
  description: 'A test collection',
  occasion: 'birthday',
  icon: 'cake',
  color: '#ef4444',
  isPublic: true,
  tags: ['tag1'],
  sortOrder: 0,
} as any;

describe('UserDishListCreateComponent — create mode', () => {
  let component: UserDishListCreateComponent;
  let fixture: ComponentFixture<UserDishListCreateComponent>;
  let collectionSpy: jasmine.SpyObj<UserDishCollectionService>;
  let toastSpy: jasmine.SpyObj<ToastService>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let dishSpy: jasmine.SpyObj<DishService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    collectionSpy = jasmine.createSpyObj('UserDishCollectionService', [
      'findAll', 'findById', 'create', 'update', 'duplicate',
    ]);
    toastSpy = jasmine.createSpyObj('ToastService', ['showSuccess', 'showError']);
    authSpy = jasmine.createSpyObj('AuthService', ['getProfile']);
    dishSpy = jasmine.createSpyObj('DishService', ['findWithScore', 'findBySlug']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    authSpy.getProfile.and.returnValue(of(mockUser));
    collectionSpy.findAll.and.returnValue(of({ data: [], count: 0 } as any));
    collectionSpy.create.and.returnValue(of(mockCollection));
    dishSpy.findWithScore.and.returnValue(of({ data: [], count: 0 } as any));

    await TestBed.configureTestingModule({
      imports: [UserDishListCreateComponent, NoopAnimationsModule],
      providers: [
        { provide: UserDishCollectionService, useValue: collectionSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: DishService, useValue: dishSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({}) } },
        },
      ],
    })
      .overrideComponent(UserDishListCreateComponent, {
        set: {
          schemas: [NO_ERRORS_SCHEMA],
          providers: [{ provide: MatDialog, useValue: dialogSpy }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(UserDishListCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── creation ──────────────────────────────────────────────────────────────────
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── initForm / form structure ─────────────────────────────────────────────────
  it('should build a collectionForm with required controls', () => {
    ['name', 'description', 'occasion', 'eventDate', 'icon', 'color', 'isPublic', 'tags'].forEach(
      (ctrl) => expect(component.collectionForm.contains(ctrl)).toBeTrue()
    );
  });

  it('name should be required', () => {
    component.collectionForm.get('name')!.setValue('');
    expect(component.collectionForm.get('name')!.hasError('required')).toBeTrue();
  });

  it('form should be valid when name is filled', () => {
    component.collectionForm.get('name')!.setValue('My List');
    expect(component.collectionForm.valid).toBeTrue();
  });

  it('should default icon to cake', () => {
    expect(component.collectionForm.get('icon')!.value).toBe('cake');
  });

  it('should default color to #3b82f6', () => {
    expect(component.collectionForm.get('color')!.value).toBe('#3b82f6');
  });

  it('should default isPublic to false', () => {
    expect(component.collectionForm.get('isPublic')!.value).toBeFalse();
  });

  // ── static data ───────────────────────────────────────────────────────────────
  it('should have 12 available icons', () => {
    expect(component.availableIcons.length).toBe(12);
  });

  it('should have 8 available colors', () => {
    expect(component.availableColors.length).toBe(8);
  });

  it('should have 9 occasions', () => {
    expect(component.occasions.length).toBe(9);
  });

  // ── ngOnInit behaviour ─────────────────────────────────────────────────────────
  it('should call getProfile on init', () => {
    expect(authSpy.getProfile).toHaveBeenCalled();
  });

  it('should set profile', () => {
    expect(component.profile).toEqual(mockUser);
  });

  it('should call loadCollectionCount on init (no id in route)', () => {
    expect(collectionSpy.findAll).toHaveBeenCalled();
  });

  it('isEditMode should return false in create mode', () => {
    expect(component.isEditMode()).toBeFalse();
  });

  // ── ngOnInit — server platform ────────────────────────────────────────────────
  it('should skip loading on server platform', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [UserDishListCreateComponent, NoopAnimationsModule],
      providers: [
        { provide: UserDishCollectionService, useValue: collectionSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: DishService, useValue: dishSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({}) } } },
      ],
    })
      .overrideComponent(UserDishListCreateComponent, { set: { schemas: [NO_ERRORS_SCHEMA] } })
      .compileComponents();
    authSpy.getProfile.calls.reset();
    collectionSpy.findAll.calls.reset();
    const f = TestBed.createComponent(UserDishListCreateComponent);
    f.detectChanges();
    expect(authSpy.getProfile).not.toHaveBeenCalled();
    expect(collectionSpy.findAll).not.toHaveBeenCalled();
    TestBed.resetTestingModule();
  });

  // ── dish selection ────────────────────────────────────────────────────────────
  it('addDish should add a dish to selectedDishes', () => {
    const dish = makeDish('slug-1');
    component.addDish(dish);
    expect(component.selectedDishes).toContain(dish);
  });

  it('addDish should not add a duplicate', () => {
    const dish = makeDish('slug-1');
    component.addDish(dish);
    component.addDish(dish);
    expect(component.selectedDishes.length).toBe(1);
  });

  it('removeDish should remove the dish with the given slug', () => {
    const dish = makeDish('slug-1');
    component.selectedDishes = [dish];
    component.removeDish('slug-1');
    expect(component.selectedDishes.length).toBe(0);
  });

  it('isDishSelected should return true for a selected dish', () => {
    component.selectedDishes = [makeDish('slug-1')];
    expect(component.isDishSelected('slug-1')).toBeTrue();
  });

  it('isDishSelected should return false for an unselected dish', () => {
    expect(component.isDishSelected('not-selected')).toBeFalse();
  });

  // ── onSearchChange ─────────────────────────────────────────────────────────────
  it('onSearchChange should update searchQuery', () => {
    component.onSearchChange('pasta');
    expect(component.searchQuery).toBe('pasta');
  });

  // ── setupDishSearch (debounced) ───────────────────────────────────────────────
  it('should populate searchResults after debounce on valid query', fakeAsync(() => {
    const results = [makeDish('r1'), makeDish('r2')];
    dishSpy.findWithScore.and.returnValue(of({ data: results, count: 2 } as any));
    component.onSearchChange('pasta');
    tick(300);
    expect(component.searchResults).toEqual(results);
    expect(component.loadingDishes).toBeFalse();
  }));

  it('should clear searchResults when query is shorter than 2 chars', fakeAsync(() => {
    component.searchResults = [makeDish('r1')];
    component.onSearchChange('p');
    tick(300);
    expect(component.searchResults).toEqual([]);
  }));

  // ── openDishDetail ────────────────────────────────────────────────────────────
  it('openDishDetail should open dialog and stop event propagation', () => {
    const dish = makeDish('slug-1');
    const event = jasmine.createSpyObj<Event>('Event', ['stopPropagation']);
    component.openDishDetail(dish, event);
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(dialogSpy.open).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.objectContaining({ data: dish })
    );
  });

  // ── createCollection — invalid form ───────────────────────────────────────────
  it('createCollection should do nothing when form is invalid', () => {
    component.collectionForm.get('name')!.setValue('');
    component.createCollection();
    expect(collectionSpy.create).not.toHaveBeenCalled();
  });

  it('createCollection should show error when profile is missing', () => {
    component.profile = null;
    component.collectionForm.get('name')!.setValue('Test');
    component.createCollection();
    expect(toastSpy.showError).toHaveBeenCalledWith(
      'Error',
      'Please login to create collections',
      1500
    );
  });

  // ── createCollection — success ────────────────────────────────────────────────
  it('createCollection should call collectionService.create with correct userId', () => {
    component.collectionForm.get('name')!.setValue('My Collection');
    component.createCollection();
    expect(collectionSpy.create).toHaveBeenCalledWith(
      jasmine.objectContaining({ userId: 'user-1', name: 'My Collection' })
    );
  });

  it('createCollection should include selected dish slugs in the DTO', () => {
    component.collectionForm.get('name')!.setValue('My Collection');
    component.selectedDishes = [makeDish('slug-x'), makeDish('slug-y')];
    component.createCollection();
    expect(collectionSpy.create).toHaveBeenCalledWith(
      jasmine.objectContaining({ dishSlugs: ['slug-x', 'slug-y'] })
    );
  });

  it('createCollection should show success toast and navigate on success', () => {
    component.collectionForm.get('name')!.setValue('My Collection');
    component.createCollection();
    expect(toastSpy.showSuccess).toHaveBeenCalledWith(
      'Success',
      'Collection created successfully!',
      1500
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/my-dishes']);
  });

  it('createCollection should show error toast and reset loading on failure', () => {
    collectionSpy.create.and.returnValue(throwError(() => new Error('fail')));
    component.collectionForm.get('name')!.setValue('My Collection');
    component.createCollection();
    expect(toastSpy.showError).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  });

  // ── cancel ────────────────────────────────────────────────────────────────────
  it('cancel should navigate to /my-dishes', () => {
    component.cancel();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/my-dishes']);
  });

  // ── resetForm ─────────────────────────────────────────────────────────────────
  it('resetForm should clear selectedDishes and searchQuery', () => {
    component.selectedDishes = [makeDish('slug-1')];
    component.searchQuery = 'pasta';
    component.resetForm();
    expect(component.selectedDishes).toEqual([]);
    expect(component.searchQuery).toBe('');
  });

  it('resetForm should reset icon and color to defaults', () => {
    component.collectionForm.get('icon')!.setValue('favorite');
    component.resetForm();
    expect(component.collectionForm.get('icon')!.value).toBe('cake');
    expect(component.collectionForm.get('color')!.value).toBe('#3b82f6');
  });
});

describe('UserDishListCreateComponent — edit mode', () => {
  let component: UserDishListCreateComponent;
  let fixture: ComponentFixture<UserDishListCreateComponent>;
  let collectionSpy: jasmine.SpyObj<UserDishCollectionService>;
  let toastSpy: jasmine.SpyObj<ToastService>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let dishSpy: jasmine.SpyObj<DishService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    collectionSpy = jasmine.createSpyObj('UserDishCollectionService', [
      'findAll', 'findById', 'create', 'update', 'duplicate',
    ]);
    toastSpy = jasmine.createSpyObj('ToastService', ['showSuccess', 'showError']);
    authSpy = jasmine.createSpyObj('AuthService', ['getProfile']);
    dishSpy = jasmine.createSpyObj('DishService', ['findWithScore', 'findBySlug']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    authSpy.getProfile.and.returnValue(of(mockUser));
    collectionSpy.findById.and.returnValue(of(mockCollection));
    collectionSpy.update.and.returnValue(of(mockCollection));
    dishSpy.findBySlug.and.callFake((slug: string) => of(makeDish(slug)));
    dishSpy.findWithScore.and.returnValue(of({ data: [], count: 0 } as any));

    await TestBed.configureTestingModule({
      imports: [UserDishListCreateComponent, NoopAnimationsModule],
      providers: [
        { provide: UserDishCollectionService, useValue: collectionSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: DishService, useValue: dishSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: 'col-1' }) } },
        },
      ],
    })
      .overrideComponent(UserDishListCreateComponent, {
        set: {
          schemas: [NO_ERRORS_SCHEMA],
          providers: [{ provide: MatDialog, useValue: dialogSpy }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(UserDishListCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create in edit mode', () => {
    expect(component).toBeTruthy();
  });

  it('isEditMode should return true when collectionId and existingCollection are set', () => {
    expect(component.isEditMode()).toBeTrue();
  });

  it('should call findById with the route id', () => {
    expect(collectionSpy.findById).toHaveBeenCalledWith('col-1');
  });

  it('should patch form name from existing collection', () => {
    expect(component.collectionForm.get('name')!.value).toBe('Test Collection');
  });

  it('should patch form color from existing collection', () => {
    expect(component.collectionForm.get('color')!.value).toBe('#ef4444');
  });

  it('should load dishes from existing dishSlugs', () => {
    expect(dishSpy.findBySlug).toHaveBeenCalledWith('dish-a');
    expect(dishSpy.findBySlug).toHaveBeenCalledWith('dish-b');
  });

  it('should populate selectedDishes from existing slugs', () => {
    const slugs = component.selectedDishes.map((d) => d.slug);
    expect(slugs).toContain('dish-a');
    expect(slugs).toContain('dish-b');
  });

  // ── createCollection in edit mode ─────────────────────────────────────────────
  it('createCollection should call update when in edit mode', () => {
    component.collectionForm.get('name')!.setValue('Updated Name');
    component.createCollection();
    expect(collectionSpy.update).toHaveBeenCalledWith(
      jasmine.objectContaining({ _id: 'col-1', name: 'Updated Name' })
    );
    expect(collectionSpy.create).not.toHaveBeenCalled();
  });

  it('createCollection update should navigate to /my-dishes on success', () => {
    component.collectionForm.get('name')!.setValue('Updated Name');
    component.createCollection();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/my-dishes']);
  });

  it('createCollection update should show error toast on failure', () => {
    collectionSpy.update.and.returnValue(throwError(() => new Error('fail')));
    component.collectionForm.get('name')!.setValue('Updated Name');
    component.createCollection();
    expect(toastSpy.showError).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  });

  // ── loadCollectionById error ──────────────────────────────────────────────────
  it('loadCollectionById should show error and navigate away on failure', async () => {
    collectionSpy.findById.and.returnValue(throwError(() => new Error('fail')));
    component.loadCollectionById('bad-id');
    expect(toastSpy.showError).toHaveBeenCalledWith('Error', 'Failed to load collection');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/my-dishes']);
  });
});
