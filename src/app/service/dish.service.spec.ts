import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { DishService } from './dish.service';
import { environment } from '@/environments/environment';

const API = `${environment.API_URL}/dish`;

const mockDish: any = {
  _id: 'd1',
  slug: 'pho',
  title: [{ lang: 'en', data: 'Pho' }],
  shortDescription: [],
  content: [],
  tags: [],
  mealCategories: ['lunch'],
  ingredientCategories: [],
  videos: [],
  ingredients: [],
  relatedDishes: [],
  labels: [],
};

describe('DishService', () => {
  let service: DishService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DishService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── creation ──────────────────────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── findAll() ─────────────────────────────────────────────────────────────

  it('should GET all dishes', () => {
    const page = { data: [mockDish], total: 1, page: 1, limit: 10 };
    let result: any;

    service.findAll({} as any).subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.method).toBe('GET');
    req.flush(page);

    expect(result).toEqual(page);
  });

  it('should pass query params to findAll', () => {
    service.findAll({ keyword: 'pho', page: 1, limit: 5 } as any).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.params.get('keyword')).toBe('pho');
    expect(req.request.params.get('page')).toBe('1');
    req.flush({ data: [], total: 0, page: 1, limit: 5 });
  });

  // ── findWithScore() ───────────────────────────────────────────────────────

  it('should GET /search for findWithScore', () => {
    let result: any;

    service.findWithScore({ keyword: 'bun bo' } as any).subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.url === `${API}/search`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('keyword')).toBe('bun bo');
    req.flush({ data: [mockDish], total: 1, page: 1, limit: 10 });

    expect(result.data[0]).toEqual(mockDish);
  });

  // ── findWithFuzzy() ───────────────────────────────────────────────────────

  it('should GET /search/fuzzy for findWithFuzzy', () => {
    service.findWithFuzzy({ keyword: 'pho' } as any).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${API}/search/fuzzy`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: [], total: 0, page: 1, limit: 10 });
  });

  it('should pass query params to findWithFuzzy', () => {
    service.findWithFuzzy({ keyword: 'bun', limit: 5 } as any).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${API}/search/fuzzy`);
    expect(req.request.params.get('keyword')).toBe('bun');
    req.flush({ data: [], total: 0, page: 1, limit: 5 });
  });

  // ── getSuggestions() ──────────────────────────────────────────────────────

  it('should GET /suggestions and return the suggestions array', () => {
    let result: any;

    service.getSuggestions('ph').subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.url === `${API}/suggestions`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('keyword')).toBe('ph');
    expect(req.request.params.get('limit')).toBe('10');
    req.flush({ suggestions: ['pho', 'pho bo'] });

    expect(result).toEqual(['pho', 'pho bo']);
  });

  it('should pass custom limit to getSuggestions', () => {
    service.getSuggestions('bu', 5).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${API}/suggestions`);
    expect(req.request.params.get('limit')).toBe('5');
    req.flush({ suggestions: [] });
  });

  // ── findBySlug() ──────────────────────────────────────────────────────────

  it('should GET /slug/:slug', () => {
    let result: any;

    service.findBySlug('pho').subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/slug/pho`);
    expect(req.request.method).toBe('GET');
    req.flush(mockDish);

    expect(result).toEqual(mockDish);
  });

  it('should cache the result for the same slug', () => {
    let r1: any, r2: any;

    service.findBySlug('pho').subscribe((r) => (r1 = r));
    service.findBySlug('pho').subscribe((r) => (r2 = r));

    // Only ONE HTTP request should be made due to shareReplay + cache
    const req = httpMock.expectOne(`${API}/slug/pho`);
    req.flush(mockDish);

    expect(r1).toEqual(mockDish);
    expect(r2).toEqual(mockDish);
  });

  it('should make separate requests for different slugs', () => {
    service.findBySlug('pho').subscribe();
    service.findBySlug('bun-bo').subscribe();

    httpMock.expectOne(`${API}/slug/pho`).flush(mockDish);
    httpMock.expectOne(`${API}/slug/bun-bo`).flush({ ...mockDish, slug: 'bun-bo' });
  });

  // ── findRandom() ──────────────────────────────────────────────────────────

  it('should GET /random with limit', () => {
    let result: any;

    service.findRandom(3).subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.url === `${API}/random`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('limit')).toBe('3');
    req.flush([mockDish]);

    expect(result).toEqual([mockDish]);
  });

  it('should pass mealCategories array to findRandom', () => {
    service.findRandom(2, ['lunch', 'dinner']).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${API}/random`);
    expect(req.request.params.getAll('mealCategories')).toEqual(['lunch', 'dinner']);
    req.flush([mockDish]);
  });

  it('should pass empty mealCategories when not provided', () => {
    service.findRandom(5).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${API}/random`);
    expect(req.request.params.getAll('mealCategories')).toEqual([]);
    req.flush([]);
  });

  // ── create() ──────────────────────────────────────────────────────────────

  it('should POST to create a dish', () => {
    const dto = { ...mockDish };
    let result: any;

    service.create(dto).subscribe((r) => (result = r));

    const req = httpMock.expectOne(API);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(mockDish);

    expect(result).toEqual(mockDish);
  });

  // ── update() ──────────────────────────────────────────────────────────────

  it('should PATCH to update a dish by id', () => {
    const dto = { ...mockDish, id: 'd1' };
    let result: any;

    service.update('d1', dto).subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/d1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);
    req.flush(mockDish);

    expect(result).toEqual(mockDish);
  });

  // ── findOne() ─────────────────────────────────────────────────────────────

  it('should GET a dish by id', () => {
    let result: any;

    service.findOne('d1').subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/d1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockDish);

    expect(result).toEqual(mockDish);
  });

  // ── delete() ──────────────────────────────────────────────────────────────

  it('should DELETE a dish by id', () => {
    let result: any;

    service.delete('d1').subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/d1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockDish);

    expect(result).toEqual(mockDish);
  });

  // ── analyze() ─────────────────────────────────────────────────────────────

  it('should GET /analyze', () => {
    const mockAnalyze = { total: 10, byCategory: {} };
    let result: any;

    service.analyze().subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/analyze`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAnalyze);

    expect(result).toEqual(mockAnalyze);
  });
});
