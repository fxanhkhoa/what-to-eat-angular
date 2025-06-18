/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';

// Register the Vietnamese locale data
registerLocaleData(localeVi);

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
