import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DishDetailDialogComponent } from './dish-detail-dialog.component';
import { provideRouter } from '@angular/router';
import { LOCALE_ID } from '@angular/core';
import { Dish } from '@/types/dish.type';

const mockDish: Dish = {
  _id: 'd1',
  slug: 'pho',
  title: [{ lang: 'en', data: 'Pho' }, { lang: 'vi', data: 'Phở' }],
  shortDescription: [{ lang: 'en', data: 'A classic noodle soup' }],
  content: [{ lang: 'en', data: 'Full recipe' }],
  tags: ['soup', 'vietnamese'],
  mealCategories: ['lunch'],
  ingredientCategories: ['noodles'],
  preparationTime: 20,
  cookingTime: 40,
  difficultLevel: 'medium',
  thumbnail: 'https://example.com/pho.jpg',
  videos: [],
  ingredients: [
    { ingredientId: 'i1', slug: 'rice-noodles', quantity: 200, note: '' },
    { ingredientId: 'i2', slug: 'beef-broth', quantity: 1, note: 'fresh' },
  ],
  relatedDishes: [],
  labels: [],
  deleted: false,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

function createDialogRefSpy() {
  return jasmine.createSpyObj('MatDialogRef', ['close']);
}

describe('DishDetailDialogComponent', () => {
  let component: DishDetailDialogComponent;
  let fixture: ComponentFixture<DishDetailDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<DishDetailDialogComponent>>;

  async function setup(dishData: Partial<Dish> = {}, localeId = 'en') {
    dialogRefSpy = createDialogRefSpy();
    await TestBed.configureTestingModule({
      imports: [DishDetailDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { ...mockDish, ...dishData } },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: LOCALE_ID, useValue: localeId },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DishDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterEach(() => TestBed.resetTestingModule());

  // ── creation ──────────────────────────────────────────────────────────────

  it('should create', async () => {
    await setup();
    expect(component).toBeTruthy();
  });

  it('should inject dialog data as the dish', async () => {
    await setup();
    expect(component.data._id).toBe('d1');
    expect(component.data.slug).toBe('pho');
  });

  // ── getTotalTime() ────────────────────────────────────────────────────────

  it('should return sum of preparationTime and cookingTime', async () => {
    await setup({ preparationTime: 20, cookingTime: 40 });
    expect(component.getTotalTime()).toBe(60);
  });

  it('should return preparationTime alone when cookingTime is absent', async () => {
    await setup({ preparationTime: 15, cookingTime: undefined });
    expect(component.getTotalTime()).toBe(15);
  });

  it('should return cookingTime alone when preparationTime is absent', async () => {
    await setup({ preparationTime: undefined, cookingTime: 30 });
    expect(component.getTotalTime()).toBe(30);
  });

  it('should return null when both times are absent', async () => {
    await setup({ preparationTime: undefined, cookingTime: undefined });
    expect(component.getTotalTime()).toBeNull();
  });

  it('should return null when both times are 0', async () => {
    await setup({ preparationTime: 0, cookingTime: 0 });
    expect(component.getTotalTime()).toBeNull();
  });

  // ── close() ───────────────────────────────────────────────────────────────

  it('should call dialogRef.close() when close() is invoked', async () => {
    await setup();
    component.close();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should call dialogRef.close() when the close button is clicked', async () => {
    await setup();
    const closeBtn: HTMLButtonElement = fixture.nativeElement.querySelector('button[mat-icon-button]');
    closeBtn.click();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  // ── template rendering: thumbnail ─────────────────────────────────────────

  it('should render the thumbnail image when thumbnail is provided', async () => {
    await setup({ thumbnail: 'https://example.com/pho.jpg' });
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(img).not.toBeNull();
    expect(img.src).toContain('pho.jpg');
  });

  it('should not render the thumbnail image when thumbnail is absent', async () => {
    await setup({ thumbnail: undefined });
    const img = fixture.nativeElement.querySelector('img');
    expect(img).toBeNull();
  });

  // ── template rendering: time cards ───────────────────────────────────────

  it('should show preparationTime card when provided', async () => {
    await setup({ preparationTime: 20 });
    expect(fixture.nativeElement.textContent).toContain('20 min');
  });

  it('should not show preparationTime card when absent', async () => {
    await setup({ preparationTime: undefined, cookingTime: 30 });
    // Only cooking time text should appear, not prep time card label
    const text: string = fixture.nativeElement.textContent;
    expect(text).not.toContain('Prep Time');
  });

  it('should show cookingTime card when provided', async () => {
    await setup({ cookingTime: 40 });
    expect(fixture.nativeElement.textContent).toContain('40 min');
  });

  it('should show total time card when sum > 0', async () => {
    await setup({ preparationTime: 20, cookingTime: 40 });
    expect(fixture.nativeElement.textContent).toContain('60 min');
  });

  it('should not show total time card when both times are absent', async () => {
    await setup({ preparationTime: undefined, cookingTime: undefined });
    expect(fixture.nativeElement.textContent).not.toContain('Total');
  });

  it('should show difficultLevel card when provided', async () => {
    await setup({ difficultLevel: 'medium' });
    expect(fixture.nativeElement.textContent).toContain('Difficulty');
  });

  it('should not show difficultLevel card when absent', async () => {
    await setup({ difficultLevel: undefined });
    expect(fixture.nativeElement.textContent).not.toContain('Difficulty');
  });

  // ── template rendering: ingredients ──────────────────────────────────────

  it('should render ingredient slugs', async () => {
    await setup();
    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('rice-noodles');
    expect(text).toContain('beef-broth');
  });

  it('should not render ingredients section when the list is empty', async () => {
    await setup({ ingredients: [] });
    expect(fixture.nativeElement.textContent).not.toContain('Ingredients');
  });

  it('should render ingredient note when present', async () => {
    await setup();
    expect(fixture.nativeElement.textContent).toContain('fresh');
  });
});
