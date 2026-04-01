import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserFavoriteService } from './user-favorite.service';
import { environment } from '@/environments/environment';

const API = `${environment.API_URL}/user-favorite`;

const mockFavorite: any = {
  _id: 'fav-1',
  userId: 'u1',
  dishId: 'd1',
  dishSlug: 'pho',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('UserFavoriteService', () => {
  let service: UserFavoriteService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserFavoriteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── creation ──────────────────────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── addFavorite() ─────────────────────────────────────────────────────────

  it('should POST to the base URL with the correct body', () => {
    const dto = { userId: 'u1', dishId: 'd1', dishSlug: 'pho' };
    let result: any;

    service.addFavorite(dto).subscribe((r) => (result = r));

    const req = httpMock.expectOne(API);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(mockFavorite);

    expect(result).toEqual(mockFavorite);
  });

  it('should return the created UserFavorite from addFavorite', () => {
    const dto = { userId: 'u1', dishId: 'd1', dishSlug: 'pho' };
    let result: any;

    service.addFavorite(dto).subscribe((r) => (result = r));

    httpMock.expectOne(API).flush(mockFavorite);

    expect(result.dishSlug).toBe('pho');
    expect(result.userId).toBe('u1');
  });

  // ── getUserFavorites() ────────────────────────────────────────────────────

  it('should GET a paginated list of favorites', () => {
    const page = { data: [mockFavorite], total: 1, page: 1, limit: 10 };
    let result: any;

    service.getUserFavorites({} as any).subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.method).toBe('GET');
    req.flush(page);

    expect(result).toEqual(page);
  });

  it('should pass userId query param to getUserFavorites', () => {
    service.getUserFavorites({ userId: 'u1' } as any).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.params.get('userId')).toBe('u1');
    req.flush({ data: [], total: 0, page: 1, limit: 10 });
  });

  it('should pass dishSlug query param to getUserFavorites', () => {
    service.getUserFavorites({ dishSlug: 'pho' } as any).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.params.get('dishSlug')).toBe('pho');
    req.flush({ data: [], total: 0, page: 1, limit: 10 });
  });

  it('should pass pagination params to getUserFavorites', () => {
    service.getUserFavorites({ page: 2, limit: 20 } as any).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('20');
    req.flush({ data: [], total: 0, page: 2, limit: 20 });
  });

  it('should pass all query params together to getUserFavorites', () => {
    service.getUserFavorites({ userId: 'u1', dishSlug: 'bun-bo', page: 1, limit: 5 } as any).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.params.get('userId')).toBe('u1');
    expect(req.request.params.get('dishSlug')).toBe('bun-bo');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('5');
    req.flush({ data: [], total: 0, page: 1, limit: 5 });
  });

  // ── removeFavorite() ──────────────────────────────────────────────────────

  it('should DELETE to /:dishSlug/', () => {
    let result: any;

    service.removeFavorite('pho').subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/pho/`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });

    expect(result).toEqual({ success: true });
  });

  it('should include the dishSlug in the DELETE URL', () => {
    service.removeFavorite('bun-bo-hue').subscribe();

    const req = httpMock.expectOne(`${API}/bun-bo-hue/`);
    expect(req.request.url).toContain('bun-bo-hue');
    req.flush(null);
  });

  // ── checkIsFavorite() ─────────────────────────────────────────────────────

  it('should GET /:dishSlug/check/ and return isFavorite true', () => {
    let result: any;

    service.checkIsFavorite('pho').subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/pho/check/`);
    expect(req.request.method).toBe('GET');
    req.flush({ isFavorite: true });

    expect(result).toEqual({ isFavorite: true });
  });

  it('should GET /:dishSlug/check/ and return isFavorite false', () => {
    let result: any;

    service.checkIsFavorite('bun-bo').subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/bun-bo/check/`);
    req.flush({ isFavorite: false });

    expect(result.isFavorite).toBe(false);
  });

  it('should include the dishSlug in the check URL', () => {
    service.checkIsFavorite('com-tam').subscribe();

    const req = httpMock.expectOne(`${API}/com-tam/check/`);
    expect(req.request.url).toContain('com-tam');
    req.flush({ isFavorite: true });
  });
});
