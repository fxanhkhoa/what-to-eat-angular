import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { UserInfoComponent } from './user-info.component';
import { UserService } from '@/app/service/user.service';

describe('UserInfoComponent', () => {
  let component: UserInfoComponent;
  let fixture: ComponentFixture<UserInfoComponent>;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['findOne']);
    userServiceSpy.findOne.and.returnValue(of({ name: 'John Doe', email: 'john@example.com' } as any));

    await TestBed.configureTestingModule({
      imports: [UserInfoComponent],
      providers: [{ provide: UserService, useValue: userServiceSpy }]
    }).compileComponents();

    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    fixture = TestBed.createComponent(UserInfoComponent);
    component = fixture.componentInstance;

    // set inputs before initial change detection so ngOnInit runs with them
    component.userId = 'u1';
    component.showingKeys = ['name', 'email'];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load and concatenate user info into `info` signal', () => {
    // the mocked service returns 'John Doe' and 'john@example.com', so info() should contain both
    expect(component.info()).toContain('John Doe');
    expect(component.info()).toContain('john@example.com');
  });
});
