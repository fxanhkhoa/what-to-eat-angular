import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FeedbackFabComponent } from './feedback-fab.component';
import { FeedbackFormComponent } from '../feedback-form/feedback-form.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { of, Subject } from 'rxjs';

describe('FeedbackFabComponent', () => {
  let component: FeedbackFabComponent;
  let fixture: ComponentFixture<FeedbackFabComponent>;
  let compiled: HTMLElement;
  let matDialog: jasmine.SpyObj<MatDialog>;
  let buttonElement: DebugElement;

  beforeEach(async () => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpy.afterClosed.and.returnValue(of(undefined));
    
    const afterOpenedSubject = new Subject();
    const afterAllClosedSubject = new Subject();
    
    const matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    matDialogSpy.open.and.returnValue(dialogRefSpy);
    matDialogSpy.openDialogs = [];
    matDialogSpy._openDialogsAtThisLevel = [];
    matDialogSpy._afterAllClosed = afterAllClosedSubject;
    matDialogSpy._afterOpened = afterOpenedSubject;
    matDialogSpy.afterOpened = afterOpenedSubject.asObservable();
    matDialogSpy.afterAllClosed = afterAllClosedSubject.asObservable();

    await TestBed.configureTestingModule({
      imports: [
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
      ],
      providers: [
        provideAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatDialog, useValue: matDialogSpy }
      ]
    })
    .overrideComponent(FeedbackFabComponent, {
      set: {
        imports: [
          MatButtonModule,
          MatIconModule,
          MatTooltipModule,
        ],
        providers: [
          { provide: MatDialog, useValue: matDialogSpy }
        ]
      }
    })
    .compileComponents();

    matDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    fixture = TestBed.createComponent(FeedbackFabComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Rendering', () => {
    beforeEach(() => {
      buttonElement = fixture.debugElement.query(By.css('.feedback-fab'));
    });

    it('should render the floating action button', () => {
      expect(buttonElement).toBeTruthy();
    });

    it('should have mat-fab attribute', () => {
      const button = buttonElement.nativeElement;
      expect(button.hasAttribute('mat-fab')).toBe(true);
    });

    it('should have correct CSS class', () => {
      const button = buttonElement.nativeElement;
      expect(button.classList.contains('feedback-fab')).toBe(true);
    });

    it('should render feedback icon', () => {
      const icon = compiled.querySelector('mat-icon');
      expect(icon).toBeTruthy();
      expect(icon?.textContent?.trim()).toBe('feedback');
    });

    it('should have aria-label for accessibility', () => {
      const button = buttonElement.nativeElement;
      expect(button.getAttribute('aria-label')).toBe('Open feedback form');
    });

    it('should have tooltip directive', () => {
      const button = buttonElement.nativeElement;
      expect(button.hasAttribute('mattooltip')).toBe(true);
    });

    it('should have tooltip with correct text', () => {
      const button = buttonElement.nativeElement;
      expect(button.getAttribute('mattooltip')).toBe('Share your feedback');
    });

    it('should have tooltip positioned to the left', () => {
      const button = buttonElement.nativeElement;
      expect(button.getAttribute('mattooltipposition')).toBe('left');
    });
  });

  describe('Button Click Behavior', () => {
    beforeEach(() => {
      buttonElement = fixture.debugElement.query(By.css('.feedback-fab'));
    });

    it('should call openFeedbackForm when button is clicked', () => {
      spyOn(component, 'openFeedbackForm');
      
      buttonElement.triggerEventHandler('click', null);
      
      expect(component.openFeedbackForm).toHaveBeenCalled();
    });

    it('should open dialog when button is clicked', () => {
      buttonElement.triggerEventHandler('click', null);
      
      expect(matDialog.open).toHaveBeenCalled();
    });

    it('should open FeedbackFormComponent in dialog', () => {
      buttonElement.triggerEventHandler('click', null);
      
      expect(matDialog.open).toHaveBeenCalledWith(
        FeedbackFormComponent,
        jasmine.any(Object)
      );
    });

    it('should open dialog with correct configuration', () => {
      buttonElement.triggerEventHandler('click', null);
      
      expect(matDialog.open).toHaveBeenCalledWith(
        FeedbackFormComponent,
        {
          width: '600px',
          maxWidth: '90vw',
          panelClass: 'feedback-dialog-container',
          disableClose: false,
          autoFocus: true,
        }
      );
    });
  });

  describe('Dialog Configuration', () => {
    it('should configure dialog with 600px width', () => {
      component.openFeedbackForm();
      
      const config = (matDialog.open as jasmine.Spy).calls.mostRecent().args[1];
      expect(config.width).toBe('600px');
    });

    it('should configure dialog with 90vw maxWidth', () => {
      component.openFeedbackForm();
      
      const config = (matDialog.open as jasmine.Spy).calls.mostRecent().args[1];
      expect(config.maxWidth).toBe('90vw');
    });

    it('should configure dialog with custom panel class', () => {
      component.openFeedbackForm();
      
      const config = (matDialog.open as jasmine.Spy).calls.mostRecent().args[1];
      expect(config.panelClass).toBe('feedback-dialog-container');
    });

    it('should allow dialog to be closed by clicking outside', () => {
      component.openFeedbackForm();
      
      const config = (matDialog.open as jasmine.Spy).calls.mostRecent().args[1];
      expect(config.disableClose).toBe(false);
    });

    it('should enable autoFocus on dialog', () => {
      component.openFeedbackForm();
      
      const config = (matDialog.open as jasmine.Spy).calls.mostRecent().args[1];
      expect(config.autoFocus).toBe(true);
    });
  });

  describe('Multiple Interactions', () => {
    it('should be able to open dialog multiple times', () => {
      component.openFeedbackForm();
      component.openFeedbackForm();
      component.openFeedbackForm();
      
      expect(matDialog.open).toHaveBeenCalledTimes(3);
    });

    it('should open same component each time', () => {
      component.openFeedbackForm();
      component.openFeedbackForm();
      
      const calls = (matDialog.open as jasmine.Spy).calls;
      expect(calls.argsFor(0)[0]).toBe(FeedbackFormComponent);
      expect(calls.argsFor(1)[0]).toBe(FeedbackFormComponent);
    });
  });

  describe('Component Styling', () => {
    it('should render with feedback-fab CSS class', () => {
      const button = compiled.querySelector('.feedback-fab') as HTMLElement;
      expect(button).toBeTruthy();
      expect(button.classList.contains('feedback-fab')).toBe(true);
    });
  });

  describe('Component Cleanup', () => {
    it('should properly destroy component', () => {
      expect(() => {
        fixture.destroy();
      }).not.toThrow();
    });
  });
});
