import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { ErrorSnackbarComponent } from './error-snackbar.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('ErrorSnackbarComponent', () => {
  let component: ErrorSnackbarComponent;
  let fixture: ComponentFixture<ErrorSnackbarComponent>;
  let mockSnackBarRef: jasmine.SpyObj<MatSnackBarRef<ErrorSnackbarComponent>>;
  let mockData: { mainMsg: string; subMsg: string };

  beforeEach(async () => {
    mockSnackBarRef = jasmine.createSpyObj('MatSnackBarRef', ['dismiss']);
    mockData = {
      mainMsg: 'Error Main Message',
      subMsg: 'Error Sub Message',
    };

    await TestBed.configureTestingModule({
      imports: [ErrorSnackbarComponent],
      providers: [
        { provide: MatSnackBarRef, useValue: mockSnackBarRef },
        { provide: MAT_SNACK_BAR_DATA, useValue: mockData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorSnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject snackbar data correctly', () => {
    expect(component.data).toEqual(mockData);
    expect(component.data?.mainMsg).toBe('Error Main Message');
    expect(component.data?.subMsg).toBe('Error Sub Message');
  });

  it('should display main message', () => {
    const mainMsgElement: DebugElement = fixture.debugElement.query(
      By.css('span.text-xl')
    );
    expect(mainMsgElement.nativeElement.textContent).toContain(
      'Error Main Message'
    );
  });

  it('should display sub message', () => {
    const subMsgElement: DebugElement = fixture.debugElement.query(
      By.css('.flex.flex-col.gap-2 span.text-white:last-child')
    );
    expect(subMsgElement.nativeElement.textContent).toContain(
      'Error Sub Message'
    );
  });

  it('should display report icon', () => {
    const iconElement: DebugElement = fixture.debugElement.query(
      By.css('mat-icon.icon')
    );
    expect(iconElement).toBeTruthy();
    expect(iconElement.nativeElement.textContent.trim()).toBe('report');
  });

  it('should apply correct styling classes to main message', () => {
    const mainMsgElement: DebugElement = fixture.debugElement.query(
      By.css('span.text-xl')
    );
    expect(
      mainMsgElement.nativeElement.classList.contains('text-white')
    ).toBe(true);
    expect(
      mainMsgElement.nativeElement.classList.contains('font-bold')
    ).toBe(true);
  });

  it('should apply white text color to sub message', () => {
    const subMsgElement: DebugElement = fixture.debugElement.query(
      By.css('.flex.flex-col.gap-2 span.text-white:last-child')
    );
    expect(subMsgElement.nativeElement.classList.contains('text-white')).toBe(
      true
    );
  });

  describe('close', () => {
    it('should dismiss snackbar when close is called', () => {
      component.close();
      expect(mockSnackBarRef.dismiss).toHaveBeenCalled();
    });

    it('should dismiss snackbar when container is clicked', () => {
      const container = fixture.debugElement.query(By.css('.container'));
      container.nativeElement.click();
      expect(mockSnackBarRef.dismiss).toHaveBeenCalled();
    });

    it('should not throw error if snackRef is undefined', () => {
      component['snackRef'] = undefined;
      expect(() => component.close()).not.toThrow();
    });
  });

  describe('Template structure', () => {
    it('should have container with correct classes', () => {
      const container = fixture.debugElement.query(By.css('.container'));
      expect(container).toBeTruthy();
      expect(container.nativeElement.classList.contains('p-3')).toBe(true);
      expect(container.nativeElement.classList.contains('rounded')).toBe(true);
      expect(container.nativeElement.classList.contains('clickable')).toBe(
        true
      );
    });

    it('should have flex layout with gap', () => {
      const flexContainer = fixture.debugElement.query(By.css('.flex.gap-2'));
      expect(flexContainer).toBeTruthy();
    });

    it('should have icon container with correct layout', () => {
      const iconContainer = fixture.debugElement.query(
        By.css('.flex.flex-col.justify-center.items-center')
      );
      expect(iconContainer).toBeTruthy();
      const icon = iconContainer.query(By.css('mat-icon'));
      expect(icon).toBeTruthy();
    });

    it('should have content container with flex column layout', () => {
      const contentContainer = fixture.debugElement.query(
        By.css('.flex.flex-col.gap-2')
      );
      expect(contentContainer).toBeTruthy();
      const spans = contentContainer.queryAll(By.css('span'));
      expect(spans.length).toBe(2);
    });
  });

  describe('Optional data handling', () => {
    it('should handle undefined data gracefully', () => {
      const newFixture = TestBed.createComponent(ErrorSnackbarComponent);
      newFixture.componentInstance.data = undefined;
      newFixture.detectChanges();

      expect(() => newFixture.detectChanges()).not.toThrow();
    });

    it('should display nothing when mainMsg is undefined', () => {
      component.data = { mainMsg: '', subMsg: '' };
      fixture.detectChanges();

      const mainMsgElement = fixture.debugElement.query(
        By.css('span.text-xl')
      );
      expect(mainMsgElement.nativeElement.textContent.trim()).toBe('');
    });
  });

  describe('Data binding', () => {
    it('should update display when data changes', () => {
      component.data = {
        mainMsg: 'New Error Message',
        subMsg: 'New Error Details',
      };
      fixture.detectChanges();

      const mainMsgElement = fixture.debugElement.query(
        By.css('span.text-xl')
      );
      const subMsgElement = fixture.debugElement.query(
        By.css('.flex.flex-col.gap-2 span.text-white:last-child')
      );

      expect(mainMsgElement.nativeElement.textContent).toContain(
        'New Error Message'
      );
      expect(subMsgElement.nativeElement.textContent).toContain(
        'New Error Details'
      );
    });
  });

  describe('ViewEncapsulation', () => {
    it('should use ViewEncapsulation.None', () => {
      const metadata = (ErrorSnackbarComponent as any)['ɵcmp'];
      expect(metadata.encapsulation).toBe(2); // ViewEncapsulation.None = 2
    });
  });
});
