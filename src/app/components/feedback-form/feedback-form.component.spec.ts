import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { FeedbackFormComponent } from './feedback-form.component';
import { FeedbackService } from '@/app/service/feedback.service';
import { ToastService } from '@/app/shared/service/toast.service';

describe('FeedbackFormComponent', () => {
  let component: FeedbackFormComponent;
  let fixture: ComponentFixture<FeedbackFormComponent>;
  let feedbackService: jasmine.SpyObj<FeedbackService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<FeedbackFormComponent>>;

  beforeEach(async () => {
    const feedbackServiceSpy = jasmine.createSpyObj('FeedbackService', ['create']);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['showSuccess', 'showError']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        FeedbackFormComponent,
        ReactiveFormsModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: FeedbackService, useValue: feedbackServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
      ],
    }).compileComponents();

    feedbackService = TestBed.inject(FeedbackService) as jasmine.SpyObj<FeedbackService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<FeedbackFormComponent>>;

    fixture = TestBed.createComponent(FeedbackFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with empty values', () => {
      expect(component.feedbackForm.value).toEqual({
        userName: '',
        email: '',
        rating: 0,
        comment: '',
        page: jasmine.any(String),
      });
    });

    it('should initialize with current page path', () => {
      const currentPath = component.feedbackForm.get('page')?.value;
      expect(currentPath).toBe(window.location.pathname);
    });

    it('should have form invalid initially', () => {
      expect(component.feedbackForm.valid).toBeFalse();
    });
  });

  describe('Form Validation', () => {
    it('should not require email field', () => {
      const emailControl = component.feedbackForm.get('email');
      expect(emailControl?.hasError('required')).toBeFalse();
    });

    it('should validate email format', () => {
      const emailControl = component.feedbackForm.get('email');
      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBeTrue();
      
      emailControl?.setValue('valid@email.com');
      expect(emailControl?.hasError('email')).toBeFalse();
    });

    it('should validate rating as required and minimum value', () => {
      const ratingControl = component.feedbackForm.get('rating');
      expect(ratingControl?.hasError('min')).toBeTrue();
      
      ratingControl?.setValue(1);
      expect(ratingControl?.hasError('min')).toBeFalse();
      expect(ratingControl?.valid).toBeTrue();
    });

    it('should not require comment field', () => {
      const commentControl = component.feedbackForm.get('comment');
      expect(commentControl?.hasError('required')).toBeFalse();
    });

    it('should validate comment minimum length', () => {
      const commentControl = component.feedbackForm.get('comment');
      commentControl?.setValue('short');
      expect(commentControl?.hasError('minlength')).toBeTrue();
      
      commentControl?.setValue('This is a valid comment with more than 10 characters');
      expect(commentControl?.hasError('minlength')).toBeFalse();
    });

    it('should validate comment maximum length', () => {
      const commentControl = component.feedbackForm.get('comment');
      const longComment = 'a'.repeat(1001);
      commentControl?.setValue(longComment);
      expect(commentControl?.hasError('maxlength')).toBeTrue();
    });

    it('should validate userName as optional', () => {
      const userNameControl = component.feedbackForm.get('userName');
      expect(userNameControl?.hasError('required')).toBeFalse();
    });
  });

  describe('Rating Functionality', () => {
    it('should set rating when star is clicked', () => {
      component.setRating(4);
      expect(component.selectedRating()).toBe(4);
      expect(component.feedbackForm.get('rating')?.value).toBe(4);
    });

    it('should mark rating as touched when set', () => {
      component.setRating(3);
      expect(component.feedbackForm.get('rating')?.touched).toBeTrue();
    });

    it('should update hover rating', () => {
      component.hoverRating.set(5);
      expect(component.hoverRating()).toBe(5);
    });

    it('should allow rating from 1 to 5', () => {
      for (let i = 1; i <= 5; i++) {
        component.setRating(i);
        expect(component.selectedRating()).toBe(i);
      }
    });
  });

  describe('Submit Feedback', () => {
    beforeEach(() => {
      // Set up valid form data
      component.feedbackForm.patchValue({
        userName: 'Test User',
        email: 'test@example.com',
        rating: 5,
        comment: 'This is a great website!',
      });
    });

    it('should not submit if form is invalid', () => {
      component.feedbackForm.patchValue({ rating: 0 });
      component.submitFeedback();
      
      expect(feedbackService.create).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched when submitting invalid form', () => {
      component.feedbackForm.patchValue({ rating: 0 });
      component.submitFeedback();
      
      expect(component.feedbackForm.get('email')?.touched).toBeTrue();
      expect(component.feedbackForm.get('rating')?.touched).toBeTrue();
      expect(component.feedbackForm.get('comment')?.touched).toBeTrue();
    });

    it('should submit feedback with valid data', fakeAsync(() => {
      feedbackService.create.and.returnValue(of({ _id: '123', message: 'Success' } as any));
      
      component.submitFeedback();
      tick();
      
      expect(feedbackService.create).toHaveBeenCalledWith({
        userName: 'Test User',
        email: 'test@example.com',
        rating: 5,
        comment: 'This is a great website!',
        page: jasmine.any(String),
        userAgent: navigator.userAgent,
      });
    }));

    it('should set isSubmitting to true during submission', () => {
      let subscribed = false;
      const pendingObservable = new (class {
        subscribe(callbacks: any) {
          subscribed = true;
          // Don't call callbacks, leave it pending
        }
      })() as any;
      
      feedbackService.create.and.returnValue(pendingObservable);
      
      component.submitFeedback();
      
      expect(subscribed).toBeTrue();
      expect(component.isSubmitting()).toBeTrue();
    });

    it('should close dialog on successful submission', (done) => {
      feedbackService.create.and.returnValue(of({ _id: '123', message: 'Success' } as any));
      
      component.submitFeedback();
      
      setTimeout(() => {
        expect(dialogRef.close).toHaveBeenCalledWith(true);
        done();
      }, 10);
    });

    it('should set isSubmitting to false after successful submission', (done) => {
      feedbackService.create.and.returnValue(of({ _id: '123', message: 'Success' } as any));
      
      component.submitFeedback();
      
      setTimeout(() => {
        expect(component.isSubmitting()).toBeFalse();
        done();
      }, 10);
    });
  });

  describe('getCurrentPage', () => {
    it('should return current pathname', () => {
      const pathname = component.getCurrentPage();
      expect(pathname).toBe(window.location.pathname);
    });
  });

  describe('Template Rendering', () => {
    it('should render dialog header', () => {
      const header = fixture.nativeElement.querySelector('.dialog-header h2');
      expect(header?.textContent).toContain('Share Your Experience');
    });

    it('should render rating stars', () => {
      const stars = fixture.nativeElement.querySelectorAll('.star-button');
      expect(stars.length).toBe(5);
    });

    it('should render form fields', () => {
      const nameField = fixture.nativeElement.querySelector('[formControlName="userName"]');
      const emailField = fixture.nativeElement.querySelector('[formControlName="email"]');
      const commentField = fixture.nativeElement.querySelector('[formControlName="comment"]');
      
      expect(nameField).toBeTruthy();
      expect(emailField).toBeTruthy();
      expect(commentField).toBeTruthy();
    });

    it('should render submit button', () => {
      const submitButton = fixture.nativeElement.querySelector('.submit-button');
      expect(submitButton).toBeTruthy();
    });

    it('should disable submit button when form is invalid', () => {
      const submitButton = fixture.nativeElement.querySelector('.submit-button');
      expect(submitButton.disabled).toBeTrue();
    });

    it('should enable submit button when form is valid', () => {
      component.feedbackForm.patchValue({
        email: 'test@example.com',
        rating: 5,
        comment: 'This is a great website!',
      });
      fixture.detectChanges();
      
      const submitButton = fixture.nativeElement.querySelector('.submit-button');
      expect(submitButton.disabled).toBeFalse();
    });
  });

  describe('Signal State Management', () => {
    it('should initialize selectedRating as 0', () => {
      expect(component.selectedRating()).toBe(0);
    });

    it('should initialize hoverRating as 0', () => {
      expect(component.hoverRating()).toBe(0);
    });

    it('should initialize isSubmitting as false', () => {
      expect(component.isSubmitting()).toBeFalse();
    });

    it('should update selectedRating signal', () => {
      component.selectedRating.set(3);
      expect(component.selectedRating()).toBe(3);
    });

    it('should update hoverRating signal', () => {
      component.hoverRating.set(4);
      expect(component.hoverRating()).toBe(4);
    });

    it('should update isSubmitting signal', () => {
      component.isSubmitting.set(true);
      expect(component.isSubmitting()).toBeTrue();
    });
  });
});
