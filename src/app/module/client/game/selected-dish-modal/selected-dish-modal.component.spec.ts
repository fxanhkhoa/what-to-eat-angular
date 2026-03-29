import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatIconRegistry } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { SelectedDishModalComponent } from './selected-dish-modal.component';
import { Dish } from '@/types/dish.type';

@Component({ selector: 'app-dish-card', template: '', standalone: true })
class DishCardStub {
  @Input() dish: any;
  @Input() newTab: boolean = false;
}

const MOCK_DISH: Partial<Dish> = {
  slug: 'pho-bo',
  title: [{ lang: 'en', data: 'Beef Pho' }],
  thumbnail: 'https://example.com/pho.jpg',
  tags: [],
  mealCategories: [],
  ingredientCategories: [],
  videos: [],
  ingredients: [],
  relatedDishes: [],
  labels: [],
};

describe('SelectedDishModalComponent', () => {
  let component: SelectedDishModalComponent;
  let fixture: ComponentFixture<SelectedDishModalComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<SelectedDishModalComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [SelectedDishModalComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: MOCK_DISH },
      ],
    })
      .overrideComponent(SelectedDishModalComponent, {
        set: {
          imports: [CommonModule, MatIconModule, MatButtonModule, DishCardStub],
        },
      })
      .compileComponents();

    const registry = TestBed.inject(MatIconRegistry);
    spyOn(registry, 'getDefaultFontSetClass').and.returnValue(['material-icons']);

    fixture = TestBed.createComponent(SelectedDishModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject MAT_DIALOG_DATA as component data', () => {
    expect(component.data).toEqual(MOCK_DISH as Dish);
  });

  it('should have dialogRef injected', () => {
    expect(component.dialogRef).toBeTruthy();
  });

  describe('close button', () => {
    it('should call dialogRef.close() with no arguments when close icon button is clicked', () => {
      const closeBtn = fixture.debugElement.query(
        By.css('button[aria-label="Close dialog"]')
      );
      closeBtn.nativeElement.click();
      expect(dialogRefSpy.close).toHaveBeenCalledOnceWith();
    });
  });

  describe('Keep button', () => {
    it('should call dialogRef.close(false) when Keep button is clicked', () => {
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const keepBtn = buttons.find(
        (b) => b.nativeElement.textContent.trim() === 'Keep'
      );
      keepBtn!.nativeElement.click();
      expect(dialogRefSpy.close).toHaveBeenCalledOnceWith(false);
    });
  });

  describe('Remove button', () => {
    it('should call dialogRef.close(true) when Remove button is clicked', () => {
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const removeBtn = buttons.find(
        (b) => b.nativeElement.textContent.trim() === 'Remove'
      );
      removeBtn!.nativeElement.click();
      expect(dialogRefSpy.close).toHaveBeenCalledOnceWith(true);
    });
  });

  describe('template', () => {
    it('should render app-dish-card', () => {
      const dishCard = fixture.debugElement.query(By.css('app-dish-card'));
      expect(dishCard).toBeTruthy();
    });

    it('should bind [dish] input of app-dish-card to component data', () => {
      const dishCardInstance = fixture.debugElement.query(
        By.directive(DishCardStub)
      ).componentInstance as DishCardStub;
      expect(dishCardInstance.dish).toEqual(MOCK_DISH);
    });

    it('should bind [newTab]=true to app-dish-card', () => {
      const dishCardInstance = fixture.debugElement.query(
        By.directive(DishCardStub)
      ).componentInstance as DishCardStub;
      expect(dishCardInstance.newTab).toBeTrue();
    });

    it('should render close icon button with aria-label', () => {
      const closeBtn = fixture.debugElement.query(
        By.css('button[aria-label="Close dialog"]')
      );
      expect(closeBtn).toBeTruthy();
    });

    it('should render the close mat-icon inside the close button', () => {
      const icon = fixture.debugElement.query(By.css('mat-icon'));
      expect(icon).toBeTruthy();
      expect(icon.nativeElement.textContent.trim()).toBe('close');
    });

    it('should render Keep and Remove action buttons', () => {
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const texts = buttons.map((b) => b.nativeElement.textContent.trim());
      expect(texts).toContain('Keep');
      expect(texts).toContain('Remove');
    });

    it('should display the selected dish message', () => {
      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text).toContain('You have selected this dish');
    });

    it('should display the note about removing from the spinning list', () => {
      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text).toContain('If you remove it');
    });

    it('should display the strong Note label', () => {
      const strong = fixture.debugElement.query(By.css('strong'));
      expect(strong).toBeTruthy();
      expect(strong.nativeElement.textContent.trim()).toBe('Note:');
    });
  });
});
