import { TestBed } from '@angular/core/testing';

import { UserLoginTrackService } from './user-login-track.service';

describe('UserLoginTrackService', () => {
  let service: UserLoginTrackService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserLoginTrackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
