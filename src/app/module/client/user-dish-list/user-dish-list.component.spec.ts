import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { UserDishListComponent } from './user-dish-list.component';
import { UserDishCollectionService } from '@/app/service/user-dish-collection.service';
import { ToastService } from '@/app/shared/service/toast.service';
import { AuthService } from '@/app/service/auth.service';
import { UserDishCollection } from '@/types/user-dish-collection.type';
import { User } from '@/types/user.type';

const mockUser = { _id: 'user-1', name: 'Alice' } as User;

const makeCollection = (id: string): UserDishCollection =>
  ({
    _id: id,
    name: `Collection ${id}`,
    dishSlugs: ['dish-1'],
    isPublic: false,
    color: '#3b82f6',
  }) as any;

describe('UserDishListComponent', () => {
  let component: UserDishListComponent;
  let fixture: ComponentFixture<UserDishListComponent>;
  let collectionSpy: jasmine.SpyObj<UserDishCollectionService>;
  let toastSpy: jasmine.SpyObj<ToastService>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockCollections = [makeCollection('c1'), makeCollection('c2')];

  function setup(platformId = 'browser') {
    collectionSpy = jasmine.createSpyObj('UserDishCollectionService', [
      'findAll',
      'delete',
      'duplicate',
    ]);
    toastSpy = jasmine.createSpyObj('ToastService', [
      'showSuccess',
      'showError',
    ]);
    authSpy = jasmine.createSpyObj('AuthService', ['getProfile']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    collectionSpy.findAll.and.returnValue(
      of({ data: mockCollections, count: 2 } as any)
    );
    authSpy.getProfile.and.returnValue(of(mockUser));

    TestBed.configureTestingModule({
      imports: [UserDishListComponent, NoopAnimationsModule],
      providers: [
        { provide: UserDishCollectionService, useValue: collectionSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        { provide: PLATFORM_ID, useValue: platformId },
      ],
    })
      .overrideComponent(UserDishListComponent, {
        set: { schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(UserDishListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
    TestBed.resetTestingModule();
    await setup();
  });

  // ── creation ──────────────────────────────────────────────────────────────────
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── initial state ─────────────────────────────────────────────────────────────
  it('should initialise loading to false after ngOnInit resolves', () => {
    expect(component.loading()).toBeFalse();
  });

  it('should initialise collections to empty array before ngOnInit', () => {
    // Before detectChanges (ngOnInit) runs, collections is empty
    const fresh = TestBed.createComponent(UserDishListComponent);
    expect(fresh.componentInstance.collections()).toEqual([]);
  });

  // ── ngOnInit — browser platform ───────────────────────────────────────────────
  it('should call authService.getProfile on init', () => {
    expect(authSpy.getProfile).toHaveBeenCalled();
  });

  it('should set profile from getProfile response', () => {
    expect(component.profile).toEqual(mockUser);
  });

  it('should call loadCollections on init', () => {
    expect(collectionSpy.findAll).toHaveBeenCalled();
  });

  it('should populate collections from service response', () => {
    expect(component.collections()).toEqual(mockCollections);
  });

  // ── ngOnInit — server platform ────────────────────────────────────────────────
  it('should skip loading when running on server', async () => {
    TestBed.resetTestingModule();
    await setup('server');
    collectionSpy.findAll.calls.reset();
    authSpy.getProfile.calls.reset();
    component.ngOnInit();
    expect(collectionSpy.findAll).not.toHaveBeenCalled();
    expect(authSpy.getProfile).not.toHaveBeenCalled();
  });

  // ── loadCollections ───────────────────────────────────────────────────────────
  it('should set loading false after collections load', () => {
    component.loadCollections();
    expect(component.loading()).toBeFalse();
  });

  it('should set loading false and show error when findAll errors', () => {
    collectionSpy.findAll.and.returnValue(throwError(() => new Error('fail')));
    component.loadCollections();
    expect(component.loading()).toBeFalse();
    expect(toastSpy.showError).toHaveBeenCalledWith(
      'Error',
      'Failed to load collections 1',
      1500
    );
  });

  it('should set loading false when response has no data', () => {
    collectionSpy.findAll.and.returnValue(of({ data: null } as any));
    component.loadCollections();
    expect(component.loading()).toBeFalse();
  });

  // ── navigateToCreate ──────────────────────────────────────────────────────────
  it('navigateToCreate should navigate to /my-dishes/create', () => {
    component.navigateToCreate();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/my-dishes/create']);
  });

  // ── navigateToEdit ────────────────────────────────────────────────────────────
  it('navigateToEdit should navigate to /my-dishes/edit/:id', () => {
    component.navigateToEdit('c1');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/my-dishes/edit', 'c1']);
  });

  // ── deleteCollection ──────────────────────────────────────────────────────────
  it('deleteCollection should remove the collection from the list on success', () => {
    collectionSpy.delete.and.returnValue(of(undefined as any));
    spyOn(window, 'confirm').and.returnValue(true);
    component.collections.set([...mockCollections]);
    component.deleteCollection('c1');
    expect(component.collections().find((c) => c._id === 'c1')).toBeUndefined();
  });

  it('deleteCollection should show success toast after deletion', () => {
    collectionSpy.delete.and.returnValue(of(undefined as any));
    spyOn(window, 'confirm').and.returnValue(true);
    component.deleteCollection('c1');
    expect(toastSpy.showSuccess).toHaveBeenCalledWith(
      'Success',
      'Collection deleted successfully'
    );
  });

  it('deleteCollection should show error toast on failure', () => {
    collectionSpy.delete.and.returnValue(throwError(() => new Error('fail')));
    spyOn(window, 'confirm').and.returnValue(true);
    component.deleteCollection('c1');
    expect(toastSpy.showError).toHaveBeenCalledWith(
      'Error',
      'Failed to delete collection',
      1500
    );
  });

  it('deleteCollection should do nothing when user cancels confirm', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.deleteCollection('c1');
    expect(collectionSpy.delete).not.toHaveBeenCalled();
  });

  // ── duplicateCollection ───────────────────────────────────────────────────────
  it('duplicateCollection should prepend the new collection to the list', () => {
    const newCol = makeCollection('c3');
    collectionSpy.duplicate.and.returnValue(of(newCol));
    component.collections.set([...mockCollections]);
    component.duplicateCollection(mockCollections[0]);
    expect(component.collections()[0]).toEqual(newCol);
    expect(component.collections().length).toBe(3);
  });

  it('duplicateCollection should call duplicate with correct dto', () => {
    collectionSpy.duplicate.and.returnValue(of(makeCollection('c3')));
    component.profile = mockUser;
    component.duplicateCollection(mockCollections[0]);
    expect(collectionSpy.duplicate).toHaveBeenCalledWith(
      jasmine.objectContaining({
        userId: 'user-1',
        collectionId: 'c1',
        newName: 'Collection c1 (Copy)',
        copyPublic: false,
      })
    );
  });

  it('duplicateCollection should show success toast', () => {
    collectionSpy.duplicate.and.returnValue(of(makeCollection('c3')));
    component.duplicateCollection(mockCollections[0]);
    expect(toastSpy.showSuccess).toHaveBeenCalledWith(
      'Success',
      'Collection duplicated successfully'
    );
  });

  it('duplicateCollection should show error toast on failure', () => {
    collectionSpy.duplicate.and.returnValue(throwError(() => new Error('fail')));
    component.duplicateCollection(mockCollections[0]);
    expect(toastSpy.showError).toHaveBeenCalledWith(
      'Error',
      'Failed to duplicate collection',
      1500
    );
  });
});
