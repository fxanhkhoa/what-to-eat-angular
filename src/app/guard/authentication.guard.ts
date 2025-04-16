import { Cookies_Key } from '@/enum/cookies.enum';
import { CanActivateFn } from '@angular/router';
import cookies from 'js-cookie';

export const authenticationGuard: CanActivateFn = (route, state) => {
  const token = cookies.get(Cookies_Key.TOKEN);
  if (token) return true;
  return false;
};
