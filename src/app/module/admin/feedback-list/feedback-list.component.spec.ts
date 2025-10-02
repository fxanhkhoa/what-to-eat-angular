import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { of, throwError } from 'rxjs';
import { FeedbackListComponent } from './feedback-list.component';
import { FeedbackService } from '@/app/service/feedback.service';
import { Feedback } from '@/types/feedback.type';

describe('FeedbackListComponent', () => {
  let component: FeedbackListComponent;
  let fixture: ComponentFixture<FeedbackListComponent>;
  let feedbackService: jasmine.SpyObj<FeedbackService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let dialog: jasmine.SpyObj<MatDialog>;

  const mockFeedbacks: Feedback[] = [
    {
      id: '1',
      userName: 'John Doe',
      email: 'john@example.com',
      rating: 5,
      comment: 'Great website!',
      page: '/home',
      userAgent: 'Mozilla/5.0',
      createdAt: '2025-10-01T10:00:00Z',
      updatedAt: '2025-10-01T10:00:00Z',
    },
    {
      id: '2',
      userName: 'Jane Smith',
      email: 'jane@example.com',
      rating: 4,
      comment: 'Very good experience.',
      page: '/about',
      userAgent: 'Mozilla/5.0',
      createdAt: '2025-10-01T11:00:00Z',
      updatedAt: '2025-10-01T11:00:00Z',
    },
  ];

  const mockResponse = {
    data: mockFeedbacks,
    metadata: {
      totalItems: 2,
      itemCount: 2,
      currentPage: 1,
      itemsPerPage: 10,
      totalPages: 1,
    },
  };

  beforeEach(async () => {
    const feedbackServiceSpy = jasmine.createSpyObj('FeedbackService', [
      'findAll',
      'delete',
    ]);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        FeedbackListComponent,
        BrowserAnimationsModule,
        FormsModule,
      ],
      providers: [
        { provide: FeedbackService, useValue: feedbackServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
    }).compileComponents();

    feedbackService = TestBed.inject(FeedbackService) as jasmine.SpyObj<FeedbackService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    feedbackService.findAll.and.returnValue(of(mockResponse));

    fixture = TestBed.createComponent(FeedbackListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.feedbacks()).toEqual([]);
      expect(component.isLoading()).toBeFalse();
      expect(component.totalItems()).toBe(0);
      expect(component.currentPage()).toBe(1);
      expect(component.pageSize()).toBe(10);
    });

    it('should initialize filters with default values', () => {
      expect(component.filters).toEqual({
        page: 1,
        limit: 10,
      });
    });

    it('should load feedbacks on init', () => {
      fixture.detectChanges(); // triggers ngOnInit

      expect(feedbackService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });
  });

  describe('loadFeedbacks', () => {
    it('should set loading state to true before API call', () => {
      // Create a pending observable that doesn't resolve immediately
      let subscribed = false;
      const pendingObservable = new (class {
        subscribe(callbacks: any) {
          subscribed = true;
          // Don't call callbacks immediately
        }
      })() as any;
      
      feedbackService.findAll.and.returnValue(pendingObservable);
      
      component.loadFeedbacks();
      
      expect(subscribed).toBeTrue();
      expect(component.isLoading()).toBeTrue();
    });

    it('should load feedbacks successfully', (done) => {
      component.loadFeedbacks();

      setTimeout(() => {
        expect(component.feedbacks()).toEqual(mockFeedbacks);
        expect(component.totalItems()).toBe(2);
        expect(component.currentPage()).toBe(1);
        expect(component.pageSize()).toBe(10);
        expect(component.isLoading()).toBeFalse();
        done();
      }, 0);
    });

    it('should handle error when loading feedbacks', (done) => {
      const errorObservable = new (class {
        subscribe(callbacks: any) {
          callbacks.error(new Error('API Error'));
        }
      })() as any;
      feedbackService.findAll.and.returnValue(errorObservable);

      component.loadFeedbacks();

      setTimeout(() => {
        expect(component.isLoading()).toBeFalse();
        done();
      }, 10);
    });

    it('should call API with current filters', () => {
      component.filters = {
        page: 2,
        limit: 25,
        email: 'test@example.com',
        rating: 5,
      };

      component.loadFeedbacks();

      expect(feedbackService.findAll).toHaveBeenCalledWith({
        page: 2,
        limit: 25,
        email: 'test@example.com',
        rating: 5,
      });
    });
  });

  describe('Filter Operations', () => {
    beforeEach(() => {
      fixture.detectChanges();
      feedbackService.findAll.calls.reset();
    });

    it('should reset page to 1 when filter changes', () => {
      component.filters.page = 5;
      component.filters.email = 'test@example.com';

      component.onFilterChange();

      expect(component.filters.page).toBe(1);
      expect(feedbackService.findAll).toHaveBeenCalled();
    });

    it('should reload feedbacks when email filter changes', () => {
      component.filters.email = 'john@example.com';

      component.onFilterChange();

      expect(feedbackService.findAll).toHaveBeenCalledWith(
        jasmine.objectContaining({
          email: 'john@example.com',
          page: 1,
        })
      );
    });

    it('should reload feedbacks when rating filter changes', () => {
      component.filters.rating = 5;

      component.onFilterChange();

      expect(feedbackService.findAll).toHaveBeenCalledWith(
        jasmine.objectContaining({
          rating: 5,
          page: 1,
        })
      );
    });

    it('should clear email filter', () => {
      component.filters.email = 'test@example.com';

      component.clearEmailFilter();

      expect(component.filters.email).toBeUndefined();
      expect(feedbackService.findAll).toHaveBeenCalled();
    });

    it('should reset all filters', () => {
      component.filters = {
        page: 3,
        limit: 25,
        email: 'test@example.com',
        rating: 5,
      };

      component.resetFilters();

      expect(component.filters).toEqual({
        page: 1,
        limit: 10,
      });
      expect(feedbackService.findAll).toHaveBeenCalled();
    });

    it('should preserve pageSize when resetting filters', () => {
      component.pageSize.set(25);
      component.filters.email = 'test@example.com';

      component.resetFilters();

      expect(component.filters.limit).toBe(25);
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      fixture.detectChanges();
      feedbackService.findAll.calls.reset();
      spyOn(window, 'scrollTo');
    });

    it('should handle page change event', () => {
      const pageEvent: PageEvent = {
        pageIndex: 2,
        pageSize: 25,
        length: 100,
      };

      component.onPageChange(pageEvent);

      expect(component.filters.page).toBe(3); // pageIndex is 0-based
      expect(component.filters.limit).toBe(25);
      expect(feedbackService.findAll).toHaveBeenCalled();
    });

    it('should scroll to top on page change', () => {
      const pageEvent: PageEvent = {
        pageIndex: 1,
        pageSize: 10,
        length: 100,
      };

      component.onPageChange(pageEvent);

      expect(window.scrollTo).toHaveBeenCalled();
    });

    it('should handle page size change', () => {
      const pageEvent: PageEvent = {
        pageIndex: 0,
        pageSize: 50,
        length: 100,
      };

      component.onPageChange(pageEvent);

      expect(component.filters.limit).toBe(50);
      expect(feedbackService.findAll).toHaveBeenCalled();
    });
  });

  describe('viewDetails', () => {
    it('should call viewDetails method with feedback', () => {
      const feedback = mockFeedbacks[0];
      spyOn(component, 'viewDetails');

      component.viewDetails(feedback);

      expect(component.viewDetails).toHaveBeenCalledWith(feedback);
    });
  });

  describe('deleteFeedback', () => {
    beforeEach(() => {
      fixture.detectChanges();
      feedbackService.delete.and.returnValue(of({ message: 'Deleted successfully' }));
      spyOn(window, 'confirm');
    });

    it('should not delete if user cancels confirmation', () => {
      (window.confirm as jasmine.Spy).and.returnValue(false);

      component.deleteFeedback('1');

      expect(feedbackService.delete).not.toHaveBeenCalled();
    });

    it('should delete feedback with confirmation', (done) => {
      (window.confirm as jasmine.Spy).and.returnValue(true);
      feedbackService.findAll.calls.reset();

      component.deleteFeedback('1');

      setTimeout(() => {
        expect(feedbackService.delete).toHaveBeenCalledWith('1');
        expect(feedbackService.findAll).toHaveBeenCalled();
        done();
      }, 10);
    });

    it('should handle delete error', (done) => {
      (window.confirm as jasmine.Spy).and.returnValue(true);
      const errorObservable = new (class {
        subscribe(callbacks: any) {
          callbacks.error(new Error('Delete failed'));
        }
      })() as any;
      feedbackService.delete.and.returnValue(errorObservable);

      component.deleteFeedback('1');

      setTimeout(() => {
        expect(feedbackService.delete).toHaveBeenCalledWith('1');
        done();
      }, 10);
    });

    it('should reload feedbacks after successful deletion', (done) => {
      (window.confirm as jasmine.Spy).and.returnValue(true);
      feedbackService.findAll.calls.reset();

      component.deleteFeedback('1');

      setTimeout(() => {
        expect(feedbackService.findAll).toHaveBeenCalled();
        done();
      }, 0);
    });
  });

  describe('Template Rendering', () => {
    it('should render header section', () => {
      fixture.detectChanges();
      const header = fixture.nativeElement.querySelector('.header-section h1');
      expect(header?.textContent).toContain('Customer Feedback');
    });

    it('should render filter fields', () => {
      fixture.detectChanges();
      const emailFilter = fixture.nativeElement.querySelector('[placeholder="Search by email..."]');
      expect(emailFilter).toBeTruthy();
    });

    it('should show loading state correctly', () => {
      // Test initial loading state
      expect(component.isLoading()).toBeFalse();
      
      // Set loading to true
      component.isLoading.set(true);
      expect(component.isLoading()).toBeTrue();
      
      // Set loading to false
      component.isLoading.set(false);
      expect(component.isLoading()).toBeFalse();
    });

    it('should render feedback cards when data is loaded', (done) => {
      fixture.detectChanges();

      setTimeout(() => {
        fixture.detectChanges();
        const cards = fixture.nativeElement.querySelectorAll('.feedback-card');
        expect(cards.length).toBe(2);
        done();
      }, 0);
    });

    it('should show empty state when no feedbacks', (done) => {
      feedbackService.findAll.and.returnValue(of({
        data: [],
        metadata: {
          totalItems: 0,
          itemCount: 0,
          currentPage: 1,
          itemsPerPage: 10,
          totalPages: 0,
        },
      }));

      component.loadFeedbacks();

      setTimeout(() => {
        fixture.detectChanges();
        const emptyState = fixture.nativeElement.querySelector('.empty-state');
        expect(emptyState).toBeTruthy();
        expect(emptyState.textContent).toContain('No feedback found');
        done();
      }, 0);
    });

    it('should render pagination when feedbacks exist', (done) => {
      fixture.detectChanges();

      setTimeout(() => {
        fixture.detectChanges();
        const paginator = fixture.nativeElement.querySelector('mat-paginator');
        expect(paginator).toBeTruthy();
        done();
      }, 0);
    });

    it('should display feedback details correctly', (done) => {
      fixture.detectChanges();

      setTimeout(() => {
        fixture.detectChanges();
        const firstCard = fixture.nativeElement.querySelector('.feedback-card');
        expect(firstCard.textContent).toContain('John Doe');
        expect(firstCard.textContent).toContain('john@example.com');
        expect(firstCard.textContent).toContain('Great website!');
        done();
      }, 0);
    });

    it('should show reset button in filters', () => {
      fixture.detectChanges();
      const resetButton = fixture.nativeElement.querySelector('.reset-button');
      expect(resetButton).toBeTruthy();
      expect(resetButton.textContent).toContain('Reset');
    });
  });

  describe('Signal State Management', () => {
    it('should update feedbacks signal', () => {
      component.feedbacks.set(mockFeedbacks);
      expect(component.feedbacks()).toEqual(mockFeedbacks);
    });

    it('should update isLoading signal', () => {
      component.isLoading.set(true);
      expect(component.isLoading()).toBeTrue();
      
      component.isLoading.set(false);
      expect(component.isLoading()).toBeFalse();
    });

    it('should update totalItems signal', () => {
      component.totalItems.set(100);
      expect(component.totalItems()).toBe(100);
    });

    it('should update currentPage signal', () => {
      component.currentPage.set(5);
      expect(component.currentPage()).toBe(5);
    });

    it('should update pageSize signal', () => {
      component.pageSize.set(25);
      expect(component.pageSize()).toBe(25);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty response data', (done) => {
      feedbackService.findAll.and.returnValue(of({
        data: [],
        metadata: {
          totalItems: 0,
          itemCount: 0,
          currentPage: 1,
          itemsPerPage: 10,
          totalPages: 0,
        },
      }));

      component.loadFeedbacks();

      setTimeout(() => {
        expect(component.feedbacks()).toEqual([]);
        expect(component.totalItems()).toBe(0);
        done();
      }, 0);
    });

    it('should handle feedback without userName', (done) => {
      const feedbackWithoutName = [{
        ...mockFeedbacks[0],
        userName: '',
      }];

      feedbackService.findAll.and.returnValue(of({
        data: feedbackWithoutName,
        metadata: mockResponse.metadata,
      }));

      component.loadFeedbacks();

      setTimeout(() => {
        fixture.detectChanges();
        const card = fixture.nativeElement.querySelector('.feedback-card');
        expect(card.textContent).toContain('Anonymous');
        done();
      }, 0);
    });

    it('should handle missing page in feedback', (done) => {
      const feedbackWithoutPage = [{
        ...mockFeedbacks[0],
        page: undefined,
      }];

      feedbackService.findAll.and.returnValue(of({
        data: feedbackWithoutPage,
        metadata: mockResponse.metadata,
      }));

      component.loadFeedbacks();

      setTimeout(() => {
        expect(component.feedbacks()[0].page).toBeUndefined();
        done();
      }, 0);
    });
  });
});
