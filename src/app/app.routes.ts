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
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./module/admin/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
        canActivate: [authenticationGuard, authorizationGuard],
        data: { permissions: [Permissions.ADMIN_DASHBOARD] },
      },
    ],
  },
];
