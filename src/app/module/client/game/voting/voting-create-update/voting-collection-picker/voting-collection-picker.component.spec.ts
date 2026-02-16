import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VotingCollectionPickerComponent } from './voting-collection-picker.component';

describe('VotingCollectionPickerComponent', () => {
  let component: VotingCollectionPickerComponent;
  let fixture: ComponentFixture<VotingCollectionPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VotingCollectionPickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VotingCollectionPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
