import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';

import { AdminIngredientComponent } from './admin-ingredient.component';

describe('AdminIngredientComponent', () => {
  let component: AdminIngredientComponent;
  let fixture: ComponentFixture<AdminIngredientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminIngredientComponent, RouterModule.forRoot([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminIngredientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a router-outlet', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('router-outlet')).toBeTruthy();
  });
});
