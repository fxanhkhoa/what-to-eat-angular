import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DishAnalyticComponent } from './dish-analytic.component';

describe('DishAnalyticComponent', () => {
  let component: DishAnalyticComponent;
  let fixture: ComponentFixture<DishAnalyticComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DishAnalyticComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DishAnalyticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
