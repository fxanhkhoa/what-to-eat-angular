import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

import { AdminRolePermissionComponent } from './admin-role-permission.component';
import { AuthorizationService } from '@/app/service/authorization.service';

const mockRolePermission = {
  _id: 'role-1',
  name: 'admin',
  permission: ['CREATE_DISH', 'UPDATE_DISH'],
  description: 'Administrator role',
  deleted: false,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('AdminRolePermissionComponent', () => {
  let component: AdminRolePermissionComponent;
  let fixture: ComponentFixture<AdminRolePermissionComponent>;
  let authServiceMock: jasmine.SpyObj<AuthorizationService>;
  let dialogOpenSpy: jasmine.Spy;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthorizationService', [
      'findAll',
      'delete',
    ]);
    authServiceMock.findAll.and.returnValue(
      of({ data: [mockRolePermission], count: 1 }) as any
    );
    authServiceMock.delete.and.returnValue(of(mockRolePermission) as any);

    await TestBed.configureTestingModule({
      imports: [AdminRolePermissionComponent, NoopAnimationsModule, RouterModule.forRoot([])],
      providers: [
        { provide: AuthorizationService, useValue: authServiceMock },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminRolePermissionComponent);
    component = fixture.componentInstance;

    // Spy on the component's own MatDialog instance (standalone components own their injected deps)
    dialogOpenSpy = spyOn((component as any).dialog, 'open').and.returnValue({
      afterClosed: () => of(false),
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit()', () => {
    it('should call loadData on browser platform', () => {
      expect(authServiceMock.findAll).toHaveBeenCalled();
    });

    it('should NOT call loadData on server platform', async () => {
      await TestBed.resetTestingModule();
      authServiceMock.findAll.calls.reset();

      await TestBed.configureTestingModule({
        imports: [AdminRolePermissionComponent, NoopAnimationsModule, RouterModule.forRoot([])],
        providers: [
          { provide: AuthorizationService, useValue: authServiceMock },
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      }).compileComponents();

      const serverFixture = TestBed.createComponent(AdminRolePermissionComponent);
      serverFixture.detectChanges();

      expect(authServiceMock.findAll).not.toHaveBeenCalled();
    });
  });

  // ─── loadData ─────────────────────────────────────────────────────────────

  describe('loadData()', () => {
    it('should call authorizationService.findAll with page, limit, and keyword', () => {
      component.pageIndex = 1;
      component.pageSize = 5;
      component.keyword = 'admin';
      component.loadData();
      expect(authServiceMock.findAll).toHaveBeenCalledWith(
        jasmine.objectContaining({ page: 1, limit: 5, keyword: 'admin' })
      );
    });

    it('should omit keyword when it is empty', () => {
      component.keyword = '';
      component.loadData();
      const callArg = authServiceMock.findAll.calls.mostRecent().args[0];
      expect(callArg.keyword).toBeUndefined();
    });

    it('should populate dataSource.data with the response', () => {
      expect(component.dataSource.data.length).toBe(1);
      expect(component.dataSource.data[0]._id).toBe('role-1');
    });

    it('should update totalCount from the response', () => {
      expect(component.totalCount).toBe(1);
    });
  });

  // ─── onSearch ─────────────────────────────────────────────────────────────

  describe('onSearch()', () => {
    it('should reset pageIndex to 0 and reload data', () => {
      component.pageIndex = 3;
      authServiceMock.findAll.calls.reset();
      component.onSearch();
      expect(component.pageIndex).toBe(0);
      expect(authServiceMock.findAll).toHaveBeenCalled();
    });
  });

  // ─── onPageChange ─────────────────────────────────────────────────────────

  describe('onPageChange()', () => {
    it('should update pageIndex, pageSize and reload data', () => {
      authServiceMock.findAll.calls.reset();
      const event: PageEvent = { pageIndex: 2, pageSize: 20, length: 100 };
      component.onPageChange(event);
      expect(component.pageIndex).toBe(2);
      expect(component.pageSize).toBe(20);
      expect(authServiceMock.findAll).toHaveBeenCalled();
    });
  });

  // ─── deleteRolePermission ─────────────────────────────────────────────────

  describe('deleteRolePermission()', () => {
    it('should open a confirmation dialog', () => {
      component.deleteRolePermission('role-1');
      expect(dialogOpenSpy).toHaveBeenCalled();
    });

    it('should NOT call delete when user cancels', () => {
      dialogOpenSpy.and.returnValue({ afterClosed: () => of(false) });
      component.deleteRolePermission('role-1');
      expect(authServiceMock.delete).not.toHaveBeenCalled();
    });

    it('should call authorizationService.delete when user confirms', () => {
      dialogOpenSpy.and.returnValue({ afterClosed: () => of(true) });
      component.deleteRolePermission('role-1');
      expect(authServiceMock.delete).toHaveBeenCalledWith('role-1');
    });

    it('should reload data after successful deletion', () => {
      dialogOpenSpy.and.returnValue({ afterClosed: () => of(true) });
      authServiceMock.findAll.calls.reset();
      component.deleteRolePermission('role-1');
      expect(authServiceMock.findAll).toHaveBeenCalled();
    });
  });

  // ─── displayedColumns ─────────────────────────────────────────────────────

  it('should declare the expected displayed columns', () => {
    expect(component.displayedColumns).toContain('name');
    expect(component.displayedColumns).toContain('permissions');
    expect(component.displayedColumns).toContain('actions');
  });
});
