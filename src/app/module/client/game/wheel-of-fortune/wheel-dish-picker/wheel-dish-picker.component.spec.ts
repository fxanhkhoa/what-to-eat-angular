import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WheelDishPickerComponent } from './wheel-dish-picker.component';

describe('WheelDishPickerComponent', () => {
  let component: WheelDishPickerComponent;
  let fixture: ComponentFixture<WheelDishPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WheelDishPickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WheelDishPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
