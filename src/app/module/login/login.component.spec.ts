import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flushMicrotasks,
} from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, PLATFORM_ID } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import cookies from 'js-cookie';

import { LoginComponent } from './login.component';
import { AuthService } from '@/app/service/auth.service';
import { Cookies_Key } from '@/enum/cookies.enum';

// Fake JWTs — jwtDecode only base64-decodes the payload segment, it does NOT verify the signature.
// ADMIN payload: { exp: 9999999999, role_name: 'ADMIN' }
const ADMIN_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTksInJvbGVfbmFtZSI6IkFETUlOIn0.fake-sig';
// USER payload: { exp: 9999999999, role_name: 'USER' }
const USER_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTksInJvbGVfbmFtZSI6IlVTRVIifQ.fake-sig';

const mockUser = { _id: 'u1', name: 'Alice' } as any;

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteStub: { snapshot: { queryParams: any } };

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('AuthService', [
      'login',
      'getProfileAPI',
      'setProfile',
    ]);
    routerSpy = jasmine.createSpyObj('Router', [
      'navigate',
      'navigateByUrl',
      'createUrlTree',
      'serializeUrl',
    ]);
    routerSpy.createUrlTree.and.returnValue({} as any);
    routerSpy.serializeUrl.and.returnValue('');
    (routerSpy as any).events = of();

    activatedRouteStub = { snapshot: { queryParams: {} } };

    spyOn(cookies, 'get').and.returnValue(undefined as any);
    spyOn(cookies, 'set').and.stub();

    await TestBed.configureTestingModule({
      imports: [LoginComponent, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    })
      .overrideComponent(LoginComponent, { set: { schemas: [NO_ERRORS_SCHEMA] } })
      .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    // Stub Google-loading methods so ngOnInit doesn't touch the DOM/network
    spyOn(component, 'ensureGoogleScriptLoaded').and.returnValue(
      Promise.resolve()
    );
    spyOn(component, 'renderGoogleButton').and.stub();
    spyOn(component, 'initGoogleOneTap').and.stub();

    fixture.detectChanges();
  });

  // ── creation ──────────────────────────────────────────────────────────────────
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── ngOnInit — browser ────────────────────────────────────────────────────────
  it('should call ensureGoogleScriptLoaded on init in browser', () => {
    expect(component.ensureGoogleScriptLoaded).toHaveBeenCalled();
  });

  it('should call renderGoogleButton after Google script resolves', fakeAsync(() => {
    (component.renderGoogleButton as jasmine.Spy).calls.reset();
    component.ngOnInit();
    flushMicrotasks();
    expect(component.renderGoogleButton).toHaveBeenCalled();
  }));

  it('should call initGoogleOneTap after Google script resolves', fakeAsync(() => {
    (component.initGoogleOneTap as jasmine.Spy).calls.reset();
    component.ngOnInit();
    flushMicrotasks();
    expect(component.initGoogleOneTap).toHaveBeenCalled();
  }));

  // ── ngOnInit — server platform ────────────────────────────────────────────────
  it('should not call ensureGoogleScriptLoaded on server platform', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [LoginComponent, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    })
      .overrideComponent(LoginComponent, { set: { schemas: [NO_ERRORS_SCHEMA] } })
      .compileComponents();
    const f = TestBed.createComponent(LoginComponent);
    const c = f.componentInstance;
    spyOn(c, 'ensureGoogleScriptLoaded').and.returnValue(Promise.resolve());
    f.detectChanges();
    expect(c.ensureGoogleScriptLoaded).not.toHaveBeenCalled();
    TestBed.resetTestingModule();
  });

  // ── ensureGoogleScriptLoaded ──────────────────────────────────────────────────
  it('should resolve immediately when window.google is already loaded', async () => {
    (component.ensureGoogleScriptLoaded as jasmine.Spy).and.callThrough();
    (window as any).google = { accounts: {} };
    await expectAsync(component.ensureGoogleScriptLoaded()).toBeResolved();
    delete (window as any).google;
  });

  it('should append a script tag to head when Google is not loaded', fakeAsync(() => {
    (component.ensureGoogleScriptLoaded as jasmine.Spy).and.callThrough();
    delete (window as any).google;
    document.getElementById('google-signin-client')?.remove();

    component.ensureGoogleScriptLoaded();
    flushMicrotasks();

    const script = document.getElementById('google-signin-client');
    expect(script).toBeTruthy();
    script?.remove();
  }));

  // ── renderGoogleButton ────────────────────────────────────────────────────────
  it('should call google.accounts.id.initialize and renderButton when element exists', () => {
    (component.renderGoogleButton as jasmine.Spy).and.callThrough();
    const btn = document.createElement('div');
    btn.id = 'google-signin-btn';
    document.body.appendChild(btn);
    const initSpy = jasmine.createSpy('initialize');
    const renderButtonSpy = jasmine.createSpy('renderButton');
    (window as any).google = {
      accounts: { id: { initialize: initSpy, renderButton: renderButtonSpy } },
    };
    component.renderGoogleButton();
    expect(initSpy).toHaveBeenCalled();
    expect(renderButtonSpy).toHaveBeenCalled();
    btn.remove();
    delete (window as any).google;
  });

  it('renderGoogleButton should not throw when google is absent', () => {
    (component.renderGoogleButton as jasmine.Spy).and.callThrough();
    delete (window as any).google;
    expect(() => component.renderGoogleButton()).not.toThrow();
  });

  // ── initGoogleOneTap ──────────────────────────────────────────────────────────
  it('should call google.accounts.id.prompt when google is available', () => {
    (component.initGoogleOneTap as jasmine.Spy).and.callThrough();
    const promptSpy = jasmine.createSpy('prompt');
    (window as any).google = {
      accounts: {
        id: { initialize: jasmine.createSpy('initialize'), prompt: promptSpy },
      },
    };
    component.initGoogleOneTap();
    expect(promptSpy).toHaveBeenCalled();
    delete (window as any).google;
  });

  it('initGoogleOneTap should not throw when google is absent', () => {
    (component.initGoogleOneTap as jasmine.Spy).and.callThrough();
    delete (window as any).google;
    expect(() => component.initGoogleOneTap()).not.toThrow();
  });

  // ── handleCredentialResponse — no credential ──────────────────────────────────
  it('should log error and skip login when credential is absent', () => {
    spyOn(console, 'error');
    component.handleCredentialResponse({ credential: null });
    expect(console.error).toHaveBeenCalledWith(
      'No credential received from Google'
    );
    expect(authSpy.login).not.toHaveBeenCalled();
  });

  // ── handleCredentialResponse — with credential ────────────────────────────────
  it('should call authService.login with the credential', () => {
    authSpy.login.and.returnValue(
      of({ token: USER_TOKEN, refreshToken: USER_TOKEN })
    );
    authSpy.getProfileAPI.and.returnValue(of(mockUser));
    component.handleCredentialResponse({ credential: 'gsi-token-abc' });
    expect(authSpy.login).toHaveBeenCalledWith('gsi-token-abc');
  });

  it('should set TOKEN cookie with the access token', () => {
    authSpy.login.and.returnValue(
      of({ token: USER_TOKEN, refreshToken: USER_TOKEN })
    );
    authSpy.getProfileAPI.and.returnValue(of(mockUser));
    component.handleCredentialResponse({ credential: 'gsi-token-abc' });
    expect(cookies.set).toHaveBeenCalledWith(
      Cookies_Key.TOKEN,
      USER_TOKEN,
      jasmine.objectContaining({ expires: jasmine.any(Date) })
    );
  });

  it('should set REFRESH_TOKEN cookie with the refresh token', () => {
    authSpy.login.and.returnValue(
      of({ token: USER_TOKEN, refreshToken: USER_TOKEN })
    );
    authSpy.getProfileAPI.and.returnValue(of(mockUser));
    component.handleCredentialResponse({ credential: 'gsi-token-abc' });
    expect(cookies.set).toHaveBeenCalledWith(
      Cookies_Key.REFRESH_TOKEN,
      USER_TOKEN,
      jasmine.objectContaining({ expires: jasmine.any(Date) })
    );
  });

  it('should call getProfileAPI after login', () => {
    authSpy.login.and.returnValue(
      of({ token: USER_TOKEN, refreshToken: USER_TOKEN })
    );
    authSpy.getProfileAPI.and.returnValue(of(mockUser));
    component.handleCredentialResponse({ credential: 'gsi-token-abc' });
    expect(authSpy.getProfileAPI).toHaveBeenCalled();
  });

  it('should call setProfile with the returned user', () => {
    authSpy.login.and.returnValue(
      of({ token: USER_TOKEN, refreshToken: USER_TOKEN })
    );
    authSpy.getProfileAPI.and.returnValue(of(mockUser));
    component.handleCredentialResponse({ credential: 'gsi-token-abc' });
    expect(authSpy.setProfile).toHaveBeenCalledWith(mockUser);
  });

  // ── navigate ──────────────────────────────────────────────────────────────────
  it('navigate should not route when no token cookie', () => {
    (cookies.get as jasmine.Spy).and.returnValue(undefined as any);
    component.navigate();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
  });

  it('navigate should call navigateByUrl with decoded redirect URL', () => {
    activatedRouteStub.snapshot.queryParams = {
      redirect: encodeURIComponent('/favorites?sort=asc'),
    };
    (cookies.get as jasmine.Spy).and.returnValue(USER_TOKEN as any);
    component.navigate();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/favorites?sort=asc');
  });

  it('navigate should go to /admin when role_name is ADMIN', () => {
    activatedRouteStub.snapshot.queryParams = {};
    (cookies.get as jasmine.Spy).and.returnValue(ADMIN_TOKEN as any);
    component.navigate();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('navigate should go to / when role_name is not ADMIN', () => {
    activatedRouteStub.snapshot.queryParams = {};
    (cookies.get as jasmine.Spy).and.returnValue(USER_TOKEN as any);
    component.navigate();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });
});
