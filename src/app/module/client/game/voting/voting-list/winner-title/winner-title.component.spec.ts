import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WinnerTitleComponent } from './winner-title.component';

describe('WinnerTitleComponent', () => {
  let component: WinnerTitleComponent;
  let fixture: ComponentFixture<WinnerTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WinnerTitleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WinnerTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
