import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { Location } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconRegistry } from '@angular/material/icon';
import { provideHttpClient } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { DishDetailComponent } from './dish-detail.component';
import { IngredientService } from '@/app/service/ingredient.service';
import { DishService } from '@/app/service/dish.service';
import { UserDishInteractionService } from '@/app/service/user-dish-interaction.service';
import { Dish } from '@/types/dish.type';
import { Ingredient } from '@/types/ingredient.type';

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const mockIngredient: Ingredient = {
  _id: 'ing-1',
  slug: 'salt',
  title: [{ lang: 'en', data: 'Salt' }],
  measure: 'g',
  calories: 0,
  carbohydrate: 0,
  fat: 0,
  ingredientCategory: [],
  weight: 0,
  protein: 0,
  cholesterol: 0,
  sodium: 100,
  images: [],
  deleted: false,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const mockRelatedDish: Dish = {
  _id: 'related-1',
  slug: 'bun-bo',
  title: [{ lang: 'en', data: 'Bun Bo' }],
  shortDescription: [{ lang: 'en', data: 'A spicy soup' }],
  content: [{ lang: 'en', data: 'Content' }],
  tags: [],
  mealCategories: ['LUNCH'],
  ingredientCategories: [],
  videos: [],
  ingredients: [],
  relatedDishes: [],
  labels: [],
  deleted: false,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const mockDish: Dish = {
  _id: 'dish-1',
  slug: 'pho-bo',
  title: [{ lang: 'en', data: 'Beef Pho' }],
  shortDescription: [
    {
      lang: 'en',
      data: 'A classic Vietnamese noodle soup with rich broth',
    },
  ],
  content: [{ lang: 'en', data: '<p>Step 1: Boil water</p>' }],
  tags: ['vietnamese'],
  preparationTime: 10,
  cookingTime: 30,
  difficultLevel: 'MEDIUM',
  mealCategories: ['BREAKFAST', 'LUNCH'],
  ingredientCategories: ['PROTEIN FOODS'],
  thumbnail: '/assets/pho.jpg',
  videos: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
  ingredients: [{ ingredientId: 'ing-1', quantity: 2, slug: 'salt', note: 'to taste' }],
  relatedDishes: ['related-1'],
  labels: [],
  deleted: false,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function buildActivatedRoute(slug: string | null): Partial<ActivatedRoute> {
  const paramMapSubject = new Subject<any>();
  return {
    snapshot: {
      data: { pageUrl: 'https://example.com/dish/pho-bo' },
      paramMap: {
        get: (key: string) => (key === 'slug' ? slug : null),
        has: () => false,
        getAll: () => [],
        keys: [],
      },
      url: [],
      params: {},
      queryParams: {},
      fragment: null,
      outlet: 'primary',
      component: null,
      routeConfig: null,
      title: undefined,
      root: new ActivatedRouteSnapshot(),
      parent: null,
      firstChild: null,
      children: [],
      pathFromRoot: [],
      queryParamMap: {
        get: () => null,
        has: () => false,
        getAll: () => [],
        keys: [],
      },
    } as unknown as ActivatedRouteSnapshot,
    paramMap: of({
      get: (key: string) => (key === 'slug' ? slug : null),
    }) as any,
  };
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('DishDetailComponent', () => {
  let component: DishDetailComponent;
  let fixture: ComponentFixture<DishDetailComponent>;
  let dishServiceSpy: jasmine.SpyObj<DishService>;
  let ingredientServiceSpy: jasmine.SpyObj<IngredientService>;
  let userDishInteractionSpy: jasmine.SpyObj<UserDishInteractionService>;
  let titleSpy: jasmine.SpyObj<Title>;
  let metaSpy: jasmine.SpyObj<Meta>;
  let locationSpy: jasmine.SpyObj<Location>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  async function createComponent(slug: string | null = 'pho-bo') {
    dishServiceSpy = jasmine.createSpyObj('DishService', ['findBySlug', 'findOne']);
    ingredientServiceSpy = jasmine.createSpyObj('IngredientService', ['findOne']);
    userDishInteractionSpy = jasmine.createSpyObj('UserDishInteractionService', ['recordView']);
    titleSpy = jasmine.createSpyObj('Title', ['setTitle']);
    metaSpy = jasmine.createSpyObj('Meta', ['updateTag']);
    locationSpy = jasmine.createSpyObj('Location', ['back']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    dishServiceSpy.findBySlug.and.returnValue(of(mockDish));
    dishServiceSpy.findOne.and.returnValue(of(mockRelatedDish));
    ingredientServiceSpy.findOne.and.returnValue(of(mockIngredient));
    userDishInteractionSpy.recordView.and.returnValue(of({} as any));

    const matIconRegistryMock: Partial<MatIconRegistry> = {
      addSvgIcon: () => ({}) as MatIconRegistry,
      getNamedSvgIcon: () => of(document.createElement('svg')) as any,
      getDefaultFontSetClass: () => ['material-icons'] as any,
    };

    await TestBed.configureTestingModule({
      imports: [DishDetailComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        { provide: ActivatedRoute, useValue: buildActivatedRoute(slug) },
        { provide: DishService, useValue: dishServiceSpy },
        { provide: IngredientService, useValue: ingredientServiceSpy },
        { provide: UserDishInteractionService, useValue: userDishInteractionSpy },
        { provide: Title, useValue: titleSpy },
        { provide: Meta, useValue: metaSpy },
        { provide: Location, useValue: locationSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MatIconRegistry, useValue: matIconRegistryMock },
        { provide: LOCALE_ID, useValue: 'en' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DishDetailComponent);
    component = fixture.componentInstance;
  }

  afterEach(() => {
    // Cleanup DOM additions
    document.getElementById('dish-structured-data')?.remove();
    document.querySelector('link[rel="canonical"]')?.remove();
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((l) => l.remove());
  });

  // ── Creation ──────────────────────────────────────────────────────────────

  it('should create', async () => {
    await createComponent();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ── Initial signals ───────────────────────────────────────────────────────

  describe('initial state', () => {
    beforeEach(async () => {
      await createComponent();
    });

    it('should initialise dish signal to null before detectChanges', () => {
      expect(component.dish()).toBeNull();
    });

    it('should initialise loading to false before detectChanges', () => {
      expect(component.loading()).toBeFalse();
    });

    it('should initialise ingredients to an empty array', () => {
      expect(component.ingredients()).toEqual([]);
    });

    it('should initialise relatedDishes to an empty array', () => {
      expect(component.relatedDishes()).toEqual([]);
    });
  });

  // ── ngOnInit / setDefaultSEO ──────────────────────────────────────────────

  describe('ngOnInit — default SEO', () => {
    beforeEach(async () => {
      dishServiceSpy = jasmine.createSpyObj('DishService', ['findBySlug', 'findOne']);
      dishServiceSpy.findBySlug.and.returnValue(of(null as any));
      await createComponent('pho-bo');
      fixture.detectChanges();
    });

    it('should set the default page title', () => {
      expect(titleSpy.setTitle).toHaveBeenCalledWith('Chi tiết món ăn | What To Eat');
    });

    it('should set default description meta tag', () => {
      expect(metaSpy.updateTag).toHaveBeenCalledWith(
        jasmine.objectContaining({ name: 'description' })
      );
    });

    it('should set og:type to article', () => {
      expect(metaSpy.updateTag).toHaveBeenCalledWith({ property: 'og:type', content: 'article' });
    });

    it('should set robots to index, follow', () => {
      expect(metaSpy.updateTag).toHaveBeenCalledWith({ name: 'robots', content: 'index, follow' });
    });

    it('should set twitter:card to summary_large_image', () => {
      expect(metaSpy.updateTag).toHaveBeenCalledWith({
        name: 'twitter:card',
        content: 'summary_large_image',
      });
    });
  });

  describe('ngOnInit — pageUrl', () => {
    it('should read pageUrl from the route snapshot data', async () => {
      await createComponent();
      fixture.detectChanges();
      expect(component.pageUrl()).toBe('https://example.com/dish/pho-bo');
    });
  });

  describe('ngOnInit — no slug', () => {
    it('should not call findBySlug when slug is null', async () => {
      await createComponent(null);
      fixture.detectChanges();
      expect(dishServiceSpy.findBySlug).not.toHaveBeenCalled();
    });
  });

  // ── getData ───────────────────────────────────────────────────────────────

  describe('getData', () => {
    beforeEach(async () => {
      await createComponent();
      fixture.detectChanges();
    });

    it('should call findBySlug with the route slug', () => {
      expect(dishServiceSpy.findBySlug).toHaveBeenCalledWith('pho-bo');
    });

    it('should populate dish signal from service response', () => {
      expect(component.dish()).toEqual(mockDish);
    });

    it('should populate relatedDishes from findOne calls', () => {
      expect(component.relatedDishes()).toEqual([mockRelatedDish]);
    });

    it('should populate ingredients from findOne calls', () => {
      expect(component.ingredients()).toEqual([mockIngredient]);
    });

    it('should call recordView with the dish data', () => {
      expect(userDishInteractionSpy.recordView).toHaveBeenCalledWith(
        jasmine.objectContaining({ dishId: 'dish-1', dishSlug: 'pho-bo' })
      );
    });

    it('should set loading to false after data is fetched', () => {
      expect(component.loading()).toBeFalse();
    });

    it('should update the page title with dish name', () => {
      expect(titleSpy.setTitle).toHaveBeenCalledWith('Beef Pho | What To Eat');
    });

    it('should update og:image with the dish thumbnail', () => {
      expect(metaSpy.updateTag).toHaveBeenCalledWith({
        property: 'og:image',
        content: '/assets/pho.jpg',
      });
    });

    it('should add a structured-data JSON-LD script to the document head', () => {
      const script = document.getElementById('dish-structured-data');
      expect(script).toBeTruthy();
      expect(script?.getAttribute('type')).toBe('application/ld+json');
    });

    it('should not call findBySlug when getData is called with empty string', () => {
      dishServiceSpy.findBySlug.calls.reset();
      component.getData('');
      expect(dishServiceSpy.findBySlug).not.toHaveBeenCalled();
    });

    it('should keep loading false when findBySlug returns null', () => {
      dishServiceSpy.findBySlug.and.returnValue(of(null as any));
      component.getData('pho-bo');
      expect(component.loading()).toBeFalse();
    });

    it('should silently handle recordView errors', () => {
      userDishInteractionSpy.recordView.and.returnValue(throwError(() => new Error('Network error')));
      expect(() => component.getData('pho-bo')).not.toThrow();
    });
  });

  // ── Computed: dishThumbUrl ────────────────────────────────────────────────

  describe('dishThumbUrl computed', () => {
    beforeEach(async () => {
      await createComponent();
    });

    it('should return empty string when dish is null', () => {
      expect(component.dishThumbUrl()).toBe('');
    });

    it('should return a CSS url() string with the thumbnail when dish is loaded', () => {
      fixture.detectChanges();
      expect(component.dishThumbUrl()).toBe('url("/assets/pho.jpg")');
    });

    it('should return empty string when dish has no thumbnail', () => {
      component.dish.set({ ...mockDish, thumbnail: undefined });
      expect(component.dishThumbUrl()).toBe('');
    });
  });

  // ── Computed: categories ─────────────────────────────────────────────────

  describe('categories computed', () => {
    beforeEach(async () => {
      await createComponent();
      fixture.detectChanges();
    });

    it('should merge mealCategories and ingredientCategories', () => {
      expect(component.categories()).toEqual(['BREAKFAST', 'LUNCH', 'PROTEIN FOODS']);
    });

    it('should return empty array when dish is null', () => {
      component.dish.set(null);
      expect(component.categories()).toEqual([]);
    });
  });

  // ── Computed: youtubeId ───────────────────────────────────────────────────

  describe('youtubeId computed', () => {
    beforeEach(async () => {
      await createComponent();
    });

    it('should return empty string when dish is null', () => {
      expect(component.youtubeId()).toBe('');
    });

    it('should extract the YouTube video ID from a watch URL', () => {
      component.dish.set(mockDish);
      expect(component.youtubeId()).toBe('dQw4w9WgXcQ');
    });

    it('should return empty string when videos array is empty', () => {
      component.dish.set({ ...mockDish, videos: [] });
      expect(component.youtubeId()).toBe('');
    });
  });

  // ── Computed: currentVideoId ──────────────────────────────────────────────

  describe('currentVideoId computed', () => {
    beforeEach(async () => {
      await createComponent();
      component.dish.set(mockDish);
    });

    it('should return the video ID for the current index (0)', () => {
      expect(component.currentVideoId()).toBe('dQw4w9WgXcQ');
    });

    it('should return empty string when videos array is empty', () => {
      component.dish.set({ ...mockDish, videos: [] });
      expect(component.currentVideoId()).toBe('');
    });
  });

  // ── selectVideo ───────────────────────────────────────────────────────────

  describe('selectVideo', () => {
    beforeEach(async () => {
      await createComponent();
      component.dish.set({
        ...mockDish,
        videos: [
          'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          'https://www.youtube.com/watch?v=AAAAAAAAAAA',
        ],
      });
    });

    it('should update currentVideoIndex to the given index', () => {
      component.selectVideo(1);
      expect(component.currentVideoIndex()).toBe(1);
    });

    it('should not update index when out of bounds (negative)', () => {
      component.selectVideo(-1);
      expect(component.currentVideoIndex()).toBe(0);
    });

    it('should not update index when out of bounds (too large)', () => {
      component.selectVideo(99);
      expect(component.currentVideoIndex()).toBe(0);
    });
  });

  // ── getYouTubeThumbnail ───────────────────────────────────────────────────

  describe('getYouTubeThumbnail', () => {
    beforeEach(async () => {
      await createComponent();
    });

    it('should return the mqdefault thumbnail URL for a valid watch URL', () => {
      expect(component.getYouTubeThumbnail('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
        'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg'
      );
    });

    it('should return the thumbnail URL for a youtu.be shortlink', () => {
      expect(component.getYouTubeThumbnail('https://youtu.be/dQw4w9WgXcQ')).toBe(
        'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg'
      );
    });

    it('should return empty string for a non-YouTube URL', () => {
      expect(component.getYouTubeThumbnail('https://vimeo.com/12345')).toBe('');
    });
  });

  // ── getQuantity / getNote ─────────────────────────────────────────────────

  describe('getQuantity', () => {
    beforeEach(async () => {
      await createComponent();
      fixture.detectChanges();
    });

    it('should return the quantity string for a known ingredient', () => {
      expect(component.getQuantity(mockIngredient)).toBe('2');
    });

    it('should return empty string for an unknown ingredient', () => {
      const unknown = { ...mockIngredient, _id: 'unknown-id' };
      expect(component.getQuantity(unknown)).toBe('');
    });
  });

  describe('getNote', () => {
    beforeEach(async () => {
      await createComponent();
      fixture.detectChanges();
    });

    it('should return the note for a known ingredient', () => {
      expect(component.getNote(mockIngredient)).toBe('to taste');
    });

    it('should return empty string for an unknown ingredient', () => {
      const unknown = { ...mockIngredient, _id: 'unknown-id' };
      expect(component.getNote(unknown)).toBe('');
    });
  });

  // ── getContent ────────────────────────────────────────────────────────────

  describe('getContent', () => {
    beforeEach(async () => {
      await createComponent();
      fixture.detectChanges();
    });

    it('should return safe HTML for the dish content', () => {
      const content = component.getContent();
      expect(content).toBeTruthy();
    });

    it('should return safe HTML for empty string when dish is null', () => {
      component.dish.set(null);
      const content = component.getContent();
      // truthy because bypassSecurityTrustHtml('') still returns an object
      expect(content).toBeTruthy();
    });
  });

  // ── goBack ────────────────────────────────────────────────────────────────

  describe('goBack', () => {
    beforeEach(async () => {
      await createComponent();
      fixture.detectChanges();
    });

    it('should call location.back()', () => {
      component.goBack();
      expect(locationSpy.back).toHaveBeenCalled();
    });
  });

  // ── copyLink ──────────────────────────────────────────────────────────────

  describe('copyLink', () => {
    beforeEach(async () => {
      await createComponent();
      fixture.detectChanges();
      spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
    });

    it('should write the pageUrl to the clipboard', () => {
      component.copyLink();
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'https://example.com/dish/pho-bo'
      );
    });

    it('should open a snackbar with "Copied!" message', () => {
      component.copyLink();
      expect(snackBarSpy.open).toHaveBeenCalledWith(
        jasmine.any(String),
        'OK',
        { duration: 2000 }
      );
    });
  });

  // ── ngOnDestroy ───────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    beforeEach(async () => {
      await createComponent();
      fixture.detectChanges();
    });

    it('should remove the structured-data script tag from the DOM', () => {
      expect(document.getElementById('dish-structured-data')).toBeTruthy();
      component.ngOnDestroy();
      expect(document.getElementById('dish-structured-data')).toBeNull();
    });

    it('should not throw when structured-data script does not exist', () => {
      document.getElementById('dish-structured-data')?.remove();
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  // ── newUUID ───────────────────────────────────────────────────────────────

  describe('newUUID', () => {
    beforeEach(async () => {
      await createComponent();
    });

    it('should return a valid UUID v4', () => {
      const uuid = component.newUUID;
      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should return a different UUID on each access', () => {
      expect(component.newUUID).not.toBe(component.newUUID);
    });
  });
});
