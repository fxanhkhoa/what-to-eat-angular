import { Routes } from '@angular/router';
import { authenticationGuard } from './guard/authentication.guard';
import { Permissions } from '@/constant/permission.constant';
import { authorizationGuard } from './guard/authorization.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./module/client/client.component').then((m) => m.ClientComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./module/client/home/home.component').then(
            (m) => m.HomeComponent
          ),
      },
      {
        path: 'dish',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./module/client/dish/dish.component').then(
                (m) => m.DishComponent
              ),
          },
          {
            path: 'basic',
            loadComponent: () =>
              import(
                './module/client/dish/dish-basic/dish-basic.component'
              ).then((m) => m.DishBasicComponent),
          },
          {
            path: ':slug',
            loadComponent: () =>
              import(
                './module/client/dish/dish-detail/dish-detail.component'
              ).then((m) => m.DishDetailComponent),
          },
        ],
      },
      {
        path: 'ingredient',
        loadComponent: () =>
          import('./module/client/ingredient/ingredient.component').then(
            (m) => m.IngredientComponent
          ),
      },
      {
        path: 'game',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./module/client/game/game.component').then(
                (m) => m.GameComponent
              ),
          },
          {
            path: 'wheel-of-fortune',
            loadComponent: () =>
              import(
                './module/client/game/wheel-of-fortune/wheel-of-fortune.component'
              ).then((m) => m.WheelOfFortuneComponent),
          },
          {
            path: 'flipping-card',
            loadComponent: () =>
              import(
                './module/client/game/flipping-card/flipping-card.component'
              ).then((m) => m.FlippingCardComponent),
          },
          {
            path: 'flipping-card',
            loadComponent: () =>
              import(
                './module/client/game/flipping-card/flipping-card.component'
              ).then((m) => m.FlippingCardComponent),
          },
          {
            path: 'voting',
            children: [
              {
                path: '',
                canActivate: [authenticationGuard, authorizationGuard],
                data: {
                  permissions: [Permissions.FIND_ALL_DISH_VOTE],
                },
                loadComponent: () =>
                  import(
                    './module/client/game/voting/voting-list/voting-list.component'
                  ).then((m) => m.VotingListComponent),
              },
              {
                path: 'create',
                canActivate: [authenticationGuard, authorizationGuard],
                data: {
                  permissions: [Permissions.CREATE_DISH_VOTE],
                },
                loadComponent: () =>
                  import(
                    './module/client/game/voting/voting-create-update/voting-create-update.component'
                  ).then((m) => m.VotingCreateUpdateComponent),
              },
              {
                path: ':id',
                canActivate: [authenticationGuard, authorizationGuard],
                data: {
                  permissions: [Permissions.FIND_ONE_DISH_VOTE],
                },
                loadComponent: () =>
                  import('./module/client/game/voting/voting.component').then(
                    (m) => m.VotingComponent
                  ),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./module/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'profile',
    canActivate: [authenticationGuard],
    loadComponent: () =>
      import('./module/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
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
      {
        path: 'contact',
        loadComponent: () =>
          import('./module/admin/admin-contact/admin-contact.component').then(
            (m) => m.AdminContactComponent
          ),
        data: {
          breadcrumb: 'Contact',
        },
      },
      {
        path: 'role-permission',
        data: {
          breadcrumb: 'Role Permission',
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
                './module/admin/admin-role-permission/admin-role-permission.component'
              ).then((m) => m.AdminRolePermissionComponent),
            data: {
              breadcrumb: 'List',
            },
          },
          {
            path: 'create',
            loadComponent: () =>
              import(
                './module/admin/admin-role-permission/admin-role-permission-form/admin-role-permission-form.component'
              ).then((m) => m.AdminRolePermissionFormComponent),
            data: {
              breadcrumb: 'Create',
            },
          },
          {
            path: 'edit/:id',
            loadComponent: () =>
              import(
                './module/admin/admin-role-permission/admin-role-permission-form/admin-role-permission-form.component'
              ).then((m) => m.AdminRolePermissionFormComponent),
            data: {
              breadcrumb: 'Edit',
            },
          },
        ],
      },
      {
        path: 'user',
        data: {
          breadcrumb: 'User Management',
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
              import('./module/admin/admin-user/admin-user.component').then(
                (m) => m.AdminUserComponent
              ),
            data: {
              breadcrumb: 'List',
            },
          },
          {
            path: 'create',
            loadComponent: () =>
              import(
                './module/admin/admin-user/admin-user-form/admin-user-form.component'
              ).then((m) => m.AdminUserFormComponent),
            data: {
              breadcrumb: 'Create',
            },
          },
          {
            path: 'edit/:id',
            loadComponent: () =>
              import(
                './module/admin/admin-user/admin-user-form/admin-user-form.component'
              ).then((m) => m.AdminUserFormComponent),
            data: {
              breadcrumb: 'Edit',
            },
          },
        ],
      },
      {
        path: 'feedback',
        data: {
          breadcrumb: 'Feedback Management',
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
              import('./module/admin/feedback-list/feedback-list.component').then(
                (m) => m.FeedbackListComponent
              ),
            data: {
              breadcrumb: 'List',
            },
          },
        ],
      },
    ],
  },
  {
    path: 'forbidden',
    loadComponent: () =>
      import('./module/forbidden/forbidden.component').then(
        (m) => m.ForbiddenComponent
      ),
  },
];
