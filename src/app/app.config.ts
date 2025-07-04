import {
  ApplicationConfig,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

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
import { MatPaginatorIntl } from '@angular/material/paginator';
import { CustomPaginatorIntl } from './shared/paginator/custom-paginator-intl';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
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
    provideHttpClient(withFetch(), withInterceptors([bearerInterceptor])),
    { provide: MatPaginatorIntl, useClass: CustomPaginatorIntl },
  ],
};
