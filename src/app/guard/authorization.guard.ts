import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthorizationService } from '../service/authorization.service';
import { firstValueFrom } from 'rxjs';
import cookies from 'js-cookie';
import { Cookies_Key } from '@/enum/cookies.enum';
import { jwtDecode } from 'jwt-decode';
import { JWTTokenPayload } from '@/types/auth.type';

export const authorizationGuard: CanActivateFn = async (route, state) => {
  const authorizationService = inject(AuthorizationService);
  const requirePermission = route.data['permissions'] as string[];

  const token = cookies.get(Cookies_Key.TOKEN);
  if (!token) return false;

  const decoded = jwtDecode<JWTTokenPayload>(token ?? '');

  const role = await firstValueFrom(
    authorizationService.findByName(decoded.role_name)
  );

  let result = true;
  requirePermission.forEach((e) => {
    if (!role.permission.includes(e)) result = false;
  });

  return result;
};
