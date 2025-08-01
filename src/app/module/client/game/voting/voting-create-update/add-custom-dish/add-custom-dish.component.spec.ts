import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCustomDishComponent } from './add-custom-dish.component';

describe('AddCustomDishComponent', () => {
  let component: AddCustomDishComponent;
  let fixture: ComponentFixture<AddCustomDishComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCustomDishComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCustomDishComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
