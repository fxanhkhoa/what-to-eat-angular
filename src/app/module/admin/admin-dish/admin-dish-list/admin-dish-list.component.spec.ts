import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDishListComponent } from './admin-dish-list.component';

describe('AdminDishListComponent', () => {
  let component: AdminDishListComponent;
  let fixture: ComponentFixture<AdminDishListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDishListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDishListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
