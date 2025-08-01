import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlippingCardPickerComponent } from './flipping-card-picker.component';

describe('FlippingCardPickerComponent', () => {
  let component: FlippingCardPickerComponent;
  let fixture: ComponentFixture<FlippingCardPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlippingCardPickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlippingCardPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
