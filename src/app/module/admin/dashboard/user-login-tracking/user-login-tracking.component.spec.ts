import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserLoginTrackingComponent } from './user-login-tracking.component';

describe('UserLoginTrackingComponent', () => {
  let component: UserLoginTrackingComponent;
  let fixture: ComponentFixture<UserLoginTrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserLoginTrackingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserLoginTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
