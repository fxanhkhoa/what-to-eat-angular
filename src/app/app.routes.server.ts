import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
  {
    path: 'admin',
    renderMode: RenderMode.Client,
  },
  {
    path: 'admin/ingredient/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'admin/dish/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'game/voting',
    renderMode: RenderMode.Client,
  },
  {
    path: 'game/voting/create',
    renderMode: RenderMode.Client,
  },
  {
    path: 'game/voting/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'dish/:slug',
    renderMode: RenderMode.Server,
  },
  {
    path: 'ingredient',
    renderMode: RenderMode.Server,
  },
];
