import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserDishCollectionService } from './user-dish-collection.service';
import { environment } from '@/environments/environment';

const API = `${environment.API_URL}/user-dish-collection`;

const mockCollection: any = {
  _id: 'col-1',
  userId: 'u1',
  name: 'Favourites',
  dishSlugs: ['pho', 'bun-bo'],
  isPublic: false,
  sortOrder: 0,
};

describe('UserDishCollectionService', () => {
  let service: UserDishCollectionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserDishCollectionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── creation ──────────────────────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── findAll() ─────────────────────────────────────────────────────────────

  it('should GET all collections', () => {
    const page = { data: [mockCollection], total: 1, page: 1, limit: 10 };
    let result: any;

    service.findAll({} as any).subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.method).toBe('GET');
    req.flush(page);

    expect(result).toEqual(page);
  });

  it('should pass query params to findAll', () => {
    service.findAll({ userId: 'u1', keyword: 'fav', page: 1, limit: 10 } as any).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.params.get('userId')).toBe('u1');
    expect(req.request.params.get('keyword')).toBe('fav');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('10');
    req.flush({ data: [], total: 0, page: 1, limit: 10 });
  });

  it('should pass isPublic param to findAll', () => {
    service.findAll({ isPublic: true } as any).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.params.get('isPublic')).toBe('true');
    req.flush({ data: [], total: 0, page: 1, limit: 10 });
  });

  // ── findById() ────────────────────────────────────────────────────────────

  it('should GET a collection by id', () => {
    let result: any;

    service.findById('col-1').subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/col-1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCollection);

    expect(result).toEqual(mockCollection);
  });

  it('should use the provided id in the GET URL', () => {
    service.findById('col-99').subscribe();

    const req = httpMock.expectOne(`${API}/col-99`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCollection);
  });

  // ── create() ──────────────────────────────────────────────────────────────

  it('should POST to create a collection', () => {
    const dto = { userId: 'u1', name: 'New List', dishSlugs: [], isPublic: false, sortOrder: 0 };
    let result: any;

    service.create(dto).subscribe((r) => (result = r));

    const req = httpMock.expectOne(API);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({ ...mockCollection, ...dto });

    expect(result.name).toBe('New List');
  });

  it('should POST create with optional fields', () => {
    const dto = {
      userId: 'u1',
      name: 'Birthday',
      description: 'Birthday dishes',
      occasion: 'birthday',
      eventDate: '2026-07-01',
      dishSlugs: ['pho'],
      tags: ['party'],
      isPublic: true,
      color: '#ff0000',
      icon: 'cake',
      sortOrder: 1,
    };

    service.create(dto).subscribe();

    const req = httpMock.expectOne(API);
    expect(req.request.body.occasion).toBe('birthday');
    expect(req.request.body.tags).toEqual(['party']);
    req.flush(mockCollection);
  });

  // ── update() ──────────────────────────────────────────────────────────────

  it('should PUT to update a collection using dto._id in URL', () => {
    const dto = { ...mockCollection, name: 'Updated Name' };
    let result: any;

    service.update(dto).subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/col-1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(dto);
    req.flush({ ...mockCollection, name: 'Updated Name' });

    expect(result.name).toBe('Updated Name');
  });

  // ── delete() ──────────────────────────────────────────────────────────────

  it('should DELETE a collection by id', () => {
    service.delete('col-1').subscribe();

    const req = httpMock.expectOne(`${API}/col-1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should use the provided id in the DELETE URL', () => {
    service.delete('col-77').subscribe();

    const req = httpMock.expectOne(`${API}/col-77`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // ── addDish() ─────────────────────────────────────────────────────────────

  it('should POST to add a dish to a collection', () => {
    const dto = { userId: 'u1', collectionId: 'col-1', dishSlug: 'pho' };
    let result: any;

    service.addDish(dto).subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/col-1/dishes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(mockCollection);

    expect(result).toEqual(mockCollection);
  });

  it('should use collectionId from dto in the addDish URL', () => {
    service.addDish({ userId: 'u1', collectionId: 'col-99', dishSlug: 'bun-bo' }).subscribe();

    const req = httpMock.expectOne(`${API}/col-99/dishes`);
    expect(req.request.method).toBe('POST');
    req.flush(mockCollection);
  });

  // ── removeDish() ──────────────────────────────────────────────────────────

  it('should DELETE to remove a dish from a collection', () => {
    const dto = { userId: 'u1', collectionId: 'col-1', dishSlug: 'pho' };
    let result: any;

    service.removeDish(dto).subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/col-1/dishes/pho`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockCollection);

    expect(result).toEqual(mockCollection);
  });

  it('should use collectionId and dishSlug from dto in the removeDish URL', () => {
    service.removeDish({ userId: 'u1', collectionId: 'col-2', dishSlug: 'bun-bo' }).subscribe();

    const req = httpMock.expectOne(`${API}/col-2/dishes/bun-bo`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockCollection);
  });

  // ── reorderDishes() ───────────────────────────────────────────────────────

  it('should PUT to reorder dishes in a collection', () => {
    const dto = { userId: 'u1', collectionId: 'col-1', dishSlugs: ['bun-bo', 'pho'] };
    let result: any;

    service.reorderDishes(dto).subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/col-1/reorder`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(dto);
    req.flush(mockCollection);

    expect(result).toEqual(mockCollection);
  });

  it('should use collectionId from dto in the reorderDishes URL', () => {
    service.reorderDishes({ userId: 'u1', collectionId: 'col-5', dishSlugs: ['pho'] }).subscribe();

    const req = httpMock.expectOne(`${API}/col-5/reorder`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockCollection);
  });

  // ── duplicate() ───────────────────────────────────────────────────────────

  it('should POST to duplicate a collection', () => {
    const dto = { userId: 'u1', collectionId: 'col-1', newName: 'Copy of Favourites', copyPublic: false };
    let result: any;

    service.duplicate(dto).subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/col-1/duplicate`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({ ...mockCollection, name: 'Copy of Favourites' });

    expect(result.name).toBe('Copy of Favourites');
  });

  it('should use collectionId from dto in the duplicate URL', () => {
    service.duplicate({ userId: 'u1', collectionId: 'col-3', newName: 'Clone', copyPublic: true }).subscribe();

    const req = httpMock.expectOne(`${API}/col-3/duplicate`);
    expect(req.request.method).toBe('POST');
    req.flush(mockCollection);
  });

  // ── share() ───────────────────────────────────────────────────────────────

  it('should POST to share a collection', () => {
    const dto = { userId: 'u1', collectionId: 'col-1', shareWithUserIds: ['u2', 'u3'] };

    service.share(dto).subscribe();

    const req = httpMock.expectOne(`${API}/col-1/share`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(null);
  });

  it('should POST share without optional shareWithUserIds', () => {
    const dto = { userId: 'u1', collectionId: 'col-1' };

    service.share(dto).subscribe();

    const req = httpMock.expectOne(`${API}/col-1/share`);
    expect(req.request.body.shareWithUserIds).toBeUndefined();
    req.flush(null);
  });

  it('should use collectionId from dto in the share URL', () => {
    service.share({ userId: 'u1', collectionId: 'col-8' }).subscribe();

    const req = httpMock.expectOne(`${API}/col-8/share`);
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });
});
