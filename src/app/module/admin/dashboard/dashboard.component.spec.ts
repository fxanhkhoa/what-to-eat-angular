import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { AuthorizationService } from '@/app/service/authorization.service';
import { DishService } from '@/app/service/dish.service';
import { IngredientService } from '@/app/service/ingredient.service';
import { RolePermission } from '@/types/auth.type';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authorizationServiceSpy: jasmine.SpyObj<AuthorizationService>;
  let dishServiceSpy: jasmine.SpyObj<DishService>;
  let ingredientServiceSpy: jasmine.SpyObj<IngredientService>;

  const roleMock: RolePermission = {
    _id: 'role-admin',
    name: 'ADMIN',
    permission: [],
    deleted: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    authorizationServiceSpy = jasmine.createSpyObj<AuthorizationService>(
      'AuthorizationService',
      ['findByName']
    );
    dishServiceSpy = jasmine.createSpyObj<DishService>('DishService', [
      'findAll',
    ]);
    ingredientServiceSpy = jasmine.createSpyObj<IngredientService>(
      'IngredientService',
      ['findAll']
    );

    authorizationServiceSpy.findByName.and.returnValue(of(roleMock));
    dishServiceSpy.findAll.and.returnValue(of({ count: 12, data: [] } as any));
    ingredientServiceSpy.findAll.and.returnValue(
      of({ count: 7, data: [] } as any)
    );

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: AuthorizationService, useValue: authorizationServiceSpy },
        { provide: DishService, useValue: dishServiceSpy },
        { provide: IngredientService, useValue: ingredientServiceSpy },
      ],
    })
      // Keep this unit test focused on Dashboard logic, not child components.
      .overrideComponent(DashboardComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load roles and analytics on init', () => {
    fixture.detectChanges();

    expect(authorizationServiceSpy.findByName).toHaveBeenCalledWith('ADMIN');
    expect(dishServiceSpy.findAll).toHaveBeenCalledWith({});
    expect(ingredientServiceSpy.findAll).toHaveBeenCalledWith({});
    expect(component.roles).toEqual([roleMock]);
    expect(component.loading).toBeFalse();
    expect(component.error).toBeNull();
    expect(component.dishCount).toBe(12);
    expect(component.ingredientCount).toBe(7);
  });

  it('should set error when role loading fails', () => {
    authorizationServiceSpy.findByName.and.returnValue(
      throwError(() => new Error('role error'))
    );

    fixture.detectChanges();

    expect(component.loading).toBeFalse();
    expect(component.error).toBe('Failed to load roles');
  });

  it('should set dishCount to null when dish analytics fails', () => {
    dishServiceSpy.findAll.and.returnValue(
      throwError(() => new Error('dish error'))
    );

    fixture.detectChanges();

    expect(component.dishCount).toBeNull();
    expect(component.ingredientCount).toBe(7);
  });

  it('should set ingredientCount to null when ingredient analytics fails', () => {
    ingredientServiceSpy.findAll.and.returnValue(
      throwError(() => new Error('ingredient error'))
    );

    fixture.detectChanges();

    expect(component.dishCount).toBe(12);
    expect(component.ingredientCount).toBeNull();
  });
});
