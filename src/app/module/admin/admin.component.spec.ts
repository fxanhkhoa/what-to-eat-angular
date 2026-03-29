import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { LOCALE_ID } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';

import { AdminComponent } from './admin.component';
import { AuthService } from '@/app/service/auth.service';
import { ToastService } from '@/app/shared/service/toast.service';
import { Cookies_Key } from '@/enum/cookies.enum';
import cookies from 'js-cookie';

// A minimal valid JWT with payload { id: 'u1', email: 'admin@test.com', roleName: 'admin', exp: 9999999999 }
const VALID_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  btoa(
    JSON.stringify({
      id: 'u1',
      email: 'admin@test.com',
      roleName: 'admin',
      exp: 9999999999,
    })
  ).replace(/=/g, '') +
  '.signature';

// Chrome's window.location is a native host object and cannot be redefined;
// tests that would trigger window.location.reload() use NEVER to prevent navigation.

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let toastServiceMock: jasmine.SpyObj<ToastService>;
  let breakpointObserverMock: jasmine.SpyObj<BreakpointObserver>;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['logout']);
    authServiceMock.logout.and.returnValue(of({}));

    toastServiceMock = jasmine.createSpyObj('ToastService', [
      'showSuccess',
      'showError',
    ]);

    breakpointObserverMock = jasmine.createSpyObj('BreakpointObserver', [
      'observe',
    ]);
    breakpointObserverMock.observe.and.returnValue(
      of({ matches: false, breakpoints: {} })
    );

    // Ensure no token cookie by default
    cookies.remove(Cookies_Key.TOKEN);
    cookies.remove(Cookies_Key.REFRESH_TOKEN);

    await TestBed.configureTestingModule({
      imports: [AdminComponent, NoopAnimationsModule, RouterModule.forRoot([])],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: BreakpointObserver, useValue: breakpointObserverMock },
        { provide: LOCALE_ID, useValue: 'en' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    // Prevent actual browser navigation from triggering in tests
    spyOn(component as any, 'navigateTo');
    spyOn(component as any, 'reloadPage');
    fixture.detectChanges();
  });

  afterEach(() => {
    cookies.remove(Cookies_Key.TOKEN);
    cookies.remove(Cookies_Key.REFRESH_TOKEN);
  });

  // ─── create ──────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit()', () => {
    it('should remove dark-theme class from body', () => {
      const renderer = (component as any).renderer;
      spyOn(renderer, 'removeClass');
      component.ngOnInit();
      expect(renderer.removeClass).toHaveBeenCalledWith(
        jasmine.anything(),
        'dark-theme'
      );
    });

    it('should leave payload undefined when no token cookie exists', () => {
      cookies.remove(Cookies_Key.TOKEN);
      component.ngOnInit();
      expect(component.payload).toBeUndefined();
    });

    it('should decode the JWT token into payload when cookie is present', () => {
      cookies.set(Cookies_Key.TOKEN, VALID_JWT);
      component.ngOnInit();
      expect(component.payload).toBeTruthy();
      expect((component.payload as any)?.email).toBe('admin@test.com');
    });
  });

  // ─── isHandset$ ───────────────────────────────────────────────────────────

  describe('isHandset$', () => {
    it('should emit false when breakpoint does not match', (done) => {
      component.isHandset$.subscribe((val) => {
        expect(val).toBeFalse();
        done();
      });
    });

    it('should emit true when breakpoint matches', async () => {
      await TestBed.resetTestingModule();

      breakpointObserverMock.observe.and.returnValue(
        of({ matches: true, breakpoints: {} })
      );

      await TestBed.configureTestingModule({
        imports: [AdminComponent, NoopAnimationsModule, RouterModule.forRoot([])],
        providers: [
          { provide: AuthService, useValue: authServiceMock },
          { provide: ToastService, useValue: toastServiceMock },
          { provide: BreakpointObserver, useValue: breakpointObserverMock },
          { provide: LOCALE_ID, useValue: 'en' },
        ],
      }).compileComponents();

      const newFixture = TestBed.createComponent(AdminComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      return new Promise<void>((resolve) => {
        newComponent.isHandset$.subscribe((val) => {
          expect(val).toBeTrue();
          resolve();
        });
      });
    });
  });

  // ─── currentLanguageObject getter ─────────────────────────────────────────

  describe('currentLanguageObject', () => {
    it('should return the language object matching currentLanguage', () => {
      component.currentLanguage = 'en';
      expect(component.currentLanguageObject?.name).toBe('English');
    });

    it('should return the Vietnamese language object', () => {
      component.currentLanguage = 'vi';
      expect(component.currentLanguageObject?.name).toBe('Vietnamese');
    });

    it('should return undefined for an unknown language code', () => {
      component.currentLanguage = 'de';
      expect(component.currentLanguageObject).toBeUndefined();
    });
  });

  // ─── availableLanguages ───────────────────────────────────────────────────

  it('should expose English and Vietnamese in availableLanguages', () => {
    const codes = component.availableLanguages.map((l) => l.code);
    expect(codes).toContain('en');
    expect(codes).toContain('vi');
  });

  // ─── changeLanguage ───────────────────────────────────────────────────────

  describe('changeLanguage()', () => {
    it('should NOT do anything when the same language is selected', () => {
      component.currentLanguage = 'en';
      spyOn(localStorage, 'setItem');
      component.changeLanguage('en');
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should update currentLanguage when a different language is selected', () => {
      component.currentLanguage = 'en';
      component.changeLanguage('vi');
      expect(component.currentLanguage).toBe('vi');
    });

    it('should store the selected language in localStorage', () => {
      component.currentLanguage = 'en';
      spyOn(localStorage, 'setItem');
      component.changeLanguage('vi');
      expect(localStorage.setItem).toHaveBeenCalledWith('preferredLanguage', 'vi');
    });

    it('should call navigateTo when a different language is selected', () => {
      component.currentLanguage = 'en';
      component.changeLanguage('vi');
      expect((component as any).navigateTo).toHaveBeenCalled();
    });
  });

  // ─── logout ───────────────────────────────────────────────────────────────

  describe('logout()', () => {
    it('should show error toast when no refresh token cookie exists', () => {
      cookies.remove(Cookies_Key.REFRESH_TOKEN);
      component.logout();
      expect(toastServiceMock.showError).toHaveBeenCalled();
      expect(authServiceMock.logout).not.toHaveBeenCalled();
    });

    it('should call authService.logout with the refresh token', () => {
      cookies.set(Cookies_Key.REFRESH_TOKEN, 'my-refresh-token');
      component.logout();
      expect(authServiceMock.logout).toHaveBeenCalledWith('my-refresh-token');
    });

    it('should clear token cookies on successful logout', () => {
      cookies.set(Cookies_Key.TOKEN, VALID_JWT);
      cookies.set(Cookies_Key.REFRESH_TOKEN, 'my-refresh-token');
      authServiceMock.logout.and.returnValue(of({}));
      component.logout();
      expect(cookies.get(Cookies_Key.TOKEN)).toBeUndefined();
      expect(cookies.get(Cookies_Key.REFRESH_TOKEN)).toBeUndefined();
    });

    it('should clear payload on successful logout', () => {
      cookies.set(Cookies_Key.REFRESH_TOKEN, 'my-refresh-token');
      component.payload = { id: 'u1' } as any;
      authServiceMock.logout.and.returnValue(of({}));
      component.logout();
      expect(component.payload).toBeUndefined();
    });

    it('should call reloadPage on successful logout', () => {
      cookies.set(Cookies_Key.REFRESH_TOKEN, 'my-refresh-token');
      authServiceMock.logout.and.returnValue(of({}));
      component.logout();
      expect((component as any).reloadPage).toHaveBeenCalled();
    });

    it('should log error when logout call fails', () => {
      cookies.set(Cookies_Key.REFRESH_TOKEN, 'my-refresh-token');
      authServiceMock.logout.and.returnValue(
        throwError(() => new Error('server error'))
      );
      spyOn(console, 'error');
      component.logout();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
