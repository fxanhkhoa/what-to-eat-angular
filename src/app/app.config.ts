import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { bearerInterceptor } from './interceptor/bearer.interceptor';
import { tokenRefreshInterceptor } from './interceptor/token-refresh.interceptor';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { CustomPaginatorIntl } from './shared/paginator/custom-paginator-intl';
import { MatIconRegistry } from '@angular/material/icon';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled', // or 'top'
        anchorScrolling: 'enabled',
      })
    ),
    provideClientHydration(withEventReplay()),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'what-to-eat-90d3e',
        appId: '1:276849599452:web:598db247d5eb2e2f302519',
        storageBucket: 'what-to-eat-90d3e.appspot.com',
        authDomain: 'what-to-eat-90d3e.firebaseapp.com',
        messagingSenderId: '276849599452',
        measurementId: 'G-FWE0TE8LCZ',
        apiKey: 'AIzaSyBV6PbTETDHd5rYI_4ZLFOUpo3lBRIHfFo',
      })
    ),
    provideAuth(() => getAuth()),
    provideHttpClient(
      withFetch(),
      withInterceptors([bearerInterceptor, tokenRefreshInterceptor])
    ),
    { provide: MatPaginatorIntl, useClass: CustomPaginatorIntl },
  ],
};
