import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DishSectionComponent } from './dish-section.component';

describe('DishSectionComponent', () => {
  let component: DishSectionComponent;
  let fixture: ComponentFixture<DishSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DishSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DishSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
