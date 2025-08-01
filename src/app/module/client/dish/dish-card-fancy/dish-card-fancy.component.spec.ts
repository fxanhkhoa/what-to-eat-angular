import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DishCardFancyComponent } from './dish-card-fancy.component';

describe('DishCardFancyComponent', () => {
  let component: DishCardFancyComponent;
  let fixture: ComponentFixture<DishCardFancyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DishCardFancyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DishCardFancyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
