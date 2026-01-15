import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router, RedirectCommand } from '@angular/router';
import { AuthorizationService } from '../service/authorization.service';
import { AuthService } from '../service/auth.service';
import { firstValueFrom } from 'rxjs';
import cookies from 'js-cookie';
import { Cookies_Key } from '@/enum/cookies.enum';
import { jwtDecode } from 'jwt-decode';
import { JWTTokenPayload, RolePermission } from '@/types/auth.type';
import { isPlatformBrowser } from '@angular/common';

export const authorizationGuard: CanActivateFn = async (route, state) => {
  const authorizationService = inject(AuthorizationService);
  const authService = inject(AuthService);
  const platformId = inject<string>(PLATFORM_ID);
  const router = inject(Router);

  const isRunningInBrowser = isPlatformBrowser(platformId);

  if (!isRunningInBrowser) return true;
  const requirePermission = route.data['permissions'] as string[];

  let token = cookies.get(Cookies_Key.TOKEN);
  const refreshToken = cookies.get(Cookies_Key.REFRESH_TOKEN);

  // No token at all, redirect to login
  if (!token && !refreshToken) {
    const loginPath = router.parseUrl(
      '/login?redirect=' + encodeURIComponent(state.url)
    );
    return new RedirectCommand(loginPath);
  }

  let decoded: JWTTokenPayload | null = null;

  // Try to decode the token
  if (token) {
    try {
      decoded = jwtDecode<JWTTokenPayload>(token);
    } catch (error) {
      // Token is invalid, try to refresh
      console.log(
        'Invalid token in authorization guard, attempting refresh...'
      );
    }
  }

  // If token decode failed or no token, try to refresh
  if (!decoded && refreshToken) {
    try {
      const tokenResult = await firstValueFrom(
        authService.refreshToken(refreshToken)
      );

      // Save new tokens to cookies
      cookies.set(Cookies_Key.TOKEN, tokenResult.token, { expires: 7 });
      cookies.set(Cookies_Key.REFRESH_TOKEN, tokenResult.refreshToken, {
        expires: 30,
      });

      // Decode the new token
      token = tokenResult.token;
      decoded = jwtDecode<JWTTokenPayload>(token);
    } catch (error) {
      console.error('Token refresh failed in authorization guard:', error);
      // Clear all invalid tokens
      cookies.remove(Cookies_Key.TOKEN);
      cookies.remove(Cookies_Key.REFRESH_TOKEN);
      const loginPath = router.parseUrl(
        '/login?redirect=' + encodeURIComponent(state.url)
      );
      return new RedirectCommand(loginPath);
    }
  }

  // If still no decoded token, redirect to login
  if (!decoded) {
    cookies.remove(Cookies_Key.TOKEN);
    cookies.remove(Cookies_Key.REFRESH_TOKEN);
    const loginPath = router.parseUrl(
      '/login?redirect=' + encodeURIComponent(state.url)
    );
    return new RedirectCommand(loginPath);
  }

  try {
    const role = await firstValueFrom(
      authorizationService.findByName(decoded.role_name)
    );

    let result = true;
    requirePermission.forEach((e) => {
      if (!role?.permission.includes(e)) result = false;
    });

    // If user has valid token but insufficient permissions, redirect to forbidden page
    if (!result) {
      const forbiddenPath = router.parseUrl('/forbidden');
      return new RedirectCommand(forbiddenPath);
    }

    return result;
  } catch (error) {
    cookies.remove(Cookies_Key.TOKEN);
    cookies.remove(Cookies_Key.REFRESH_TOKEN);
    const loginPath = router.parseUrl(
      '/login?redirect=' + encodeURIComponent(state.url)
    );
    return new RedirectCommand(loginPath);
  }
};
