import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { ProfileComponent } from './profile.component';
import { UserService } from '@/app/service/user.service';
import { AuthService } from '@/app/service/auth.service';
import { ToastService } from '@/app/shared/service/toast.service';
import { User } from '@/types/user.type';

const mockUser: User = {
  _id: 'user-1',
  name: 'Alice',
  email: 'alice@example.com',
  phone: '1234567890',
  address: '123 Main St',
  dateOfBirth: '1990-01-01',
  avatar: '',
  googleID: null,
  facebookID: null,
  githubID: null,
  createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
} as any;

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let userSpy: jasmine.SpyObj<UserService>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let toastSpy: jasmine.SpyObj<ToastService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    userSpy = jasmine.createSpyObj('UserService', ['update']);
    authSpy = jasmine.createSpyObj('AuthService', ['getProfile']);
    toastSpy = jasmine.createSpyObj('ToastService', ['showSuccess', 'showError']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    authSpy.getProfile.and.returnValue(of(mockUser));

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, NoopAnimationsModule],
      providers: [
        { provide: UserService, useValue: userSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: Router, useValue: routerSpy },
      ],
    })
      .overrideComponent(ProfileComponent, { set: { schemas: [NO_ERRORS_SCHEMA] } })
      .compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    document.body.classList.remove('dark-theme');
  });

  // ── creation ───────────────────────────────────────────────────────────────────
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── ngOnInit ───────────────────────────────────────────────────────────────────
  it('should add dark-theme class to body on init', () => {
    expect(document.body.classList.contains('dark-theme')).toBeTrue();
  });

  it('should call getProfile on init', () => {
    expect(authSpy.getProfile).toHaveBeenCalled();
  });

  it('should set user signal after loading profile', () => {
    expect(component.user()).toEqual(mockUser);
  });

  it('should set isLoading to false after successful load', () => {
    expect(component.isLoading()).toBeFalse();
  });

  // ── ngOnDestroy ────────────────────────────────────────────────────────────────
  it('should remove dark-theme class from body on destroy', () => {
    document.body.classList.add('dark-theme');
    fixture.destroy();
    expect(document.body.classList.contains('dark-theme')).toBeFalse();
  });

  // ── form structure ─────────────────────────────────────────────────────────────
  it('should initialize profileForm with required controls', () => {
    ['name', 'email', 'phone', 'address', 'dateOfBirth'].forEach((ctrl) =>
      expect(component.profileForm.get(ctrl)).not.toBeNull()
    );
  });

  it('name should be required', () => {
    component.profileForm.get('name')!.setValue('');
    expect(component.profileForm.get('name')!.hasError('required')).toBeTrue();
  });

  it('name should enforce minLength of 2', () => {
    component.profileForm.get('name')!.setValue('A');
    expect(component.profileForm.get('name')!.hasError('minlength')).toBeTrue();
  });

  it('name should be valid when filled correctly', () => {
    component.profileForm.get('name')!.setValue('John Doe');
    expect(component.profileForm.get('name')!.hasError('required')).toBeFalse();
  });

  it('email should be disabled by default', () => {
    expect(component.profileForm.get('email')!.disabled).toBeTrue();
  });

  it('email should validate format when enabled', () => {
    const ctrl = component.profileForm.get('email')!;
    ctrl.enable();
    ctrl.setValue('not-an-email');
    expect(ctrl.hasError('email')).toBeTrue();
    ctrl.setValue('valid@email.com');
    expect(ctrl.hasError('email')).toBeFalse();
  });

  it('phone should validate pattern', () => {
    const ctrl = component.profileForm.get('phone')!;
    ctrl.setValue('123');
    expect(ctrl.hasError('pattern')).toBeTrue();
    ctrl.setValue('1234567890');
    expect(ctrl.hasError('pattern')).toBeFalse();
  });

  // ── populateForm ───────────────────────────────────────────────────────────────
  it('populateForm should patch name from user data', () => {
    expect(component.profileForm.get('name')!.value).toBe('Alice');
  });

  it('populateForm should patch phone from user data', () => {
    expect(component.profileForm.get('phone')!.value).toBe('1234567890');
  });

  it('populateForm should patch address from user data', () => {
    expect(component.profileForm.get('address')!.value).toBe('123 Main St');
  });

  it('populateForm should set dateOfBirth as a Date object', () => {
    expect(component.profileForm.get('dateOfBirth')!.value).toBeInstanceOf(Date);
  });

  // ── avatarUrl computed ─────────────────────────────────────────────────────────
  it('avatarUrl should return ui-avatars URL based on name when avatar is empty', () => {
    expect(component.avatarUrl()).toContain('ui-avatars.com');
    expect(component.avatarUrl()).toContain('Alice');
  });

  it('avatarUrl should return avatar URL directly when user has an avatar', () => {
    component.user.set({ ...mockUser, avatar: 'https://cdn.example.com/avatar.jpg' });
    expect(component.avatarUrl()).toBe('https://cdn.example.com/avatar.jpg');
  });

  it('avatarUrl should return Guest URL when user is undefined', () => {
    component.user.set(undefined);
    expect(component.avatarUrl()).toContain('User');
  });

  // ── toggleEdit ─────────────────────────────────────────────────────────────────
  it('toggleEdit should set isEditing to true', () => {
    expect(component.isEditing()).toBeFalse();
    component.toggleEdit();
    expect(component.isEditing()).toBeTrue();
  });

  it('toggleEdit should set isEditing back to false on second call', () => {
    component.isEditing.set(true);
    component.toggleEdit();
    expect(component.isEditing()).toBeFalse();
  });

  it('toggleEdit cancel should restore original form values', () => {
    component.isEditing.set(true);
    component.profileForm.get('name')!.setValue('Changed Name');
    component.toggleEdit(); // cancel
    expect(component.profileForm.get('name')!.value).toBe('Alice');
  });

  // ── loadUserProfile error ──────────────────────────────────────────────────────
  it('should show error toast when loadUserProfile fails', () => {
    authSpy.getProfile.and.returnValue(throwError(() => new Error('fail')));
    component.loadUserProfile();
    expect(toastSpy.showError).toHaveBeenCalled();
    expect(component.isLoading()).toBeFalse();
  });

  it('should not update user when profile resolves to null', () => {
    component.user.set(undefined);
    authSpy.getProfile.and.returnValue(of(null as any));
    component.loadUserProfile();
    expect(component.user()).toBeUndefined();
  });

  // ── saveProfile ────────────────────────────────────────────────────────────────
  it('saveProfile should show error when form is invalid', () => {
    component.profileForm.get('name')!.setValue('');
    component.saveProfile();
    expect(toastSpy.showError).toHaveBeenCalled();
    expect(userSpy.update).not.toHaveBeenCalled();
  });

  it('saveProfile should show error when user has no _id', () => {
    component.user.set(undefined);
    component.saveProfile();
    expect(toastSpy.showError).toHaveBeenCalled();
    expect(userSpy.update).not.toHaveBeenCalled();
  });

  it('saveProfile should call userService.update with correct id', () => {
    const updatedUser = { ...mockUser, name: 'Alice Updated' } as any;
    userSpy.update.and.returnValue(of(updatedUser));
    component.saveProfile();
    expect(userSpy.update).toHaveBeenCalledWith(
      jasmine.objectContaining({ id: 'user-1' })
    );
  });

  it('saveProfile should set user to updated value on success', () => {
    const updatedUser = { ...mockUser, name: 'Alice Updated' } as any;
    userSpy.update.and.returnValue(of(updatedUser));
    component.saveProfile();
    expect(component.user()).toEqual(updatedUser);
  });

  it('saveProfile should stop editing on success', () => {
    component.isEditing.set(true);
    userSpy.update.and.returnValue(of(mockUser));
    component.saveProfile();
    expect(component.isEditing()).toBeFalse();
  });

  it('saveProfile should show success toast on success', () => {
    userSpy.update.and.returnValue(of(mockUser));
    component.saveProfile();
    expect(toastSpy.showSuccess).toHaveBeenCalled();
  });

  it('saveProfile should show error toast on update failure', () => {
    userSpy.update.and.returnValue(throwError(() => new Error('fail')));
    component.saveProfile();
    expect(toastSpy.showError).toHaveBeenCalled();
    expect(component.isLoading()).toBeFalse();
  });

  it('saveProfile should reset isLoading to false on error', () => {
    userSpy.update.and.returnValue(throwError(() => new Error('fail')));
    component.saveProfile();
    expect(component.isLoading()).toBeFalse();
  });

  // ── goBack ─────────────────────────────────────────────────────────────────────
  it('goBack should call window.history.back', () => {
    spyOn(window.history, 'back');
    component.goBack();
    expect(window.history.back).toHaveBeenCalled();
  });

  // ── getAccountAge ──────────────────────────────────────────────────────────────
  it('getAccountAge should return "N/A" when createdAt is missing', () => {
    component.user.set({ ...mockUser, createdAt: undefined } as any);
    expect(component.getAccountAge()).toBe('N/A');
  });

  it('getAccountAge should return days label for accounts under 30 days old', () => {
    const tenDaysAgo = new Date(Date.now() - 9.5 * 24 * 60 * 60 * 1000).toISOString();
    component.user.set({ ...mockUser, createdAt: tenDaysAgo } as any);
    expect(component.getAccountAge()).toContain('10 days');
  });

  it('getAccountAge should return months label for accounts between 30 and 365 days', () => {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    component.user.set({ ...mockUser, createdAt: sixtyDaysAgo } as any);
    expect(component.getAccountAge()).toContain('2');
  });

  it('getAccountAge should return years label for accounts over 365 days old', () => {
    const twoYearsAgo = new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString();
    component.user.set({ ...mockUser, createdAt: twoYearsAgo } as any);
    expect(component.getAccountAge()).toContain('2');
  });

  // ── getFormattedDate ───────────────────────────────────────────────────────────
  it('getFormattedDate should return "Not set" for null input', () => {
    expect(component.getFormattedDate(null)).toBe('Not set');
  });

  it('getFormattedDate should return "Not set" for undefined input', () => {
    expect(component.getFormattedDate(undefined)).toBe('Not set');
  });

  it('getFormattedDate should return a formatted date string for a valid date', () => {
    const result = component.getFormattedDate('1990-06-15');
    expect(result).not.toBe('Not set');
    expect(result.length).toBeGreaterThan(0);
  });
});
