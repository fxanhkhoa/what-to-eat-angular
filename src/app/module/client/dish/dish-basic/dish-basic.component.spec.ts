import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DishBasicComponent } from './dish-basic.component';

describe('DishBasicComponent', () => {
  let component: DishBasicComponent;
  let fixture: ComponentFixture<DishBasicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DishBasicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DishBasicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
