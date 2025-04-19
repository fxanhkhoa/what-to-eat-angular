import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminIngredientListComponent } from './admin-ingredient-list.component';

describe('AdminIngredientListComponent', () => {
  let component: AdminIngredientListComponent;
  let fixture: ComponentFixture<AdminIngredientListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminIngredientListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminIngredientListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
