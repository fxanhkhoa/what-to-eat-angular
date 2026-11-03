import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { BreadcrumbService } from './breadcrumb.service';

function makeRoute(
  segments: string[],
  breadcrumb: string | undefined,
  children: any[] = []
): any {
  return {
    snapshot: {
      url: segments.map((s) => ({ path: s })),
      data: breadcrumb !== undefined ? { breadcrumb } : {},
    },
    children,
  };
}

describe('BreadcrumbService', () => {
  let service: BreadcrumbService;
  let routerEvents$: Subject<any>;
  let rootRoute: any;

  function setup(root: any) {
    rootRoute = root;
    routerEvents$ = new Subject<any>();

    const routerSpy = {
      events: routerEvents$.asObservable(),
    };

    const activatedRouteSpy = { root: rootRoute };

    TestBed.configureTestingModule({
      providers: [
        BreadcrumbService,
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
    });

    service = TestBed.inject(BreadcrumbService);
  }

  function emitNavigationEnd() {
    routerEvents$.next(new NavigationEnd(1, '/test', '/test'));
  }

  // ── creation ──────────────────────────────────────────────────────────────

  it('should be created', () => {
    setup({ children: [] });
    expect(service).toBeTruthy();
  });

  it('should expose breadcrumbs$ as an observable', () => {
    setup({ children: [] });
    expect(typeof service.breadcrumbs$.subscribe).toBe('function');
  });

  it('should start with an empty breadcrumbs array', () => {
    setup({ children: [] });
    expect(service.breadcrumbs).toEqual([]);
  });

  // ── breadcrumbs getter ────────────────────────────────────────────────────

  it('should return current value via breadcrumbs getter', () => {
    setup({ children: [] });
    expect(service.breadcrumbs).toEqual([]);
  });

  // ── NavigationEnd reaction ────────────────────────────────────────────────

  it('should not update breadcrumbs before any NavigationEnd event', () => {
    const root = makeRoute([], 'Root', [makeRoute(['about'], 'About')]);
    setup(root);
    expect(service.breadcrumbs).toEqual([]);
  });

  it('should update breadcrumbs$ when a NavigationEnd event occurs', (done) => {
    const root = makeRoute([], 'Root', [makeRoute(['home'], 'Home')]);
    setup(root);

    service.breadcrumbs$.subscribe((crumbs) => {
      if (crumbs.length > 0) {
        expect(crumbs.length).toBe(1);
        done();
      }
    });

    emitNavigationEnd();
  });

  // ── createBreadcrumbs logic ───────────────────────────────────────────────

  it('should produce no breadcrumbs when root has no children', () => {
    setup({ children: [] });
    emitNavigationEnd();
    expect(service.breadcrumbs).toEqual([]);
  });

  it('should produce one breadcrumb for a single-level route', () => {
    const root = makeRoute([], undefined, [makeRoute(['about'], 'About')]);
    setup(root);
    emitNavigationEnd();

    expect(service.breadcrumbs).toEqual([{ label: 'About', url: '/about' }]);
  });

  it('should produce two breadcrumbs for a two-level route', () => {
    const child = makeRoute(['settings'], 'Settings');
    const parent = makeRoute(['profile'], 'Profile', [child]);
    const root = makeRoute([], undefined, [parent]);
    setup(root);
    emitNavigationEnd();

    expect(service.breadcrumbs).toEqual([
      { label: 'Profile', url: '/profile' },
      { label: 'Settings', url: '/profile/settings' },
    ]);
  });

  it('should skip URL segment when route URL is empty', () => {
    const child = makeRoute(['details'], 'Details');
    const emptySegment = makeRoute([], 'Empty', [child]);
    const root = makeRoute([], undefined, [emptySegment]);
    setup(root);
    emitNavigationEnd();

    expect(service.breadcrumbs[0].url).toBe('');
    expect(service.breadcrumbs[1].url).toBe('/details');
  });

  it('should include undefined breadcrumb label when route data has no breadcrumb key', () => {
    const root = makeRoute([], undefined, [makeRoute(['foo'], undefined)]);
    setup(root);
    emitNavigationEnd();

    expect(service.breadcrumbs[0].label).toBeUndefined();
  });

  it('should accumulate URL across nested levels', () => {
    const level3 = makeRoute(['edit'], 'Edit');
    const level2 = makeRoute(['posts'], 'Posts', [level3]);
    const level1 = makeRoute(['admin'], 'Admin', [level2]);
    const root = makeRoute([], undefined, [level1]);
    setup(root);
    emitNavigationEnd();

    expect(service.breadcrumbs).toEqual([
      { label: 'Admin', url: '/admin' },
      { label: 'Posts', url: '/admin/posts' },
      { label: 'Edit', url: '/admin/posts/edit' },
    ]);
  });

  it('should recalculate breadcrumbs on each NavigationEnd', () => {
    const rootA = makeRoute([], undefined, [makeRoute(['page-a'], 'Page A')]);
    setup(rootA);
    emitNavigationEnd();
    expect(service.breadcrumbs).toEqual([{ label: 'Page A', url: '/page-a' }]);

    // Simulate route change by updating root's children
    rootRoute.children = [makeRoute(['page-b'], 'Page B')];
    emitNavigationEnd();
    expect(service.breadcrumbs).toEqual([{ label: 'Page B', url: '/page-b' }]);
  });

  it('should emit on breadcrumbs$ for each NavigationEnd', () => {
    setup({ children: [] });
    const emissions: any[][] = [];
    service.breadcrumbs$.subscribe((c) => emissions.push(c));

    emitNavigationEnd();
    emitNavigationEnd();

    // initial emission + 2 NavigationEnd emissions
    expect(emissions.length).toBe(3);
  });

  it('should ignore non-NavigationEnd router events', () => {
    setup({ children: [] });
    routerEvents$.next({ type: 'NavigationStart' });
    expect(service.breadcrumbs).toEqual([]);
  });
});
