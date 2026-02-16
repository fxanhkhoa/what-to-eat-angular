import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatSnackBarRef,
  MAT_SNACK_BAR_DATA,
} from '@angular/material/snack-bar';
import { ConfirmSnackbarComponent } from './confirm-snackbar.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('ConfirmSnackbarComponent', () => {
  let component: ConfirmSnackbarComponent;
  let fixture: ComponentFixture<ConfirmSnackbarComponent>;
  let mockSnackBarRef: jasmine.SpyObj<
    MatSnackBarRef<ConfirmSnackbarComponent>
  >;
  let mockData: { mainMsg: string; subMsg: string };

  beforeEach(async () => {
    mockSnackBarRef = jasmine.createSpyObj('MatSnackBarRef', ['dismiss']);
    mockData = {
      mainMsg: 'Test Main Message',
      subMsg: 'Test Sub Message',
    };

    await TestBed.configureTestingModule({
      imports: [ConfirmSnackbarComponent],
      providers: [
        { provide: MatSnackBarRef, useValue: mockSnackBarRef },
        { provide: MAT_SNACK_BAR_DATA, useValue: mockData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmSnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject snackbar data correctly', () => {
    expect(component.data).toEqual(mockData);
    expect(component.data.mainMsg).toBe('Test Main Message');
    expect(component.data.subMsg).toBe('Test Sub Message');
  });

  it('should display main message', () => {
    const h2Element: DebugElement = fixture.debugElement.query(By.css('h2'));
    expect(h2Element.nativeElement.textContent).toContain('Test Main Message');
  });

  it('should display sub message', () => {
    const spanElement: DebugElement = fixture.debugElement.query(
      By.css('span.sub-text')
    );
    expect(spanElement.nativeElement.textContent).toContain(
      'Test Sub Message'
    );
  });

  it('should display help icon', () => {
    const iconElement: DebugElement = fixture.debugElement.query(
      By.css('mat-icon.icon')
    );
    expect(iconElement).toBeTruthy();
    expect(iconElement.nativeElement.textContent.trim()).toBe('help_outline');
  });

  it('should render cancel button with correct color', () => {
    const cancelButton = fixture.debugElement.query(
      By.css('button[color="primary"][mat-raised-button]')
    );
    expect(cancelButton).toBeTruthy();
  });

  it('should render confirm button with correct styling', () => {
    const confirmButton = fixture.debugElement.query(
      By.css('button[color="primary"][mat-stroked-button]')
    );
    expect(confirmButton).toBeTruthy();
  });

  describe('onCancel', () => {
    it('should dismiss snackbar when onCancel is called', () => {
      component.onCancel();
      expect(mockSnackBarRef.dismiss).toHaveBeenCalled();
    });

    it('should dismiss snackbar when cancel button is clicked', () => {
      const cancelButton = fixture.debugElement.query(
        By.css('button[mat-raised-button]')
      );
      cancelButton.nativeElement.click();
      expect(mockSnackBarRef.dismiss).toHaveBeenCalled();
    });
  });

  describe('onConfirm', () => {
    it('should call onConfirm method when confirm button is clicked', () => {
      spyOn(component, 'onConfirm');
      const confirmButton = fixture.debugElement.query(
        By.css('button[mat-stroked-button]')
      );
      confirmButton.nativeElement.click();
      expect(component.onConfirm).toHaveBeenCalled();
    });

    it('should exist as a method', () => {
      expect(component.onConfirm).toBeDefined();
      expect(typeof component.onConfirm).toBe('function');
    });
  });

  describe('Template structure', () => {
    it('should have container div', () => {
      const container = fixture.debugElement.query(By.css('.container'));
      expect(container).toBeTruthy();
    });

    it('should center icon in flex container', () => {
      const iconContainer = fixture.debugElement.query(
        By.css('.flex.justify-center.mb-2')
      );
      expect(iconContainer).toBeTruthy();
      const icon = iconContainer.query(By.css('mat-icon'));
      expect(icon).toBeTruthy();
    });

    it('should center main message text', () => {
      const h2 = fixture.debugElement.query(By.css('h2.text-center'));
      expect(h2).toBeTruthy();
    });

    it('should align buttons to the end', () => {
      const buttonContainer = fixture.debugElement.query(
        By.css('.flex.justify-end')
      );
      expect(buttonContainer).toBeTruthy();
      const buttons = buttonContainer.queryAll(By.css('button'));
      expect(buttons.length).toBe(2);
    });
  });

  describe('Data binding', () => {
    it('should update display when data changes', () => {
      component.data = {
        mainMsg: 'Updated Main Message',
        subMsg: 'Updated Sub Message',
      };
      fixture.detectChanges();

      const h2Element = fixture.debugElement.query(By.css('h2'));
      const spanElement = fixture.debugElement.query(By.css('span.sub-text'));

      expect(h2Element.nativeElement.textContent).toContain(
        'Updated Main Message'
      );
      expect(spanElement.nativeElement.textContent).toContain(
        'Updated Sub Message'
      );
    });
  });
});
