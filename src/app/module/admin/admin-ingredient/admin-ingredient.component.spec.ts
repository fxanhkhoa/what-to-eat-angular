import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminIngredientComponent } from './admin-ingredient.component';

describe('AdminIngredientComponent', () => {
  let component: AdminIngredientComponent;
  let fixture: ComponentFixture<AdminIngredientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminIngredientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminIngredientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
