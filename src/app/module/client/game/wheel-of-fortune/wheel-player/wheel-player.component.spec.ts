import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WheelPlayerComponent } from './wheel-player.component';

describe('WheelPlayerComponent', () => {
  let component: WheelPlayerComponent;
  let fixture: ComponentFixture<WheelPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WheelPlayerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WheelPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
