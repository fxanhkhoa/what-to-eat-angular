import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router, RedirectCommand } from '@angular/router';
import { AuthorizationService } from '../service/authorization.service';
import { firstValueFrom } from 'rxjs';
import cookies from 'js-cookie';
import { Cookies_Key } from '@/enum/cookies.enum';
import { jwtDecode } from 'jwt-decode';
import { JWTTokenPayload, RolePermission } from '@/types/auth.type';
import { isPlatformBrowser } from '@angular/common';

export const authorizationGuard: CanActivateFn = async (route, state) => {
  const authorizationService = inject(AuthorizationService);
  const platformId = inject<string>(PLATFORM_ID);
  const router = inject(Router);

  const isRunningInBrowser = isPlatformBrowser(platformId);

  if (!isRunningInBrowser) return true;
  const requirePermission = route.data['permissions'] as string[];

  const token = cookies.get(Cookies_Key.TOKEN);
  if (!token) return false;

  const decoded = jwtDecode<JWTTokenPayload>(token ?? '');

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
    const loginPath = router.parseUrl('/login?redirect=' + encodeURIComponent(state.url));
    return new RedirectCommand(loginPath);
  }
};
