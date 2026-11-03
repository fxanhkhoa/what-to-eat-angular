import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest, HttpHeaders, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';

import { bearerInterceptor } from './bearer.interceptor';
import cookies from 'js-cookie';
import { Cookies_Key } from '@/enum/cookies.enum';
import { BASE_HEADER } from '@/constant/header.constant';

describe('bearerInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => bearerInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('adds Authorization header and base headers', (done) => {
    spyOn<any>(cookies, 'get').and.returnValue('tok-123');

    const req = new HttpRequest('GET', '/api/test');

    let captured: any = null;
    const next = (r: any) => {
      captured = r;
      return of(new HttpResponse({ status: 200 }));
    };

    interceptor(req, next).subscribe(() => {
      const auth = captured.headers.get('Authorization');
      expect(auth).toBe('Bearer tok-123');

      // BASE_HEADER keys must be present
      Object.keys(BASE_HEADER).forEach((k) => {
        expect(captured.headers.get(k)).toBe(BASE_HEADER[k]);
      });

      done();
    });
  });
});
