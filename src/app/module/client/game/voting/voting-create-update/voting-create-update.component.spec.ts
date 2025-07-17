import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VotingCreateUpdateComponent } from './voting-create-update.component';

describe('VotingCreateUpdateComponent', () => {
  let component: VotingCreateUpdateComponent;
  let fixture: ComponentFixture<VotingCreateUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VotingCreateUpdateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VotingCreateUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
