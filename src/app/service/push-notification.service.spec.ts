import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { Messaging } from '@angular/fire/messaging';
import { PushNotificationService } from './push-notification.service';
import { environment } from '@/environments/environment';

const API = `${environment.API_URL}/notification`;

// ── helpers ───────────────────────────────────────────────────────────────────

function setup(platformId: string = 'browser', messaging: any = null) {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: PLATFORM_ID, useValue: platformId },
      { provide: Messaging, useValue: messaging },
    ],
  });
  return {
    service: TestBed.inject(PushNotificationService),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

describe('PushNotificationService', () => {
  let service: PushNotificationService;
  let httpMock: HttpTestingController;

  afterEach(() => {
    if (httpMock) httpMock.verify();
  });

  // ── creation ────────────────────────────────────────────────────────────────

  it('should be created on browser platform', () => {
    ({ service, httpMock } = setup('browser'));
    expect(service).toBeTruthy();
  });

  it('should be created on server platform', () => {
    ({ service, httpMock } = setup('server'));
    expect(service).toBeTruthy();
  });

  it('should expose unreadCount as an observable', () => {
    ({ service, httpMock } = setup('browser'));
    expect(typeof service.unreadCount.subscribe).toBe('function');
  });

  // ── requestPermission() ─────────────────────────────────────────────────────

  it('should return false when on server platform', async () => {
    ({ service, httpMock } = setup('server'));
    const result = await service.requestPermission();
    expect(result).toBe(false);
  });

  it('should return false when Notification API is unavailable', async () => {
    ({ service, httpMock } = setup('browser'));
    const original = (globalThis as any).Notification;
    (globalThis as any).Notification = undefined;
    const result = await service.requestPermission();
    expect(result).toBe(false);
    (globalThis as any).Notification = original;
  });

  it('should return true when Notification.requestPermission resolves to "granted"', async () => {
    ({ service, httpMock } = setup('browser'));
    spyOn(Notification, 'requestPermission').and.returnValue(Promise.resolve('granted' as NotificationPermission));
    const result = await service.requestPermission();
    expect(result).toBe(true);
  });

  it('should return false when Notification.requestPermission resolves to "denied"', async () => {
    ({ service, httpMock } = setup('browser'));
    spyOn(Notification, 'requestPermission').and.returnValue(Promise.resolve('denied' as NotificationPermission));
    const result = await service.requestPermission();
    expect(result).toBe(false);
  });

  it('should return false when Notification.requestPermission throws', async () => {
    ({ service, httpMock } = setup('browser'));
    spyOn(Notification, 'requestPermission').and.returnValue(Promise.reject(new Error('blocked')));
    const result = await service.requestPermission();
    expect(result).toBe(false);
  });

  // ── getAndRegisterToken() ───────────────────────────────────────────────────

  it('should return null when messaging is null', async () => {
    ({ service, httpMock } = setup('browser', null));
    const result = await service.getAndRegisterToken();
    expect(result).toBeNull();
  });

  it('should return null when on server platform', async () => {
    ({ service, httpMock } = setup('server', {}));
    const result = await service.getAndRegisterToken();
    expect(result).toBeNull();
  });

  // ── onForegroundMessage() ────────────────────────────────────────────────────

  it('should complete immediately when messaging is null', (done) => {
    ({ service, httpMock } = setup('browser', null));
    service.onForegroundMessage().subscribe({
      complete: () => done(),
    });
  });

  it('should return an Observable', () => {
    ({ service, httpMock } = setup('browser', null));
    const obs = service.onForegroundMessage();
    expect(typeof obs.subscribe).toBe('function');
  });

  // ── deleteAndUnregisterToken() ──────────────────────────────────────────────

  it('should return early when on server platform', async () => {
    ({ service, httpMock } = setup('server', {}));
    await expectAsync(service.deleteAndUnregisterToken()).toBeResolved();
  });

  it('should return early when messaging is null', async () => {
    ({ service, httpMock } = setup('browser', null));
    await expectAsync(service.deleteAndUnregisterToken()).toBeResolved();
  });

  // ── getNotifications() ────────────────────────────────────────────────────────

  it('should GET notifications with default page and limit', () => {
    ({ service, httpMock } = setup('browser'));
    const mockResp = { data: [], count: 0 };
    let result: any;

    service.getNotifications().subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.url === `${API}/`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('20');
    req.flush(mockResp);

    expect(result).toEqual(mockResp);
  });

  it('should GET notifications with custom page and limit', () => {
    ({ service, httpMock } = setup('browser'));

    service.getNotifications(3, 50).subscribe();

    const req = httpMock.expectOne((r) => r.url === `${API}/`);
    expect(req.request.params.get('page')).toBe('3');
    expect(req.request.params.get('limit')).toBe('50');
    req.flush({ data: [], count: 0 });
  });

  // ── getUnreadCount() ──────────────────────────────────────────────────────────

  it('should GET unread count and extract count field', () => {
    ({ service, httpMock } = setup('browser'));
    let result: any;

    service.getUnreadCount().subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/unread-count/`);
    expect(req.request.method).toBe('GET');
    req.flush({ count: 7 });

    expect(result).toBe(7);
  });

  // ── refreshUnreadCount() ──────────────────────────────────────────────────────

  it('should update unreadCount$ after refreshUnreadCount', fakeAsync(() => {
    ({ service, httpMock } = setup('browser'));
    let emitted: number | undefined;

    service.unreadCount.subscribe((c) => (emitted = c));
    service.refreshUnreadCount();

    httpMock.expectOne(`${API}/unread-count/`).flush({ count: 4 });
    tick();

    expect(emitted).toBe(4);
  }));

  it('should not throw when refreshUnreadCount HTTP call fails', fakeAsync(() => {
    ({ service, httpMock } = setup('browser'));

    service.refreshUnreadCount();

    httpMock
      .expectOne(`${API}/unread-count/`)
      .flush('error', { status: 500, statusText: 'Server Error' });
    tick();
    // no throw expected
    expect(true).toBe(true);
  }));

  // ── markAsRead() ──────────────────────────────────────────────────────────────

  it('should PUT to mark a notification as read', () => {
    ({ service, httpMock } = setup('browser'));

    service.markAsRead('notif-1').subscribe();

    const req = httpMock.expectOne(`${API}/notif-1/read/`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({});
    req.flush(null);
  });

  // ── markAllAsRead() ────────────────────────────────────────────────────────────

  it('should PUT to mark all notifications as read', () => {
    ({ service, httpMock } = setup('browser'));

    service.markAllAsRead().subscribe();

    const req = httpMock.expectOne(`${API}/read-all/`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({});
    req.flush(null);
  });

  // ── getPreferences() ──────────────────────────────────────────────────────────

  it('should GET preferences', () => {
    ({ service, httpMock } = setup('browser'));
    const mockPref = { userId: 'u1', chatEnabled: true, activityEnabled: true, marketingEnabled: false };
    let result: any;

    service.getPreferences().subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/preferences/`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPref);

    expect(result).toEqual(mockPref);
  });

  // ── updatePreferences() ───────────────────────────────────────────────────────

  it('should PUT to update preferences', () => {
    ({ service, httpMock } = setup('browser'));
    const dto = { chatEnabled: false };
    let result: any;

    service.updatePreferences(dto).subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/preferences/`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(dto);
    req.flush({ userId: 'u1', chatEnabled: false, activityEnabled: true, marketingEnabled: true });

    expect(result.chatEnabled).toBe(false);
  });

  // ── sendBroadcast() ───────────────────────────────────────────────────────────

  it('should POST to broadcast', () => {
    ({ service, httpMock } = setup('browser'));
    const dto = { title: 'Hello', body: 'World', type: 'marketing' as any };
    let result: any;

    service.sendBroadcast(dto).subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/broadcast/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({ message: 'sent' });

    expect(result).toEqual({ message: 'sent' });
  });

  // ── sendSegment() ─────────────────────────────────────────────────────────────

  it('should POST to segment', () => {
    ({ service, httpMock } = setup('browser'));
    const dto = { title: 'Hi', body: 'Segment', type: 'activity' as any, segmentFilter: { inactiveDays: 7 } };
    let result: any;

    service.sendSegment(dto).subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/segment/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({ message: 'sent' });

    expect(result).toEqual({ message: 'sent' });
  });

  // ── getAdminLogs() ────────────────────────────────────────────────────────────

  it('should GET admin logs with defaults', () => {
    ({ service, httpMock } = setup('browser'));
    const mockLogs = { data: [], total: 0, page: 1, limit: 20 };

    service.getAdminLogs().subscribe();

    const req = httpMock.expectOne((r) => r.url === `${API}/admin/logs/`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('20');
    expect(req.request.params.get('sentTo')).toBeNull();
    req.flush(mockLogs);
  });

  it('should include sentTo filter when provided', () => {
    ({ service, httpMock } = setup('browser'));

    service.getAdminLogs(1, 10, 'all').subscribe();

    const req = httpMock.expectOne((r) => r.url === `${API}/admin/logs/`);
    expect(req.request.params.get('sentTo')).toBe('all');
    req.flush({ data: [], total: 0, page: 1, limit: 10 });
  });

  // ── getTemplates() ────────────────────────────────────────────────────────────

  it('should GET templates with default page and limit', () => {
    ({ service, httpMock } = setup('browser'));

    service.getTemplates().subscribe();

    const req = httpMock.expectOne((r) => r.url === `${API}/templates/`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('50');
    req.flush({ data: [], total: 0, page: 1, limit: 50 });
  });

  // ── createTemplate() ──────────────────────────────────────────────────────────

  it('should POST to create a template', () => {
    ({ service, httpMock } = setup('browser'));
    const dto = { name: 'Welcome', title: 'Hi!', body: 'Welcome aboard', type: 'marketing' as any };
    let result: any;

    service.createTemplate(dto).subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/templates/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({ _id: 't1', ...dto });

    expect(result._id).toBe('t1');
  });

  // ── updateTemplate() ──────────────────────────────────────────────────────────

  it('should PUT to update a template by id', () => {
    ({ service, httpMock } = setup('browser'));
    const dto = { title: 'Updated Title' };
    let result: any;

    service.updateTemplate('t1', dto).subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/templates/t1/`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(dto);
    req.flush({ _id: 't1', ...dto });

    expect(result.title).toBe('Updated Title');
  });

  // ── deleteTemplate() ──────────────────────────────────────────────────────────

  it('should DELETE a template by id', () => {
    ({ service, httpMock } = setup('browser'));
    let result: any;

    service.deleteTemplate('t1').subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${API}/templates/t1/`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'deleted' });

    expect(result).toEqual({ message: 'deleted' });
  });
});
