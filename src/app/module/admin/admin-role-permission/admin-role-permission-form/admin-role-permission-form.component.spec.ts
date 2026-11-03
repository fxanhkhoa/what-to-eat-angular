import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

import { AdminRolePermissionFormComponent } from './admin-role-permission-form.component';
import { AuthorizationService } from '@/app/service/authorization.service';
import { ToastService } from '@/app/shared/service/toast.service';

const mockAllPermissions = ['CREATE_DISH', 'UPDATE_DISH', 'REMOVE_DISH', 'CREATE_USER'];

const mockRolePermission: any = {
  _id: 'role-1',
  name: 'editor',
  permission: ['CREATE_DISH'],
  description: 'Editor role',
  deleted: false,
};

function buildActivatedRoute(id: string | null) {
  return {
    snapshot: {
      paramMap: {
        get: (key: string) => (key === 'id' ? id : null),
      },
    },
  };
}

describe('AdminRolePermissionFormComponent', () => {
  let component: AdminRolePermissionFormComponent;
  let fixture: ComponentFixture<AdminRolePermissionFormComponent>;
  let authServiceMock: jasmine.SpyObj<AuthorizationService>;
  let toastServiceMock: jasmine.SpyObj<ToastService>;
  let routerMock: jasmine.SpyObj<Router>;

  async function setupComponent(routeId: string | null) {
    authServiceMock = jasmine.createSpyObj('AuthorizationService', [
      'getAllPermissions',
      'findOne',
      'create',
      'update',
    ]);
    authServiceMock.getAllPermissions.and.returnValue(
      of({ data: mockAllPermissions, count: mockAllPermissions.length })
    );
    authServiceMock.findOne.and.returnValue(of(mockRolePermission));
    authServiceMock.create.and.returnValue(of(mockRolePermission));
    authServiceMock.update.and.returnValue(of(mockRolePermission));

    toastServiceMock = jasmine.createSpyObj('ToastService', [
      'showSuccess',
      'showError',
    ]);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [AdminRolePermissionFormComponent, NoopAnimationsModule],
      providers: [
        { provide: AuthorizationService, useValue: authServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: buildActivatedRoute(routeId) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminRolePermissionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await setupComponent(null);
  });

  // ─── create ──────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── form controls ────────────────────────────────────────────────────────

  describe('form', () => {
    it('should have name and description controls', () => {
      expect(component.form.get('name')).toBeTruthy();
      expect(component.form.get('description')).toBeTruthy();
    });

    it('should require name', () => {
      component.form.get('name')!.setValue('');
      expect(component.form.get('name')!.invalid).toBeTrue();
    });

    it('should fail if name is shorter than 3 characters', () => {
      component.form.get('name')!.setValue('ab');
      expect(component.form.get('name')!.invalid).toBeTrue();
    });

    it('should pass when name has at least 3 characters', () => {
      component.form.get('name')!.setValue('abc');
      expect(component.form.get('name')!.valid).toBeTrue();
    });

    it('should not require description', () => {
      component.form.get('description')!.setValue('');
      expect(component.form.get('description')!.valid).toBeTrue();
    });
  });

  // ─── ngOnInit (create mode) ───────────────────────────────────────────────

  describe('ngOnInit() — create mode', () => {
    it('should set isEdit to false when no id param', () => {
      expect(component.isEdit).toBeFalse();
    });

    it('should set rolePermissionId to null', () => {
      expect(component.rolePermissionId).toBeNull();
    });

    it('should call loadAllPermissions', () => {
      expect(authServiceMock.getAllPermissions).toHaveBeenCalled();
    });

    it('should NOT call findOne in create mode', () => {
      expect(authServiceMock.findOne).not.toHaveBeenCalled();
    });
  });

  // ─── ngOnInit (edit mode) ─────────────────────────────────────────────────

  describe('ngOnInit() — edit mode', () => {
    beforeEach(async () => {
      await TestBed.resetTestingModule();
      await setupComponent('role-1');
    });

    it('should set isEdit to true', () => {
      expect(component.isEdit).toBeTrue();
    });

    it('should set rolePermissionId', () => {
      expect(component.rolePermissionId).toBe('role-1');
    });

    it('should call findOne with the id', () => {
      expect(authServiceMock.findOne).toHaveBeenCalledWith('role-1');
    });

    it('should patch the form with the loaded role permission data', () => {
      expect(component.form.get('name')!.value).toBe('editor');
      expect(component.form.get('description')!.value).toBe('Editor role');
    });

    it('should populate selectedPermissions from the loaded data', () => {
      expect(component.selectedPermissions).toEqual(['CREATE_DISH']);
    });
  });

  // ─── loadAllPermissions ───────────────────────────────────────────────────

  describe('loadAllPermissions()', () => {
    it('should populate allPermissions', () => {
      expect(component.allPermissions).toEqual(mockAllPermissions);
    });

    it('should populate availablePermissions on success', () => {
      expect(component.availablePermissions.length).toBeGreaterThan(0);
    });

    it('should show error toast on failure', () => {
      authServiceMock.getAllPermissions.and.returnValue(
        throwError(() => new Error('network error'))
      );
      component.loadAllPermissions();
      expect(toastServiceMock.showError).toHaveBeenCalled();
    });
  });

  // ─── updateAvailablePermissions ───────────────────────────────────────────

  describe('updateAvailablePermissions()', () => {
    it('should exclude selectedPermissions from availablePermissions', () => {
      component.allPermissions = ['PERM_A', 'PERM_B', 'PERM_C'];
      component.selectedPermissions = ['PERM_B'];
      component.updateAvailablePermissions();
      expect(component.availablePermissions).toEqual(['PERM_A', 'PERM_C']);
    });

    it('should return all permissions when nothing is selected', () => {
      component.allPermissions = ['PERM_A', 'PERM_B'];
      component.selectedPermissions = [];
      component.updateAvailablePermissions();
      expect(component.availablePermissions).toEqual(['PERM_A', 'PERM_B']);
    });
  });

  // ─── removePermission ─────────────────────────────────────────────────────

  describe('removePermission()', () => {
    beforeEach(() => {
      component.allPermissions = ['PERM_A', 'PERM_B', 'PERM_C'];
      component.selectedPermissions = ['PERM_A', 'PERM_B'];
      component.updateAvailablePermissions();
    });

    it('should remove the permission from selectedPermissions', () => {
      component.removePermission('PERM_A');
      expect(component.selectedPermissions).not.toContain('PERM_A');
    });

    it('should update availablePermissions after removal', () => {
      component.removePermission('PERM_A');
      expect(component.availablePermissions).toContain('PERM_A');
    });

    it('should not modify selectedPermissions if permission is not found', () => {
      const before = [...component.selectedPermissions];
      component.removePermission('PERM_MISSING');
      expect(component.selectedPermissions).toEqual(before);
    });
  });

  // ─── onDrop ───────────────────────────────────────────────────────────────

  describe('onDrop()', () => {
    it('should reorder within the same container', () => {
      const data = ['PERM_A', 'PERM_B', 'PERM_C'];
      const container: any = { data };
      const event = {
        previousContainer: container,
        container,
        previousIndex: 0,
        currentIndex: 2,
      } as CdkDragDrop<string[]>;

      component.onDrop(event);

      expect(data[2]).toBe('PERM_A');
    });

    it('should transfer item between different containers and update availablePermissions', () => {
      component.allPermissions = ['PERM_A', 'PERM_B'];
      component.selectedPermissions = [];
      component.availablePermissions = ['PERM_A', 'PERM_B'];

      const prevData = component.availablePermissions;
      const currData = component.selectedPermissions;

      const event = {
        previousContainer: { data: prevData } as any,
        container: { data: currData } as any,
        previousIndex: 0,
        currentIndex: 0,
      } as CdkDragDrop<string[]>;

      component.onDrop(event);

      expect(currData).toContain('PERM_A');
    });
  });

  // ─── onSubmit — create ────────────────────────────────────────────────────

  describe('onSubmit() — create mode', () => {
    it('should mark form as touched when invalid', () => {
      component.form.get('name')!.setValue('');
      spyOn(component.form, 'markAllAsTouched');
      component.onSubmit();
      expect(component.form.markAllAsTouched).toHaveBeenCalled();
    });

    it('should NOT call create when form is invalid', () => {
      component.form.get('name')!.setValue('ab');
      component.onSubmit();
      expect(authServiceMock.create).not.toHaveBeenCalled();
    });

    it('should call authorizationService.create with correct dto', () => {
      component.form.setValue({ name: 'editor', description: 'desc' });
      component.selectedPermissions = ['CREATE_DISH'];
      component.onSubmit();
      expect(authServiceMock.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: 'editor',
          description: 'desc',
          permission: ['CREATE_DISH'],
        })
      );
    });

    it('should show success toast and navigate after create', () => {
      component.form.setValue({ name: 'editor', description: '' });
      component.onSubmit();
      expect(toastServiceMock.showSuccess).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/admin/role-permission']);
    });

    it('should show error toast and reset loading on create error', () => {
      authServiceMock.create.and.returnValue(throwError(() => new Error('fail')));
      component.form.setValue({ name: 'editor', description: '' });
      component.onSubmit();
      expect(toastServiceMock.showError).toHaveBeenCalled();
      expect(component.loading).toBeFalse();
    });
  });

  // ─── onSubmit — update ────────────────────────────────────────────────────

  describe('onSubmit() — edit mode', () => {
    beforeEach(async () => {
      await TestBed.resetTestingModule();
      await setupComponent('role-1');
    });

    it('should call authorizationService.update with correct dto', () => {
      component.form.setValue({ name: 'editor', description: 'desc' });
      component.selectedPermissions = ['CREATE_DISH', 'UPDATE_DISH'];
      component.onSubmit();
      expect(authServiceMock.update).toHaveBeenCalledWith(
        'role-1',
        jasmine.objectContaining({
          id: 'role-1',
          name: 'editor',
          description: 'desc',
          permission: ['CREATE_DISH', 'UPDATE_DISH'],
        })
      );
    });

    it('should show success toast and navigate after update', () => {
      component.form.setValue({ name: 'editor', description: '' });
      component.onSubmit();
      expect(toastServiceMock.showSuccess).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/admin/role-permission']);
    });

    it('should show error toast and reset loading on update error', () => {
      authServiceMock.update.and.returnValue(throwError(() => new Error('fail')));
      component.form.setValue({ name: 'editor', description: '' });
      component.onSubmit();
      expect(toastServiceMock.showError).toHaveBeenCalled();
      expect(component.loading).toBeFalse();
    });
  });

  // ─── loadRolePermission error ─────────────────────────────────────────────

  describe('loadRolePermission() — error', () => {
    beforeEach(async () => {
      await TestBed.resetTestingModule();

      authServiceMock = jasmine.createSpyObj('AuthorizationService', [
        'getAllPermissions',
        'findOne',
        'create',
        'update',
      ]);
      authServiceMock.getAllPermissions.and.returnValue(
        of({ data: mockAllPermissions, count: mockAllPermissions.length })
      );
      authServiceMock.findOne.and.returnValue(
        throwError(() => new Error('not found'))
      );
      authServiceMock.create.and.returnValue(of(mockRolePermission));
      authServiceMock.update.and.returnValue(of(mockRolePermission));

      toastServiceMock = jasmine.createSpyObj('ToastService', [
        'showSuccess',
        'showError',
      ]);
      routerMock = jasmine.createSpyObj('Router', ['navigate']);

      await TestBed.configureTestingModule({
        imports: [AdminRolePermissionFormComponent, NoopAnimationsModule],
        providers: [
          { provide: AuthorizationService, useValue: authServiceMock },
          { provide: ToastService, useValue: toastServiceMock },
          { provide: Router, useValue: routerMock },
          { provide: ActivatedRoute, useValue: buildActivatedRoute('role-1') },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(AdminRolePermissionFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should show error toast when loadRolePermission fails', () => {
      expect(toastServiceMock.showError).toHaveBeenCalled();
    });

    it('should navigate away when loadRolePermission fails', () => {
      expect(routerMock.navigate).toHaveBeenCalledWith(['/admin/role-permission']);
    });
  });

  // ─── onCancel ─────────────────────────────────────────────────────────────

  describe('onCancel()', () => {
    it('should navigate to /admin/role-permission', () => {
      component.onCancel();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/admin/role-permission']);
    });
  });

  // ─── trackByPermission ────────────────────────────────────────────────────

  describe('trackByPermission()', () => {
    it('should return the permission string', () => {
      expect(component.trackByPermission(0, 'CREATE_DISH')).toBe('CREATE_DISH');
    });
  });
});
