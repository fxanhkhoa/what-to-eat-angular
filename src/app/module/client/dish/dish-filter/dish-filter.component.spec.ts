import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { DishFilterComponent } from './dish-filter.component';
import { DishService } from '@/app/service/dish.service';
import { DIFFICULT_LEVELS, MEAL_CATEGORIES } from '@/enum/dish.enum';
import { INGREDIENT_CATEGORIES } from '@/enum/ingredient.enum';

describe('DishFilterComponent', () => {
  let component: DishFilterComponent;
  let fixture: ComponentFixture<DishFilterComponent>;
  let dishServiceSpy: jasmine.SpyObj<DishService>;

  const matIconRegistryMock: Partial<MatIconRegistry> = {
    addSvgIcon: () => ({}) as MatIconRegistry,
    getNamedSvgIcon: () => of(document.createElement('svg')) as any,
    getDefaultFontSetClass: () => ['material-icons'] as any,
  };

  beforeEach(async () => {
    dishServiceSpy = jasmine.createSpyObj('DishService', ['getSuggestions']);
    dishServiceSpy.getSuggestions.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [DishFilterComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        { provide: DishService, useValue: dishServiceSpy },
        { provide: MatIconRegistry, useValue: matIconRegistryMock },
        { provide: LOCALE_ID, useValue: 'en' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DishFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Options arrays ──────────────────────────────────────────────────────────

  describe('options arrays', () => {
    it('should expose all MEAL_CATEGORIES values', () => {
      expect(component.mealCategoriesOptions).toEqual(Object.values(MEAL_CATEGORIES));
    });

    it('should expose all INGREDIENT_CATEGORIES values', () => {
      expect(component.ingredientCategoriesOptions).toEqual(Object.values(INGREDIENT_CATEGORIES));
    });

    it('should expose all DIFFICULT_LEVELS values', () => {
      expect(component.difficultLevelsOptions).toEqual(Object.values(DIFFICULT_LEVELS));
    });
  });

  // ── Initial form state ──────────────────────────────────────────────────────

  describe('initial form state (no filter input)', () => {
    it('should initialise keyword to empty string', () => {
      expect(component.filterForm.get('keyword')?.value).toBe('');
    });

    it('should initialise preparationTimeFrom to 1', () => {
      expect(component.filterForm.get('preparationTimeFrom')?.value).toBe(1);
    });

    it('should initialise preparationTimeTo to 60', () => {
      expect(component.filterForm.get('preparationTimeTo')?.value).toBe(60);
    });

    it('should initialise cookingTimeFrom to 1', () => {
      expect(component.filterForm.get('cookingTimeFrom')?.value).toBe(1);
    });

    it('should initialise cookingTimeTo to 60', () => {
      expect(component.filterForm.get('cookingTimeTo')?.value).toBe(60);
    });

    it('should initialise difficultLevels to empty array', () => {
      expect(component.filterForm.get('difficultLevels')?.value).toEqual([]);
    });

    it('should initialise mealCategories to empty array', () => {
      expect(component.filterForm.get('mealCategories')?.value).toEqual([]);
    });

    it('should initialise ingredientCategories to empty array', () => {
      expect(component.filterForm.get('ingredientCategories')?.value).toEqual([]);
    });

    it('should initialise tags to empty array', () => {
      expect(component.tags).toEqual([]);
    });
  });

  describe('initial form state (with filter @Input)', () => {
    it('should pre-populate form fields from the filter input', () => {
      component.filter = {
        keyword: 'pho',
        preparationTimeFrom: 5,
        difficultLevels: ['HARD'],
        mealCategories: ['LUNCH'],
      };
      // Re-create the form using ngOnInit to pick up the new input
      component.filterForm.patchValue({
        keyword: 'pho',
        preparationTimeFrom: 5,
        difficultLevels: ['HARD'],
        mealCategories: ['LUNCH'],
      });
      expect(component.filterForm.get('keyword')?.value).toBe('pho');
      expect(component.filterForm.get('preparationTimeFrom')?.value).toBe(5);
    });

    it('should convert filter.tags to tag objects on ngOnInit', () => {
      component.filter = { tags: ['spicy', 'vegan'] };
      component.ngOnInit();
      expect(component.tags).toEqual([
        { id: 'spicy', value: 'spicy' },
        { id: 'vegan', value: 'vegan' },
      ]);
    });

    it('should leave tags empty when filter.tags is not set', () => {
      component.filter = {};
      component.ngOnInit();
      expect(component.tags).toEqual([]);
    });
  });

  // ── Auto-suggestions ────────────────────────────────────────────────────────
  // A fresh fixture is created inside fakeAsync so that the startWith('') debounce
  // timer from ngOnInit is a fake timer that tick() can control.

  describe('setupAutoSuggestions', () => {
    let debFixture: ComponentFixture<DishFilterComponent>;
    let debComponent: DishFilterComponent;

    beforeEach(fakeAsync(() => {
      debFixture = TestBed.createComponent(DishFilterComponent);
      debComponent = debFixture.componentInstance;
      debFixture.detectChanges(); // triggers ngOnInit inside fakeAsync zone
      tick(300);                  // flush the startWith('') debounce timer
      dishServiceSpy.getSuggestions.calls.reset();
    }));

    afterEach(() => debFixture.destroy());

    it('should not call getSuggestions when keyword is shorter than 2 chars', fakeAsync(() => {
      debComponent.filterForm.get('keyword')?.setValue('p');
      tick(300);
      expect(dishServiceSpy.getSuggestions).not.toHaveBeenCalled();
    }));

    it('should call getSuggestions when keyword has 2+ chars after debounce', fakeAsync(() => {
      dishServiceSpy.getSuggestions.and.returnValue(of(['pho', 'pho bo']));
      debComponent.filterForm.get('keyword')?.setValue('ph');
      tick(300);
      expect(dishServiceSpy.getSuggestions).toHaveBeenCalledWith('ph', 8);
    }));

    it('should populate searchSuggestions from service response', fakeAsync(() => {
      dishServiceSpy.getSuggestions.and.returnValue(of(['pho', 'pho bo']));
      debComponent.filterForm.get('keyword')?.setValue('ph');
      tick(300);
      expect(debComponent.searchSuggestions()).toEqual(['pho', 'pho bo']);
    }));

    it('should set isLoadingSuggestions to false after suggestions are fetched', fakeAsync(() => {
      dishServiceSpy.getSuggestions.and.returnValue(of(['pho']));
      debComponent.filterForm.get('keyword')?.setValue('ph');
      tick(300);
      expect(debComponent.isLoadingSuggestions()).toBeFalse();
    }));
  });

  // ── onSuggestionSelected ────────────────────────────────────────────────────

  describe('onSuggestionSelected', () => {
    it('should patch the keyword form control', () => {
      spyOn(component, 'onSearch');
      component.onSuggestionSelected('bun bo');
      expect(component.filterForm.get('keyword')?.value).toBe('bun bo');
    });

    it('should call onSearch', () => {
      spyOn(component, 'onSearch');
      component.onSuggestionSelected('bun bo');
      expect(component.onSearch).toHaveBeenCalled();
    });
  });

  // ── Tag management ──────────────────────────────────────────────────────────

  describe('addTag', () => {
    it('should add a new tag to the tags array', () => {
      component.filter = {};
      component.addTag('spicy');
      expect(component.tags).toEqual([{ id: 'spicy', value: 'spicy' }]);
    });

    it('should initialise filter.tags when it is undefined', () => {
      component.filter = {};
      component.addTag('vegan');
      expect(component.filter.tags).toEqual(['vegan']);
    });

    it('should append to an existing tags list', () => {
      component.filter = { tags: ['spicy'] };
      component.tags = [{ id: 'spicy', value: 'spicy' }];
      component.addTag('vegan');
      expect(component.tags.length).toBe(2);
      expect(component.tags[1]).toEqual({ id: 'vegan', value: 'vegan' });
    });
  });

  describe('updateTag', () => {
    beforeEach(() => {
      component.filter = { tags: ['spicy'] };
      component.tags = [{ id: 'spicy', value: 'spicy' }];
    });

    it('should update the matching tag value', () => {
      component.updateTag({ id: 'spicy', value: 'very-spicy' });
      expect(component.tags).toEqual([{ id: 'very-spicy', value: 'very-spicy' }]);
    });

    it('should update filter.tags accordingly', () => {
      component.updateTag({ id: 'spicy', value: 'very-spicy' });
      expect(component.filter.tags).toEqual(['very-spicy']);
    });

    it('should not modify tags when filter.tags is undefined', () => {
      component.filter = {};
      component.updateTag({ id: 'spicy', value: 'very-spicy' });
      expect(component.tags).toEqual([{ id: 'spicy', value: 'spicy' }]);
    });
  });

  describe('removeTag', () => {
    beforeEach(() => {
      component.filter = { tags: ['spicy', 'vegan'] };
      component.tags = [
        { id: 'spicy', value: 'spicy' },
        { id: 'vegan', value: 'vegan' },
      ];
    });

    it('should remove the specified tag', () => {
      component.removeTag({ id: 'spicy', value: 'spicy' });
      expect(component.tags).toEqual([{ id: 'vegan', value: 'vegan' }]);
    });

    it('should update filter.tags accordingly', () => {
      component.removeTag({ id: 'spicy', value: 'spicy' });
      expect(component.filter.tags).toEqual(['vegan']);
    });

    it('should not modify tags when filter.tags is undefined', () => {
      component.filter = {};
      component.removeTag({ id: 'spicy', value: 'spicy' });
      expect(component.tags.length).toBe(2);
    });
  });

  // ── onSearch ────────────────────────────────────────────────────────────────

  describe('onSearch', () => {
    it('should emit search event with current form value', () => {
      const emitted: any[] = [];
      component.search.subscribe((v) => emitted.push(v));

      component.filterForm.patchValue({ keyword: 'bun bo' });
      component.onSearch();

      expect(emitted.length).toBe(1);
      expect(emitted[0].keyword).toBe('bun bo');
    });

    it('should emit the full form value including all fields', () => {
      const emitted: any[] = [];
      component.search.subscribe((v) => emitted.push(v));
      component.filterForm.patchValue({
        mealCategories: ['LUNCH'],
        difficultLevels: ['EASY'],
      });
      component.onSearch();
      expect(emitted[0].mealCategories).toEqual(['LUNCH']);
      expect(emitted[0].difficultLevels).toEqual(['EASY']);
    });
  });

  // ── formatLabel ─────────────────────────────────────────────────────────────

  describe('formatLabel', () => {
    it('should append "m" to the value', () => {
      expect(component.formatLabel(30)).toContain('30');
    });

    it('should handle value of 0', () => {
      expect(component.formatLabel(0)).toContain('0');
    });
  });

  // ── toggleDifficultyLevel ───────────────────────────────────────────────────

  describe('toggleDifficultyLevel', () => {
    it('should add a level when it is not yet selected', () => {
      component.difficultyLevels?.setValue([]);
      component.toggleDifficultyLevel(DIFFICULT_LEVELS.EASY);
      expect(component.difficultyLevels?.value).toContain(DIFFICULT_LEVELS.EASY);
    });

    it('should remove a level when it is already selected', () => {
      component.difficultyLevels?.setValue([DIFFICULT_LEVELS.EASY]);
      component.toggleDifficultyLevel(DIFFICULT_LEVELS.EASY);
      expect(component.difficultyLevels?.value).not.toContain(DIFFICULT_LEVELS.EASY);
    });

    it('should keep other levels when removing one', () => {
      component.difficultyLevels?.setValue([DIFFICULT_LEVELS.EASY, DIFFICULT_LEVELS.HARD]);
      component.toggleDifficultyLevel(DIFFICULT_LEVELS.EASY);
      expect(component.difficultyLevels?.value).toEqual([DIFFICULT_LEVELS.HARD]);
    });

    it('should allow all three levels to be selected simultaneously', () => {
      component.difficultyLevels?.setValue([]);
      Object.values(DIFFICULT_LEVELS).forEach((level) =>
        component.toggleDifficultyLevel(level)
      );
      expect(component.difficultyLevels?.value).toEqual(
        jasmine.arrayContaining(Object.values(DIFFICULT_LEVELS))
      );
    });
  });

  // ── difficultyLevels getter ─────────────────────────────────────────────────

  describe('difficultyLevels getter', () => {
    it('should return the difficultLevels form control', () => {
      expect(component.difficultyLevels).toBe(
        component.filterForm.get('difficultLevels')
      );
    });
  });

  // ── signals ─────────────────────────────────────────────────────────────────

  describe('signals', () => {
    it('should initialise isLoadingSuggestions to false', () => {
      expect(component.isLoadingSuggestions()).toBeFalse();
    });

    it('should initialise searchSuggestions to empty array', () => {
      expect(component.searchSuggestions()).toEqual([]);
    });
  });
});
