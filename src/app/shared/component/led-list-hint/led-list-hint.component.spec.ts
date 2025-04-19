import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LedListHintComponent } from './led-list-hint.component';

describe('LedListHintComponent', () => {
  let component: LedListHintComponent;
  let fixture: ComponentFixture<LedListHintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LedListHintComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LedListHintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
