import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { IngredientService } from './ingredient.service';
import { environment } from '@/environments/environment';

const API = `${environment.API_URL}/ingredient`;

const mockIngredient: any = {
  _id: 'i1',
  slug: 'tomato',
  title: [{ lang: 'en', data: 'Tomato' }],
  measure: 'g',
  calories: 18,
  carbohydrate: 3.9,
  fat: 0.2,
  ingredientCategory: ['vegetable'],
  weight: 100,
  protein: 0.9,
  cholesterol: 0,
  sodium: 5,
  images: [],
};

describe('IngredientService', () => {
  let service: IngredientService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(IngredientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── creation ──────────────────────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── findAll() ─────────────────────────────────────────────────────────────

  it('should GET all ingredients', () => {
    const page = { data: [mockIngredient], total: 1, page: 1, limit: 10 };
    let result: any;

    service.findAll({} as any).subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.method).toBe('GET');
    req.flush(page);

    expect(result).toEqual(page);
  });

  it('should pass keyword query param in findAll', () => {
    service.findAll({ keyword: 'tomato', page: 1, limit: 10 } as any).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.params.get('keyword')).toBe('tomato');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('10');
    req.flush({ data: [], total: 0, page: 1, limit: 10 });
  });

  it('should pass ingredientCategory array in findAll', () => {
    service.findAll({ ingredientCategory: ['vegetable', 'fruit'] } as any).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.params.getAll('ingredientCategory')).toEqual(['vegetable', 'fruit']);
    req.flush({ data: [], total: 0, page: 1, limit: 10 });
  });

  // ── findRandom() ──────────────────────────────────────────────────────────

  it('should GET /random with limit', () => {
    let result: any;

    service.findRandom(3).subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.url === `${API}/random`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('limit')).toBe('3');
    req.flush([mockIngredient]);

    expect(result).toEqual([mockIngredient]);
  });

  it('should include ingredientCategories when provided and non-empty', () => {
    service.findRandom(2, ['vegetable', 'fruit']).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${API}/random`);
    expect(req.request.params.getAll('ingredientCategory')).toEqual(['vegetable', 'fruit']);
    req.flush([mockIngredient]);
  });

  it('should omit ingredientCategory param when empty array provided', () => {
    service.findRandom(5, []).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${API}/random`);
    expect(req.request.params.get('ingredientCategory')).toBeNull();
    req.flush([]);
  });

  it('should omit ingredientCategory param when not provided', () => {
    service.findRandom(5).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${API}/random`);
    expect(req.request.params.get('ingredientCategory')).toBeNull();
    req.flush([]);
  });

  // ── create() ──────────────────────────────────────────────────────────────

  it('should POST to create an ingredient', () => {
    const dto = {
      slug: 'carrot',
      title: [{ lang: 'en', data: 'Carrot' }],
      ingredientCategory: ['vegetable'],
      images: [],
    };
    let result: any;

    service.create(dto).subscribe((r) => (result = r));

    const req = httpMock.expectOne(API);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({ ...mockIngredient, ...dto });

    expect(result.slug).toBe('carrot');
  });

  it('should include optional fields in POST body', () => {
    const dto = {
      slug: 'carrot',
      title: [{ lang: 'en', data: 'Carrot' }],
      ingredientCategory: ['vegetable'],
      images: [],
      calories: 41,
      protein: 0.9,
    };

    service.create(dto).subscribe();

    const req = httpMock.expectOne(API);
    expect(req.request.body.calories).toBe(41);
    expect(req.request.body.protein).toBe(0.9);
    req.flush(mockIngredient);
  });

  // ── update() ──────────────────────────────────────────────────────────────

  it('should PATCH to update an ingredient by id', () => {
    const dto = { id: 'i1', slug: 'tomato', title: [], ingredientCategory: [], images: [] };
    let result: any;

    service.update('i1', dto as any).subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/i1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);
    req.flush(mockIngredient);

    expect(result).toEqual(mockIngredient);
  });

  it('should use the provided id in the PATCH URL', () => {
    service.update('ingredient-99', { id: 'ingredient-99', slug: 'x', title: [], ingredientCategory: [], images: [] } as any).subscribe();

    const req = httpMock.expectOne(`${API}/ingredient-99`);
    expect(req.request.method).toBe('PATCH');
    req.flush(mockIngredient);
  });

  // ── findOne() ─────────────────────────────────────────────────────────────

  it('should GET an ingredient by id', () => {
    let result: any;

    service.findOne('i1').subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/i1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockIngredient);

    expect(result).toEqual(mockIngredient);
  });

  it('should use the provided id in the GET URL', () => {
    service.findOne('ingredient-42').subscribe();

    const req = httpMock.expectOne(`${API}/ingredient-42`);
    expect(req.request.method).toBe('GET');
    req.flush(mockIngredient);
  });

  // ── delete() ──────────────────────────────────────────────────────────────

  it('should DELETE an ingredient by id', () => {
    let result: any;

    service.delete('i1').subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/i1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockIngredient);

    expect(result).toEqual(mockIngredient);
  });

  it('should use the provided id in the DELETE URL', () => {
    service.delete('ingredient-77').subscribe();

    const req = httpMock.expectOne(`${API}/ingredient-77`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockIngredient);
  });
});
