import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

import { NotificationSnackbarComponent } from './notification-snackbar.component';

describe('NotificationSnackbarComponent', () => {
  let component: NotificationSnackbarComponent;
  let fixture: ComponentFixture<NotificationSnackbarComponent>;
  let compiled: HTMLElement;
  let mockRouter: jasmine.SpyObj<Router>;
  
  const mockData = {
    mainMsg: 'Test Main Message',
    subMsg: 'Test Sub Message',
    redirectUrl: '/test-url'
  };

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [NotificationSnackbarComponent, MatIconModule],
      providers: [
        { provide: MAT_SNACK_BAR_DATA, useValue: mockData },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationSnackbarComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should be a standalone component', () => {
      const metadata = (NotificationSnackbarComponent as any).ɵcmp;
      expect(metadata.standalone).toBe(true);
    });

    it('should inject MAT_SNACK_BAR_DATA correctly', () => {
      expect(component.data).toEqual(mockData);
    });
  });

  describe('Data Binding', () => {
    it('should display the main message', () => {
      const h2Element = compiled.querySelector('h2');
      expect(h2Element).toBeTruthy();
      expect(h2Element?.textContent?.trim()).toBe(mockData.mainMsg);
    });

    it('should display the sub message', () => {
      const spanElement = compiled.querySelector('span.text-main-color');
      expect(spanElement).toBeTruthy();
      expect(spanElement?.textContent?.trim()).toBe(mockData.subMsg);
    });

    it('should display the notification icon', () => {
      const iconElement = compiled.querySelector('mat-icon');
      expect(iconElement).toBeTruthy();
      expect(iconElement?.textContent?.trim()).toBe('tips_and_updates');
    });
  });

  describe('Template Structure', () => {
    it('should have a clickable container', () => {
      const container = compiled.querySelector('.container.clickable');
      expect(container).toBeTruthy();
    });

    it('should have proper flex layout classes', () => {
      const flexContainers = compiled.querySelectorAll('.flex.justify-center');
      expect(flexContainers.length).toBeGreaterThanOrEqual(3);
    });

    it('should have icon with correct class', () => {
      const icon = compiled.querySelector('mat-icon.icon');
      expect(icon).toBeTruthy();
    });
  });

  describe('Navigation Functionality', () => {
    it('should call notificationClicked when container is clicked', () => {
      spyOn(component, 'notificationClicked');
      const container = compiled.querySelector('.container.clickable') as HTMLElement;
      
      container.click();
      
      expect(component.notificationClicked).toHaveBeenCalled();
    });

    it('should navigate to redirectUrl when notificationClicked is called', () => {
      component.notificationClicked();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith([mockData.redirectUrl]);
    });

    it('should navigate with correct URL on click', () => {
      const container = compiled.querySelector('.container.clickable') as HTMLElement;
      
      container.click();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/test-url']);
    });
  });

  describe('Different Data Scenarios', () => {
    it('should handle empty messages', () => {
      const emptyData = { mainMsg: '', subMsg: '', redirectUrl: '' };
      component.data = emptyData;
      fixture.detectChanges();
      
      const h2Element = compiled.querySelector('h2');
      const spanElement = compiled.querySelector('span.text-main-color');
      
      expect(h2Element?.textContent?.trim()).toBe('');
      expect(spanElement?.textContent?.trim()).toBe('');
    });

    it('should handle long messages', () => {
      const longData = {
        mainMsg: 'This is a very long main message that should still be displayed properly',
        subMsg: 'This is a very long sub message that should also be displayed properly',
        redirectUrl: '/long-url'
      };
      component.data = longData;
      fixture.detectChanges();
      
      const h2Element = compiled.querySelector('h2');
      const spanElement = compiled.querySelector('span.text-main-color');
      
      expect(h2Element?.textContent).toContain(longData.mainMsg);
      expect(spanElement?.textContent).toContain(longData.subMsg);
    });

    it('should handle special characters in messages', () => {
      const specialData = {
        mainMsg: 'Test & <Special> "Characters"',
        subMsg: 'Sub & <Message> "Test"',
        redirectUrl: '/test'
      };
      component.data = specialData;
      fixture.detectChanges();
      
      const h2Element = compiled.querySelector('h2');
      expect(h2Element?.textContent).toContain(specialData.mainMsg);
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
    it('should have clickable element with proper structure', () => {
      const container = compiled.querySelector('.container.clickable');
      expect(container).toBeTruthy();
    });

    it('should display icon with semantic meaning', () => {
      const icon = compiled.querySelector('mat-icon');
      expect(icon?.textContent).toBe('tips_and_updates');
    });

    it('should have centered text for better readability', () => {
      const h2Element = compiled.querySelector('h2.text-center');
      expect(h2Element).toBeTruthy();
    });
  });
});
