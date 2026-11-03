import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserDishInteractionService } from './user-dish-interaction.service';
import { environment } from '@/environments/environment';

const API = `${environment.API_URL}/user-dish-interaction`;

const mockInteraction: any = {
  _id: 'int-1',
  userId: 'u1',
  dishId: 'd1',
  dishSlug: 'pho',
  viewCount: 5,
  cooked: true,
  cookedCount: 2,
  sharedCount: 1,
  interactionScore: 10,
};

describe('UserDishInteractionService', () => {
  let service: UserDishInteractionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserDishInteractionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── creation ──────────────────────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── recordView() ──────────────────────────────────────────────────────────

  it('should POST to /view/ with the correct body', () => {
    const dto = { userId: 'u1', dishId: 'd1', dishSlug: 'pho' };
    let result: any;

    service.recordView(dto).subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/view/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(mockInteraction);

    expect(result).toEqual(mockInteraction);
  });

  it('should return the updated UserDishInteraction from recordView', () => {
    const dto = { userId: 'u1', dishId: 'd1', dishSlug: 'pho' };
    let result: any;

    service.recordView(dto).subscribe((r) => (result = r));

    httpMock.expectOne(`${API}/view/`).flush({ ...mockInteraction, viewCount: 6 });

    expect(result.viewCount).toBe(6);
  });

  // ── recordCooked() ────────────────────────────────────────────────────────

  it('should POST to /cooked/ with the correct body', () => {
    const dto = { userId: 'u1', dishId: 'd1', dishSlug: 'pho' };
    let result: any;

    service.recordCooked(dto).subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/cooked/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(mockInteraction);

    expect(result).toEqual(mockInteraction);
  });

  it('should return the updated UserDishInteraction from recordCooked', () => {
    const dto = { userId: 'u1', dishId: 'd1', dishSlug: 'pho' };
    let result: any;

    service.recordCooked(dto).subscribe((r) => (result = r));

    httpMock.expectOne(`${API}/cooked/`).flush({ ...mockInteraction, cookedCount: 3 });

    expect(result.cookedCount).toBe(3);
  });

  // ── rateDish() ────────────────────────────────────────────────────────────

  it('should POST to /rate/ with the correct body including rating', () => {
    const dto = { userId: 'u1', dishId: 'd1', dishSlug: 'pho', rating: 5 };
    let result: any;

    service.rateDish(dto).subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/rate/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({ ...mockInteraction, rating: 5 });

    expect(result.rating).toBe(5);
  });

  it('should POST to /rate/ with minimum rating of 1', () => {
    const dto = { userId: 'u1', dishId: 'd1', dishSlug: 'pho', rating: 1 };

    service.rateDish(dto).subscribe();

    const req = httpMock.expectOne(`${API}/rate/`);
    expect(req.request.body.rating).toBe(1);
    req.flush(mockInteraction);
  });

  // ── recordShare() ─────────────────────────────────────────────────────────

  it('should POST to /share/ with the correct body', () => {
    const dto = { userId: 'u1', dishId: 'd1', dishSlug: 'pho' };
    let result: any;

    service.recordShare(dto).subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/share/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(mockInteraction);

    expect(result).toEqual(mockInteraction);
  });

  it('should return updated sharedCount from recordShare', () => {
    const dto = { userId: 'u1', dishId: 'd1', dishSlug: 'pho' };
    let result: any;

    service.recordShare(dto).subscribe((r) => (result = r));

    httpMock.expectOne(`${API}/share/`).flush({ ...mockInteraction, sharedCount: 2 });

    expect(result.sharedCount).toBe(2);
  });

  // ── getUserInteractions() ─────────────────────────────────────────────────

  it('should GET user interactions', () => {
    const page = { data: [mockInteraction], total: 1, page: 1, limit: 10 };
    let result: any;

    service.getUserInteractions({} as any).subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.method).toBe('GET');
    req.flush(page);

    expect(result).toEqual(page);
  });

  it('should pass userId query param to getUserInteractions', () => {
    service.getUserInteractions({ userId: 'u1' } as any).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.params.get('userId')).toBe('u1');
    req.flush({ data: [], total: 0, page: 1, limit: 10 });
  });

  it('should pass dishSlug query param to getUserInteractions', () => {
    service.getUserInteractions({ dishSlug: 'pho' } as any).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.params.get('dishSlug')).toBe('pho');
    req.flush({ data: [], total: 0, page: 1, limit: 10 });
  });

  it('should pass cooked and minRating filters to getUserInteractions', () => {
    service.getUserInteractions({ cooked: true, minRating: 4, page: 1, limit: 5 } as any).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.params.get('cooked')).toBe('true');
    expect(req.request.params.get('minRating')).toBe('4');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('5');
    req.flush({ data: [], total: 0, page: 1, limit: 5 });
  });

  // ── getTopInteractedDishes() ──────────────────────────────────────────────

  it('should GET top interacted dishes', () => {
    const page = { data: [mockInteraction], total: 1, page: 1, limit: 10 };
    let result: any;

    service.getTopInteractedDishes({} as any).subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.url === `${API}/top/`);
    expect(req.request.method).toBe('GET');
    req.flush(page);

    expect(result).toEqual(page);
  });

  it('should pass userId param to getTopInteractedDishes', () => {
    service.getTopInteractedDishes({ userId: 'u2' } as any).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${API}/top/`);
    expect(req.request.params.get('userId')).toBe('u2');
    req.flush({ data: [], total: 0, page: 1, limit: 10 });
  });

  it('should pass pagination params to getTopInteractedDishes', () => {
    service.getTopInteractedDishes({ page: 2, limit: 20 } as any).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${API}/top/`);
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('20');
    req.flush({ data: [], total: 0, page: 2, limit: 20 });
  });
});
