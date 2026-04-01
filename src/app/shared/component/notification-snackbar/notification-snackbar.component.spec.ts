import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

import { NotificationSnackbarComponent, NotificationSnackbarData } from './notification-snackbar.component';

describe('NotificationSnackbarComponent', () => {
  let component: NotificationSnackbarComponent;
  let fixture: ComponentFixture<NotificationSnackbarComponent>;
  let compiled: HTMLElement;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSnackBarRef: jasmine.SpyObj<MatSnackBarRef<NotificationSnackbarComponent>>;

  const mockData: NotificationSnackbarData = {
    mainMsg: 'Test Main Message',
    subMsg: 'Test Sub Message',
    redirectUrl: '/test-url',
    type: 'activity',
    duration: 5000,
  };

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockSnackBarRef = jasmine.createSpyObj('MatSnackBarRef', ['dismiss']);

    await TestBed.configureTestingModule({
      imports: [NotificationSnackbarComponent, MatIconModule],
      providers: [
        { provide: MAT_SNACK_BAR_DATA, useValue: mockData },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBarRef, useValue: mockSnackBarRef },
      ],
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
      const titleEl = compiled.querySelector('.notif-title');
      expect(titleEl).toBeTruthy();
      expect(titleEl?.textContent?.trim()).toBe(mockData.mainMsg);
    });

    it('should display the sub message', () => {
      const bodyEl = compiled.querySelector('.notif-body');
      expect(bodyEl).toBeTruthy();
      expect(bodyEl?.textContent?.trim()).toBe(mockData.subMsg);
    });

    it('should display the type icon for activity', () => {
      const icons = compiled.querySelectorAll('mat-icon');
      const iconTexts = Array.from(icons).map((i) => i.textContent?.trim());
      expect(iconTexts).toContain('notifications_active');
    });
  });

  describe('Type Icon Getters', () => {
    it('should return chat icon for chat type', () => {
      component.data = { ...mockData, type: 'chat' };
      expect(component.typeIcon).toBe('chat');
    });

    it('should return notifications_active icon for activity type', () => {
      component.data = { ...mockData, type: 'activity' };
      expect(component.typeIcon).toBe('notifications_active');
    });

    it('should return campaign icon for marketing type', () => {
      component.data = { ...mockData, type: 'marketing' };
      expect(component.typeIcon).toBe('campaign');
    });

    it('should return default notifications icon for unknown type', () => {
      component.data = { ...mockData, type: 'unknown' };
      expect(component.typeIcon).toBe('notifications');
    });

    it('should return default notifications icon when type is undefined', () => {
      component.data = { ...mockData, type: undefined };
      expect(component.typeIcon).toBe('notifications');
    });
  });

  describe('CSS Class Getters', () => {
    it('should return icon-chat class for chat type', () => {
      component.data = { ...mockData, type: 'chat' };
      expect(component.iconBgClass).toBe('icon-chat');
    });

    it('should return icon-activity class for activity type', () => {
      component.data = { ...mockData, type: 'activity' };
      expect(component.iconBgClass).toBe('icon-activity');
    });

    it('should return icon-marketing class for marketing type', () => {
      component.data = { ...mockData, type: 'marketing' };
      expect(component.iconBgClass).toBe('icon-marketing');
    });

    it('should return icon-default class for unknown type', () => {
      component.data = { ...mockData, type: undefined };
      expect(component.iconBgClass).toBe('icon-default');
    });

    it('should return correct bar class for chat type', () => {
      component.data = { ...mockData, type: 'chat' };
      expect(component.barClass).toBe('bar-chat');
    });

    it('should return bar-default when type is unknown', () => {
      component.data = { ...mockData, type: undefined };
      expect(component.barClass).toBe('bar-default');
    });
  });

  describe('Animation Duration', () => {
    it('should return duration as css string', () => {
      component.data = { ...mockData, duration: 3000 };
      expect(component.animDuration).toBe('3000ms');
    });

    it('should default to 5000ms when duration is not set', () => {
      component.data = { ...mockData, duration: undefined };
      expect(component.animDuration).toBe('5000ms');
    });
  });

  describe('Template Structure', () => {
    it('should have a .notif-toast container', () => {
      expect(compiled.querySelector('.notif-toast')).toBeTruthy();
    });

    it('should have a type icon circle', () => {
      expect(compiled.querySelector('.notif-icon-circle')).toBeTruthy();
    });

    it('should have a dismiss button with aria-label', () => {
      const btn = compiled.querySelector('button.notif-dismiss');
      expect(btn).toBeTruthy();
      expect(btn?.getAttribute('aria-label')).toBe('Dismiss notification');
    });

    it('should have a progress bar track element', () => {
      expect(compiled.querySelector('.notif-progress')).toBeTruthy();
    });

    it('should have a progress bar fill element', () => {
      expect(compiled.querySelector('.notif-progress-fill')).toBeTruthy();
    });

    it('should apply animation-duration style to progress fill', () => {
      const fill = compiled.querySelector('.notif-progress-fill') as HTMLElement;
      expect(fill?.style.animationDuration).toBe('5000ms');
    });
  });

  describe('Navigation', () => {
    it('should call snackBarRef.dismiss and router.navigate when navigate() is called', () => {
      component.navigate();
      expect(mockSnackBarRef.dismiss).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith([mockData.redirectUrl]);
    });

    it('should not call router.navigate when redirectUrl is empty', () => {
      component.data = { ...mockData, redirectUrl: '' };
      component.navigate();
      expect(mockSnackBarRef.dismiss).toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should navigate when .notif-toast is clicked', () => {
      spyOn(component, 'navigate');
      (compiled.querySelector('.notif-toast') as HTMLElement).click();
      expect(component.navigate).toHaveBeenCalled();
    });
  });

  describe('Dismiss', () => {
    it('should call snackBarRef.dismiss and stopPropagation when dismiss() is called', () => {
      const mockEvent = jasmine.createSpyObj<Event>('Event', ['stopPropagation']);
      component.dismiss(mockEvent);
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(mockSnackBarRef.dismiss).toHaveBeenCalled();
    });

    it('should not call navigate when dismiss button is clicked', () => {
      spyOn(component, 'navigate');
      (compiled.querySelector('button.notif-dismiss') as HTMLElement).click();
      expect(component.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Different Data Scenarios', () => {
    it('should handle empty messages', () => {
      component.data = { mainMsg: '', subMsg: '', redirectUrl: '' };
      fixture.detectChanges();
      expect(compiled.querySelector('.notif-title')?.textContent?.trim()).toBe('');
      expect(compiled.querySelector('.notif-body')?.textContent?.trim()).toBe('');
    });

    it('should handle long messages', () => {
      const longData: NotificationSnackbarData = {
        mainMsg: 'This is a very long main message that should still be displayed properly',
        subMsg: 'This is a very long sub message that should also be displayed properly',
        redirectUrl: '/long-url',
      };
      component.data = longData;
      fixture.detectChanges();
      expect(compiled.querySelector('.notif-title')?.textContent).toContain(longData.mainMsg);
      expect(compiled.querySelector('.notif-body')?.textContent).toContain(longData.subMsg);
    });

    it('should handle special characters in messages', () => {
      const specialData: NotificationSnackbarData = {
        mainMsg: 'Test & <Special> "Characters"',
        subMsg: 'Sub & <Message> "Test"',
        redirectUrl: '/test',
      };
      component.data = specialData;
      fixture.detectChanges();
      expect(compiled.querySelector('.notif-title')?.textContent).toContain(specialData.mainMsg);
    });
  });

  describe('Component Lifecycle', () => {
    it('should initialize without errors', () => {
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should destroy without errors', () => {
      expect(() => fixture.destroy()).not.toThrow();
    });
  });
});

