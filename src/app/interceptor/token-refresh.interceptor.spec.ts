import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { tokenRefreshInterceptor } from './token-refresh.interceptor';
import { AuthService } from '@/app/service/auth.service';
import { Router } from '@angular/router';
import cookies from 'js-cookie';
import { Cookies_Key } from '@/enum/cookies.enum';

describe('tokenRefreshInterceptor', () => {
  const interceptor = (req: any, next: any) =>
    TestBed.runInInjectionContext(() => tokenRefreshInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: jasmine.createSpyObj('AuthService', ['refreshToken']) },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
      ],
    });
  });

  it('refreshes token and retries original request on 401 when refresh token exists', (done) => {
    const auth = TestBed.inject(AuthService) as any;
    const router = TestBed.inject(Router) as any;

    spyOn<any>(cookies, 'get').and.callFake((k: string) => {
      if (k === Cookies_Key.REFRESH_TOKEN) return 'refresh-abc';
      return null;
    });
    const setSpy = spyOn<any>(cookies, 'set');

    // auth.refreshToken returns new tokens
    (auth.refreshToken as jasmine.Spy).and.returnValue(of({ token: 'new-tok', refreshToken: 'new-refresh' }));

    // next handler: if Authorization header present with new token, succeed; otherwise fail with 401
    const req = new HttpRequest('GET', '/test');

    let calledWithReq: any = null;
    const next = (r: any) => {
      calledWithReq = r;
      const authHeader = r.headers.get('Authorization');
      if (authHeader === 'Bearer new-tok') {
        return of(new HttpResponse({ status: 200 }));
      }
      return throwError(() => new HttpErrorResponse({ status: 401 }));
    };

    interceptor(req, next).subscribe({
      next: (res: any) => {
        expect(res.status).toBe(200);
        // ensure the retried request had the new Authorization header
        expect(calledWithReq.headers.get('Authorization')).toBe('Bearer new-tok');

        // cookies.set should be called for the new tokens
        expect(setSpy).toHaveBeenCalledWith(Cookies_Key.TOKEN, 'new-tok');
        expect(setSpy).toHaveBeenCalledWith(Cookies_Key.REFRESH_TOKEN, 'new-refresh');

        // router shouldn't navigate
        expect(router.navigate).not.toHaveBeenCalled();
        done();
      },
      error: (err) => done.fail(err),
    });
  });

  it('rethrows the 401 error when no refresh token available', (done) => {
    const auth = TestBed.inject(AuthService) as any;
    const router = TestBed.inject(Router) as any;

    spyOn<any>(cookies, 'get').and.returnValue(undefined);
    const removeSpy = spyOn<any>(cookies, 'remove');

    const req = new HttpRequest('GET', '/test');

    const next = (r: any) => throwError(() => new HttpErrorResponse({ status: 401 }));

    interceptor(req, next).subscribe({
      next: () => done.fail('expected error'),
      error: (err) => {
        // When no refresh token, interceptor should not attempt logout or navigate — it should rethrow
        expect(removeSpy).not.toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
        // also refreshToken shouldn't be called
        expect(auth.refreshToken).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('logs out when refreshToken call fails', (done) => {
    const auth = TestBed.inject(AuthService) as any;
    const router = TestBed.inject(Router) as any;

    spyOn<any>(cookies, 'get').and.callFake((k: string) => (k === Cookies_Key.REFRESH_TOKEN ? 'refresh-abc' : null));
    const removeSpy = spyOn<any>(cookies, 'remove');

    (auth.refreshToken as jasmine.Spy).and.returnValue(throwError(() => new Error('refresh failed')));

    const req = new HttpRequest('GET', '/test');
    const next = (r: any) => throwError(() => new HttpErrorResponse({ status: 401 }));

    interceptor(req, next).subscribe({
      next: () => done.fail('expected error'),
      error: (err) => {
        expect(removeSpy).toHaveBeenCalledWith(Cookies_Key.TOKEN);
        expect(removeSpy).toHaveBeenCalledWith(Cookies_Key.REFRESH_TOKEN);
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
        done();
      },
    });
  });
});
