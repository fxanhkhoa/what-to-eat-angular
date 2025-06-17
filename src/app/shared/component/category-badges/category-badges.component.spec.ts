import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryBadgesComponent } from './category-badges.component';

describe('CategoryBadgesComponent', () => {
  let component: CategoryBadgesComponent;
  let fixture: ComponentFixture<CategoryBadgesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryBadgesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryBadgesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
