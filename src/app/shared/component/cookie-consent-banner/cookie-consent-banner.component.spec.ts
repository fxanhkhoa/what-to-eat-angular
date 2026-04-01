import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CookieConsentBannerComponent } from './cookie-consent-banner.component';
import { PLATFORM_ID } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { Cookies_Key } from '@/enum/cookies.enum';
import cookies from 'js-cookie';

describe('CookieConsentBannerComponent', () => {
  let component: CookieConsentBannerComponent;
  let fixture: ComponentFixture<CookieConsentBannerComponent>;

  async function createComponent(platformId: string, routerUrl: string = '/') {
    await TestBed.configureTestingModule({
      imports: [CookieConsentBannerComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: platformId },
        provideRouter([]),
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    spyOnProperty(router, 'url', 'get').and.returnValue(routerUrl);

    fixture = TestBed.createComponent(CookieConsentBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    cookies.remove(Cookies_Key.COOKIE_CONSENT);
    localStorage.removeItem(Cookies_Key.COOKIE_CONSENT);
  });

  afterEach(() => {
    cookies.remove(Cookies_Key.COOKIE_CONSENT);
    localStorage.removeItem(Cookies_Key.COOKIE_CONSENT);
    TestBed.resetTestingModule();
  });

  // ── creation ──────────────────────────────────────────────────────────────

  it('should be created', async () => {
    await createComponent('browser');
    expect(component).toBeTruthy();
  });

  // ── isVisible initial state ───────────────────────────────────────────────

  it('should be visible on browser when no consent cookie is set', async () => {
    await createComponent('browser');
    expect(component.isVisible).toBeTrue();
  });

  it('should not be visible when consent cookie is already set', async () => {
    cookies.set(Cookies_Key.COOKIE_CONSENT, 'accepted');
    await createComponent('browser');
    expect(component.isVisible).toBeFalse();
  });

  it('should not be visible on server (non-browser platform)', async () => {
    await createComponent('server');
    expect(component.isVisible).toBeFalse();
  });

  it('should not be visible when url starts with /admin', async () => {
    await createComponent('browser', '/admin/dashboard');
    expect(component.isVisible).toBeFalse();
  });

  it('should be visible for non-admin routes even without consent', async () => {
    await createComponent('browser', '/home');
    expect(component.isVisible).toBeTrue();
  });

  // ── template rendering ────────────────────────────────────────────────────

  it('should render the banner section when isVisible is true', async () => {
    await createComponent('browser');
    const section = fixture.nativeElement.querySelector('section');
    expect(section).not.toBeNull();
  });

  it('should not render the banner section when isVisible is false', async () => {
    cookies.set(Cookies_Key.COOKIE_CONSENT, 'accepted');
    await createComponent('browser');
    const section = fixture.nativeElement.querySelector('section');
    expect(section).toBeNull();
  });

  it('should render an Accept button', async () => {
    await createComponent('browser');
    const button = fixture.nativeElement.querySelector('button');
    expect(button).not.toBeNull();
  });

  // ── acceptCookies() ───────────────────────────────────────────────────────

  it('should set the consent cookie when acceptCookies() is called', async () => {
    await createComponent('browser');
    component.acceptCookies();
    expect(cookies.get(Cookies_Key.COOKIE_CONSENT)).toBe('accepted');
  });

  it('should set the consent value in localStorage when acceptCookies() is called', async () => {
    await createComponent('browser');
    component.acceptCookies();
    expect(localStorage.getItem(Cookies_Key.COOKIE_CONSENT)).toBe('accepted');
  });

  it('should hide the banner after acceptCookies() is called', async () => {
    await createComponent('browser');
    expect(component.isVisible).toBeTrue();
    component.acceptCookies();
    expect(component.isVisible).toBeFalse();
  });

  it('should remove the banner from the DOM after acceptCookies()', async () => {
    await createComponent('browser');
    component.acceptCookies();
    fixture.detectChanges();
    const section = fixture.nativeElement.querySelector('section');
    expect(section).toBeNull();
  });

  it('should do nothing on server platform when acceptCookies() is called', async () => {
    await createComponent('server');
    component.acceptCookies();
    expect(cookies.get(Cookies_Key.COOKIE_CONSENT)).toBeUndefined();
    expect(localStorage.getItem(Cookies_Key.COOKIE_CONSENT)).toBeNull();
    expect(component.isVisible).toBeFalse();
  });

  it('should hide banner when Accept button is clicked', async () => {
    await createComponent('browser');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();
    expect(component.isVisible).toBeFalse();
    const section = fixture.nativeElement.querySelector('section');
    expect(section).toBeNull();
  });
});
