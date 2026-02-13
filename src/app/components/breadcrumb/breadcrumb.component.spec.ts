import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { BreadcrumbComponent } from './breadcrumb.component';
import { BreadcrumbService } from '@/app/service/breadcrumb.service';

describe('BreadcrumbComponent', () => {
  let component: BreadcrumbComponent;
  let fixture: ComponentFixture<BreadcrumbComponent>;
  let breadcrumbServiceSpy: jasmine.SpyObj<BreadcrumbService>;

  const mockBreadcrumbs = [
    { label: 'Home', url: '/' },
    { label: 'Dishes', url: '/dishes' },
    { label: 'Pizza', url: '/dishes/pizza' }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('BreadcrumbService', [], {
      breadcrumbs: mockBreadcrumbs,
      breadcrumbs$: new BehaviorSubject(mockBreadcrumbs)
    });

    await TestBed.configureTestingModule({
      imports: [BreadcrumbComponent, RouterModule.forRoot([])],
      providers: [
        { provide: BreadcrumbService, useValue: spy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BreadcrumbComponent);
    component = fixture.componentInstance;
    breadcrumbServiceSpy = TestBed.inject(BreadcrumbService) as jasmine.SpyObj<BreadcrumbService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize breadcrumbs on ngOnInit', () => {
    component.ngOnInit();
    expect(component.breadcrumbs).toEqual(mockBreadcrumbs);
  });

  it('should subscribe to breadcrumb changes on ngOnInit', () => {
    const newBreadcrumbs = [{ label: 'New Page', url: '/new' }];
    component.ngOnInit();

    (breadcrumbServiceSpy.breadcrumbs$ as BehaviorSubject<any>).next(newBreadcrumbs);

    expect(component.breadcrumbs).toEqual(newBreadcrumbs);
  });

  it('should unsubscribe on ngOnDestroy', () => {
    component.ngOnInit();
    spyOn(component.subscription, 'unsubscribe');

    component.ngOnDestroy();

    expect(component.subscription.unsubscribe).toHaveBeenCalled();
  });

  it('should render breadcrumbs correctly', () => {
    component.breadcrumbs = mockBreadcrumbs;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const nav = compiled.querySelector('nav');

    expect(nav).toBeTruthy();
    expect(nav?.textContent).toContain('Home');
    expect(nav?.textContent).toContain('Dishes');
    expect(nav?.textContent).toContain('Pizza');
  });
});
