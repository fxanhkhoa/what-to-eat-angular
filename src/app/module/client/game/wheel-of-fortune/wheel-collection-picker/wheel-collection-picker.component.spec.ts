import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WheelCollectionPickerComponent } from './wheel-collection-picker.component';

describe('WheelCollectionPickerComponent', () => {
  let component: WheelCollectionPickerComponent;
  let fixture: ComponentFixture<WheelCollectionPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WheelCollectionPickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WheelCollectionPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
