import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngredientSectionComponent } from './ingredient-section.component';

describe('IngredientSectionComponent', () => {
  let component: IngredientSectionComponent;
  let fixture: ComponentFixture<IngredientSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngredientSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngredientSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
