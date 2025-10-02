import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router, NavigationEnd } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { of, Subject } from 'rxjs';
import { AppComponent } from './app.component';
import { AuthService } from './service/auth.service';
import { WebsiteVisitService } from './service/website-visit.service';
import { provideRouter } from '@angular/router';
import { User } from '@/types/user.type';
import cookies from 'js-cookie';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let websiteVisitService: jasmine.SpyObj<WebsiteVisitService>;
  let router: jasmine.SpyObj<Router>;
  let routerEventsSubject: Subject<any>;

  beforeEach(async () => {
    // Create spies for services
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getProfileAPI',
      'setProfile',
    ]);
    const websiteVisitServiceSpy = jasmine.createSpyObj('WebsiteVisitService', [
      'trackVisit',
    ]);
    
    routerEventsSubject = new Subject();
    const routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
      events: routerEventsSubject.asObservable(),
    });

    // Create mock user profile
    const mockUser: User = {
      _id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      roleName: 'user',
      deleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Setup default return values
    authServiceSpy.getProfileAPI.and.returnValue(of(mockUser));
    websiteVisitServiceSpy.trackVisit.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: WebsiteVisitService, useValue: websiteVisitServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: PLATFORM_ID, useValue: 'browser' },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    websiteVisitService = TestBed.inject(
      WebsiteVisitService
    ) as jasmine.SpyObj<WebsiteVisitService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Mock localStorage
    let store: { [key: string]: string } = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => store[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      store[key] = value;
    });
    spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
      delete store[key];
    });
    spyOn(localStorage, 'clear').and.callFake(() => {
      store = {};
    });

    // Mock cookies
    spyOn(cookies, 'get').and.returnValue(undefined as any);
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have the 'what-to-eat-angular' title`, () => {
    expect(component.title).toEqual('what-to-eat-angular');
  });

  it('should render router-outlet', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should render feedback-fab component', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-feedback-fab')).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call getProfile on init', () => {
      spyOn(component, 'getProfile');
      component.ngOnInit();
      expect(component.getProfile).toHaveBeenCalled();
    });

    it('should track website visit if not already visited', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);
      
      component.ngOnInit();
      
      expect(websiteVisitService.trackVisit).toHaveBeenCalled();
    });

    it('should not track website visit if already visited', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue('true');
      
      component.ngOnInit();
      
      expect(websiteVisitService.trackVisit).not.toHaveBeenCalled();
    });

    it('should set localStorage after tracking visit', (done) => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);
      
      component.ngOnInit();
      
      setTimeout(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('website_visited', 'true');
        done();
      }, 100);
    });

    it('should subscribe to router events for Google Analytics', () => {
      component.ngOnInit();
      
      expect(router.events).toBeTruthy();
    });

    it('should track navigation with Google Analytics if gtag is available', () => {
      (window as any).gtag = jasmine.createSpy('gtag');
      
      component.ngOnInit();
      routerEventsSubject.next(new NavigationEnd(1, '/test', '/test'));
      
      expect((window as any).gtag).toHaveBeenCalledWith(
        'config',
        'G-FWE0TE8LCZ',
        { page_path: '/test' }
      );
    });

    it('should not track navigation if gtag is not available', () => {
      (window as any).gtag = undefined;
      
      component.ngOnInit();
      routerEventsSubject.next(new NavigationEnd(1, '/test', '/test'));
      
      // Should not throw error
      expect(component).toBeTruthy();
    });
  });

  describe('getProfile', () => {
    it('should not get profile if no token exists', () => {
      (cookies.get as jasmine.Spy).and.returnValue(undefined as any);
      
      component.getProfile();
      
      expect(authService.getProfileAPI).not.toHaveBeenCalled();
    });

    it('should get profile if token exists', () => {
      (cookies.get as jasmine.Spy).and.returnValue('test-token');
      
      component.getProfile();
      
      expect(authService.getProfileAPI).toHaveBeenCalled();
    });

    it('should set profile on successful API call', (done) => {
      const mockProfile: User = {
        _id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        roleName: 'user',
        deleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (cookies.get as jasmine.Spy).and.returnValue('test-token');
      authService.getProfileAPI.and.returnValue(of(mockProfile));
      
      component.getProfile();
      
      setTimeout(() => {
        expect(authService.setProfile).toHaveBeenCalledWith(mockProfile);
        done();
      }, 100);
    });

    it('should handle error when getting profile', () => {
      (cookies.get as jasmine.Spy).and.returnValue('test-token');
      authService.getProfileAPI.and.returnValue(
        new (class {
          subscribe(callbacks: any) {
            callbacks.error(new Error('API Error'));
          }
        })() as any
      );
      
      spyOn(console, 'error');
      
      component.getProfile();
      
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching user profile:',
        jasmine.any(Error)
      );
    });
  });

  describe('Server-side rendering', () => {
    beforeEach(async () => {
      await TestBed.resetTestingModule();
      
      const authServiceSpy = jasmine.createSpyObj('AuthService', [
        'getProfileAPI',
        'setProfile',
      ]);
      const websiteVisitServiceSpy = jasmine.createSpyObj('WebsiteVisitService', [
        'trackVisit',
      ]);
      const routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
        events: of(),
      });

      await TestBed.configureTestingModule({
        imports: [AppComponent],
        providers: [
          { provide: AuthService, useValue: authServiceSpy },
          { provide: WebsiteVisitService, useValue: websiteVisitServiceSpy },
          { provide: Router, useValue: routerSpy },
          { provide: PLATFORM_ID, useValue: 'server' },
          provideRouter([]),
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
      websiteVisitService = TestBed.inject(
        WebsiteVisitService
      ) as jasmine.SpyObj<WebsiteVisitService>;
    });

    it('should not track website visit on server', () => {
      component.ngOnInit();
      expect(websiteVisitService.trackVisit).not.toHaveBeenCalled();
    });

    it('should not get profile on server', () => {
      component.getProfile();
      expect(authService.getProfileAPI).not.toHaveBeenCalled();
    });
  });
});
