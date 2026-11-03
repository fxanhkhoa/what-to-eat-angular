import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDialogRef } from '@angular/material/dialog';

import { AddCustomDishComponent } from './add-custom-dish.component';

describe('AddCustomDishComponent', () => {
  let component: AddCustomDishComponent;
  let fixture: ComponentFixture<AddCustomDishComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<AddCustomDishComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [AddCustomDishComponent, NoopAnimationsModule],
      providers: [
        FormBuilder,
        { provide: MatDialogRef, useValue: dialogRefSpy },
      ],
    })
      .overrideComponent(AddCustomDishComponent, {
        set: {
          imports: [
            CommonModule,
            ReactiveFormsModule,
            MatCardModule,
            MatFormFieldModule,
            MatInputModule,
            MatButtonModule,
            MatIconModule,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AddCustomDishComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ---- Creation ----------------------------------------------------------

  describe('creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with empty customTitle and url', () => {
      expect(component.dishVoteItemForm.get('customTitle')?.value).toBe('');
      expect(component.dishVoteItemForm.get('url')?.value).toBe('');
    });

    it('should start with an invalid form (customTitle required)', () => {
      expect(component.dishVoteItemForm.valid).toBeFalse();
    });
  });

  // ---- Form validation ---------------------------------------------------

  describe('form validation', () => {
    it('should be invalid when customTitle is empty', () => {
      component.dishVoteItemForm.get('customTitle')?.setValue('');
      expect(component.dishVoteItemForm.get('customTitle')?.hasError('required')).toBeTrue();
    });

    it('should be invalid when customTitle is only 1 character', () => {
      component.dishVoteItemForm.get('customTitle')?.setValue('A');
      expect(component.dishVoteItemForm.get('customTitle')?.hasError('minlength')).toBeTrue();
    });

    it('should be valid when customTitle has at least 2 characters', () => {
      component.dishVoteItemForm.get('customTitle')?.setValue('My Dish');
      expect(component.dishVoteItemForm.get('customTitle')?.valid).toBeTrue();
    });

    it('should be valid when url is empty (not required)', () => {
      component.dishVoteItemForm.get('customTitle')?.setValue('My Dish');
      component.dishVoteItemForm.get('url')?.setValue('');
      expect(component.dishVoteItemForm.valid).toBeTrue();
    });

    it('should be valid with both customTitle and url provided', () => {
      component.dishVoteItemForm.get('customTitle')?.setValue('My Dish');
      component.dishVoteItemForm.get('url')?.setValue('https://example.com/dish');
      expect(component.dishVoteItemForm.valid).toBeTrue();
    });
  });

  // ---- onSubmit ----------------------------------------------------------

  describe('onSubmit()', () => {
    it('should not call dialogRef.close when form is invalid', () => {
      component.dishVoteItemForm.get('customTitle')?.setValue('');
      component.onSubmit();
      expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });

    it('should call dialogRef.close with a DishVoteItem when form is valid', () => {
      component.dishVoteItemForm.get('customTitle')?.setValue('Banh Mi');
      component.dishVoteItemForm.get('url')?.setValue('https://example.com/banh-mi');
      component.onSubmit();
      expect(dialogRefSpy.close).toHaveBeenCalledWith(
        jasmine.objectContaining({
          customTitle: 'Banh Mi',
          slug: 'https://example.com/banh-mi',
          isCustom: true,
          voteUser: [],
          voteAnonymous: [],
        })
      );
    });

    it('should set slug from the url field', () => {
      component.dishVoteItemForm.get('customTitle')?.setValue('Pho');
      component.dishVoteItemForm.get('url')?.setValue('https://example.com/pho');
      component.onSubmit();
      const arg = dialogRefSpy.close.calls.mostRecent().args[0] as any;
      expect(arg.slug).toBe('https://example.com/pho');
    });

    it('should set slug to empty string when url is not provided', () => {
      component.dishVoteItemForm.get('customTitle')?.setValue('Pho');
      component.dishVoteItemForm.get('url')?.setValue('');
      component.onSubmit();
      const arg = dialogRefSpy.close.calls.mostRecent().args[0] as any;
      expect(arg.slug).toBe('');
    });

    it('should reset the form after successful submit', () => {
      component.dishVoteItemForm.get('customTitle')?.setValue('Pho');
      component.onSubmit();
      expect(component.dishVoteItemForm.get('customTitle')?.value).toBeNull();
      expect(component.dishVoteItemForm.get('url')?.value).toBeNull();
    });
  });

  // ---- onCancel ----------------------------------------------------------

  describe('onCancel()', () => {
    it('should call dialogRef.close with no arguments', () => {
      component.onCancel();
      expect(dialogRefSpy.close).toHaveBeenCalledWith();
    });

    it('should reset the form on cancel', () => {
      component.dishVoteItemForm.get('customTitle')?.setValue('Some Dish');
      component.onCancel();
      expect(component.dishVoteItemForm.get('customTitle')?.value).toBeNull();
    });

    it('should not close with a DishVoteItem on cancel', () => {
      component.dishVoteItemForm.get('customTitle')?.setValue('Some Dish');
      component.onCancel();
      const callArg = dialogRefSpy.close.calls.mostRecent().args[0];
      expect(callArg).toBeUndefined();
    });
  });

  // ---- Template ----------------------------------------------------------

  describe('template', () => {
    it('should render the customTitle input', () => {
      const input = fixture.debugElement.query(By.css('input[formControlName="customTitle"]'));
      expect(input).not.toBeNull();
    });

    it('should render the url input', () => {
      const input = fixture.debugElement.query(By.css('input[formControlName="url"]'));
      expect(input).not.toBeNull();
    });

    it('should disable the Add Dish button when form is invalid', () => {
      component.dishVoteItemForm.get('customTitle')?.setValue('');
      fixture.detectChanges();
      const addBtn = fixture.debugElement.query(By.css('button[mat-raised-button]'));
      expect(addBtn.nativeElement.disabled).toBeTrue();
    });

    it('should enable the Add Dish button when form is valid', () => {
      component.dishVoteItemForm.get('customTitle')?.setValue('Valid Dish');
      fixture.detectChanges();
      const addBtn = fixture.debugElement.query(By.css('button[mat-raised-button]'));
      expect(addBtn.nativeElement.disabled).toBeFalse();
    });

    it('should call onCancel when Cancel button is clicked', () => {
      spyOn(component, 'onCancel');
      const cancelBtn = fixture.debugElement.query(By.css('button[mat-button]'));
      cancelBtn.triggerEventHandler('click', null);
      expect(component.onCancel).toHaveBeenCalled();
    });

    it('should call onSubmit when Add Dish button is clicked with valid form', () => {
      spyOn(component, 'onSubmit');
      component.dishVoteItemForm.get('customTitle')?.setValue('Valid Dish');
      fixture.detectChanges();
      const addBtn = fixture.debugElement.query(By.css('button[mat-raised-button]'));
      addBtn.triggerEventHandler('click', null);
      expect(component.onSubmit).toHaveBeenCalled();
    });

    it('should update form value when user types in customTitle input', () => {
      const input = fixture.debugElement.query(By.css('input[formControlName="customTitle"]'));
      input.nativeElement.value = 'Sushi';
      input.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(component.dishVoteItemForm.get('customTitle')?.value).toBe('Sushi');
    });

    it('should update form value when user types in url input', () => {
      const input = fixture.debugElement.query(By.css('input[formControlName="url"]'));
      input.nativeElement.value = 'https://sushi.com';
      input.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(component.dishVoteItemForm.get('url')?.value).toBe('https://sushi.com');
    });
  });
});
