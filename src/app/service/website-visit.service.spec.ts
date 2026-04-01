import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { WebsiteVisitService } from './website-visit.service';
import { environment } from '@/environments/environment';

const API = `${environment.API_URL}/website-visit`;
const IP_SERVICE = 'https://robotic.dratini.tech/client-ip';

const mockVisit: any = {
  ip: '1.2.3.4',
  userAgent: 'Chrome/120',
  visitedAt: new Date('2024-01-01'),
};

describe('WebsiteVisitService', () => {
  let service: WebsiteVisitService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(WebsiteVisitService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── creation ──────────────────────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── trackVisit() ──────────────────────────────────────────────────────────

  it('should fetch client IP then POST with the ip in the body', () => {
    let completed = false;

    service.trackVisit().subscribe(() => (completed = true));

    const ipReq = httpMock.expectOne(IP_SERVICE);
    expect(ipReq.request.method).toBe('GET');
    ipReq.flush({ ip: '1.2.3.4' });

    const postReq = httpMock.expectOne(`${API}/visit`);
    expect(postReq.request.method).toBe('POST');
    expect(postReq.request.body).toEqual({ ip: '1.2.3.4' });
    postReq.flush(null);

    expect(completed).toBeTrue();
  });

  it('should POST with empty body when IP service returns empty string', () => {
    service.trackVisit().subscribe();

    const ipReq = httpMock.expectOne(IP_SERVICE);
    ipReq.flush({ ip: '' });

    const postReq = httpMock.expectOne(`${API}/visit`);
    expect(postReq.request.body).toEqual({});
    postReq.flush(null);
  });

  it('should fallback to empty body when IP service errors', () => {
    service.trackVisit().subscribe();

    const ipReq = httpMock.expectOne(IP_SERVICE);
    ipReq.error(new ProgressEvent('error'));

    const postReq = httpMock.expectOne(`${API}/visit`);
    expect(postReq.request.body).toEqual({});
    postReq.flush(null);
  });

  it('should POST with empty body when IP service returns a network error', () => {
    service.trackVisit().subscribe();

    const ipReq = httpMock.expectOne(IP_SERVICE);
    ipReq.error(new ProgressEvent('network'));

    const postReq = httpMock.expectOne(`${API}/visit`);
    expect(postReq.request.body).toEqual({});
    postReq.flush(null);
  });

  // ── getVisitCount() ───────────────────────────────────────────────────────

  it('should GET the visit count', () => {
    let result: any;

    service.getVisitCount().subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/visit/count`);
    expect(req.request.method).toBe('GET');
    req.flush({ count: 42 });

    expect(result).toEqual({ count: 42 });
  });

  it('should return count of 0 when there are no visits', () => {
    let result: any;

    service.getVisitCount().subscribe((r) => (result = r));

    httpMock.expectOne(`${API}/visit/count`).flush({ count: 0 });

    expect(result.count).toBe(0);
  });

  // ── findAll() ─────────────────────────────────────────────────────────────

  it('should GET a paginated list with default page=1 and limit=10', () => {
    const page = { data: [mockVisit], total: 1, page: 1, limit: 10 };
    let result: any;

    service.findAll().subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.url === `${API}/visit`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('10');
    req.flush(page);

    expect(result).toEqual(page);
  });

  it('should pass custom page and limit params', () => {
    service.findAll(3, 25).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${API}/visit`);
    expect(req.request.params.get('page')).toBe('3');
    expect(req.request.params.get('limit')).toBe('25');
    req.flush({ data: [], total: 0, page: 3, limit: 25 });
  });

  it('should return the paginated visit list', () => {
    const page = { data: [mockVisit, { ...mockVisit, ip: '5.6.7.8' }], total: 2, page: 1, limit: 10 };
    let result: any;

    service.findAll(1, 10).subscribe((r) => (result = r));

    httpMock.expectOne((r) => r.url === `${API}/visit`).flush(page);

    expect(result.data.length).toBe(2);
    expect(result.total).toBe(2);
  });
});
