import { BASE_HEADER } from '@/constant/header.constant';
import { Cookies_Key } from '@/enum/cookies.enum';
import { HttpInterceptorFn } from '@angular/common/http';
import cookies from 'js-cookie';

export const bearerInterceptor: HttpInterceptorFn = (req, next) => {
  const token = cookies.get(Cookies_Key.TOKEN);

  let newReq = req.clone({
    headers: req.headers.append('Authorization', `Bearer ${token}`),
  });

  Object.keys(BASE_HEADER).forEach((key) => {
    newReq = newReq.clone({
      headers: newReq.headers.set(key, BASE_HEADER[key]),
    });
  });

  return next(newReq);
};
