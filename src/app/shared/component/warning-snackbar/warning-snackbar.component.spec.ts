import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

import { WarningSnackbarComponent } from './warning-snackbar.component';

describe('WarningSnackbarComponent', () => {
  let component: WarningSnackbarComponent;
  let fixture: ComponentFixture<WarningSnackbarComponent>;
  let compiled: HTMLElement;
  let mockSnackBarRef: jasmine.SpyObj<MatSnackBarRef<WarningSnackbarComponent>>;
  
  const mockData = {
    mainMsg: 'Warning!',
    subMsg: 'Please check your input'
  };

  beforeEach(async () => {
    mockSnackBarRef = jasmine.createSpyObj('MatSnackBarRef', ['dismissWithAction', 'dismiss']);

    await TestBed.configureTestingModule({
      imports: [WarningSnackbarComponent, MatIconModule],
      providers: [
        { provide: MAT_SNACK_BAR_DATA, useValue: mockData },
        { provide: MatSnackBarRef, useValue: mockSnackBarRef }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarningSnackbarComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should be a standalone component', () => {
      const metadata = (WarningSnackbarComponent as any).ɵcmp;
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
      const mainMsgElement = compiled.querySelector('.text-xl.text-white.font-bold');
      expect(mainMsgElement).toBeTruthy();
      expect(mainMsgElement?.textContent?.trim()).toBe(mockData.mainMsg);
    });

    it('should display the sub message', () => {
      const subMsgElements = compiled.querySelectorAll('.text-white');
      const subMsgElement = Array.from(subMsgElements).find(el => 
        el.textContent?.trim() === mockData.subMsg
      );
      expect(subMsgElement).toBeTruthy();
      expect(subMsgElement?.textContent?.trim()).toBe(mockData.subMsg);
    });

    it('should display the warning icon', () => {
      const iconElement = compiled.querySelector('mat-icon');
      expect(iconElement).toBeTruthy();
      expect(iconElement?.textContent?.trim()).toBe('check_circle');
    });
  });

  describe('Template Structure', () => {
    it('should have a clickable container', () => {
      const container = compiled.querySelector('.container.clickable');
      expect(container).toBeTruthy();
    });

    it('should have proper styling classes on container', () => {
      const container = compiled.querySelector('.container');
      expect(container?.classList.contains('p-3')).toBe(true);
      expect(container?.classList.contains('rounded')).toBe(true);
      expect(container?.classList.contains('clickable')).toBe(true);
    });

    it('should have proper flex layout', () => {
      const flexContainer = compiled.querySelector('.flex.gap-2');
      expect(flexContainer).toBeTruthy();
    });

    it('should have icon with correct class', () => {
      const icon = compiled.querySelector('mat-icon.icon');
      expect(icon).toBeTruthy();
    });

    it('should have two text elements with proper styling', () => {
      const textElements = compiled.querySelectorAll('.text-white');
      expect(textElements.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Dismissal Functionality', () => {
    it('should call dismissWithAction when container is clicked', () => {
      const container = compiled.querySelector('.container.clickable') as HTMLElement;
      
      container.click();
      
      expect(mockSnackBarRef.dismissWithAction).toHaveBeenCalled();
    });

    it('should dismiss snackbar on click', () => {
      const container = compiled.querySelector('.container.clickable') as HTMLElement;
      
      container.click();
      
      expect(mockSnackBarRef.dismissWithAction).toHaveBeenCalled();
    });

    it('should call dismissWithAction exactly once per click', () => {
      const container = compiled.querySelector('.container.clickable') as HTMLElement;
      
      container.click();
      
      expect(mockSnackBarRef.dismissWithAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Different Data Scenarios', () => {
    it('should handle empty messages', () => {
      const emptyData = { mainMsg: '', subMsg: '' };
      component.data = emptyData;
      fixture.detectChanges();
      
      const mainMsgElement = compiled.querySelector('.text-xl.text-white.font-bold');
      const subMsgElements = compiled.querySelectorAll('.text-white');
      
      expect(mainMsgElement?.textContent?.trim()).toBe('');
      expect(subMsgElements.length).toBeGreaterThan(0);
    });

    it('should handle long messages', () => {
      const longData = {
        mainMsg: 'This is a very long warning message that should still be displayed properly',
        subMsg: 'This is a very long sub message with additional warning details'
      };
      component.data = longData;
      fixture.detectChanges();
      
      const mainMsgElement = compiled.querySelector('.text-xl.text-white.font-bold');
      expect(mainMsgElement?.textContent).toContain(longData.mainMsg);
    });

    it('should handle special characters in messages', () => {
      const specialData = {
        mainMsg: 'Warning & <Alert> "Important"',
        subMsg: 'Check & <Review> "Data"'
      };
      component.data = specialData;
      fixture.detectChanges();
      
      const mainMsgElement = compiled.querySelector('.text-xl.text-white.font-bold');
      expect(mainMsgElement?.textContent).toContain(specialData.mainMsg);
    });

    it('should update when data changes', () => {
      const newData = {
        mainMsg: 'Updated Warning',
        subMsg: 'New warning message'
      };
      component.data = newData;
      fixture.detectChanges();
      
      const mainMsgElement = compiled.querySelector('.text-xl.text-white.font-bold');
      expect(mainMsgElement?.textContent?.trim()).toBe(newData.mainMsg);
    });
  });

  describe('Visual Elements', () => {
    it('should have icon centered properly', () => {
      const iconContainer = compiled.querySelector('.flex.flex-col.justify-center.items-center');
      expect(iconContainer).toBeTruthy();
      expect(iconContainer?.querySelector('mat-icon')).toBeTruthy();
    });

    it('should have text in a separate column', () => {
      const textContainer = compiled.querySelector('.flex.flex-col.gap-2');
      expect(textContainer).toBeTruthy();
    });

    it('should have main message with bold styling', () => {
      const mainMsg = compiled.querySelector('.font-bold');
      expect(mainMsg).toBeTruthy();
    });

    it('should have main message with larger text', () => {
      const mainMsg = compiled.querySelector('.text-xl');
      expect(mainMsg).toBeTruthy();
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
    it('should have semantic warning icon', () => {
      const icon = compiled.querySelector('mat-icon');
      expect(icon?.textContent).toBe('check_circle');
    });

    it('should have clickable element that is interactive', () => {
      const container = compiled.querySelector('.clickable');
      expect(container).toBeTruthy();
    });

    it('should have clear text hierarchy with main and sub messages', () => {
      const mainMsg = compiled.querySelector('.text-xl');
      const allTextElements = compiled.querySelectorAll('.text-white');
      
      expect(mainMsg).toBeTruthy();
      expect(allTextElements.length).toBeGreaterThanOrEqual(2);
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
      const minimalData = { mainMsg: '!', subMsg: '.' };
      component.data = minimalData;
      fixture.detectChanges();
      
      const container = compiled.querySelector('.container');
      expect(container).toBeTruthy();
    });
  });

  describe('Import Configuration', () => {
    it('should import MatIconModule', () => {
      const matIcon = compiled.querySelector('mat-icon');
      expect(matIcon).toBeTruthy();
    });
  });
});
