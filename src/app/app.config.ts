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
import { environment } from '@/environments/environment';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { bearerInterceptor } from './interceptor/bearer.interceptor';
import { tokenRefreshInterceptor } from './interceptor/token-refresh.interceptor';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { CustomPaginatorIntl } from './shared/paginator/custom-paginator-intl';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled', // or 'top'
        anchorScrolling: 'enabled',
      }),
    ),
    provideClientHydration(withEventReplay()),
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: 'AIzaSyBMtHMc7AEo5U4uZvR84wn-Z73oXGSZgCA',
        authDomain: 'what-to-eat-no-firebase.firebaseapp.com',
        projectId: 'what-to-eat-no-firebase',
        storageBucket: 'what-to-eat-no-firebase.firebasestorage.app',
        messagingSenderId: '500870159993',
        appId: '1:500870159993:web:105e95dd672dd099137ea8',
        measurementId: environment.FIREBASE_MEASUREMENT_ID,
      }),
    ),
    provideAuth(() => getAuth()),
    provideMessaging(() => getMessaging()),
    provideHttpClient(
      withFetch(),
      withInterceptors([bearerInterceptor, tokenRefreshInterceptor]),
    ),
    { provide: MatPaginatorIntl, useClass: CustomPaginatorIntl },
  ],
};
