import { Cookies_Key } from '@/enum/cookies.enum';
import { inject } from '@angular/core';
import {
  CanActivateFn,
  RedirectCommand,
  Router,
  UrlTree,
} from '@angular/router';
import cookies from 'js-cookie';

export const authenticationGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = cookies.get(Cookies_Key.TOKEN);
  if (token) return true;
  const loginPath = router.parseUrl('/login');
  return new RedirectCommand(loginPath, { skipLocationChange: true });
};
