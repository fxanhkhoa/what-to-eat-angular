import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

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

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'what-to-eat-90d3e',
        appId: '1:276849599452:web:598db247d5eb2e2f302519',
        storageBucket: 'what-to-eat-90d3e.appspot.com',
        authDomain: 'what-to-eat-90d3e.firebaseapp.com',
        messagingSenderId: '276849599452',
        measurementId: 'G-FWE0TE8LCZ',
      })
    ),
    provideAuth(() => getAuth()),
    provideHttpClient(withFetch(), withInterceptors([])),
  ],
};
