import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedDishModalComponent } from './selected-dish-modal.component';

describe('SelectedDishModalComponent', () => {
  let component: SelectedDishModalComponent;
  let fixture: ComponentFixture<SelectedDishModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedDishModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectedDishModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
