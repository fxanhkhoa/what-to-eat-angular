import { Routes } from '@angular/router';
import { authenticationGuard } from './guard/authentication.guard';
import { Permissions } from '@/constant/permission.constant';
import { authorizationGuard } from './guard/authorization.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./module/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./module/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./module/admin/admin.component').then((m) => m.AdminComponent),
    canActivate: [authenticationGuard, authorizationGuard],
    data: {
      permissions: [Permissions.ADMIN_DASHBOARD],
      breadcrumb: 'Admin',
    },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./module/admin/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
        data: {
          breadcrumb: 'Dashboard',
        },
      },
      {
        path: 'ingredient',
        loadComponent: () =>
          import(
            './module/admin/admin-ingredient/admin-ingredient.component'
          ).then((m) => m.AdminIngredientComponent),
        data: {
          breadcrumb: 'Ingredient',
        },
        children: [
          {
            path: '',
            redirectTo: 'list',
            pathMatch: 'full',
          },
          {
            path: 'list',
            loadComponent: () =>
              import(
                './module/admin/admin-ingredient/admin-ingredient-list/admin-ingredient-list.component'
              ).then((m) => m.AdminIngredientListComponent),
            data: {
              breadcrumb: 'List',
            },
          },
          {
            path: ':id',
            loadComponent: () =>
              import(
                './module/admin/admin-ingredient/admin-ingredient-update/admin-ingredient-update.component'
              ).then((m) => m.AdminIngredientUpdateComponent),
            data: {
              breadcrumb: 'Create/Update',
            },
          },
        ],
      },
      {
        path: 'dish',
        loadComponent: () =>
          import('./module/admin/admin-dish/admin-dish.component').then(
            (m) => m.AdminDishComponent
          ),
        data: {
          breadcrumb: 'Dish',
        },
        children: [
          {
            path: '',
            redirectTo: 'list',
            pathMatch: 'full',
          },
          {
            path: 'list',
            loadComponent: () =>
              import(
                './module/admin/admin-dish/admin-dish-list/admin-dish-list.component'
              ).then((m) => m.AdminDishListComponent),
            data: {
              breadcrumb: 'List',
            },
          },
          {
            path: ':id',
            loadComponent: () =>
              import(
                './module/admin/admin-dish/admin-dish-update/admin-dish-update.component'
              ).then((m) => m.AdminDishUpdateComponent),
            data: {
              breadcrumb: 'Create/Update',
            },
          },
        ],
      },
    ],
  },
];
