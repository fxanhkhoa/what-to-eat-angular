import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, LOCALE_ID } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import cookies from 'js-cookie';

import { ClientComponent } from './client.component';
import { AuthService } from '@/app/service/auth.service';
import { AuthorizationService } from '@/app/service/authorization.service';
import { ToastService } from '@/app/shared/service/toast.service';
import { Permissions } from '@/constant/permission.constant';
import { Cookies_Key } from '@/enum/cookies.enum';
import { CategoryTranslatePipe } from '@/app/pipe/category-translate.pipe';
import { MatMenuModule } from '@angular/material/menu';

describe('ClientComponent', () => {
  let component: ClientComponent;
  let fixture: ComponentFixture<ClientComponent>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let authorizationSpy: jasmine.SpyObj<AuthorizationService>;
  let toastSpy: jasmine.SpyObj<ToastService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('AuthService', ['logout']);
    authorizationSpy = jasmine.createSpyObj('AuthorizationService', ['findByName']);
    toastSpy = jasmine.createSpyObj('ToastService', ['showSuccess', 'showError']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    spyOn(cookies, 'get').and.returnValue(undefined as any);
    spyOn(cookies, 'remove').and.stub();

    await TestBed.configureTestingModule({
      imports: [ClientComponent, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: AuthorizationService, useValue: authorizationSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: Router, useValue: routerSpy },
        { provide: LOCALE_ID, useValue: 'en' },
      ],
    })
      .overrideComponent(ClientComponent, {
        set: { imports: [CategoryTranslatePipe, MatMenuModule], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    spyOn(TestBed.inject(MatIconRegistry), 'addSvgIcon').and.stub();

    fixture = TestBed.createComponent(ClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    document.body.classList.remove('dark-theme', 'client-body');
  });

  // ── creation ───────────────────────────────────────────────────────────────────
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── initial state ──────────────────────────────────────────────────────────────
  it('currentLanguage should match provided LOCALE_ID', () => {
    expect(component.currentLanguage).toBe('en');
  });

  it('currentYear should equal the current year', () => {
    expect(component.currentYear).toBe(new Date().getFullYear());
  });

  it('availableLanguages should have 2 entries', () => {
    expect(component.availableLanguages.length).toBe(2);
  });

  it('isScrolled should default to false', () => {
    expect(component.isScrolled).toBeFalse();
  });

  it('isMenuOpen should default to false', () => {
    expect(component.isMenuOpen).toBeFalse();
  });

  it('hasAdminDashboardPermission should default to false', () => {
    expect(component.hasAdminDashboardPermission).toBeFalse();
  });

  it('payload should be undefined when no token cookie', () => {
    expect(component.payload).toBeUndefined();
  });

  // ── ngOnInit ───────────────────────────────────────────────────────────────────
  it('ngOnInit should add dark-theme class to body', () => {
    expect(document.body.classList.contains('dark-theme')).toBeTrue();
  });

  it('ngOnInit should add client-body class to body', () => {
    expect(document.body.classList.contains('client-body')).toBeTrue();
  });

  it('ngOnInit should populate mealCategories with 4 items', () => {
    expect(component.mealCategories.length).toBe(4);
  });

  it('ngOnInit mealCategories should contain unique values', () => {
    const unique = new Set(component.mealCategories);
    expect(unique.size).toBe(component.mealCategories.length);
  });

  // ── newsletterForm ─────────────────────────────────────────────────────────────
  it('newsletterForm email should be required', () => {
    component.newsletterForm.get('email')!.setValue('');
    expect(component.newsletterForm.get('email')!.hasError('required')).toBeTrue();
  });

  it('newsletterForm should be invalid for a malformed email', () => {
    component.newsletterForm.get('email')!.setValue('not-an-email');
    expect(component.newsletterForm.invalid).toBeTrue();
  });

  it('newsletterForm should be valid for a correct email', () => {
    component.newsletterForm.get('email')!.setValue('test@example.com');
    expect(component.newsletterForm.valid).toBeTrue();
  });

  // ── toggleMenu ─────────────────────────────────────────────────────────────────
  it('toggleMenu should set isMenuOpen to true', () => {
    component.toggleMenu();
    expect(component.isMenuOpen).toBeTrue();
  });

  it('toggleMenu should toggle isMenuOpen back to false', () => {
    component.isMenuOpen = true;
    component.toggleMenu();
    expect(component.isMenuOpen).toBeFalse();
  });

  // ── onScroll ───────────────────────────────────────────────────────────────────
  it('onScroll should set isScrolled to true when scrollY > 50', () => {
    Object.defineProperty(window, 'scrollY', { value: 100, configurable: true, writable: true });
    component.onScroll(new Event('scroll'));
    expect(component.isScrolled).toBeTrue();
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true, writable: true });
  });

  it('onScroll should set isScrolled to false when scrollY <= 50', () => {
    component.isScrolled = true;
    Object.defineProperty(window, 'scrollY', { value: 10, configurable: true, writable: true });
    component.onScroll(new Event('scroll'));
    expect(component.isScrolled).toBeFalse();
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true, writable: true });
  });

  // ── checkAdminPermission ───────────────────────────────────────────────────────
  it('checkAdminPermission should set hasAdminDashboardPermission true when permission present', () => {
    component.payload = { role_name: 'admin', name: 'Alice' } as any;
    authorizationSpy.findByName.and.returnValue(
      of({ permission: [Permissions.ADMIN_DASHBOARD] } as any)
    );
    component.checkAdminPermission();
    expect(component.hasAdminDashboardPermission).toBeTrue();
  });

  it('checkAdminPermission should set hasAdminDashboardPermission false when permission absent', () => {
    component.payload = { role_name: 'editor', name: 'Bob' } as any;
    authorizationSpy.findByName.and.returnValue(
      of({ permission: ['OTHER_PERMISSION'] } as any)
    );
    component.checkAdminPermission();
    expect(component.hasAdminDashboardPermission).toBeFalse();
  });

  it('checkAdminPermission should set hasAdminDashboardPermission false on error', () => {
    component.payload = { role_name: 'admin', name: 'Alice' } as any;
    component.hasAdminDashboardPermission = true;
    authorizationSpy.findByName.and.returnValue(throwError(() => new Error('error')));
    component.checkAdminPermission();
    expect(component.hasAdminDashboardPermission).toBeFalse();
  });

  it('checkAdminPermission should set false when payload has no role_name', () => {
    component.payload = { name: 'Alice' } as any;
    component.hasAdminDashboardPermission = true;
    component.checkAdminPermission();
    expect(component.hasAdminDashboardPermission).toBeFalse();
    expect(authorizationSpy.findByName).not.toHaveBeenCalled();
  });

  // ── hasPermission ──────────────────────────────────────────────────────────────
  it('hasPermission should return false when payload is undefined', () => {
    component.payload = undefined;
    expect(component.hasPermission(Permissions.ADMIN_DASHBOARD)).toBeFalse();
  });

  it('hasPermission should return true when admin and correct permission', () => {
    component.payload = { role_name: 'admin', name: 'Alice' } as any;
    component.hasAdminDashboardPermission = true;
    expect(component.hasPermission(Permissions.ADMIN_DASHBOARD)).toBeTrue();
  });

  it('hasPermission should return false for an unrecognised permission string', () => {
    component.payload = { role_name: 'admin', name: 'Alice' } as any;
    component.hasAdminDashboardPermission = true;
    expect(component.hasPermission('SOME_OTHER_PERMISSION')).toBeFalse();
  });

  // ── avatarFromPlaceholder ──────────────────────────────────────────────────────
  it('avatarFromPlaceholder should return Guest URL when payload is null', () => {
    component.payload = undefined;
    expect(component.avatarFromPlaceholder()).toContain('name=Guest');
  });

  it('avatarFromPlaceholder should return URL with name when payload is set', () => {
    component.payload = { name: 'John', role_name: 'user' } as any;
    expect(component.avatarFromPlaceholder()).toContain('name=John');
  });

  // ── getRandomMealCategories ────────────────────────────────────────────────────
  it('getRandomMealCategories should return exactly the requested count', () => {
    component.getRandomMealCategories(3);
    expect(component.mealCategories.length).toBe(3);
  });

  it('getRandomMealCategories should return unique values', () => {
    component.getRandomMealCategories(5);
    const unique = new Set(component.mealCategories);
    expect(unique.size).toBe(component.mealCategories.length);
  });

  // ── subscribeToNewsletter ──────────────────────────────────────────────────────
  it('subscribeToNewsletter should not throw when form is invalid', () => {
    component.newsletterForm.get('email')!.setValue('');
    expect(() => component.subscribeToNewsletter()).not.toThrow();
  });

  it('subscribeToNewsletter should log email when form is valid', () => {
    spyOn(console, 'log');
    component.newsletterForm.get('email')!.setValue('test@example.com');
    component.subscribeToNewsletter();
    expect(console.log).toHaveBeenCalledWith('Subscribing email:', 'test@example.com');
  });

  // ── goToProfile ────────────────────────────────────────────────────────────────
  it('goToProfile should navigate to /profile', () => {
    component.goToProfile();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/profile']);
  });

  // ── changeLanguage ─────────────────────────────────────────────────────────────
  it('changeLanguage should not update language when code is the same', () => {
    component.currentLanguage = 'en';
    component.changeLanguage('en');
    expect(component.currentLanguage).toBe('en');
  });

  it('changeLanguage should not call localStorage when code is the same', () => {
    spyOn(localStorage, 'setItem');
    component.currentLanguage = 'en';
    component.changeLanguage('en');
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  // ── logout ─────────────────────────────────────────────────────────────────────
  it('logout should show error toast when no refresh token', () => {
    (cookies.get as jasmine.Spy).and.returnValue(undefined as any);
    component.logout();
    expect(toastSpy.showError).toHaveBeenCalled();
    expect(authSpy.logout).not.toHaveBeenCalled();
  });

  it('logout should call authService.logout with the refresh token', () => {
    (cookies.get as jasmine.Spy).and.callFake((key: string) =>
      key === Cookies_Key.REFRESH_TOKEN ? 'refresh-abc' : (undefined as any)
    );
    authSpy.logout.and.returnValue(of({}));
    component.logout();
    expect(authSpy.logout).toHaveBeenCalledWith('refresh-abc');
  });

  it('logout should clear payload and navigate to / on success', () => {
    (cookies.get as jasmine.Spy).and.callFake((key: string) =>
      key === Cookies_Key.REFRESH_TOKEN ? 'refresh-abc' : (undefined as any)
    );
    authSpy.logout.and.returnValue(of({}));
    component.payload = { name: 'Alice', role_name: 'admin' } as any;
    component.hasAdminDashboardPermission = true;
    component.logout();
    expect(component.payload).toBeUndefined();
    expect(component.hasAdminDashboardPermission).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('logout should remove cookies on success', () => {
    (cookies.get as jasmine.Spy).and.callFake((key: string) =>
      key === Cookies_Key.REFRESH_TOKEN ? 'refresh-abc' : (undefined as any)
    );
    authSpy.logout.and.returnValue(of({}));
    component.logout();
    expect(cookies.remove).toHaveBeenCalledWith(Cookies_Key.TOKEN);
    expect(cookies.remove).toHaveBeenCalledWith(Cookies_Key.REFRESH_TOKEN);
  });
});
