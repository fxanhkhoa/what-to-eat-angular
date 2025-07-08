import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender,
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
    path: 'dish/:slug',
    renderMode: RenderMode.Server,
  },
  {
    path: 'ingredient',
    renderMode: RenderMode.Server,
  },
];
