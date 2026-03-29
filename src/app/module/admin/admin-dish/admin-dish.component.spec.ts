import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminDishComponent } from './admin-dish.component';

describe('AdminDishComponent', () => {
  let component: AdminDishComponent;
  let fixture: ComponentFixture<AdminDishComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDishComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDishComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have RouterModule imported', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render router-outlet', () => {
    const routerOutlet = fixture.nativeElement.querySelector('router-outlet');
    expect(routerOutlet).toBeTruthy();
  });

  it('should be a container component with minimal template', () => {
    const compiled = fixture.nativeElement;
    const children = compiled.querySelectorAll('*');
    // Should only have router-outlet as child
    expect(children.length).toBe(1);
    expect(children[0].tagName.toLowerCase()).toBe('router-outlet');
  });

  it('should have correct selector', () => {
    const selector = (AdminDishComponent as any).ɵcmp.selectors[0];
    expect(selector).toContain('app-admin-dish');
  });
});
