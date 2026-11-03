import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input, LOCALE_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { of } from 'rxjs';

import { DishComponent } from './dish.component';
import { DishService } from '@/app/service/dish.service';
import { CategoryTranslatePipe } from '@/app/pipe/category-translate.pipe';
import { MEAL_CATEGORIES } from '@/enum/dish.enum';
import { Dish } from '@/types/dish.type';

@Component({ selector: 'app-dish-card-fancy', template: '', standalone: true })
class DishCardFancyStubComponent {
  @Input() dish!: Dish;
}

@Component({ selector: 'app-empty', template: '', standalone: true })
class EmptyStubComponent {}

const mockDish: Dish = {
  _id: '1',
  slug: 'pho',
  title: [{ lang: 'vi', data: 'Phở' }],
  shortDescription: [{ lang: 'vi', data: 'Short desc' }],
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

const mockResponse = { data: [mockDish], count: 1 };
const emptyResponse = { data: [], count: 0 };

describe('DishComponent', () => {
  let component: DishComponent;
  let fixture: ComponentFixture<DishComponent>;
  let dishServiceSpy: jasmine.SpyObj<DishService>;
  let titleSpy: jasmine.SpyObj<Title>;
  let metaSpy: jasmine.SpyObj<Meta>;
  let doc: Document;

  beforeEach(async () => {
    dishServiceSpy = jasmine.createSpyObj('DishService', ['findAll']);
    dishServiceSpy.findAll.and.returnValue(of(mockResponse));
    titleSpy = jasmine.createSpyObj('Title', ['setTitle']);
    metaSpy = jasmine.createSpyObj('Meta', ['updateTag']);

    await TestBed.configureTestingModule({
      imports: [DishComponent, RouterModule.forRoot([])],
      providers: [
        { provide: DishService, useValue: dishServiceSpy },
        { provide: Title, useValue: titleSpy },
        { provide: Meta, useValue: metaSpy },
        { provide: LOCALE_ID, useValue: 'en' },
      ],
    })
      .overrideComponent(DishComponent, {
        set: {
          imports: [
            MatButtonModule,
            MatIconModule,
            RouterModule,
            CategoryTranslatePipe,
            DishCardFancyStubComponent,
            EmptyStubComponent,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DishComponent);
    component = fixture.componentInstance;
    doc = TestBed.inject(DOCUMENT);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set English title and meta tags when localeId is "en"', () => {
      fixture.detectChanges();

      expect(titleSpy.setTitle).toHaveBeenCalledWith('Dishes | What To Eat');
      expect(metaSpy.updateTag).toHaveBeenCalledWith({
        name: 'description',
        content: 'Discover a variety of delicious dishes and recipes tailored to your taste at What To Eat.',
      });
      expect(metaSpy.updateTag).toHaveBeenCalledWith({
        name: 'keywords',
        content: 'dishes, menu, cuisine, what to eat, delicious food, food suggestion, recipe',
      });
      expect(metaSpy.updateTag).toHaveBeenCalledWith({
        property: 'og:title',
        content: 'Dishes | What To Eat',
      });
      expect(metaSpy.updateTag).toHaveBeenCalledWith({
        property: 'og:description',
        content: 'Discover a variety of delicious dishes and recipes tailored to your taste at What To Eat.',
      });
    });

    it('should set Vietnamese title and meta tags when localeId is "vi"', () => {
      component.localeId = 'vi';
      component.ngOnInit();

      expect(titleSpy.setTitle).toHaveBeenCalledWith('Món ăn | What To Eat');
      expect(metaSpy.updateTag).toHaveBeenCalledWith({
        name: 'description',
        content: 'Khám phá danh sách các món ăn hấp dẫn, đa dạng và phù hợp với khẩu vị của bạn tại What To Eat.',
      });
      expect(metaSpy.updateTag).toHaveBeenCalledWith({
        name: 'keywords',
        content: 'món ăn, thực đơn, ẩm thực, what to eat, món ngon, gợi ý món ăn, công thức nấu ăn',
      });
    });

    it('should set og:type to website', () => {
      fixture.detectChanges();
      expect(metaSpy.updateTag).toHaveBeenCalledWith({ property: 'og:type', content: 'website' });
    });

    it('should set twitter:card to summary_large_image', () => {
      fixture.detectChanges();
      expect(metaSpy.updateTag).toHaveBeenCalledWith({ name: 'twitter:card', content: 'summary_large_image' });
    });

    it('should set robots meta tag to index, follow', () => {
      fixture.detectChanges();
      expect(metaSpy.updateTag).toHaveBeenCalledWith({ name: 'robots', content: 'index, follow' });
    });

    it('should initialize listMealCategories with 4 entries', () => {
      fixture.detectChanges();
      expect(component.listMealCategories.length).toBe(4);
    });

    it('should call all four getDishes methods', () => {
      spyOn(component, 'getDishes_1');
      spyOn(component, 'getDishes_2');
      spyOn(component, 'getDishes_3');
      spyOn(component, 'getDishes_4');

      component.ngOnInit();

      expect(component.getDishes_1).toHaveBeenCalled();
      expect(component.getDishes_2).toHaveBeenCalled();
      expect(component.getDishes_3).toHaveBeenCalled();
      expect(component.getDishes_4).toHaveBeenCalled();
    });
  });

  describe('canonical and hreflang links', () => {
    it('should add a canonical link pointing to /en/dish for en locale', () => {
      fixture.detectChanges();
      const canonical = doc.querySelector('link[rel="canonical"]');
      expect(canonical).toBeTruthy();
      expect(canonical?.getAttribute('href')).toContain('/en/dish');
    });

    it('should add a canonical link pointing to /vi/dish when localeId is "vi"', () => {
      component.localeId = 'vi';
      component.ngOnInit();

      const canonical = doc.querySelector('link[rel="canonical"]');
      expect(canonical?.getAttribute('href')).toContain('/vi/dish');
    });

    it('should replace an existing canonical link on repeated ngOnInit calls', () => {
      fixture.detectChanges();
      component.ngOnInit();
      const canonicals = doc.querySelectorAll('link[rel="canonical"]');
      expect(canonicals.length).toBe(1);
    });

    it('should add hreflang links for vi, en, and x-default', () => {
      fixture.detectChanges();
      expect(doc.querySelector('link[rel="alternate"][hreflang="vi"]')).toBeTruthy();
      expect(doc.querySelector('link[rel="alternate"][hreflang="en"]')).toBeTruthy();
      expect(doc.querySelector('link[rel="alternate"][hreflang="x-default"]')).toBeTruthy();
    });

    it('should replace existing hreflang links on repeated ngOnInit calls', () => {
      fixture.detectChanges();
      component.ngOnInit();
      const viLinks = doc.querySelectorAll('link[rel="alternate"][hreflang="vi"]');
      expect(viLinks.length).toBe(1);
    });
  });

  describe('getDishes_1', () => {
    it('should call dishService.findAll with page 1, limit 10, and a meal category', () => {
      fixture.detectChanges();
      const call = dishServiceSpy.findAll.calls.all().find(c => c.args[0].limit === 10);
      expect(call).toBeTruthy();
      expect(call?.args[0].page).toBe(1);
      expect(call?.args[0].mealCategories?.length).toBe(1);
    });

    it('should populate listDishCategory_1 signal with data from the response', () => {
      fixture.detectChanges();
      expect(component.listDishCategory_1()).toEqual([mockDish]);
    });
  });

  describe('getDishes_2', () => {
    it('should call dishService.findAll with page 1 and limit 1', () => {
      fixture.detectChanges();
      const call = dishServiceSpy.findAll.calls.all().find(c => c.args[0].limit === 1);
      expect(call).toBeTruthy();
      expect(call?.args[0].page).toBe(1);
    });

    it('should populate listDishCategory_2 signal with data from the response', () => {
      fixture.detectChanges();
      expect(component.listDishCategory_2()).toEqual([mockDish]);
    });
  });

  describe('getDishes_3', () => {
    it('should call dishService.findAll with page 1 and limit 4', () => {
      fixture.detectChanges();
      const call = dishServiceSpy.findAll.calls.all().find(c => c.args[0].limit === 4);
      expect(call).toBeTruthy();
      expect(call?.args[0].page).toBe(1);
    });

    it('should populate listDishCategory_3 signal with data from the response', () => {
      fixture.detectChanges();
      expect(component.listDishCategory_3()).toEqual([mockDish]);
    });
  });

  describe('getDishes_4', () => {
    it('should call dishService.findAll with page 1 and limit 3', () => {
      fixture.detectChanges();
      const call = dishServiceSpy.findAll.calls.all().find(c => c.args[0].limit === 3);
      expect(call).toBeTruthy();
      expect(call?.args[0].page).toBe(1);
    });

    it('should populate listDishCategory_4 signal with data from the response', () => {
      fixture.detectChanges();
      expect(component.listDishCategory_4()).toEqual([mockDish]);
    });
  });

  describe('getDishes - empty response', () => {
    beforeEach(() => {
      dishServiceSpy.findAll.and.returnValue(of(emptyResponse));
    });

    it('should leave listDishCategory_1 empty when response data is empty', () => {
      fixture.detectChanges();
      expect(component.listDishCategory_1()).toEqual([]);
    });

    it('should leave listDishCategory_2 empty when response data is empty', () => {
      fixture.detectChanges();
      expect(component.listDishCategory_2()).toEqual([]);
    });

    it('should leave listDishCategory_3 empty when response data is empty', () => {
      fixture.detectChanges();
      expect(component.listDishCategory_3()).toEqual([]);
    });

    it('should leave listDishCategory_4 empty when response data is empty', () => {
      fixture.detectChanges();
      expect(component.listDishCategory_4()).toEqual([]);
    });
  });

  describe('getRandomMealCategories', () => {
    beforeEach(() => fixture.detectChanges());

    it('should return the specified number of categories', () => {
      expect(component.getRandomMealCategories(4).length).toBe(4);
    });

    it('should return unique categories (no duplicates)', () => {
      const result = component.getRandomMealCategories(5);
      expect(new Set(result).size).toBe(5);
    });

    it('should only return valid MEAL_CATEGORIES values', () => {
      const validCategories = Object.values(MEAL_CATEGORIES) as string[];
      component.getRandomMealCategories(4).forEach(cat =>
        expect(validCategories).toContain(cat)
      );
    });

    it('should return all available categories when count exceeds total', () => {
      const total = Object.values(MEAL_CATEGORIES).length;
      const result = component.getRandomMealCategories(total + 10);
      expect(result.length).toBe(total);
    });

    it('should return an empty array when count is 0', () => {
      expect(component.getRandomMealCategories(0)).toEqual([]);
    });

    it('should return 1 category when count is 1', () => {
      expect(component.getRandomMealCategories(1).length).toBe(1);
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

  describe('template rendering', () => {
    it('should render dish card components when a category list has items', () => {
      fixture.detectChanges();
      const cards = fixture.nativeElement.querySelectorAll('app-dish-card-fancy');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should render empty components when all category lists are empty', () => {
      dishServiceSpy.findAll.and.returnValue(of(emptyResponse));
      fixture.detectChanges();
      const emptyComponents = fixture.nativeElement.querySelectorAll('app-empty');
      expect(emptyComponents.length).toBeGreaterThan(0);
    });
  });
});
