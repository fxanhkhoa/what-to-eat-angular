import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DishFilterComponent } from './dish-filter.component';

describe('DishFilterComponent', () => {
  let component: DishFilterComponent;
  let fixture: ComponentFixture<DishFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DishFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DishFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
