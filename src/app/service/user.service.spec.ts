import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { environment } from '@/environments/environment';

const API = `${environment.API_URL}/user`;

const mockUser: any = {
  _id: 'u1',
  email: 'test@example.com',
  name: 'Test User',
  roleName: 'user',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── creation ──────────────────────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── findOne() ─────────────────────────────────────────────────────────────

  it('should GET a user by id', () => {
    let result: any;

    service.findOne('u1').subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/u1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);

    expect(result).toEqual(mockUser);
  });

  it('should cache the result and make only one HTTP request for repeated calls', () => {
    let r1: any, r2: any;

    service.findOne('u1').subscribe((r) => (r1 = r));
    const req = httpMock.expectOne(`${API}/u1`);
    req.flush(mockUser);

    service.findOne('u1').subscribe((r) => (r2 = r));
    httpMock.expectNone(`${API}/u1`);

    expect(r1).toEqual(mockUser);
    expect(r2).toEqual(mockUser);
  });

  it('should make separate requests for different user ids', () => {
    service.findOne('u1').subscribe();
    httpMock.expectOne(`${API}/u1`).flush(mockUser);

    service.findOne('u2').subscribe();
    httpMock.expectOne(`${API}/u2`).flush({ ...mockUser, _id: 'u2' });
  });

  // ── findAll() ─────────────────────────────────────────────────────────────

  it('should GET all users without params', () => {
    const page = { data: [mockUser], total: 1, page: 1, limit: 10 };
    let result: any;

    service.findAll().subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.method).toBe('GET');
    req.flush(page);

    expect(result).toEqual(page);
  });

  it('should pass page and limit params', () => {
    service.findAll({ page: 2, limit: 20 }).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('20');
    req.flush({ data: [], total: 0, page: 2, limit: 20 });
  });

  it('should pass keyword query param', () => {
    service.findAll(undefined, { keyword: 'test' }).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.params.get('keyword')).toBe('test');
    req.flush({ data: [], total: 0, page: 1, limit: 10 });
  });

  it('should pass email query param', () => {
    service.findAll(undefined, { email: 'a@b.com' }).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.params.get('email')).toBe('a@b.com');
    req.flush({ data: [], total: 0, page: 1, limit: 10 });
  });

  it('should pass phoneNumber query param', () => {
    service.findAll(undefined, { phoneNumber: '0123' }).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.params.get('phoneNumber')).toBe('0123');
    req.flush({ data: [], total: 0, page: 1, limit: 10 });
  });

  it('should join roleName array into a comma-separated string', () => {
    service.findAll(undefined, { roleName: ['admin', 'user'] }).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.params.get('roleName')).toBe('admin,user');
    req.flush({ data: [], total: 0, page: 1, limit: 10 });
  });

  it('should omit roleName param when the array is empty', () => {
    service.findAll(undefined, { roleName: [] }).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.params.has('roleName')).toBeFalse();
    req.flush({ data: [], total: 0, page: 1, limit: 10 });
  });

  it('should pass all params together', () => {
    service.findAll({ page: 1, limit: 5 }, { keyword: 'foo', email: 'a@b.com', roleName: ['admin'] }).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('5');
    expect(req.request.params.get('keyword')).toBe('foo');
    expect(req.request.params.get('email')).toBe('a@b.com');
    expect(req.request.params.get('roleName')).toBe('admin');
    req.flush({ data: [], total: 0, page: 1, limit: 5 });
  });

  // ── create() ──────────────────────────────────────────────────────────────

  it('should POST to the base URL with the correct body', () => {
    const dto = { email: 'new@example.com', name: 'New User' };
    let result: any;

    service.create(dto).subscribe((r) => (result = r));

    const req = httpMock.expectOne(API);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(mockUser);

    expect(result).toEqual(mockUser);
  });

  // ── update() ──────────────────────────────────────────────────────────────

  it('should PATCH to /:id with body excluding id', () => {
    const dto = { id: 'u1', email: 'updated@example.com', name: 'Updated' };
    let result: any;

    service.update(dto).subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/u1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).not.toContain('id');
    expect(req.request.body['email']).toBe('updated@example.com');
    req.flush({ ...mockUser, name: 'Updated' });

    expect(result.name).toBe('Updated');
  });

  it('should not include id in the PATCH body', () => {
    service.update({ id: 'u1', email: 'a@b.com' }).subscribe();

    const req = httpMock.expectOne(`${API}/u1`);
    expect(req.request.body['id']).toBeUndefined();
    req.flush(mockUser);
  });

  // ── remove() ──────────────────────────────────────────────────────────────

  it('should DELETE to /:id', () => {
    let completed = false;

    service.remove('u1').subscribe(() => (completed = true));

    const req = httpMock.expectOne(`${API}/u1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(completed).toBeTrue();
  });

  // ── deleteUserData() ──────────────────────────────────────────────────────

  it('should DELETE to /:id/data', () => {
    let result: any;

    service.deleteUserData('u1').subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/u1/data`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'All user data deleted' });

    expect(result.message).toBe('All user data deleted');
  });
});
