import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VotingChatComponent } from './voting-chat.component';

describe('VotingChatComponent', () => {
  let component: VotingChatComponent;
  let fixture: ComponentFixture<VotingChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VotingChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VotingChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
