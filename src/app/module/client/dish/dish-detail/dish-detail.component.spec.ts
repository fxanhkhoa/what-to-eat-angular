import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { DishDetailComponent } from './dish-detail.component';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { IngredientService } from '@/app/service/ingredient.service';
import { DishService } from '@/app/service/dish.service';
import { UserDishInteractionService } from '@/app/service/user-dish-interaction.service';
import { MatIconRegistry } from '@angular/material/icon';

describe('DishDetailComponent', () => {
  let component: DishDetailComponent;
  let fixture: ComponentFixture<DishDetailComponent>;

  beforeEach(async () => {
    const mockActivatedRoute: Partial<ActivatedRoute> = {
      snapshot: {
        data: { pageUrl: 'https://example.com' },
        paramMap: {
          get: (_: string) => null,
          has: function (name: string): boolean {
            throw new Error('Function not implemented.');
          },
          getAll: function (name: string): string[] {
            throw new Error('Function not implemented.');
          },
          keys: [],
        },
        url: [],
        params: {},
        queryParams: {},
        fragment: null,
        outlet: '',
        component: null,
        routeConfig: null,
        title: undefined,
        root: new ActivatedRouteSnapshot(),
        parent: null,
        firstChild: null,
        children: [],
        pathFromRoot: [],
        queryParamMap: {
          get: (_: string) => null,
          has: function (name: string): boolean {
            throw new Error('Function not implemented.');
          },
          getAll: function (name: string): string[] {
            throw new Error('Function not implemented.');
          },
          keys: [],
        },
      },
      paramMap: { subscribe: (fn: any) => ({ unsubscribe() {} }) } as any,
    };

    const ingredientServiceMock = jasmine.createSpyObj('IngredientService', [
      'findOne',
    ]);
    ingredientServiceMock.findOne.and.returnValue(of(null));

    const dishServiceMock = jasmine.createSpyObj('DishService', [
      'findBySlug',
      'findOne',
    ]);
    dishServiceMock.findBySlug.and.returnValue(of(null));
    dishServiceMock.findOne.and.returnValue(of(null));

    const userDishInteractionServiceMock = jasmine.createSpyObj(
      'UserDishInteractionService',
      ['recordView'],
    );
    userDishInteractionServiceMock.recordView.and.returnValue(of(null));

    const matIconRegistryMock: Partial<MatIconRegistry> = {
      // addSvgIcon should return MatIconRegistry; return a matching mock to satisfy the type
      addSvgIcon: (_iconName: string, _url: any) => ({}) as MatIconRegistry,
      // MatIcon component may call getNamedSvgIcon; mock it to return an observable SVG element
      getNamedSvgIcon: (_name: string) => of(document.createElement('svg')) as any,
    };

    await TestBed.configureTestingModule({
      imports: [DishDetailComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: IngredientService, useValue: ingredientServiceMock },
        { provide: DishService, useValue: dishServiceMock },
        {
          provide: UserDishInteractionService,
          useValue: userDishInteractionServiceMock,
        },
        { provide: MatIconRegistry, useValue: matIconRegistryMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DishDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
