import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminIngredientUpdateComponent } from './admin-ingredient-update.component';

describe('AdminIngredientUpdateComponent', () => {
  let component: AdminIngredientUpdateComponent;
  let fixture: ComponentFixture<AdminIngredientUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminIngredientUpdateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminIngredientUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
