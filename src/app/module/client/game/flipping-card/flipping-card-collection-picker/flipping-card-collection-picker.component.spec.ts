import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlippingCardCollectionPickerComponent } from './flipping-card-collection-picker.component';

describe('FlippingCardCollectionPickerComponent', () => {
  let component: FlippingCardCollectionPickerComponent;
  let fixture: ComponentFixture<FlippingCardCollectionPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlippingCardCollectionPickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlippingCardCollectionPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
