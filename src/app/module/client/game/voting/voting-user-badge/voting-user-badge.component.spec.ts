import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VotingUserBadgeComponent } from './voting-user-badge.component';

describe('VotingUserBadgeComponent', () => {
  let component: VotingUserBadgeComponent;
  let fixture: ComponentFixture<VotingUserBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VotingUserBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VotingUserBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
