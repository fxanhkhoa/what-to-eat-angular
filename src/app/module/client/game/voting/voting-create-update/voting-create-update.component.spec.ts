import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Component, EventEmitter, Input, LOCALE_ID, Output } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { of, Subject } from 'rxjs';

import { VotingCreateUpdateComponent } from './voting-create-update.component';
import { DishService } from '@/app/service/dish.service';
import { DishVoteService } from '@/app/service/dish-vote.service';
import { ToastService } from '@/app/shared/service/toast.service';
import { MultiLanguagePipe } from '@/app/pipe/multi-language.pipe';
import { Dish } from '@/types/dish.type';
import { DishVoteItem } from '@/types/dish-vote.type';

// ---- Stubs ---------------------------------------------------------------

@Component({ selector: 'app-dish-card-fancy', standalone: true, template: '' })
class DishCardFancyStub { @Input() dish: any; }

@Component({ selector: 'app-dish-filter', standalone: true, template: '' })
class DishFilterStub { @Output() search = new EventEmitter<any>(); }

@Component({ selector: 'app-voting-collection-picker', standalone: true, template: '' })
class VotingCollectionPickerStub { @Output() dishesSelected = new EventEmitter<Dish[]>(); }

// ---- Helpers -------------------------------------------------------------

function makeDish(overrides: Partial<Dish> = {}): Dish {
  return {
    _id: 'dish-1',
    slug: 'dish-slug-1',
    title: [{ lang: 'en', data: 'Dish One' }] as any,
    shortDescription: [{ lang: 'en', data: 'Short desc' }] as any,
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

function makeDishVoteItem(overrides: Partial<DishVoteItem> = {}): DishVoteItem {
  return {
    slug: 'custom-slug',
    customTitle: 'Custom Dish',
    voteUser: [],
    voteAnonymous: [],
    isCustom: true,
    ...overrides,
  };
}

// ---- Suite ---------------------------------------------------------------

describe('VotingCreateUpdateComponent', () => {
  let component: VotingCreateUpdateComponent;
  let fixture: ComponentFixture<VotingCreateUpdateComponent>;

  let dishServiceSpy: jasmine.SpyObj<DishService>;
  let dishVoteServiceSpy: jasmine.SpyObj<DishVoteService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let mockOverlayRef: jasmine.SpyObj<OverlayRef>;
  let titleServiceSpy: jasmine.SpyObj<Title>;
  let metaServiceSpy: jasmine.SpyObj<Meta>;

  const defaultDishResponse = { data: [makeDish()], count: 1 };

  beforeEach(async () => {
    dishServiceSpy = jasmine.createSpyObj('DishService', ['findAll']);
    dishServiceSpy.findAll.and.returnValue(of(defaultDishResponse));

    dishVoteServiceSpy = jasmine.createSpyObj('DishVoteService', ['create']);
    dishVoteServiceSpy.create.and.returnValue(of({ _id: 'vote-123' } as any));

    toastServiceSpy = jasmine.createSpyObj('ToastService', ['showSuccess', 'showError', 'showWarning']);

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    dialogSpy.open.and.returnValue({
      afterClosed: () => of(null),
    } as any);

    mockOverlayRef = jasmine.createSpyObj('OverlayRef', ['attach', 'dispose']);
    const overlaySpy: Partial<Overlay> = {
      create: jasmine.createSpy('create').and.returnValue(mockOverlayRef),
      position: jasmine.createSpy('position').and.returnValue({
        flexibleConnectedTo: () => ({
          withPositions: () => ({}),
        }),
      } as any),
      scrollStrategies: { close: jasmine.createSpy('close').and.returnValue({}) } as any,
    };

    titleServiceSpy = jasmine.createSpyObj('Title', ['setTitle']);
    metaServiceSpy = jasmine.createSpyObj('Meta', ['updateTag']);

    await TestBed.configureTestingModule({
      imports: [
        VotingCreateUpdateComponent,
        NoopAnimationsModule,
        RouterTestingModule,
      ],
      providers: [
        FormBuilder,
        { provide: DishService, useValue: dishServiceSpy },
        { provide: DishVoteService, useValue: dishVoteServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: Overlay, useValue: overlaySpy },
        { provide: Title, useValue: titleServiceSpy },
        { provide: Meta, useValue: metaServiceSpy },
      ],
    })
      .overrideComponent(VotingCreateUpdateComponent, {
        set: {
          imports: [
            RouterModule,
            CommonModule,
            FormsModule,
            ReactiveFormsModule,
            MatButtonModule,
            MatIconModule,
            MatSidenavModule,
            MatToolbarModule,
            MatFormFieldModule,
            MatCardModule,
            MatInputModule,
            MatTabsModule,
            DragDropModule,
            MatProgressSpinnerModule,
            MatExpansionModule,
            MatPaginatorModule,
            MatTooltipModule,
            MatDividerModule,
            MultiLanguagePipe,
            DishCardFancyStub,
            DishFilterStub,
            VotingCollectionPickerStub,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(VotingCreateUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ---- Creation ----------------------------------------------------------

  describe('creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize signals with defaults', () => {
      expect(component.openSidenav()).toBeTrue();
      expect(component.availableDishes().length).toBe(1);
      expect(component.availableDishes()[0]._id).toBe('dish-1');
      expect(component.selectedDishes()).toEqual([]);
      expect(component.customDishes()).toEqual([]);
      expect(component.currentPage()).toBe(1);
      expect(component.limit()).toBe(10);
      expect(component.loading()).toBeFalse();
      expect(component.creatingLoading()).toBeFalse();
    });

    it('should initialize dishVoteForm with empty values', () => {
      expect(component.dishVoteForm.get('title')?.value).toBe('');
      expect(component.dishVoteForm.get('description')?.value).toBe('');
      expect(component.dishVoteItems.length).toBe(0);
    });
  });

  // ---- ngOnInit ----------------------------------------------------------

  describe('ngOnInit()', () => {
    it('should call setupSEO (set title)', () => {
      expect(titleServiceSpy.setTitle).toHaveBeenCalled();
    });

    it('should call getDishes on init', () => {
      expect(dishServiceSpy.findAll).toHaveBeenCalled();
    });
  });

  // ---- getDishes ---------------------------------------------------------

  describe('getDishes()', () => {
    it('should call dishService.findAll with current page and limit', () => {
      dishServiceSpy.findAll.calls.reset();
      component.getDishes();
      expect(dishServiceSpy.findAll).toHaveBeenCalledWith(
        jasmine.objectContaining({ limit: 10, page: 1 })
      );
    });

    it('should set availableDishes from response', () => {
      const dishes = [makeDish({ _id: 'a' }), makeDish({ _id: 'b' })];
      dishServiceSpy.findAll.and.returnValue(of({ data: dishes, count: 2 }));
      component.getDishes();
      expect(component.availableDishes().length).toBe(2);
    });

    it('should set total from response', () => {
      dishServiceSpy.findAll.and.returnValue(of({ data: [], count: 42 }));
      component.getDishes();
      expect(component.total()).toBe(42);
    });

    it('should set loading to false after completion', () => {
      component.getDishes();
      expect(component.loading()).toBeFalse();
    });
  });

  // ---- onSearch ----------------------------------------------------------

  describe('onSearch()', () => {
    it('should update dto and call getDishes', () => {
      dishServiceSpy.findAll.calls.reset();
      const dto = { keyword: 'pizza' };
      component.onSearch(dto);
      expect(component.dto).toEqual(dto);
      expect(dishServiceSpy.findAll).toHaveBeenCalledWith(
        jasmine.objectContaining({ keyword: 'pizza' })
      );
    });
  });

  // ---- paginatorChange ---------------------------------------------------

  describe('paginatorChange()', () => {
    it('should update currentPage from pageIndex + 1', () => {
      const event: PageEvent = { pageIndex: 2, pageSize: 25, length: 100 };
      dishServiceSpy.findAll.calls.reset();
      component.paginatorChange(event);
      expect(component.currentPage()).toBe(3);
    });

    it('should update limit from pageSize', () => {
      const event: PageEvent = { pageIndex: 0, pageSize: 50, length: 100 };
      component.paginatorChange(event);
      expect(component.limit()).toBe(50);
    });

    it('should call getDishes after updating pagination', () => {
      dishServiceSpy.findAll.calls.reset();
      const event: PageEvent = { pageIndex: 0, pageSize: 10, length: 100 };
      component.paginatorChange(event);
      expect(dishServiceSpy.findAll).toHaveBeenCalled();
    });
  });

  // ---- dishVoteItems getter ----------------------------------------------

  describe('dishVoteItems getter', () => {
    it('should return the FormArray from dishVoteForm', () => {
      expect(component.dishVoteItems).toBe(
        component.dishVoteForm.get('dishVoteItems') as any
      );
    });
  });

  // ---- createDishVoteItem ------------------------------------------------

  describe('createDishVoteItem()', () => {
    it('should return a FormGroup with required controls', () => {
      const group = component.createDishVoteItem();
      expect(group.contains('slug')).toBeTrue();
      expect(group.contains('customTitle')).toBeTrue();
      expect(group.contains('voteUser')).toBeTrue();
      expect(group.contains('voteAnonymous')).toBeTrue();
      expect(group.contains('isCustom')).toBeTrue();
    });

    it('should initialize slug as empty (required)', () => {
      const group = component.createDishVoteItem();
      expect(group.get('slug')?.value).toBe('');
      expect(group.get('slug')?.valid).toBeFalse();
    });

    it('should initialize isCustom as false', () => {
      const group = component.createDishVoteItem();
      expect(group.get('isCustom')?.value).toBeFalse();
    });
  });

  // ---- addDishVoteItem ---------------------------------------------------

  describe('addDishVoteItem()', () => {
    it('should push a new FormGroup to dishVoteItems', () => {
      const before = component.dishVoteItems.length;
      component.addDishVoteItem();
      expect(component.dishVoteItems.length).toBe(before + 1);
    });
  });

  // ---- removeDishVoteItem ------------------------------------------------

  describe('removeDishVoteItem()', () => {
    it('should remove the item at the given index', () => {
      component.addDishVoteItem();
      component.addDishVoteItem();
      const before = component.dishVoteItems.length;
      component.removeDishVoteItem(0);
      expect(component.dishVoteItems.length).toBe(before - 1);
    });
  });

  // ---- clearSelectedDishes -----------------------------------------------

  describe('clearSelectedDishes()', () => {
    it('should clear selectedDishes signal', () => {
      component.selectedDishes.set([makeDish()]);
      component.clearSelectedDishes();
      expect(component.selectedDishes()).toEqual([]);
    });

    it('should clear dishVoteItems FormArray', () => {
      component.addDishVoteItem();
      component.clearSelectedDishes();
      expect(component.dishVoteItems.length).toBe(0);
    });
  });

  // ---- removeDish --------------------------------------------------------

  describe('removeDish()', () => {
    it('should remove dish from selectedDishes by _id', () => {
      const d1 = makeDish({ _id: 'a', slug: 's1' });
      const d2 = makeDish({ _id: 'b', slug: 's2' });
      component.selectedDishes.set([d1, d2]);
      component.addDishVoteItem();
      component.addDishVoteItem();

      component.removeDish(d1);

      expect(component.selectedDishes().length).toBe(1);
      expect(component.selectedDishes()[0]._id).toBe('b');
    });

    it('should remove corresponding FormArray item', () => {
      const d1 = makeDish({ _id: 'a', slug: 's1' });
      component.selectedDishes.set([d1]);
      component.addDishVoteItem();

      component.removeDish(d1);

      expect(component.dishVoteItems.length).toBe(0);
    });

    it('should do nothing if dish not in selectedDishes', () => {
      component.selectedDishes.set([makeDish({ _id: 'x' })]);
      component.addDishVoteItem();
      component.removeDish(makeDish({ _id: 'not-found' }));
      expect(component.selectedDishes().length).toBe(1);
      expect(component.dishVoteItems.length).toBe(1);
    });
  });

  // ---- removeCustomDish --------------------------------------------------

  describe('removeCustomDish()', () => {
    it('should remove from customDishes by slug+customTitle match', () => {
      const item = makeDishVoteItem();
      component.customDishes.set([item]);
      const group = component.createDishVoteItem();
      group.patchValue({ slug: item.slug });
      component.dishVoteItems.push(group);

      component.removeCustomDish(item);

      expect(component.customDishes()).toEqual([]);
    });

    it('should remove corresponding form item by slug', () => {
      const item = makeDishVoteItem({ slug: 'custom-slug', customTitle: 'Custom Dish' });
      component.customDishes.set([item]);
      const group = component.createDishVoteItem();
      group.patchValue({ slug: 'custom-slug' });
      component.dishVoteItems.push(group);

      component.removeCustomDish(item);

      expect(component.dishVoteItems.length).toBe(0);
    });

    it('should do nothing if custom dish not found', () => {
      component.customDishes.set([makeDishVoteItem({ slug: 'other' })]);
      component.addDishVoteItem();
      component.removeCustomDish(makeDishVoteItem({ slug: 'not-found' }));
      expect(component.customDishes().length).toBe(1);
    });
  });

  // ---- onCollectionDishesSelected ----------------------------------------

  describe('onCollectionDishesSelected()', () => {
    it('should add new dishes to selectedDishes', () => {
      const d1 = makeDish({ _id: 'new1', slug: 's1' });
      component.availableDishes.set([]);
      component.selectedDishes.set([]);

      component.onCollectionDishesSelected([d1]);

      expect(component.selectedDishes()).toContain(d1);
    });

    it('should add a FormArray item for each new dish', () => {
      const d1 = makeDish({ _id: 'new1', slug: 's1' });
      component.availableDishes.set([]);
      component.selectedDishes.set([]);

      component.onCollectionDishesSelected([d1]);

      expect(component.dishVoteItems.length).toBe(1);
    });

    it('should filter out dishes already in selectedDishes', () => {
      const d1 = makeDish({ _id: 'dup', slug: 's-dup' });
      component.selectedDishes.set([d1]);
      component.availableDishes.set([]);

      component.onCollectionDishesSelected([d1]);

      expect(component.selectedDishes().length).toBe(1);
    });

    it('should filter out dishes already in availableDishes', () => {
      const d1 = makeDish({ _id: 'avail', slug: 's-avail' });
      component.availableDishes.set([d1]);
      component.selectedDishes.set([]);

      component.onCollectionDishesSelected([d1]);

      expect(component.selectedDishes().length).toBe(0);
    });

    it('should show success toast when new dishes are added', () => {
      const d1 = makeDish({ _id: 'new1', slug: 's1' });
      component.availableDishes.set([]);
      component.selectedDishes.set([]);

      component.onCollectionDishesSelected([d1]);

      expect(toastServiceSpy.showSuccess).toHaveBeenCalled();
    });

    it('should show warning toast when all dishes are duplicates', () => {
      const d1 = makeDish({ _id: 'dup', slug: 's-dup' });
      component.selectedDishes.set([d1]);
      component.availableDishes.set([]);

      component.onCollectionDishesSelected([d1]);

      expect(toastServiceSpy.showWarning).toHaveBeenCalled();
    });
  });

  // ---- addCustomDish -----------------------------------------------------

  describe('addCustomDish()', () => {
    it('should open MatDialog', () => {
      component.addCustomDish();
      expect(dialogSpy.open).toHaveBeenCalled();
    });

    it('should add to customDishes and dishVoteItems when dialog returns a result', () => {
      const result = { slug: 'new-custom', customTitle: 'My Dish' };
      dialogSpy.open.and.returnValue({ afterClosed: () => of(result) } as any);

      component.addCustomDish();

      expect(component.customDishes().length).toBe(1);
      expect(component.customDishes()[0].slug).toBe('new-custom');
      expect(component.dishVoteItems.length).toBe(1);
    });

    it('should show error toast when duplicate custom dish is added', () => {
      const existing = makeDishVoteItem({ slug: 'dup-slug' });
      component.customDishes.set([existing]);
      const result = { slug: 'dup-slug', customTitle: 'Copy' };
      dialogSpy.open.and.returnValue({ afterClosed: () => of(result) } as any);

      component.addCustomDish();

      expect(toastServiceSpy.showError).toHaveBeenCalled();
      expect(component.customDishes().length).toBe(1);
    });

    it('should do nothing when dialog returns null', () => {
      dialogSpy.open.and.returnValue({ afterClosed: () => of(null) } as any);

      component.addCustomDish();

      expect(component.customDishes().length).toBe(0);
      expect(component.dishVoteItems.length).toBe(0);
    });
  });

  // ---- onSubmit ----------------------------------------------------------

  describe('onSubmit()', () => {
    function fillValidForm() {
      component.dishVoteForm.get('title')?.setValue('My Voting');
      component.addDishVoteItem();
      component.dishVoteItems.at(0).patchValue({ slug: 'dish-slug' });
    }

    it('should not call dishVoteService.create when form is invalid', () => {
      dishVoteServiceSpy.create.calls.reset();
      component.dishVoteForm.get('title')?.setValue('');
      component.onSubmit();
      expect(dishVoteServiceSpy.create).not.toHaveBeenCalled();
    });

    it('should call dishVoteService.create when form is valid', () => {
      fillValidForm();
      dishVoteServiceSpy.create.calls.reset();
      component.onSubmit();
      expect(dishVoteServiceSpy.create).toHaveBeenCalled();
    });

    it('should navigate to /game/voting/<id> after successful creation', () => {
      fillValidForm();
      dishVoteServiceSpy.create.and.returnValue(of({ _id: 'vote-999' } as any));
      component.onSubmit();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/game/voting', 'vote-999']);
    });

    it('should set creatingLoading to false after completion', () => {
      fillValidForm();
      component.onSubmit();
      expect(component.creatingLoading()).toBeFalse();
    });
  });

  // ---- drop --------------------------------------------------------------

  describe('drop()', () => {
    it('should add dish to selectedDishes when dropped onto selected-dishes container', () => {
      const dish = makeDish({ _id: 'drop1', slug: 'drop-slug' });
      component.availableDishes.set([dish]);
      component.selectedDishes.set([]);

      const fakeEvent: any = {
        previousContainer: {
          data: [dish],
          element: { nativeElement: { id: 'available-dishes' } },
        },
        container: {
          data: component.selectedDishes(),
          element: { nativeElement: { id: 'selected-dishes' } },
        },
        previousIndex: 0,
        currentIndex: 0,
      };

      component.drop(fakeEvent);

      expect(component.selectedDishes()).toContain(dish);
      expect(component.dishVoteItems.length).toBe(1);
    });

    it('should remove dish from availableDishes when dropped onto selected-dishes', () => {
      const dish = makeDish({ _id: 'drop2', slug: 'drop-slug-2' });
      component.availableDishes.set([dish]);
      component.selectedDishes.set([]);

      const fakeEvent: any = {
        previousContainer: { data: [dish], element: { nativeElement: { id: 'available-dishes' } } },
        container: { data: [], element: { nativeElement: { id: 'selected-dishes' } } },
        previousIndex: 0,
        currentIndex: 0,
      };

      component.drop(fakeEvent);

      expect(component.availableDishes().find((d) => d._id === 'drop2')).toBeUndefined();
    });

    it('should move dish back to availableDishes when dropped onto available-dishes', () => {
      const dish = makeDish({ _id: 'back1', slug: 's-back' });
      component.selectedDishes.set([dish]);
      component.addDishVoteItem();
      component.availableDishes.set([]);

      const fakeEvent: any = {
        previousContainer: { data: [dish], element: { nativeElement: { id: 'selected-dishes' } } },
        container: { data: [], element: { nativeElement: { id: 'available-dishes' } } },
        previousIndex: 0,
        currentIndex: 0,
      };

      component.drop(fakeEvent);

      expect(component.availableDishes()).toContain(dish);
      expect(component.selectedDishes().find((d) => d._id === 'back1')).toBeUndefined();
    });
  });

  // ---- hideDishPreview ---------------------------------------------------

  describe('hideDishPreview()', () => {
    it('should dispose overlayRef and set it to null', () => {
      (component as any).overlayRef = mockOverlayRef;
      component.hideDishPreview();
      expect(mockOverlayRef.dispose).toHaveBeenCalled();
      expect((component as any).overlayRef).toBeNull();
    });

    it('should do nothing when overlayRef is null', () => {
      (component as any).overlayRef = null;
      expect(() => component.hideDishPreview()).not.toThrow();
    });
  });

  // ---- goBack ------------------------------------------------------------

  describe('goBack()', () => {
    it('should call window.history.back()', () => {
      spyOn(window.history, 'back');
      component.goBack();
      expect(window.history.back).toHaveBeenCalled();
    });
  });

  // ---- ngOnDestroy -------------------------------------------------------

  describe('ngOnDestroy()', () => {
    it('should dispose overlayRef if it exists', () => {
      (component as any).overlayRef = mockOverlayRef;
      component.ngOnDestroy();
      expect(mockOverlayRef.dispose).toHaveBeenCalled();
    });

    it('should not throw when overlayRef is null on destroy', () => {
      (component as any).overlayRef = null;
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  // ---- SEO ---------------------------------------------------------------

  describe('setupSEO()', () => {
    it('should set English title when localeID is not vi', () => {
      expect(titleServiceSpy.setTitle).toHaveBeenCalledWith(
        jasmine.stringContaining('Create Food Voting')
      );
    });

    it('should call metaService.updateTag for description', () => {
      expect(metaServiceSpy.updateTag).toHaveBeenCalledWith(
        jasmine.objectContaining({ name: 'description' })
      );
    });

    it('should call metaService.updateTag for og:title', () => {
      expect(metaServiceSpy.updateTag).toHaveBeenCalledWith(
        jasmine.objectContaining({ property: 'og:title' })
      );
    });
  });

  // ---- Template ----------------------------------------------------------

  describe('template', () => {
    it('should render the back button', () => {
      const btn = fixture.debugElement.query(By.css('button[matbutton]'));
      expect(btn).not.toBeNull();
    });

    it('should call goBack when back button is clicked', () => {
      spyOn(component, 'goBack');
      const btns = fixture.debugElement.queryAll(By.css('button[matbutton]'));
      btns[0].triggerEventHandler('click', null);
      expect(component.goBack).toHaveBeenCalled();
    });

    it('should disable Create Voting button when form is invalid', () => {
      component.dishVoteForm.get('title')?.setValue('');
      fixture.detectChanges();
      const createBtn = fixture.nativeElement.querySelector('button[matbutton="tonal"]');
      expect(createBtn?.disabled).toBeTrue();
    });

    it('should enable Create Voting button when form is valid', () => {
      component.dishVoteForm.get('title')?.setValue('Valid Title');
      component.addDishVoteItem();
      component.dishVoteItems.at(0).patchValue({ slug: 'some-slug' });
      fixture.detectChanges();
      const createBtn = fixture.nativeElement.querySelector('button[matbutton="tonal"]');
      expect(createBtn?.disabled).toBeFalse();
    });

    it('should toggle openSidenav when sidenav toggle button is clicked', () => {
      const before = component.openSidenav();
      const toggleBtn = fixture.debugElement.queryAll(By.css('button[maticonbutton]'))[0];
      toggleBtn?.triggerEventHandler('click', null);
      expect(component.openSidenav()).toBe(!before);
    });
  });
});

// =========================================================================
// Separate top-level suite for Vietnamese locale (requires its own TestBed)
// =========================================================================

describe('VotingCreateUpdateComponent — Vietnamese locale', () => {
  let viTitleSpy: jasmine.SpyObj<Title>;
  let viMetaSpy: jasmine.SpyObj<Meta>;
  let mockOverlayRef: jasmine.SpyObj<OverlayRef>;

  beforeEach(async () => {
    viTitleSpy = jasmine.createSpyObj('Title', ['setTitle']);
    viMetaSpy = jasmine.createSpyObj('Meta', ['updateTag']);
    mockOverlayRef = jasmine.createSpyObj('OverlayRef', ['attach', 'dispose']);
    const viDishSpy = jasmine.createSpyObj('DishService', ['findAll']);
    viDishSpy.findAll.and.returnValue(of({ data: [], count: 0 }));
    const viDishVoteSpy = jasmine.createSpyObj('DishVoteService', ['create']);
    const viToastSpy = jasmine.createSpyObj('ToastService', ['showSuccess', 'showError', 'showWarning']);
    const viRouterSpy = jasmine.createSpyObj('Router', ['navigate']);
    const viDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    viDialogSpy.open.and.returnValue({ afterClosed: () => of(null) } as any);
    const overlayMock: Partial<Overlay> = {
      create: jasmine.createSpy('create').and.returnValue(mockOverlayRef),
      position: jasmine.createSpy('position').and.returnValue({
        flexibleConnectedTo: () => ({ withPositions: () => ({}) }),
      } as any),
      scrollStrategies: { close: jasmine.createSpy().and.returnValue({}) } as any,
    };

    await TestBed.configureTestingModule({
      imports: [VotingCreateUpdateComponent, NoopAnimationsModule, RouterTestingModule],
      providers: [
        FormBuilder,
        { provide: DishService, useValue: viDishSpy },
        { provide: DishVoteService, useValue: viDishVoteSpy },
        { provide: ToastService, useValue: viToastSpy },
        { provide: Router, useValue: viRouterSpy },
        { provide: MatDialog, useValue: viDialogSpy },
        { provide: Overlay, useValue: overlayMock },
        { provide: Title, useValue: viTitleSpy },
        { provide: Meta, useValue: viMetaSpy },
        { provide: LOCALE_ID, useValue: 'vi' },
      ],
    })
      .overrideComponent(VotingCreateUpdateComponent, {
        set: {
          imports: [
            RouterModule, CommonModule, FormsModule, ReactiveFormsModule,
            MatButtonModule, MatIconModule, MatSidenavModule, MatToolbarModule,
            MatFormFieldModule, MatCardModule, MatInputModule, MatTabsModule,
            DragDropModule, MatProgressSpinnerModule, MatExpansionModule,
            MatPaginatorModule, MatTooltipModule, MatDividerModule,
            MultiLanguagePipe,
            DishCardFancyStub,
            DishFilterStub,
            VotingCollectionPickerStub,
          ],
        },
      })
      .compileComponents();

    const viFixture = TestBed.createComponent(VotingCreateUpdateComponent);
    viFixture.detectChanges();
  });

  it('should set Vietnamese title when localeID is vi', () => {
    expect(viTitleSpy.setTitle).toHaveBeenCalledWith(
      jasmine.stringContaining('Tạo Phiên Bình Chọn')
    );
  });
});
