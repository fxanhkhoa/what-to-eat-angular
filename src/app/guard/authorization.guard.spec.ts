import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { authorizationGuard } from './authorization.guard';
import cookies from 'js-cookie';
import { Cookies_Key } from '@/enum/cookies.enum';
import { AuthService } from '@/app/service/auth.service';
import { AuthorizationService } from '@/app/service/authorization.service';
import { PLATFORM_ID } from '@angular/core';

describe('authorizationGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authorizationGuard(...guardParameters));

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('returns true when not running in browser', async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['parseUrl']);
    const authSpy = jasmine.createSpyObj('AuthService', ['refreshToken']);
    const authorizationSpy = jasmine.createSpyObj('AuthorizationService', ['findByName']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: AuthService, useValue: authSpy },
        { provide: AuthorizationService, useValue: authorizationSpy },
      ],
    });

    const result = await executeGuard(null as any, { url: '/protected' } as any);
    expect(result).toBeTrue();
  });

  it('redirects to login when no tokens are present', async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['parseUrl']);
    const authSpy = jasmine.createSpyObj('AuthService', ['refreshToken']);
    const authorizationSpy = jasmine.createSpyObj('AuthorizationService', ['findByName']);

    spyOn<any>(cookies, 'get').and.returnValue(undefined);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: AuthService, useValue: authSpy },
        { provide: AuthorizationService, useValue: authorizationSpy },
      ],
    });

    const state = { url: '/protected' } as any;
    const route: any = { data: { permissions: [] } };
    const result = await executeGuard(route as any, state);

    expect(routerSpy.parseUrl).toHaveBeenCalledWith(
      '/login?redirect=' + encodeURIComponent(state.url)
    );
    expect(result).not.toBeTrue();
  });

  it('refreshes token and allows when refresh succeeds and permissions include required', async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['parseUrl']);
    const authSpy = jasmine.createSpyObj('AuthService', ['refreshToken']);
    const validToken = 'e30.eyJyb2xlX25hbWUiOiJyb2xlMSJ9.sig';
    authSpy.refreshToken.and.returnValue(of({ token: validToken, refreshToken: 'newR' }));
    const authorizationSpy = jasmine.createSpyObj('AuthorizationService', ['findByName']);
    authorizationSpy.findByName.and.returnValue(of({ permission: ['perm1', 'perm2'] } as any));

    spyOn<any>(cookies, 'get').and.callFake((key: string) =>
      key === Cookies_Key.REFRESH_TOKEN ? 'refresh' : undefined
    );
    const setSpy = spyOn<any>(cookies, 'set').and.stub();

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: AuthService, useValue: authSpy },
        { provide: AuthorizationService, useValue: authorizationSpy },
      ],
    });

    // route.data.permissions should be provided by router, pass via route param
    const route: any = { data: { permissions: ['perm1'] } };
    const result = await executeGuard(route as any, { url: '/x' } as any);
    expect(result).toBeTrue();
    expect(setSpy).toHaveBeenCalledWith(Cookies_Key.TOKEN, validToken, { expires: 7 });
    expect(setSpy).toHaveBeenCalledWith(Cookies_Key.REFRESH_TOKEN, 'newR', { expires: 30 });
  });

  it('redirects to forbidden when permissions missing', async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['parseUrl']);
    const authSpy = jasmine.createSpyObj('AuthService', ['refreshToken']);
    const validToken2 = 'e30.eyJyb2xlX25hbWUiOiJyb2xlMSJ9.sig';
    authSpy.refreshToken.and.returnValue(of({ token: validToken2, refreshToken: 'newR' }));
    const authorizationSpy = jasmine.createSpyObj('AuthorizationService', ['findByName']);
    authorizationSpy.findByName.and.returnValue(of({ permission: ['perm-other'] } as any));

    spyOn<any>(cookies, 'get').and.callFake((key: string) =>
      key === Cookies_Key.REFRESH_TOKEN ? 'refresh' : undefined
    );

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: AuthService, useValue: authSpy },
        { provide: AuthorizationService, useValue: authorizationSpy },
      ],
    });

    const route: any = { data: { permissions: ['perm1'] } };
    const result = await executeGuard(route as any, { url: '/x' } as any);
    // result will be RedirectCommand; assert router.parseUrl called with /forbidden
    expect(routerSpy.parseUrl).toHaveBeenCalledWith('/forbidden');
    expect(result).not.toBeTrue();
  });

  it('redirects to login and clears cookies when refresh fails', async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['parseUrl']);
    const authSpy = jasmine.createSpyObj('AuthService', ['refreshToken']);
    authSpy.refreshToken.and.returnValue(throwError(() => new Error('fail')));
    const authorizationSpy = jasmine.createSpyObj('AuthorizationService', ['findByName']);

    spyOn<any>(cookies, 'get').and.callFake((key: string) =>
      key === Cookies_Key.REFRESH_TOKEN ? 'refresh' : undefined
    );
    const removeSpy = spyOn<any>(cookies, 'remove').and.stub();

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: AuthService, useValue: authSpy },
        { provide: AuthorizationService, useValue: authorizationSpy },
      ],
    });

    const state = { url: '/protected' } as any;
    const result = await executeGuard({ data: { permissions: ['p'] } } as any, state);

    expect(removeSpy).toHaveBeenCalledWith(Cookies_Key.TOKEN);
    expect(removeSpy).toHaveBeenCalledWith(Cookies_Key.REFRESH_TOKEN);
    expect(routerSpy.parseUrl).toHaveBeenCalledWith(
      '/login?redirect=' + encodeURIComponent(state.url)
    );
    expect(result).not.toBeTrue();
  });
});
