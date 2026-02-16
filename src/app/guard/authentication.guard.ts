import { Cookies_Key } from '@/enum/cookies.enum';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import {
  CanActivateFn,
  RedirectCommand,
  Router,
} from '@angular/router';
import cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../service/auth.service';
import { firstValueFrom } from 'rxjs';

export const authenticationGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const platformId = inject<string>(PLATFORM_ID);
  const authService = inject(AuthService);

  const isRunningInBrowser = isPlatformBrowser(platformId);

  if (!isRunningInBrowser) return true;

  const token = cookies.get(Cookies_Key.TOKEN);
  const refreshToken = cookies.get(Cookies_Key.REFRESH_TOKEN);

  // No token at all, redirect to login
  if (!token && !refreshToken) {
    const loginPath = router.parseUrl(
      '/login?redirect=' + encodeURIComponent(state.url)
    );
    return new RedirectCommand(loginPath);
  }

  // Try to decode the token
  if (token) {
    try {
      jwtDecode(token);
      return true; // Token is valid
    } catch (error) {
      // Token is invalid, try to refresh
      console.log('Invalid token, attempting refresh...');
    }
  }

  // Try to refresh the token
  if (refreshToken) {
    try {
      const tokenResult = await firstValueFrom(authService.refreshToken(refreshToken));

      // Save new tokens to cookies
      cookies.set(Cookies_Key.TOKEN, tokenResult.token, { expires: 7 });
      cookies.set(Cookies_Key.REFRESH_TOKEN, tokenResult.refreshToken, { expires: 30 });

      return true; // Successfully refreshed
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear all invalid tokens
      cookies.remove(Cookies_Key.TOKEN);
      cookies.remove(Cookies_Key.REFRESH_TOKEN);
    }
  }

  // All attempts failed, redirect to login
  const loginPath = router.parseUrl(
    '/login?redirect=' + encodeURIComponent(state.url)
  );
  return new RedirectCommand(loginPath);
};
