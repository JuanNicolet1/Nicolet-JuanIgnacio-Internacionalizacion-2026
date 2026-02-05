import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class IdiomaService {

  constructor(private translate: TranslateService) {
    const langGuardado = localStorage.getItem('lang') || 'es';

    translate.addLangs(['es', 'en', 'fr', 'de', 'pt', 'ru']);
    translate.setDefaultLang('es');
    translate.use(langGuardado);
  }

  cambiarIdioma(lang: string) {
    localStorage.setItem('lang', lang);
    this.translate.use(lang);
  }

  getIdiomaActual(): string {
    return this.translate.currentLang;
  }
}
