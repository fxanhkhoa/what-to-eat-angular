import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VotingNameDialogComponent } from './voting-name-dialog.component';

describe('VotingNameDialogComponent', () => {
  let component: VotingNameDialogComponent;
  let fixture: ComponentFixture<VotingNameDialogComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<VotingNameDialogComponent>>;

  beforeEach(async () => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [VotingNameDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VotingNameDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ---- creation -----------------------------------------------------------

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise name to empty string', () => {
    expect(component.name).toBe('');
  });

  it('should inject MAT_DIALOG_DATA as public data', () => {
    expect(component.data).toEqual({});
  });

  // ---- onSubmit() ---------------------------------------------------------

  describe('onSubmit()', () => {
    it('should close the dialog with trimmed name when name is non-empty', () => {
      component.name = 'Alice';
      component.onSubmit();
      expect(dialogRef.close).toHaveBeenCalledWith('Alice');
    });

    it('should trim whitespace before closing', () => {
      component.name = '  Bob  ';
      component.onSubmit();
      expect(dialogRef.close).toHaveBeenCalledWith('Bob');
    });

    it('should not close the dialog when name is empty', () => {
      component.name = '';
      component.onSubmit();
      expect(dialogRef.close).not.toHaveBeenCalled();
    });

    it('should not close the dialog when name is only whitespace', () => {
      component.name = '   ';
      component.onSubmit();
      expect(dialogRef.close).not.toHaveBeenCalled();
    });

    it('should close with trimmed value when name has leading/trailing spaces', () => {
      component.name = '  Charlie  ';
      component.onSubmit();
      expect(dialogRef.close).toHaveBeenCalledWith('Charlie');
    });
  });

  // ---- template -----------------------------------------------------------

  describe('template', () => {
    it('should render the heading "Let us know your name"', () => {
      const h2 = fixture.debugElement.query(By.css('h2'));
      expect(h2.nativeElement.textContent.trim()).toBe('Let us know your name');
    });

    it('should render a text input', () => {
      const input = fixture.debugElement.query(By.css('input[name="name"]'));
      expect(input).not.toBeNull();
    });

    it('should bind input to name via ngModel', async () => {
      const input = fixture.debugElement.query(By.css('input[name="name"]'));
      input.nativeElement.value = 'Diana';
      input.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.name).toBe('Diana');
    });

    it('should submit button be disabled when name is empty', () => {
      component.name = '';
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(btn.nativeElement.disabled).toBeTrue();
    });

    it('should submit button be disabled when name is only whitespace', () => {
      component.name = '   ';
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(btn.nativeElement.disabled).toBeTrue();
    });

    it('should submit button be enabled when name has valid text', () => {
      component.name = 'Eve';
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(btn.nativeElement.disabled).toBeFalse();
    });

    it('should call onSubmit when form is submitted', () => {
      spyOn(component, 'onSubmit');
      const form = fixture.debugElement.query(By.css('form'));
      form.nativeElement.dispatchEvent(new Event('submit'));
      fixture.detectChanges();
      expect(component.onSubmit).toHaveBeenCalled();
    });

    it('should close dialog when submit button is clicked with valid name', () => {
      component.name = 'Frank';
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('button[type="submit"]'));
      btn.nativeElement.click();
      fixture.detectChanges();
      expect(dialogRef.close).toHaveBeenCalledWith('Frank');
    });

    it('should render a submit button with type submit', () => {
      const btn = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(btn).not.toBeNull();
    });
  });
});
