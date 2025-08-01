import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteSectionComponent } from './quote-section.component';

describe('QuoteSectionComponent', () => {
  let component: QuoteSectionComponent;
  let fixture: ComponentFixture<QuoteSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuoteSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuoteSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
