import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import cookies from 'js-cookie';
import { Cookies_Key } from '@/enum/cookies.enum';

const CONSENT_VALUE = 'accepted';
const CONSENT_EXPIRES_IN_DAYS = 90;

@Component({
  selector: 'app-cookie-consent-banner',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule],
  templateUrl: './cookie-consent-banner.component.html',
  styleUrl: './cookie-consent-banner.component.scss',
})
export class CookieConsentBannerComponent {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  isVisible = this.shouldShowBanner();

  acceptCookies(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    cookies.set(Cookies_Key.COOKIE_CONSENT, CONSENT_VALUE, {
      expires: CONSENT_EXPIRES_IN_DAYS,
      path: '/',
      sameSite: 'Lax',
    });

    localStorage.setItem(Cookies_Key.COOKIE_CONSENT, CONSENT_VALUE);
    this.isVisible = false;
  }

  private shouldShowBanner(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    if (this.router.url.startsWith('/admin')) {
      return false;
    }

    return cookies.get(Cookies_Key.COOKIE_CONSENT) !== CONSENT_VALUE;
  }
}
