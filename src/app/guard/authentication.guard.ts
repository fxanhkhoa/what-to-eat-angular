import { Cookies_Key } from '@/enum/cookies.enum';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import {
  CanActivateFn,
  RedirectCommand,
  Router,
  UrlTree,
} from '@angular/router';
import cookies from 'js-cookie';

export const authenticationGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject<string>(PLATFORM_ID);

  const isRunningInBrowser = isPlatformBrowser(platformId);

  if (!isRunningInBrowser) return true;
  const token = cookies.get(Cookies_Key.TOKEN);
  
  if (token) return true;
  const loginPath = router.parseUrl('/login');
  return new RedirectCommand(loginPath, { skipLocationChange: true });
};
