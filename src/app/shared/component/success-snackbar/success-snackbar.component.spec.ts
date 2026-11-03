import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

import { SuccessSnackbarComponent } from './success-snackbar.component';

describe('SuccessSnackbarComponent', () => {
  let component: SuccessSnackbarComponent;
  let fixture: ComponentFixture<SuccessSnackbarComponent>;
  let compiled: HTMLElement;
  let mockSnackBarRef: jasmine.SpyObj<MatSnackBarRef<SuccessSnackbarComponent>>;
  
  const mockData = {
    mainMsg: 'Success!',
    subMsg: 'Operation completed successfully'
  };

  beforeEach(async () => {
    mockSnackBarRef = jasmine.createSpyObj('MatSnackBarRef', ['dismissWithAction', 'dismiss']);

    await TestBed.configureTestingModule({
      imports: [SuccessSnackbarComponent, MatIconModule],
      providers: [
        { provide: MAT_SNACK_BAR_DATA, useValue: mockData },
        { provide: MatSnackBarRef, useValue: mockSnackBarRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SuccessSnackbarComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should be a standalone component', () => {
      const metadata = (SuccessSnackbarComponent as any).ɵcmp;
      expect(metadata.standalone).toBe(true);
    });

    it('should inject MAT_SNACK_BAR_DATA correctly', () => {
      expect(component.data).toEqual(mockData);
    });

    it('should inject MatSnackBarRef correctly', () => {
      expect(component.snackBarRef).toBe(mockSnackBarRef);
    });
  });

  describe('Data Binding', () => {
    it('should display the main message', () => {
      const mainMsgElement = compiled.querySelector('.main-message');
      expect(mainMsgElement).toBeTruthy();
      expect(mainMsgElement?.textContent?.trim()).toBe(mockData.mainMsg);
    });

    it('should display the sub message', () => {
      const subMsgElement = compiled.querySelector('.sub-message');
      expect(subMsgElement).toBeTruthy();
      expect(subMsgElement?.textContent?.trim()).toBe(mockData.subMsg);
    });

    it('should display the success icon', () => {
      const iconElement = compiled.querySelector('mat-icon');
      expect(iconElement).toBeTruthy();
      expect(iconElement?.textContent?.trim()).toBe('check_circle');
    });
  });

  describe('Template Structure', () => {
    it('should have a clickable container', () => {
      const container = compiled.querySelector('.success-snackbar-container');
      expect(container).toBeTruthy();
    });

    it('should have proper styling classes on container', () => {
      const container = compiled.querySelector('.success-snackbar-container');
      expect(container).toBeTruthy();
      expect(container?.classList.contains('success-snackbar-container')).toBe(true);
    });

    it('should have proper flex layout', () => {
      const flexContainer = compiled.querySelector('.flex.items-center.gap-3');
      expect(flexContainer).toBeTruthy();
    });

    it('should have icon with correct class', () => {
      const icon = compiled.querySelector('mat-icon.success-icon');
      expect(icon).toBeTruthy();
    });

    it('should have two text elements with proper styling', () => {
      const mainMsg = compiled.querySelector('.main-message');
      const subMsg = compiled.querySelector('.sub-message');
      expect(mainMsg).toBeTruthy();
      expect(subMsg).toBeTruthy();
    });
  });

  describe('Dismissal Functionality', () => {
    it('should call dismissWithAction when container is clicked', () => {
      const container = compiled.querySelector('.success-snackbar-container') as HTMLElement;
      
      container.click();
      
      expect(mockSnackBarRef.dismissWithAction).toHaveBeenCalled();
    });

    it('should dismiss snackbar on click', () => {
      const container = compiled.querySelector('.success-snackbar-container') as HTMLElement;
      
      container.click();
      
      expect(mockSnackBarRef.dismissWithAction).toHaveBeenCalled();
    });

    it('should call dismissWithAction exactly once per click', () => {
      const container = compiled.querySelector('.success-snackbar-container') as HTMLElement;
      
      container.click();
      
      expect(mockSnackBarRef.dismissWithAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Different Data Scenarios', () => {
    it('should handle empty messages', () => {
      const emptyData = { mainMsg: '', subMsg: '' };
      component.data = emptyData;
      fixture.detectChanges();
      
      const mainMsgElement = compiled.querySelector('.main-message');
      const subMsgElement = compiled.querySelector('.sub-message');
      
      expect(mainMsgElement?.textContent?.trim()).toBe('');
      expect(subMsgElement).toBeTruthy();
    });

    it('should handle long messages', () => {
      const longData = {
        mainMsg: 'This is a very long success message that should still be displayed properly',
        subMsg: 'This is a very long sub message with additional details about the successful operation'
      };
      component.data = longData;
      fixture.detectChanges();
      
      const mainMsgElement = compiled.querySelector('.main-message');
      expect(mainMsgElement?.textContent).toContain(longData.mainMsg);
    });

    it('should handle special characters in messages', () => {
      const specialData = {
        mainMsg: 'Success & <Complete> "Done"',
        subMsg: 'Operation & <Task> "Finished"'
      };
      component.data = specialData;
      fixture.detectChanges();
      
      const mainMsgElement = compiled.querySelector('.main-message');
      expect(mainMsgElement?.textContent).toContain(specialData.mainMsg);
    });

    it('should update when data changes', () => {
      const newData = {
        mainMsg: 'Updated Success',
        subMsg: 'New message'
      };
      component.data = newData;
      fixture.detectChanges();
      
      const mainMsgElement = compiled.querySelector('.main-message');
      expect(mainMsgElement?.textContent?.trim()).toBe(newData.mainMsg);
    });
  });

  describe('Visual Elements', () => {
    it('should have icon centered properly', () => {
      const iconContainer = compiled.querySelector('.icon-wrapper');
      expect(iconContainer).toBeTruthy();
      expect(iconContainer?.querySelector('mat-icon')).toBeTruthy();
    });

    it('should have text in a separate column', () => {
      const textContainer = compiled.querySelector('.flex.flex-col.gap-1');
      expect(textContainer).toBeTruthy();
    });

    it('should have main message element', () => {
      const mainMsg = compiled.querySelector('.main-message');
      expect(mainMsg).toBeTruthy();
    });

    it('should have sub message element', () => {
      const subMsg = compiled.querySelector('.sub-message');
      expect(subMsg).toBeTruthy();
    });
  });

  describe('Component Lifecycle', () => {
    it('should initialize without errors', () => {
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should destroy without errors', () => {
      expect(() => {
        fixture.destroy();
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic success icon', () => {
      const icon = compiled.querySelector('mat-icon');
      expect(icon?.textContent).toBe('check_circle');
    });

    it('should have clickable element that is interactive', () => {
      const container = compiled.querySelector('.success-snackbar-container');
      expect(container).toBeTruthy();
    });

    it('should have clear text hierarchy with main and sub messages', () => {
      const mainMsg = compiled.querySelector('.main-message');
      const subMsg = compiled.querySelector('.sub-message');
      
      expect(mainMsg).toBeTruthy();
      expect(subMsg).toBeTruthy();
    });
  });

  describe('View Encapsulation', () => {
    it('should have ViewEncapsulation.None', () => {
      const metadata = (SuccessSnackbarComponent as any).ɵcmp;
      expect(metadata.encapsulation).toBe(2); // ViewEncapsulation.None = 2
    });
  });

  describe('MatSnackBarRef Integration', () => {
    it('should have snackBarRef injected', () => {
      expect(component.snackBarRef).toBeDefined();
    });

    it('should be able to access dismissWithAction method', () => {
      expect(component.snackBarRef.dismissWithAction).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null-like values gracefully', () => {
      const nullishData = { mainMsg: null as any, subMsg: undefined as any };
      component.data = nullishData;
      fixture.detectChanges();
      
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should render even with minimal data', () => {
      const minimalData = { mainMsg: 'OK', subMsg: '.' };
      component.data = minimalData;
      fixture.detectChanges();
      
      const container = compiled.querySelector('.success-snackbar-container');
      expect(container).toBeTruthy();
    });
  });
});
