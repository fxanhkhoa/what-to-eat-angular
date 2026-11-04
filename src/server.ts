import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import localeVi from '@angular/common/locales/vi';
import localeEn from '@angular/common/locales/en';
import { registerLocaleData } from '@angular/common';
import { environment } from './environments/environment';

// Register the Vietnamese locale data
registerLocaleData(localeVi);

// Register the English locale data
registerLocaleData(localeEn);

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const SUPPORTED_LOCALES = ['en', 'vi'];

const defaultAllowedHosts = [
  'localhost',
  '127.0.0.1',
  'eatwhat.io.vn',
  '*.eatwhat.io.vn',
];

const envAllowedHosts = process.env['NG_ALLOWED_HOSTS']
  ? process.env['NG_ALLOWED_HOSTS'].split(',').map((h) => h.trim()).filter(Boolean)
  : [];

const app = express();
app.set('trust proxy', true);

const angularApp = new AngularNodeAppEngine({
  allowedHosts: [...new Set([...defaultAllowedHosts, ...envAllowedHosts])],
  trustProxyHeaders: true,
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/**', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  })
);

const isDev = !environment.production || !existsSync(browserDistFolder);

if (isDev) {
  // In development mode (e.g. ng serve), the dev server serves a single locale mounted at root ('/')
  app.use((req, res, next) => {
    // If request contains /en or /vi prefix, strip it and redirect to root-relative path
    for (const locale of SUPPORTED_LOCALES) {
      if (req.path === `/${locale}`) {
        return res.redirect(302, '/');
      }
      if (req.path.startsWith(`/${locale}/`)) {
        const strippedPath = req.originalUrl.replace(new RegExp(`^/${locale}`), '') || '/';
        return res.redirect(302, strippedPath);
      }
    }
    next();
  });
} else {
  // In production mode, Angular multi-locale is active (/en and /vi)
  app.use((req, res, next) => {
    const firstSegment = req.path.split('/')[1];
    if (SUPPORTED_LOCALES.includes(firstSegment) || req.path === '/') {
      return next();
    }
    // If URL doesn't have a valid locale in production, redirect to default locale
    const redirectPath = `/en${req.originalUrl}`;
    res.redirect(302, redirectPath);
  });
}

app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next()
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
