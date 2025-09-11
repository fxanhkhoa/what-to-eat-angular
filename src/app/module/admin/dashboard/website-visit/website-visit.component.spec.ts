import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebsiteVisitComponent } from './website-visit.component';

describe('WebsiteVisitComponent', () => {
  let component: WebsiteVisitComponent;
  let fixture: ComponentFixture<WebsiteVisitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebsiteVisitComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebsiteVisitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
