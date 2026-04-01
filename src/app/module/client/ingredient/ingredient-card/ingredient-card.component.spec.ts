import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { IngredientCardComponent } from './ingredient-card.component';
import { Ingredient } from '@/types/ingredient.type';
import { MultiLanguagePipe } from '@/app/pipe/multi-language.pipe';

@Component({ selector: 'app-category-badges', template: '', standalone: true })
class CategoryBadgesStub {
  @Input() categories: string[] = [];
}

const mockIngredient: Ingredient = {
  _id: 'ing-1',
  images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
  title: [
    { lang: 'en', data: 'Tomato' },
    { lang: 'vi', data: 'Cà chua' },
  ],
  ingredientCategory: ['vegetable', 'fruit'],
  calories: 18,
  protein: 0.9,
  fat: 0.2,
  carbs: 3.9,
  slug: 'tomato',
} as any;

describe('IngredientCardComponent', () => {
  let component: IngredientCardComponent;
  let fixture: ComponentFixture<IngredientCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngredientCardComponent, NoopAnimationsModule],
    })
      .overrideComponent(IngredientCardComponent, {
        set: {
          imports: [MultiLanguagePipe, CategoryBadgesStub],
          schemas: [NO_ERRORS_SCHEMA],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(IngredientCardComponent);
    component = fixture.componentInstance;
    component.ingredient = mockIngredient;
    fixture.detectChanges();
  });

  // ── creation ──────────────────────────────────────────────────────────────────
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── initial signal state ──────────────────────────────────────────────────────
  it('should initialise flipCard to false', () => {
    expect(component.flipCard()).toBeFalse();
  });

  // ── backgroundList ────────────────────────────────────────────────────────────
  it('should have 4 background images', () => {
    expect(component.backgroundList.length).toBe(4);
  });

  // ── ngOnInit ──────────────────────────────────────────────────────────────────
  it('should set selectedBackground to a CSS background-image string on init', () => {
    expect(component.selectedBackground()).toContain('background-image');
    expect(component.selectedBackground()).toContain('url(');
    expect(component.selectedBackground()).toContain('!important');
  });

  it('selectedBackground should use one of the backgroundList images', () => {
    const bg = component.selectedBackground();
    const usedAKnownImage = component.backgroundList.some((img) =>
      bg.includes(img)
    );
    expect(usedAKnownImage).toBeTrue();
  });

  // ── toggleFlipCard ────────────────────────────────────────────────────────────
  it('toggleFlipCard should flip flipCard from false to true', () => {
    component.toggleFlipCard();
    expect(component.flipCard()).toBeTrue();
  });

  it('toggleFlipCard should flip flipCard back to false on second call', () => {
    component.toggleFlipCard();
    component.toggleFlipCard();
    expect(component.flipCard()).toBeFalse();
  });

  it('toggleFlipCard should toggle state on each call', () => {
    for (let i = 1; i <= 5; i++) {
      component.toggleFlipCard();
      expect(component.flipCard()).toBe(i % 2 === 1);
    }
  });

  // ── @Input ingredient ─────────────────────────────────────────────────────────
  it('should accept the ingredient input', () => {
    expect(component.ingredient).toEqual(mockIngredient);
  });

  it('ingredient images should be accessible', () => {
    expect(component.ingredient.images.length).toBe(2);
  });

  // ── localeId ──────────────────────────────────────────────────────────────────
  it('should inject a localeId', () => {
    expect(component.localeId).toBeTruthy();
  });
});
