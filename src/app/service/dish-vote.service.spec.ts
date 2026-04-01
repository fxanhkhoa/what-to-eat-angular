import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { DishVoteService } from './dish-vote.service';
import { environment } from '@/environments/environment';

const API = `${environment.API_URL}/dish-vote`;

const mockVoteItem = {
  slug: 'pho',
  voteUser: ['u1'],
  voteAnonymous: [],
  isCustom: false,
};

const mockDishVote = {
  _id: 'dv1',
  title: 'Lunch Vote',
  description: 'Vote for lunch',
  dishVoteItems: [mockVoteItem],
};

describe('DishVoteService', () => {
  let service: DishVoteService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DishVoteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── creation ──────────────────────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── findAll() ─────────────────────────────────────────────────────────────

  it('should GET all dish votes', () => {
    const mockPage = { data: [mockDishVote], total: 1, page: 1, limit: 10 };
    let result: any;

    service.findAll({} as any).subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.method).toBe('GET');
    req.flush(mockPage);

    expect(result).toEqual(mockPage);
  });

  it('should pass keyword query param in findAll', () => {
    service.findAll({ keyword: 'pho', page: 1, limit: 10 } as any).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.params.get('keyword')).toBe('pho');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('10');
    req.flush({ data: [], total: 0, page: 1, limit: 10 });
  });

  it('should pass empty params when findAll called with empty dto', () => {
    service.findAll({} as any).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.method).toBe('GET');
    req.flush({ data: [], total: 0, page: 1, limit: 10 });
  });

  // ── findById() ────────────────────────────────────────────────────────────

  it('should GET a dish vote by id', () => {
    let result: any;

    service.findById('dv1').subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/dv1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockDishVote);

    expect(result).toEqual(mockDishVote);
  });

  it('should use the provided id in the GET URL', () => {
    service.findById('dv-99').subscribe();

    const req = httpMock.expectOne(`${API}/dv-99`);
    expect(req.request.method).toBe('GET');
    req.flush(mockDishVote);
  });

  // ── create() ──────────────────────────────────────────────────────────────

  it('should POST to create a dish vote', () => {
    const dto = { title: 'Dinner Vote', description: 'Pick dinner', dishVoteItems: [mockVoteItem] };
    let result: any;

    service.create(dto).subscribe((r) => (result = r));

    const req = httpMock.expectOne(API);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({ ...mockDishVote, ...dto });

    expect(result.title).toBe('Dinner Vote');
  });

  it('should POST create without optional title and description', () => {
    const dto = { dishVoteItems: [mockVoteItem] };

    service.create(dto).subscribe();

    const req = httpMock.expectOne(API);
    expect(req.request.body).toEqual(dto);
    expect(req.request.body.title).toBeUndefined();
    expect(req.request.body.description).toBeUndefined();
    req.flush(mockDishVote);
  });

  it('should forward the created DishVote response', () => {
    const dto = { dishVoteItems: [mockVoteItem] };
    let result: any;

    service.create(dto).subscribe((r) => (result = r));

    httpMock.expectOne(API).flush(mockDishVote);

    expect(result).toEqual(mockDishVote);
  });
});
