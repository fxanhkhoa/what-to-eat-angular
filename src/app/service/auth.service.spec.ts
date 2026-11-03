import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { AuthService } from './auth.service';
import { PushNotificationService } from './push-notification.service';
import { environment } from '@/environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let pushNotifSpy: jasmine.SpyObj<PushNotificationService>;

  function setup(platformId: string = 'browser') {
    pushNotifSpy = jasmine.createSpyObj<PushNotificationService>(
      'PushNotificationService',
      ['requestPermission', 'getAndRegisterToken', 'deleteAndUnregisterToken']
    );
    pushNotifSpy.requestPermission.and.returnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: platformId },
        { provide: PushNotificationService, useValue: pushNotifSpy },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  }

  afterEach(() => {
    if (httpMock) httpMock.verify();
  });

  // ── creation ──────────────────────────────────────────────────────────────

  it('should be created', () => {
    setup();
    expect(service).toBeTruthy();
  });

  // ── login() ───────────────────────────────────────────────────────────────

  it('should fetch IP then POST to login with ip in body', () => {
    setup();
    const mockToken = { token: 'tok', refreshToken: 'ref' };
    let result: any;

    service.login('google-token').subscribe((r) => (result = r));

    const ipReq = httpMock.expectOne('https://robotic.dratini.tech/client-ip');
    expect(ipReq.request.method).toBe('GET');
    ipReq.flush({ ip: '1.2.3.4' });

    const loginReq = httpMock.expectOne(`${environment.API_URL}/auth/login`);
    expect(loginReq.request.method).toBe('POST');
    expect(loginReq.request.body).toEqual({ token: 'google-token', type: 'google', ip: '1.2.3.4' });
    loginReq.flush(mockToken);

    expect(result).toEqual(mockToken);
  });

  it('should use type parameter in login body', () => {
    setup();

    service.login('apple-token', 'apple').subscribe();

    const ipReq = httpMock.expectOne('https://robotic.dratini.tech/client-ip');
    ipReq.flush({ ip: '1.2.3.4' });

    const loginReq = httpMock.expectOne(`${environment.API_URL}/auth/login`);
    expect(loginReq.request.body.type).toBe('apple');
    loginReq.flush({ token: 't', refreshToken: 'r' });
  });

  it('should omit ip from login body when IP service returns empty string', () => {
    setup();

    service.login('google-token').subscribe();

    const ipReq = httpMock.expectOne('https://robotic.dratini.tech/client-ip');
    ipReq.flush({ ip: '' });

    const loginReq = httpMock.expectOne(`${environment.API_URL}/auth/login`);
    expect(loginReq.request.body).toEqual({ token: 'google-token', type: 'google' });
    expect(loginReq.request.body.ip).toBeUndefined();
    loginReq.flush({ token: 't', refreshToken: 'r' });
  });

  it('should fall back and omit ip when IP service errors', () => {
    setup();

    service.login('google-token').subscribe();

    const ipReq = httpMock.expectOne('https://robotic.dratini.tech/client-ip');
    ipReq.flush('error', { status: 500, statusText: 'Server Error' });

    const loginReq = httpMock.expectOne(`${environment.API_URL}/auth/login`);
    expect(loginReq.request.body).toEqual({ token: 'google-token', type: 'google' });
    loginReq.flush({ token: 't', refreshToken: 'r' });
  });

  it('should call requestPermission after login when in browser', fakeAsync(() => {
    setup('browser');

    service.login('google-token').subscribe();

    httpMock.expectOne('https://robotic.dratini.tech/client-ip').flush({ ip: '' });
    httpMock.expectOne(`${environment.API_URL}/auth/login`).flush({ token: 't', refreshToken: 'r' });

    tick();
    expect(pushNotifSpy.requestPermission).toHaveBeenCalled();
  }));

  it('should call getAndRegisterToken after login when permission granted', fakeAsync(() => {
    setup('browser');
    pushNotifSpy.requestPermission.and.returnValue(Promise.resolve(true));

    service.login('google-token').subscribe();

    httpMock.expectOne('https://robotic.dratini.tech/client-ip').flush({ ip: '' });
    httpMock.expectOne(`${environment.API_URL}/auth/login`).flush({ token: 't', refreshToken: 'r' });

    tick();
    expect(pushNotifSpy.getAndRegisterToken).toHaveBeenCalled();
  }));

  it('should not call getAndRegisterToken after login when permission denied', fakeAsync(() => {
    setup('browser');
    pushNotifSpy.requestPermission.and.returnValue(Promise.resolve(false));

    service.login('google-token').subscribe();

    httpMock.expectOne('https://robotic.dratini.tech/client-ip').flush({ ip: '' });
    httpMock.expectOne(`${environment.API_URL}/auth/login`).flush({ token: 't', refreshToken: 'r' });

    tick();
    expect(pushNotifSpy.getAndRegisterToken).not.toHaveBeenCalled();
  }));

  it('should not call requestPermission after login when on server', fakeAsync(() => {
    setup('server');

    service.login('google-token').subscribe();

    httpMock.expectOne('https://robotic.dratini.tech/client-ip').flush({ ip: '' });
    httpMock.expectOne(`${environment.API_URL}/auth/login`).flush({ token: 't', refreshToken: 'r' });

    tick();
    expect(pushNotifSpy.requestPermission).not.toHaveBeenCalled();
  }));

  // ── refreshToken() ────────────────────────────────────────────────────────

  it('should POST to refresh-token with the refresh token', () => {
    setup();
    const mockResult = { token: 'new-tok', refreshToken: 'new-ref' };
    let result: any;

    service.refreshToken('old-ref').subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${environment.API_URL}/auth/refresh-token`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ refreshToken: 'old-ref' });
    req.flush(mockResult);

    expect(result).toEqual(mockResult);
  });

  // ── logout() ──────────────────────────────────────────────────────────────

  it('should call deleteAndUnregisterToken when in browser on logout', () => {
    setup('browser');

    service.logout('ref-tok').subscribe();

    expect(pushNotifSpy.deleteAndUnregisterToken).toHaveBeenCalled();
    httpMock.expectOne(`${environment.API_URL}/auth/logout`).flush({});
  });

  it('should not call deleteAndUnregisterToken when on server on logout', () => {
    setup('server');

    service.logout('ref-tok').subscribe();

    expect(pushNotifSpy.deleteAndUnregisterToken).not.toHaveBeenCalled();
    httpMock.expectOne(`${environment.API_URL}/auth/logout`).flush({});
  });

  it('should POST to logout with the refresh token', () => {
    setup();

    service.logout('ref-tok').subscribe();

    const req = httpMock.expectOne(`${environment.API_URL}/auth/logout`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ refreshToken: 'ref-tok' });
    req.flush({});
  });

  // ── getProfileAPI() ───────────────────────────────────────────────────────

  it('should GET the profile endpoint', () => {
    setup();
    const mockUser = { id: '1', name: 'Test' } as any;
    let result: any;

    service.getProfileAPI().subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${environment.API_URL}/auth/profile`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);

    expect(result).toEqual(mockUser);
  });

  it('should call requestPermission after getProfileAPI when in browser', fakeAsync(() => {
    setup('browser');

    service.getProfileAPI().subscribe();

    httpMock.expectOne(`${environment.API_URL}/auth/profile`).flush({ id: '1' });

    tick();
    expect(pushNotifSpy.requestPermission).toHaveBeenCalled();
  }));

  it('should not call requestPermission after getProfileAPI when on server', fakeAsync(() => {
    setup('server');

    service.getProfileAPI().subscribe();

    httpMock.expectOne(`${environment.API_URL}/auth/profile`).flush({ id: '1' });

    tick();
    expect(pushNotifSpy.requestPermission).not.toHaveBeenCalled();
  }));

  // ── getProfile() / setProfile() ───────────────────────────────────────────

  it('should return an Observable from getProfile()', () => {
    setup();
    const obs = service.getProfile();
    expect(obs).toBeDefined();
    expect(typeof obs.subscribe).toBe('function');
  });

  it('should initially emit null from getProfile()', (done) => {
    setup();
    service.getProfile().subscribe((val) => {
      expect(val).toBeNull();
      done();
    });
  });

  it('should emit the new user after setProfile()', (done) => {
    setup();
    const mockUser = { id: '1', name: 'Alice' } as any;
    let count = 0;

    service.getProfile().subscribe((val) => {
      count++;
      if (count === 2) {
        expect(val).toEqual(mockUser);
        done();
      }
    });

    service.setProfile(mockUser);
  });

  it('should emit null after setProfile(null)', (done) => {
    setup();
    const mockUser = { id: '1', name: 'Alice' } as any;
    let emissions: any[] = [];

    service.getProfile().subscribe((val) => {
      emissions.push(val);
      if (emissions.length === 3) {
        expect(emissions).toEqual([null, mockUser, null]);
        done();
      }
    });

    service.setProfile(mockUser);
    service.setProfile(null);
  });
});
