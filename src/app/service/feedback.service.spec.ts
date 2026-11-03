import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { FeedbackService } from './feedback.service';
import { environment } from '@/environments/environment';

const API = `${environment.API_URL}/feedback`;

const mockFeedback: any = {
  id: 'fb1',
  email: 'user@example.com',
  rating: 5,
  comment: 'Great app!',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockPage: any = {
  data: [mockFeedback],
  metadata: {
    totalItems: 1,
    itemCount: 1,
    itemsPerPage: 10,
    totalPages: 1,
    currentPage: 1,
  },
};

describe('FeedbackService', () => {
  let service: FeedbackService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FeedbackService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── creation ──────────────────────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── create() ──────────────────────────────────────────────────────────────

  it('should POST to create feedback', () => {
    const dto = { email: 'user@example.com', rating: 5, comment: 'Great!' };
    let result: any;

    service.create(dto).subscribe((r) => (result = r));

    const req = httpMock.expectOne(API);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(mockFeedback);

    expect(result).toEqual(mockFeedback);
  });

  it('should include optional fields in POST body', () => {
    const dto = {
      email: 'user@example.com',
      rating: 4,
      comment: 'Good',
      userName: 'Alice',
      page: '/home',
      userAgent: 'Chrome',
    };

    service.create(dto).subscribe();

    const req = httpMock.expectOne(API);
    expect(req.request.body.userName).toBe('Alice');
    expect(req.request.body.page).toBe('/home');
    expect(req.request.body.userAgent).toBe('Chrome');
    req.flush(mockFeedback);
  });

  // ── findAll() ─────────────────────────────────────────────────────────────

  it('should GET all feedbacks with pagination params', () => {
    let result: any;

    service.findAll({ page: 1, limit: 10 }).subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('10');
    req.flush(mockPage);

    expect(result).toEqual(mockPage);
  });

  it('should pass rating filter to findAll', () => {
    service.findAll({ rating: 5 }).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.params.get('rating')).toBe('5');
    req.flush(mockPage);
  });

  it('should pass email filter to findAll', () => {
    service.findAll({ email: 'user@example.com' }).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.params.get('email')).toBe('user@example.com');
    req.flush(mockPage);
  });

  it('should pass all filters together in findAll', () => {
    service.findAll({ page: 2, limit: 5, rating: 4, email: 'test@test.com' }).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('5');
    expect(req.request.params.get('rating')).toBe('4');
    expect(req.request.params.get('email')).toBe('test@test.com');
    req.flush(mockPage);
  });

  it('should omit undefined params in findAll', () => {
    service.findAll({}).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.params.get('page')).toBeNull();
    expect(req.request.params.get('limit')).toBeNull();
    expect(req.request.params.get('rating')).toBeNull();
    expect(req.request.params.get('email')).toBeNull();
    req.flush(mockPage);
  });

  // ── findOne() ─────────────────────────────────────────────────────────────

  it('should GET a feedback by id', () => {
    let result: any;

    service.findOne('fb1').subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/fb1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockFeedback);

    expect(result).toEqual(mockFeedback);
  });

  it('should use the provided id in the GET URL', () => {
    service.findOne('feedback-99').subscribe();

    const req = httpMock.expectOne(`${API}/feedback-99`);
    expect(req.request.method).toBe('GET');
    req.flush(mockFeedback);
  });

  // ── update() ──────────────────────────────────────────────────────────────

  it('should PATCH to update feedback by id', () => {
    const dto = { rating: 3, comment: 'Okay' };
    let result: any;

    service.update('fb1', dto).subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/fb1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);
    req.flush({ ...mockFeedback, ...dto });

    expect(result.rating).toBe(3);
  });

  it('should allow partial update with only comment', () => {
    const dto = { comment: 'Updated comment' };

    service.update('fb1', dto).subscribe();

    const req = httpMock.expectOne(`${API}/fb1`);
    expect(req.request.body).toEqual(dto);
    expect(req.request.body.rating).toBeUndefined();
    req.flush(mockFeedback);
  });

  it('should allow partial update with only rating', () => {
    const dto = { rating: 2 };

    service.update('fb1', dto).subscribe();

    const req = httpMock.expectOne(`${API}/fb1`);
    expect(req.request.body).toEqual(dto);
    expect(req.request.body.comment).toBeUndefined();
    req.flush(mockFeedback);
  });

  // ── delete() ──────────────────────────────────────────────────────────────

  it('should DELETE a feedback by id', () => {
    let result: any;

    service.delete('fb1').subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/fb1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Deleted successfully' });

    expect(result).toEqual({ message: 'Deleted successfully' });
  });

  it('should use the provided id in the DELETE URL', () => {
    service.delete('feedback-77').subscribe();

    const req = httpMock.expectOne(`${API}/feedback-77`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'ok' });
  });
});
