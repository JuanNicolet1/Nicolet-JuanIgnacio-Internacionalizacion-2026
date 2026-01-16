import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // Obligatorio para cargar .json

import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes'; // ajusta si es necesario

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),                    // Necesario para HttpLoader
    provideRouter(routes),

   

    // Firebase (descomenta si lo necesitas)
    // provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    // provideAuth(() => getAuth()),
    // provideFirestore(() => getFirestore()),

    // ── ngx-translate ── (esto soluciona el NG0201)
    provideTranslateService({
      defaultLanguage: 'es',               // idioma por defecto
      // fallbackLanguage: 'en',           // opcional
    }),

    provideTranslateHttpLoader({
      prefix: './i18n/',            // o 'assets/i18n/' si prefieres sin punto inicial
      suffix: '.json'
    }),

    // Opcional: inicializar idioma basado en navegador
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: () => {
    //     const translate = inject(TranslateService);
    //     return () => translate.use(translate.getBrowserLang() || 'es');
    //   },
    //   multi: true,
    //   deps: [TranslateService]
    // },

    provideZoneChangeDetection({ eventCoalescing: true }), // buena práctica
  ]
};