import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError, Subject } from 'rxjs';
import cookies from 'js-cookie';

import { DataDeletionComponent } from './data-deletion.component';
import { UserService } from '@/app/service/user.service';
import { AuthService } from '@/app/service/auth.service';
import { ToastService } from '@/app/shared/service/toast.service';
import { Cookies_Key } from '@/enum/cookies.enum';

const mockProfile = { _id: 'user-1', name: 'Alice' } as any;

describe('DataDeletionComponent', () => {
  let component: DataDeletionComponent;
  let fixture: ComponentFixture<DataDeletionComponent>;
  let userSpy: jasmine.SpyObj<UserService>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let toastSpy: jasmine.SpyObj<ToastService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    userSpy = jasmine.createSpyObj('UserService', ['deleteUserData']);
    authSpy = jasmine.createSpyObj('AuthService', ['getProfile', 'logout']);
    toastSpy = jasmine.createSpyObj('ToastService', ['showSuccess', 'showError']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree', 'serializeUrl']);
    routerSpy.createUrlTree.and.returnValue({} as any);
    routerSpy.serializeUrl.and.returnValue('');
    (routerSpy as any).events = of();
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    authSpy.getProfile.and.returnValue(of(mockProfile));
    spyOn(cookies, 'get').and.returnValue(undefined as any);
    spyOn(cookies, 'remove').and.stub();

    await TestBed.configureTestingModule({
      imports: [DataDeletionComponent, NoopAnimationsModule],
      providers: [
        { provide: UserService, useValue: userSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({}) } } },
      ],
    })
      .overrideComponent(DataDeletionComponent, {
        set: {
          schemas: [NO_ERRORS_SCHEMA],
          providers: [{ provide: MatDialog, useValue: dialogSpy }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DataDeletionComponent);
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

  it('should load user profile on init', () => {
    expect(authSpy.getProfile).toHaveBeenCalled();
  });

  it('should set userId from profile', () => {
    expect(component.userId()).toBe('user-1');
  });

  it('should set userName from profile', () => {
    expect(component.userName()).toBe('Alice');
  });

  it('userId should default to null when profile fails to load', async () => {
    TestBed.resetTestingModule();
    authSpy.getProfile.and.returnValue(throwError(() => new Error('fail')));
    await TestBed.configureTestingModule({
      imports: [DataDeletionComponent, NoopAnimationsModule],
      providers: [
        { provide: UserService, useValue: userSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({}) } } },
      ],
    })
      .overrideComponent(DataDeletionComponent, {
        set: {
          schemas: [NO_ERRORS_SCHEMA],
          providers: [{ provide: MatDialog, useValue: dialogSpy }],
        },
      })
      .compileComponents();
    const f = TestBed.createComponent(DataDeletionComponent);
    f.detectChanges();
    expect(f.componentInstance.userId()).toBeNull();
    TestBed.resetTestingModule();
  });

  it('userId should remain null when profile resolves to null', async () => {
    TestBed.resetTestingModule();
    authSpy.getProfile.and.returnValue(of(null as any));
    await TestBed.configureTestingModule({
      imports: [DataDeletionComponent, NoopAnimationsModule],
      providers: [
        { provide: UserService, useValue: userSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({}) } } },
      ],
    })
      .overrideComponent(DataDeletionComponent, {
        set: {
          schemas: [NO_ERRORS_SCHEMA],
          providers: [{ provide: MatDialog, useValue: dialogSpy }],
        },
      })
      .compileComponents();
    const f = TestBed.createComponent(DataDeletionComponent);
    f.detectChanges();
    expect(f.componentInstance.userId()).toBeNull();
    TestBed.resetTestingModule();
  });

  // ── ngOnDestroy ────────────────────────────────────────────────────────────────
  it('should remove dark-theme class from body on destroy', () => {
    document.body.classList.add('dark-theme');
    fixture.destroy();
    expect(document.body.classList.contains('dark-theme')).toBeFalse();
  });

  // ── signals initial state ──────────────────────────────────────────────────────
  it('isDeleting should be false initially', () => {
    expect(component.isDeleting()).toBeFalse();
  });

  // ── goBack ─────────────────────────────────────────────────────────────────────
  it('goBack should navigate to /profile', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/profile']);
  });

  // ── openDeleteConfirmation ─────────────────────────────────────────────────────
  it('openDeleteConfirmation should open ConfirmDialogComponent', () => {
    const afterClosedSubject = new Subject<boolean>();
    dialogSpy.open.and.returnValue({
      afterClosed: () => afterClosedSubject.asObservable(),
    } as MatDialogRef<any>);
    component.openDeleteConfirmation();
    expect(dialogSpy.open).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.objectContaining({ width: '500px' })
    );
  });

  it('openDeleteConfirmation should not delete when dialog is cancelled', () => {
    const afterClosedSubject = new Subject<boolean>();
    dialogSpy.open.and.returnValue({
      afterClosed: () => afterClosedSubject.asObservable(),
    } as MatDialogRef<any>);
    component.openDeleteConfirmation();
    afterClosedSubject.next(false);
    expect(userSpy.deleteUserData).not.toHaveBeenCalled();
  });

  it('openDeleteConfirmation should call deleteUserData when dialog is confirmed', () => {
    userSpy.deleteUserData.and.returnValue(of({ message: "ok" }));
    (cookies.get as jasmine.Spy).and.returnValue(undefined as any);
    const afterClosedSubject = new Subject<boolean>();
    dialogSpy.open.and.returnValue({
      afterClosed: () => afterClosedSubject.asObservable(),
    } as MatDialogRef<any>);
    component.openDeleteConfirmation();
    afterClosedSubject.next(true);
    expect(userSpy.deleteUserData).toHaveBeenCalledWith('user-1');
  });

  // ── deleteUserData — no userId ─────────────────────────────────────────────────
  it('should show error toast when userId is not set', () => {
    component.userId.set(null);
    const afterClosedSubject = new Subject<boolean>();
    dialogSpy.open.and.returnValue({
      afterClosed: () => afterClosedSubject.asObservable(),
    } as MatDialogRef<any>);
    component.openDeleteConfirmation();
    afterClosedSubject.next(true);
    expect(toastSpy.showError).toHaveBeenCalled();
    expect(userSpy.deleteUserData).not.toHaveBeenCalled();
  });

  // ── deleteUserData — success, no refresh token ────────────────────────────────
  it('should clear cookies and navigate to / after deletion with no refresh token', () => {
    userSpy.deleteUserData.and.returnValue(of({ message: "ok" }));
    (cookies.get as jasmine.Spy).and.returnValue(undefined as any);
    const afterClosedSubject = new Subject<boolean>();
    dialogSpy.open.and.returnValue({
      afterClosed: () => afterClosedSubject.asObservable(),
    } as MatDialogRef<any>);
    component.openDeleteConfirmation();
    afterClosedSubject.next(true);
    expect(cookies.remove).toHaveBeenCalledWith(Cookies_Key.TOKEN);
    expect(cookies.remove).toHaveBeenCalledWith(Cookies_Key.REFRESH_TOKEN);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should show success toast after successful deletion', () => {
    userSpy.deleteUserData.and.returnValue(of({ message: "ok" }));
    (cookies.get as jasmine.Spy).and.returnValue(undefined as any);
    const afterClosedSubject = new Subject<boolean>();
    dialogSpy.open.and.returnValue({
      afterClosed: () => afterClosedSubject.asObservable(),
    } as MatDialogRef<any>);
    component.openDeleteConfirmation();
    afterClosedSubject.next(true);
    expect(toastSpy.showSuccess).toHaveBeenCalled();
  });

  // ── deleteUserData — success, with refresh token ──────────────────────────────
  it('should call authService.logout with refresh token after deletion', () => {
    userSpy.deleteUserData.and.returnValue(of({ message: "ok" }));
    (cookies.get as jasmine.Spy).and.callFake((key: string) =>
      key === Cookies_Key.REFRESH_TOKEN ? 'refresh-abc' : (undefined as any)
    );
    authSpy.logout.and.returnValue(of({ message: "ok" }));
    const afterClosedSubject = new Subject<boolean>();
    dialogSpy.open.and.returnValue({
      afterClosed: () => afterClosedSubject.asObservable(),
    } as MatDialogRef<any>);
    component.openDeleteConfirmation();
    afterClosedSubject.next(true);
    expect(authSpy.logout).toHaveBeenCalledWith('refresh-abc');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should clear cookies and navigate to / even when logout fails', () => {
    userSpy.deleteUserData.and.returnValue(of({ message: "ok" }));
    (cookies.get as jasmine.Spy).and.callFake((key: string) =>
      key === Cookies_Key.REFRESH_TOKEN ? 'refresh-abc' : (undefined as any)
    );
    authSpy.logout.and.returnValue(throwError(() => new Error('logout fail')));
    const afterClosedSubject = new Subject<boolean>();
    dialogSpy.open.and.returnValue({
      afterClosed: () => afterClosedSubject.asObservable(),
    } as MatDialogRef<any>);
    component.openDeleteConfirmation();
    afterClosedSubject.next(true);
    expect(cookies.remove).toHaveBeenCalledWith(Cookies_Key.TOKEN);
    expect(cookies.remove).toHaveBeenCalledWith(Cookies_Key.REFRESH_TOKEN);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  // ── deleteUserData — error ─────────────────────────────────────────────────────
  it('should show error toast when deleteUserData fails', () => {
    userSpy.deleteUserData.and.returnValue(throwError(() => new Error('fail')));
    const afterClosedSubject = new Subject<boolean>();
    dialogSpy.open.and.returnValue({
      afterClosed: () => afterClosedSubject.asObservable(),
    } as MatDialogRef<any>);
    component.openDeleteConfirmation();
    afterClosedSubject.next(true);
    expect(toastSpy.showError).toHaveBeenCalled();
  });

  it('should reset isDeleting to false when deleteUserData fails', () => {
    userSpy.deleteUserData.and.returnValue(throwError(() => new Error('fail')));
    const afterClosedSubject = new Subject<boolean>();
    dialogSpy.open.and.returnValue({
      afterClosed: () => afterClosedSubject.asObservable(),
    } as MatDialogRef<any>);
    component.openDeleteConfirmation();
    afterClosedSubject.next(true);
    expect(component.isDeleting()).toBeFalse();
  });

  it('should set isDeleting to true while deletion is in progress', () => {
    const deleteSubject = new Subject<any>();
    userSpy.deleteUserData.and.returnValue(deleteSubject.asObservable());
    const afterClosedSubject = new Subject<boolean>();
    dialogSpy.open.and.returnValue({
      afterClosed: () => afterClosedSubject.asObservable(),
    } as MatDialogRef<any>);
    component.openDeleteConfirmation();
    afterClosedSubject.next(true);
    expect(component.isDeleting()).toBeTrue();
    deleteSubject.error(new Error('fail'));
  });
});
