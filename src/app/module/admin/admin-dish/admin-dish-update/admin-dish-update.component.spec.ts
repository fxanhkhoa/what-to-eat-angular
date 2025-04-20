import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDishUpdateComponent } from './admin-dish-update.component';

describe('AdminDishUpdateComponent', () => {
  let component: AdminDishUpdateComponent;
  let fixture: ComponentFixture<AdminDishUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDishUpdateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDishUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
