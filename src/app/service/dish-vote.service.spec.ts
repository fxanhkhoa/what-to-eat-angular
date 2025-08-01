import { TestBed } from '@angular/core/testing';

import { DishVoteService } from './dish-vote.service';

describe('DishVoteService', () => {
  let service: DishVoteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DishVoteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
