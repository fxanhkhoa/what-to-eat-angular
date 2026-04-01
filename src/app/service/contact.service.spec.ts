import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ContactService } from './contact.service';
import { environment } from '@/environments/environment';

const API = `${environment.API_URL}/contact`;

const mockContact = {
  _id: 'c1',
  email: 'test@example.com',
  name: 'Tester',
  message: 'Hello',
  deleted: false,
};

describe('ContactService', () => {
  let service: ContactService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ContactService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── creation ──────────────────────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── findAll() ─────────────────────────────────────────────────────────────

  it('should GET all contacts with query params', () => {
    const mockPage = { data: [mockContact], total: 1, page: 1, limit: 10 };
    let result: any;

    service.findAll({ keyword: 'test', page: 1, limit: 10 } as any).subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('keyword')).toBe('test');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('10');
    req.flush(mockPage);

    expect(result).toEqual(mockPage);
  });

  it('should GET all contacts with empty query', () => {
    service.findAll({} as any).subscribe();

    const req = httpMock.expectOne((r) => r.url === API);
    expect(req.request.method).toBe('GET');
    req.flush({ data: [], total: 0, page: 1, limit: 10 });
  });

  // ── create() ──────────────────────────────────────────────────────────────

  it('should POST to create a contact', () => {
    const dto = { email: 'test@example.com', name: 'Tester', message: 'Hello' };
    let result: any;

    service.create(dto).subscribe((r) => (result = r));

    const req = httpMock.expectOne(API);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(mockContact);

    expect(result).toEqual(mockContact);
  });

  it('should include all required fields in POST body', () => {
    const dto = { email: 'a@b.com', name: 'Alice', message: 'Inquiry' };

    service.create(dto).subscribe();

    const req = httpMock.expectOne(API);
    expect(req.request.body.email).toBe('a@b.com');
    expect(req.request.body.name).toBe('Alice');
    expect(req.request.body.message).toBe('Inquiry');
    req.flush({ ...mockContact, ...dto });
  });

  // ── update() ──────────────────────────────────────────────────────────────

  it('should PATCH to update a contact by id', () => {
    const dto = { _id: 'c1', email: 'new@example.com', name: 'Updated', message: 'Updated msg' };
    let result: any;

    service.update('c1', dto).subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/c1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);
    req.flush({ ...mockContact, ...dto });

    expect(result.name).toBe('Updated');
  });

  it('should use the provided id in the PATCH URL', () => {
    service.update('contact-99', { _id: 'contact-99', email: 'x@y.com', name: 'X', message: 'Y' }).subscribe();

    const req = httpMock.expectOne(`${API}/contact-99`);
    expect(req.request.method).toBe('PATCH');
    req.flush(mockContact);
  });

  // ── findOne() ─────────────────────────────────────────────────────────────

  it('should GET a contact by id', () => {
    let result: any;

    service.findOne('c1').subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/c1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockContact);

    expect(result).toEqual(mockContact);
  });

  it('should use the provided id in the GET URL', () => {
    service.findOne('contact-42').subscribe();

    const req = httpMock.expectOne(`${API}/contact-42`);
    expect(req.request.method).toBe('GET');
    req.flush(mockContact);
  });

  // ── delete() ──────────────────────────────────────────────────────────────

  it('should DELETE a contact by id', () => {
    let result: any;

    service.delete('c1').subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/c1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockContact);

    expect(result).toEqual(mockContact);
  });

  it('should use the provided id in the DELETE URL', () => {
    service.delete('contact-77').subscribe();

    const req = httpMock.expectOne(`${API}/contact-77`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockContact);
  });
});
