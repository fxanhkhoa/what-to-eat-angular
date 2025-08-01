import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ForbiddenComponent } from './forbidden.component';

describe('ForbiddenComponent', () => {
  let component: ForbiddenComponent;
  let fixture: ComponentFixture<ForbiddenComponent>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ForbiddenComponent],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForbiddenComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to home when goHome is called', () => {
    component.goHome();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should call window.history.back when goBack is called', () => {
    spyOn(window.history, 'back');
    component.goBack();
    expect(window.history.back).toHaveBeenCalled();
  });

  it('should render forbidden message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.forbidden-title')?.textContent).toContain('403');
    expect(compiled.querySelector('.forbidden-subtitle')?.textContent).toContain('Access Forbidden');
  });

  it('should have go back and go home buttons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('.btn');
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent?.trim()).toBe('Go Back');
    expect(buttons[1].textContent?.trim()).toBe('Go Home');
  });
});
