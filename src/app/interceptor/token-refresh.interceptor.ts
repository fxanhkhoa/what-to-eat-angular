import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take, Observable } from 'rxjs';
import { AuthService } from '@/app/service/auth.service';
import { Cookies_Key } from '@/enum/cookies.enum';
import { ResultToken } from '@/types/auth.type';
import cookies from 'js-cookie';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const tokenRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Check if error is 401 and we have a refresh token
      if (error.status === 401 && cookies.get(Cookies_Key.REFRESH_TOKEN)) {
        return handle401Error(req, next, authService, router);
      }
      
      return throwError(() => error);
    })
  );
};

function handle401Error(request: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService, router: Router) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = cookies.get(Cookies_Key.REFRESH_TOKEN);
    
    if (!refreshToken) {
      logout(router);
      return throwError(() => new Error('No refresh token available'));
    }

    return authService.refreshToken(refreshToken).pipe(
      switchMap((tokenResponse: ResultToken) => {
        isRefreshing = false;
        
        // Store new tokens
        cookies.set(Cookies_Key.TOKEN, tokenResponse.token);
        if (tokenResponse.refreshToken) {
          cookies.set(Cookies_Key.REFRESH_TOKEN, tokenResponse.refreshToken);
        }
        
        refreshTokenSubject.next(tokenResponse.token);
        
        // Retry the original request with new token
        const newRequest = request.clone({
          headers: request.headers.set('Authorization', `Bearer ${tokenResponse.token}`)
        });
        
        return next(newRequest);
      }),
      catchError((refreshError) => {
        isRefreshing = false;
        logout(router);
        return throwError(() => refreshError);
      })
    );
  } else {
    // If refresh is in progress, wait for the new token
    return refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(token => {
        const newRequest = request.clone({
          headers: request.headers.set('Authorization', `Bearer ${token}`)
        });
        return next(newRequest);
      })
    );
  }
}

function logout(router: Router) {
  // Clear tokens
  cookies.remove(Cookies_Key.TOKEN);
  cookies.remove(Cookies_Key.REFRESH_TOKEN);
  
  // Redirect to login page
  router.navigate(['/login']);
}
