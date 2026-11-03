import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AdminUserFormComponent } from './admin-user-form.component';
import { UserService } from '@/app/service/user.service';
import { AuthorizationService } from '@/app/service/authorization.service';
import { ToastService } from '@/app/shared/service/toast.service';

const mockUser: any = {
  _id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  phone: '0123456789',
  address: '123 Main St',
  dateOfBirth: '2000-01-01T00:00:00.000Z',
  roleName: 'admin',
  deleted: false,
};

const mockRoles: any[] = [
  { name: 'admin' },
  { name: 'user' },
  { name: 'admin' }, // duplicate — should be de-duped
];

function buildActivatedRoute(id: string | null) {
  return {
    snapshot: {
      paramMap: { get: (key: string) => (key === 'id' ? id : null) },
    },
  };
}

describe('AdminUserFormComponent', () => {
  let component: AdminUserFormComponent;
  let fixture: ComponentFixture<AdminUserFormComponent>;
  let userServiceMock: jasmine.SpyObj<UserService>;
  let authServiceMock: jasmine.SpyObj<AuthorizationService>;
  let toastServiceMock: jasmine.SpyObj<ToastService>;
  let routerMock: jasmine.SpyObj<Router>;

  async function setupComponent(routeId: string | null, platformId = 'browser') {
    userServiceMock = jasmine.createSpyObj('UserService', [
      'findOne',
      'create',
      'update',
    ]);
    userServiceMock.findOne.and.returnValue(of(mockUser));
    userServiceMock.create.and.returnValue(of(mockUser));
    userServiceMock.update.and.returnValue(of(mockUser));

    authServiceMock = jasmine.createSpyObj('AuthorizationService', ['findAll']);
    authServiceMock.findAll.and.returnValue(
      of({ data: mockRoles, count: mockRoles.length }) as any
    );

    toastServiceMock = jasmine.createSpyObj('ToastService', [
      'showSuccess',
      'showError',
    ]);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [AdminUserFormComponent, NoopAnimationsModule],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: AuthorizationService, useValue: authServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: buildActivatedRoute(routeId) },
        { provide: PLATFORM_ID, useValue: platformId },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminUserFormComponent);
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
    it('should have all expected controls', () => {
      ['email', 'name', 'phone', 'address', 'dateOfBirth', 'roleName'].forEach(
        (ctrl) => expect(component.form.get(ctrl)).toBeTruthy()
      );
    });

    it('should require email', () => {
      component.form.get('email')!.setValue('');
      expect(component.form.get('email')!.invalid).toBeTrue();
    });

    it('should validate email format', () => {
      component.form.get('email')!.setValue('not-an-email');
      expect(component.form.get('email')!.invalid).toBeTrue();
    });

    it('should accept a valid email', () => {
      component.form.get('email')!.setValue('user@example.com');
      expect(component.form.get('email')!.valid).toBeTrue();
    });

    it('should require name', () => {
      component.form.get('name')!.setValue('');
      expect(component.form.get('name')!.invalid).toBeTrue();
    });

    it('should fail when name is shorter than 2 characters', () => {
      component.form.get('name')!.setValue('a');
      expect(component.form.get('name')!.invalid).toBeTrue();
    });

    it('should pass when name has at least 2 characters', () => {
      component.form.get('name')!.setValue('ab');
      expect(component.form.get('name')!.valid).toBeTrue();
    });

    it('should require roleName', () => {
      component.form.get('roleName')!.setValue('');
      expect(component.form.get('roleName')!.invalid).toBeTrue();
    });

    it('should not require phone, address, or dateOfBirth', () => {
      component.form.get('phone')!.setValue('');
      component.form.get('address')!.setValue('');
      component.form.get('dateOfBirth')!.setValue(null);
      expect(component.form.get('phone')!.valid).toBeTrue();
      expect(component.form.get('address')!.valid).toBeTrue();
      expect(component.form.get('dateOfBirth')!.valid).toBeTrue();
    });
  });

  // ─── ngOnInit — create mode ───────────────────────────────────────────────

  describe('ngOnInit() — create mode', () => {
    it('should set isEdit to false when no id param', () => {
      expect(component.isEdit).toBeFalse();
    });

    it('should set userId to null', () => {
      expect(component.userId).toBeNull();
    });

    it('should call loadRoles', () => {
      expect(authServiceMock.findAll).toHaveBeenCalled();
    });

    it('should NOT call userService.findOne in create mode', () => {
      expect(userServiceMock.findOne).not.toHaveBeenCalled();
    });
  });

  // ─── ngOnInit — server platform ───────────────────────────────────────────

  describe('ngOnInit() — server platform', () => {
    beforeEach(async () => {
      await TestBed.resetTestingModule();
      await setupComponent(null, 'server');
    });

    it('should NOT call loadRoles on server', () => {
      expect(authServiceMock.findAll).not.toHaveBeenCalled();
    });

    it('should NOT call findOne on server', () => {
      expect(userServiceMock.findOne).not.toHaveBeenCalled();
    });
  });

  // ─── ngOnInit — edit mode ─────────────────────────────────────────────────

  describe('ngOnInit() — edit mode', () => {
    beforeEach(async () => {
      await TestBed.resetTestingModule();
      await setupComponent('user-1');
    });

    it('should set isEdit to true', () => {
      expect(component.isEdit).toBeTrue();
    });

    it('should set userId', () => {
      expect(component.userId).toBe('user-1');
    });

    it('should call userService.findOne with the id', () => {
      expect(userServiceMock.findOne).toHaveBeenCalledWith('user-1');
    });

    it('should patch the form with loaded user data', () => {
      expect(component.form.get('email')!.value).toBe('test@example.com');
      expect(component.form.get('name')!.value).toBe('Test User');
      expect(component.form.get('phone')!.value).toBe('0123456789');
      expect(component.form.get('address')!.value).toBe('123 Main St');
    });

    it('should set roleName from the loaded user', () => {
      expect(component.form.get('roleName')!.value).toBe('admin');
    });
  });

  // ─── loadRoles ────────────────────────────────────────────────────────────

  describe('loadRoles()', () => {
    it('should populate availableRoles with unique role names', () => {
      // mockRoles has ['admin', 'user', 'admin'] — expect de-duped
      expect(component.availableRoles).toEqual(['admin', 'user']);
    });

    it('should set rolesLoading to false after success', () => {
      expect(component.rolesLoading).toBeFalse();
    });

    it('should show error toast on failure and fall back to default roles', () => {
      authServiceMock.findAll.and.returnValue(
        throwError(() => new Error('network error'))
      );
      component.loadRoles();
      expect(toastServiceMock.showError).toHaveBeenCalled();
      expect(component.availableRoles).toEqual(['admin', 'user', 'moderator']);
      expect(component.rolesLoading).toBeFalse();
    });
  });

  // ─── loadUser — error ─────────────────────────────────────────────────────

  describe('loadUser() — error', () => {
    beforeEach(async () => {
      await TestBed.resetTestingModule();

      userServiceMock = jasmine.createSpyObj('UserService', [
        'findOne',
        'create',
        'update',
      ]);
      userServiceMock.findOne.and.returnValue(
        throwError(() => new Error('not found'))
      );
      userServiceMock.create.and.returnValue(of(mockUser));
      userServiceMock.update.and.returnValue(of(mockUser));

      authServiceMock = jasmine.createSpyObj('AuthorizationService', ['findAll']);
      authServiceMock.findAll.and.returnValue(
        of({ data: mockRoles, count: mockRoles.length }) as any
      );

      toastServiceMock = jasmine.createSpyObj('ToastService', [
        'showSuccess',
        'showError',
      ]);
      routerMock = jasmine.createSpyObj('Router', ['navigate']);

      await TestBed.configureTestingModule({
        imports: [AdminUserFormComponent, NoopAnimationsModule],
        providers: [
          { provide: UserService, useValue: userServiceMock },
          { provide: AuthorizationService, useValue: authServiceMock },
          { provide: ToastService, useValue: toastServiceMock },
          { provide: Router, useValue: routerMock },
          { provide: ActivatedRoute, useValue: buildActivatedRoute('user-1') },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(AdminUserFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should show error toast when loadUser fails', () => {
      expect(toastServiceMock.showError).toHaveBeenCalledWith(
        'Failed to load user',
        '',
        3000
      );
    });

    it('should navigate away when loadUser fails', () => {
      expect(routerMock.navigate).toHaveBeenCalledWith(['/admin/user']);
    });
  });

  // ─── onSubmit — create ────────────────────────────────────────────────────

  describe('onSubmit() — create mode', () => {
    beforeEach(() => {
      component.form.setValue({
        email: 'new@example.com',
        name: 'New User',
        phone: '',
        address: '',
        dateOfBirth: null,
        roleName: 'user',
      });
    });

    it('should mark form as touched when invalid', () => {
      component.form.get('email')!.setValue('');
      spyOn(component.form, 'markAllAsTouched');
      component.onSubmit();
      expect(component.form.markAllAsTouched).toHaveBeenCalled();
    });

    it('should NOT call create when form is invalid', () => {
      component.form.get('name')!.setValue('');
      component.onSubmit();
      expect(userServiceMock.create).not.toHaveBeenCalled();
    });

    it('should call userService.create with correct dto', () => {
      component.onSubmit();
      expect(userServiceMock.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          email: 'new@example.com',
          name: 'New User',
        })
      );
    });

    it('should show success toast and navigate after create', () => {
      component.onSubmit();
      expect(toastServiceMock.showSuccess).toHaveBeenCalledWith(
        'User created successfully',
        '',
        3000
      );
      expect(routerMock.navigate).toHaveBeenCalledWith(['/admin/user']);
    });

    it('should show error toast and reset loading on create failure', () => {
      userServiceMock.create.and.returnValue(
        throwError(() => new Error('server error'))
      );
      component.onSubmit();
      expect(toastServiceMock.showError).toHaveBeenCalledWith(
        'Failed to create user',
        '',
        3000
      );
      expect(component.loading).toBeFalse();
    });

    it('should convert dateOfBirth to ISO string when present', () => {
      component.form.get('dateOfBirth')!.setValue(new Date('2000-06-15'));
      component.onSubmit();
      const dto = userServiceMock.create.calls.mostRecent().args[0] as any;
      expect(dto.dateOfBirth).toContain('2000-06-15');
    });
  });

  // ─── onSubmit — update ────────────────────────────────────────────────────

  describe('onSubmit() — edit mode', () => {
    beforeEach(async () => {
      await TestBed.resetTestingModule();
      await setupComponent('user-1');
    });

    it('should call userService.update with correct dto', () => {
      component.form.setValue({
        email: 'updated@example.com',
        name: 'Updated User',
        phone: '0987654321',
        address: '456 Other St',
        dateOfBirth: null,
        roleName: 'user',
      });
      component.onSubmit();
      expect(userServiceMock.update).toHaveBeenCalledWith(
        jasmine.objectContaining({
          id: 'user-1',
          email: 'updated@example.com',
          name: 'Updated User',
        })
      );
    });

    it('should show success toast and navigate after update', () => {
      component.onSubmit();
      expect(toastServiceMock.showSuccess).toHaveBeenCalledWith(
        'User updated successfully',
        '',
        3000
      );
      expect(routerMock.navigate).toHaveBeenCalledWith(['/admin/user']);
    });

    it('should show error toast and reset loading on update failure', () => {
      userServiceMock.update.and.returnValue(
        throwError(() => new Error('server error'))
      );
      component.onSubmit();
      expect(toastServiceMock.showError).toHaveBeenCalledWith(
        'Failed to update user',
        '',
        3000
      );
      expect(component.loading).toBeFalse();
    });
  });

  // ─── onCancel ─────────────────────────────────────────────────────────────

  describe('onCancel()', () => {
    it('should navigate to /admin/user', () => {
      component.onCancel();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/admin/user']);
    });
  });
});
