import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthorizationService } from './authorization.service';
import { environment } from '@/environments/environment';

const API = `${environment.API_URL}/authorization`;

const mockRole = {
  _id: 'role-1',
  name: 'admin',
  permission: ['read', 'write'],
  deleted: false,
};

describe('AuthorizationService', () => {
  let service: AuthorizationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthorizationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── creation ──────────────────────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── findByName() ──────────────────────────────────────────────────────────

  it('should GET by name', () => {
    let result: any;
    service.findByName('admin').subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/by-name/admin`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRole);

    expect(result).toEqual(mockRole);
  });

  it('should encode the name in the URL', () => {
    service.findByName('super admin').subscribe();

    const req = httpMock.expectOne(`${API}/by-name/super admin`);
    req.flush(mockRole);
  });

  // ── findAll() ─────────────────────────────────────────────────────────────

  it('should GET all roles with query params', () => {
    const mockPage = { data: [mockRole], total: 1, page: 1, limit: 10 };
    let result: any;

    service.findAll({ keyword: 'admin', page: 1, limit: 10 } as any).subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('keyword')).toBe('admin');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('10');
    req.flush(mockPage);

    expect(result).toEqual(mockPage);
  });

  it('should GET all roles with empty query params', () => {
    service.findAll({} as any).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.method).toBe('GET');
    req.flush({ data: [], total: 0, page: 1, limit: 10 });
  });

  // ── create() ──────────────────────────────────────────────────────────────

  it('should POST to create a role', () => {
    const dto = { name: 'editor', permission: ['read'] };
    let result: any;

    service.create(dto).subscribe((r) => (result = r));

    const req = httpMock.expectOne(API);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({ ...mockRole, ...dto });

    expect(result.name).toBe('editor');
  });

  it('should POST create without optional fields', () => {
    const dto = { name: 'viewer' };

    service.create(dto).subscribe();

    const req = httpMock.expectOne(API);
    expect(req.request.body).toEqual({ name: 'viewer' });
    req.flush({ ...mockRole, name: 'viewer' });
  });

  // ── update() ──────────────────────────────────────────────────────────────

  it('should PATCH to update a role by id', () => {
    const dto = { id: 'role-1', name: 'super-admin', permission: ['read', 'write', 'delete'] };
    let result: any;

    service.update('role-1', dto).subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/role-1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);
    req.flush({ ...mockRole, ...dto });

    expect(result.name).toBe('super-admin');
  });

  // ── findOne() ─────────────────────────────────────────────────────────────

  it('should GET a role by id', () => {
    let result: any;

    service.findOne('role-1').subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/role-1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRole);

    expect(result).toEqual(mockRole);
  });

  // ── delete() ──────────────────────────────────────────────────────────────

  it('should DELETE a role by id', () => {
    let result: any;

    service.delete('role-1').subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/role-1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockRole);

    expect(result).toEqual(mockRole);
  });

  // ── getAllPermissions() ────────────────────────────────────────────────────

  it('should GET all permissions', () => {
    const mockPerms = { data: ['read', 'write', 'delete'], count: 3 };
    let result: any;

    service.getAllPermissions().subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/permissions/all`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPerms);

    expect(result).toEqual(mockPerms);
  });

  it('should return empty permissions list', () => {
    let result: any;

    service.getAllPermissions().subscribe((r) => (result = r));

    httpMock.expectOne(`${API}/permissions/all`).flush({ data: [], count: 0 });

    expect(result).toEqual({ data: [], count: 0 });
  });
});
