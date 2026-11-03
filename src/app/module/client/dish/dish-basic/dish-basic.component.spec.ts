import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { of, Subject } from 'rxjs';

import { DishBasicComponent } from './dish-basic.component';
import { DishService } from '@/app/service/dish.service';
import { Dish, QueryDishDto } from '@/types/dish.type';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@Component({ selector: 'app-dish-filter', template: '', standalone: true })
class DishFilterStubComponent {
  @Output() search = new EventEmitter<QueryDishDto>();
}

@Component({ selector: 'app-dish-card', template: '', standalone: true })
class DishCardStubComponent {
  @Input() dish!: Dish;
}

@Component({ selector: 'app-empty', template: '', standalone: true })
class EmptyStubComponent {}

const mockDish: Dish = {
  _id: '1',
  slug: 'banh-mi',
  title: [{ lang: 'vi', data: 'Bánh Mì' }],
  shortDescription: [{ lang: 'vi', data: 'A classic Vietnamese sandwich' }],
  content: [{ lang: 'vi', data: 'Content' }],
  tags: [],
  mealCategories: ['BREAKFAST'],
  ingredientCategories: [],
  videos: [],
  ingredients: [],
  relatedDishes: [],
  labels: [],
  deleted: false,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const mockResponse = { data: [mockDish], count: 42 };
const emptyResponse = { data: [], count: 0 };

describe('DishBasicComponent', () => {
  let component: DishBasicComponent;
  let fixture: ComponentFixture<DishBasicComponent>;
  let dishServiceSpy: jasmine.SpyObj<DishService>;
  let titleSpy: jasmine.SpyObj<Title>;
  let metaSpy: jasmine.SpyObj<Meta>;

  beforeEach(async () => {
    dishServiceSpy = jasmine.createSpyObj('DishService', ['findWithFuzzy']);
    dishServiceSpy.findWithFuzzy.and.returnValue(of(mockResponse));
    titleSpy = jasmine.createSpyObj('Title', ['setTitle']);
    metaSpy = jasmine.createSpyObj('Meta', ['updateTag']);

    await TestBed.configureTestingModule({
      imports: [DishBasicComponent, NoopAnimationsModule],
      providers: [
        { provide: DishService, useValue: dishServiceSpy },
        { provide: Title, useValue: titleSpy },
        { provide: Meta, useValue: metaSpy },
      ],
    })
      .overrideComponent(DishBasicComponent, {
        set: {
          imports: [
            CommonModule,
            MatButtonModule,
            MatIconModule,
            MatExpansionModule,
            MatPaginatorModule,
            MatProgressSpinnerModule,
            DishFilterStubComponent,
            DishCardStubComponent,
            EmptyStubComponent,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DishBasicComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should initialize loading to false', () => {
      expect(component.loading()).toBeFalse();
    });

    it('should initialize dishes to an empty array', () => {
      expect(component.dishes()).toEqual([]);
    });

    it('should initialize currentPage to 1', () => {
      expect(component.currentPage()).toBe(1);
    });

    it('should initialize limit to 10', () => {
      expect(component.limit()).toBe(10);
    });

    it('should initialize total to 0', () => {
      expect(component.total()).toBe(0);
    });

    it('should initialize dto as an empty object', () => {
      expect(component.dto).toEqual({});
    });
  });

  describe('ngOnInit', () => {
    it('should call setupMetaTags and getDishes', () => {
      spyOn(component, 'setupMetaTags');
      spyOn(component, 'getDishes');

      component.ngOnInit();

      expect(component.setupMetaTags).toHaveBeenCalled();
      expect(component.getDishes).toHaveBeenCalled();
    });
  });

  describe('setupMetaTags', () => {
    it('should call titleService.setTitle', () => {
      component.setupMetaTags();
      expect(titleSpy.setTitle).toHaveBeenCalled();
    });

    it('should set description meta tag', () => {
      component.setupMetaTags();
      expect(metaSpy.updateTag).toHaveBeenCalledWith(
        jasmine.objectContaining({ name: 'description' })
      );
    });

    it('should set keywords meta tag', () => {
      component.setupMetaTags();
      expect(metaSpy.updateTag).toHaveBeenCalledWith({
        name: 'keywords',
        content: 'ăn gì, what to eat, eat what, ăn chi',
      });
    });

    it('should set robots meta tag to index,follow', () => {
      component.setupMetaTags();
      expect(metaSpy.updateTag).toHaveBeenCalledWith({
        name: 'robots',
        content: 'index,follow',
      });
    });
  });

  describe('getDishes', () => {
    it('should call dishService.findWithFuzzy with current page and limit', () => {
      fixture.detectChanges();

      expect(dishServiceSpy.findWithFuzzy).toHaveBeenCalledWith(
        jasmine.objectContaining({ page: 1, limit: 10 })
      );
    });

    it('should populate dishes signal with response data', () => {
      fixture.detectChanges();
      expect(component.dishes()).toEqual([mockDish]);
    });

    it('should set total signal from response count', () => {
      fixture.detectChanges();
      expect(component.total()).toBe(42);
    });

    it('should set loading to false after the request completes', () => {
      fixture.detectChanges();
      expect(component.loading()).toBeFalse();
    });

    it('should merge dto properties into the findWithFuzzy call', () => {
      component.dto = { keyword: 'pho', mealCategories: ['BREAKFAST'] };
      component.getDishes();

      expect(dishServiceSpy.findWithFuzzy).toHaveBeenCalledWith(
        jasmine.objectContaining({ keyword: 'pho', mealCategories: ['BREAKFAST'], page: 1, limit: 10 })
      );
    });

    it('should set loading to false even when stream completes (finalize)', () => {
      const subject = new Subject<typeof mockResponse>();
      dishServiceSpy.findWithFuzzy.and.returnValue(subject.asObservable());

      component.getDishes();
      expect(component.loading()).toBeTrue();

      subject.next(mockResponse);
      subject.complete();
      expect(component.loading()).toBeFalse();
    });
  });

  describe('goBack', () => {
    it('should call window.history.back()', () => {
      fixture.detectChanges();
      spyOn(window.history, 'back');
      component.goBack();
      expect(window.history.back).toHaveBeenCalled();
    });
  });

  describe('onSearch', () => {
    beforeEach(() => fixture.detectChanges());

    it('should update dto with the provided filter', () => {
      const filter: QueryDishDto = { keyword: 'bun bo', mealCategories: ['LUNCH'] };
      component.onSearch(filter);
      expect(component.dto).toEqual(filter);
    });

    it('should call getDishes after updating dto', () => {
      spyOn(component, 'getDishes');
      component.onSearch({ keyword: 'pho' });
      expect(component.getDishes).toHaveBeenCalled();
    });

    it('should reset to current page when fetching after search', () => {
      component.onSearch({ keyword: 'bun bo' });
      expect(dishServiceSpy.findWithFuzzy).toHaveBeenCalledWith(
        jasmine.objectContaining({ keyword: 'bun bo', page: 1, limit: 10 })
      );
    });
  });

  describe('paginatorChange', () => {
    beforeEach(() => fixture.detectChanges());

    it('should update currentPage to pageIndex + 1', () => {
      const event: PageEvent = { pageIndex: 2, pageSize: 10, length: 42 };
      component.paginatorChange(event);
      expect(component.currentPage()).toBe(3);
    });

    it('should update limit to the new pageSize', () => {
      const event: PageEvent = { pageIndex: 0, pageSize: 25, length: 42 };
      component.paginatorChange(event);
      expect(component.limit()).toBe(25);
    });

    it('should call getDishes with updated page and limit', () => {
      const event: PageEvent = { pageIndex: 1, pageSize: 25, length: 42 };
      component.paginatorChange(event);

      expect(dishServiceSpy.findWithFuzzy).toHaveBeenCalledWith(
        jasmine.objectContaining({ page: 2, limit: 25 })
      );
    });
  });

  describe('template rendering', () => {
    it('should render dish cards when dishes are available', () => {
      fixture.detectChanges();
      const cards = fixture.nativeElement.querySelectorAll('app-dish-card');
      expect(cards.length).toBe(1);
    });

    it('should render the empty component when dishes list is empty', () => {
      dishServiceSpy.findWithFuzzy.and.returnValue(of(emptyResponse));
      fixture.detectChanges();
      const empty = fixture.nativeElement.querySelector('app-empty');
      expect(empty).toBeTruthy();
    });

    it('should render the spinner when loading is true', () => {
      const subject = new Subject<typeof mockResponse>();
      dishServiceSpy.findWithFuzzy.and.returnValue(subject.asObservable());
      fixture.detectChanges();

      const spinner = fixture.nativeElement.querySelector('mat-spinner');
      expect(spinner).toBeTruthy();
    });

    it('should hide the spinner after loading completes', () => {
      fixture.detectChanges();
      const spinner = fixture.nativeElement.querySelector('mat-spinner');
      expect(spinner).toBeNull();
    });

    it('should render a back button that calls goBack on click', () => {
      fixture.detectChanges();
      spyOn(component, 'goBack');
      const button = fixture.nativeElement.querySelector('button');
      button.click();
      expect(component.goBack).toHaveBeenCalled();
    });
  });
});
