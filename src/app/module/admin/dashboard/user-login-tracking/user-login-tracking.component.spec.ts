import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';

import { UserLoginTrackingComponent } from './user-login-tracking.component';
import { UserLoginTrackService } from '@/app/service/user-login-track.service';
import { UserLoginTrack } from '@/types/user_login_track.type';
import { APIPagination } from '@/types/base.type';

describe('UserLoginTrackingComponent', () => {
  let component: UserLoginTrackingComponent;
  let fixture: ComponentFixture<UserLoginTrackingComponent>;
  let userLoginTrackServiceSpy: jasmine.SpyObj<UserLoginTrackService>;

  const loginMock: UserLoginTrack = {
    userId: 'user-1',
    loginAt: '2026-01-01T10:30:00.000Z',
    ip: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
  };

  const loginResponse: APIPagination<UserLoginTrack> = {
    data: [loginMock],
    count: 1,
  };

  beforeEach(async () => {
    userLoginTrackServiceSpy = jasmine.createSpyObj<UserLoginTrackService>(
      'UserLoginTrackService',
      ['findAll']
    );
    userLoginTrackServiceSpy.findAll.and.returnValue(of(loginResponse));

    await TestBed.configureTestingModule({
      imports: [UserLoginTrackingComponent],
      providers: [
        { provide: UserLoginTrackService, useValue: userLoginTrackServiceSpy },
      ],
    })
      // Keep unit tests focused on component logic only.
      .overrideComponent(UserLoginTrackingComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(UserLoginTrackingComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load login data on init', () => {
    fixture.detectChanges();

    expect(userLoginTrackServiceSpy.findAll).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
    });
    expect(component.dataSource.data).toEqual([loginMock]);
    expect(component.total).toBe(1);
  });

  it('should reload with updated paging when page changes', () => {
    const event: PageEvent = {
      length: 100,
      pageIndex: 2,
      pageSize: 20,
      previousPageIndex: 1,
    };

    component.onPageChange(event);

    expect(component.pageIndex).toBe(2);
    expect(component.pageSize).toBe(20);
    expect(userLoginTrackServiceSpy.findAll).toHaveBeenCalledWith({
      page: 3,
      limit: 20,
    });
  });

  it('should return stable trackBy key', () => {
    const key = component.trackByFn(0, loginMock);

    expect(key).toBe('user-1-2026-01-01T10:30:00.000Z');
  });

  it('should convert loginAt to timestamp in sorting accessor', () => {
    component.ngAfterViewInit();

    const result = component.dataSource.sortingDataAccessor(loginMock, 'loginAt');

    expect(result).toBe(new Date('2026-01-01T10:30:00.000Z').getTime());
  });

  it('should sort rows by loginAt in descending order', () => {
    component.ngAfterViewInit();

    const newerLogin: UserLoginTrack = {
      userId: 'user-2',
      loginAt: '2026-01-02T08:00:00.000Z',
      ip: '192.168.1.2',
      userAgent: 'Chrome',
    };
    const olderLogin: UserLoginTrack = {
      userId: 'user-3',
      loginAt: '2025-12-31T23:59:59.000Z',
      ip: '10.0.0.1',
      userAgent: 'Safari',
    };

    const sorted = component.dataSource.sortData([olderLogin, newerLogin], {
      active: 'loginAt',
      direction: 'desc',
    } as any);

    expect(sorted.map((item) => item.userId)).toEqual(['user-2', 'user-3']);
  });
});
