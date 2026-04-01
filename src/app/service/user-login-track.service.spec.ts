import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserLoginTrackService } from './user-login-track.service';
import { environment } from '@/environments/environment';

const API = `${environment.API_URL}/user-login-track`;

const mockTrack: any = {
  userId: 'u1',
  loginAt: '2024-01-01T00:00:00.000Z',
  ip: '127.0.0.1',
  userAgent: 'Chrome/120',
};

describe('UserLoginTrackService', () => {
  let service: UserLoginTrackService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserLoginTrackService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── creation ──────────────────────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── findAll() ─────────────────────────────────────────────────────────────

  it('should GET the base URL', () => {
    const page = { data: [mockTrack], total: 1, page: 1, limit: 10 };
    let result: any;

    service.findAll({} as any).subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.method).toBe('GET');
    req.flush(page);

    expect(result).toEqual(page);
  });

  it('should pass userId query param', () => {
    service.findAll({ userId: 'u1' } as any).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.params.get('userId')).toBe('u1');
    req.flush({ data: [], total: 0, page: 1, limit: 10 });
  });

  it('should pass page query param', () => {
    service.findAll({ page: 2 } as any).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.params.get('page')).toBe('2');
    req.flush({ data: [], total: 0, page: 2, limit: 10 });
  });

  it('should pass limit query param', () => {
    service.findAll({ limit: 20 } as any).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.params.get('limit')).toBe('20');
    req.flush({ data: [], total: 0, page: 1, limit: 20 });
  });

  it('should pass all query params together', () => {
    service.findAll({ userId: 'u1', page: 3, limit: 5 } as any).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.params.get('userId')).toBe('u1');
    expect(req.request.params.get('page')).toBe('3');
    expect(req.request.params.get('limit')).toBe('5');
    req.flush({ data: [], total: 0, page: 3, limit: 5 });
  });

  it('should return paginated data from findAll', () => {
    const page = { data: [mockTrack, { ...mockTrack, ip: '10.0.0.1' }], total: 2, page: 1, limit: 10 };
    let result: any;

    service.findAll({ userId: 'u1' } as any).subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.url === API);
    req.flush(page);

    expect(result.data.length).toBe(2);
    expect(result.total).toBe(2);
  });
});
