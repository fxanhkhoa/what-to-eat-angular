import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

import { AdminUserComponent } from './admin-user.component';
import { UserService } from '@/app/service/user.service';

const mockUser = {
  _id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  phone: '0123456789',
  roleName: 'admin',
  deleted: false,
  createdAt: '2024-01-01',
};

describe('AdminUserComponent', () => {
  let component: AdminUserComponent;
  let fixture: ComponentFixture<AdminUserComponent>;
  let userServiceMock: jasmine.SpyObj<UserService>;
  let dialogOpenSpy: jasmine.Spy;

  beforeEach(async () => {
    userServiceMock = jasmine.createSpyObj('UserService', ['findAll', 'remove']);
    userServiceMock.findAll.and.returnValue(
      of({ data: [mockUser], count: 1 }) as any
    );
    userServiceMock.remove.and.returnValue(of(undefined) as any);

    await TestBed.configureTestingModule({
      imports: [AdminUserComponent, NoopAnimationsModule, RouterModule.forRoot([])],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminUserComponent);
    component = fixture.componentInstance;

    // Standalone component owns its MatDialog — spy on private field before detectChanges
    dialogOpenSpy = spyOn((component as any).dialog, 'open').and.returnValue({
      afterClosed: () => of(false),
    });

    fixture.detectChanges();
  });

  // ─── create ──────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit()', () => {
    it('should call loadData on browser platform', () => {
      expect(userServiceMock.findAll).toHaveBeenCalled();
    });

    it('should NOT call loadData on server platform', async () => {
      await TestBed.resetTestingModule();
      userServiceMock.findAll.calls.reset();

      await TestBed.configureTestingModule({
        imports: [AdminUserComponent, NoopAnimationsModule, RouterModule.forRoot([])],
        providers: [
          { provide: UserService, useValue: userServiceMock },
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      }).compileComponents();

      const serverFixture = TestBed.createComponent(AdminUserComponent);
      serverFixture.detectChanges();

      expect(userServiceMock.findAll).not.toHaveBeenCalled();
    });
  });

  // ─── loadData ─────────────────────────────────────────────────────────────

  describe('loadData()', () => {
    it('should call userService.findAll with page and limit', () => {
      component.pageIndex = 0;
      component.pageSize = 5;
      component.loadData();
      expect(userServiceMock.findAll).toHaveBeenCalledWith(
        jasmine.objectContaining({ page: 1, limit: 5 }),
        jasmine.any(Object)
      );
    });

    it('should pass keyword in the query dto when set', () => {
      component.keyword = 'alice';
      component.loadData();
      expect(userServiceMock.findAll).toHaveBeenCalledWith(
        jasmine.any(Object),
        jasmine.objectContaining({ keyword: 'alice' })
      );
    });

    it('should omit keyword from query dto when empty', () => {
      component.keyword = '';
      component.loadData();
      const queryArg = userServiceMock.findAll.calls.mostRecent().args[1] as any;
      expect(queryArg.keyword).toBeUndefined();
    });

    it('should populate dataSource.data from the response', () => {
      expect(component.dataSource.data.length).toBe(1);
      expect(component.dataSource.data[0]._id).toBe('user-1');
    });

    it('should update totalCount from the response', () => {
      expect(component.totalCount).toBe(1);
    });
  });

  // ─── onSearch ─────────────────────────────────────────────────────────────

  describe('onSearch()', () => {
    it('should reset pageIndex to 0 and reload data', () => {
      component.pageIndex = 3;
      userServiceMock.findAll.calls.reset();
      component.onSearch();
      expect(component.pageIndex).toBe(0);
      expect(userServiceMock.findAll).toHaveBeenCalled();
    });
  });

  // ─── onPageChange ─────────────────────────────────────────────────────────

  describe('onPageChange()', () => {
    it('should update pageIndex, pageSize and reload data', () => {
      userServiceMock.findAll.calls.reset();
      const event: PageEvent = { pageIndex: 2, pageSize: 20, length: 100 };
      component.onPageChange(event);
      expect(component.pageIndex).toBe(2);
      expect(component.pageSize).toBe(20);
      expect(userServiceMock.findAll).toHaveBeenCalled();
    });
  });

  // ─── deleteUser ───────────────────────────────────────────────────────────

  describe('deleteUser()', () => {
    it('should open a confirmation dialog', () => {
      component.deleteUser('user-1');
      expect(dialogOpenSpy).toHaveBeenCalled();
    });

    it('should NOT call remove when user cancels', () => {
      dialogOpenSpy.and.returnValue({ afterClosed: () => of(false) });
      component.deleteUser('user-1');
      expect(userServiceMock.remove).not.toHaveBeenCalled();
    });

    it('should call userService.remove with the id when user confirms', () => {
      dialogOpenSpy.and.returnValue({ afterClosed: () => of(true) });
      component.deleteUser('user-1');
      expect(userServiceMock.remove).toHaveBeenCalledWith('user-1');
    });

    it('should reload data after successful deletion', () => {
      dialogOpenSpy.and.returnValue({ afterClosed: () => of(true) });
      userServiceMock.findAll.calls.reset();
      component.deleteUser('user-1');
      expect(userServiceMock.findAll).toHaveBeenCalled();
    });
  });

  // ─── displayedColumns ─────────────────────────────────────────────────────

  it('should declare the expected displayed columns', () => {
    expect(component.displayedColumns).toContain('name');
    expect(component.displayedColumns).toContain('email');
    expect(component.displayedColumns).toContain('roleName');
    expect(component.displayedColumns).toContain('actions');
  });
});
