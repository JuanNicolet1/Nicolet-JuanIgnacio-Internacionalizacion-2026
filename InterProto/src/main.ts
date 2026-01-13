import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app'; // o AppComponent según tu nombre
import { appConfig } from './app/app.config';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));