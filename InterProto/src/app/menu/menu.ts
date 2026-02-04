import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-menu',
  imports: [TranslateModule, RouterLink, FontAwesomeModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  constructor(private router: Router, private translate: TranslateService) {}
  faArrowLeft = faArrowLeft;
  private translate1 = inject(TranslateService)

  "comidas"= [
    {"nombre": this.translate1.instant('COMIDA.POLLO'), "descripcion": this.translate1.instant('COMIDA.TEXTO1'), "precio": 8000, "foto": 'pollo.jpg'},
    {"nombre": this.translate1.instant('COMIDA.CARNE'), "descripcion": this.translate1.instant('COMIDA.TEXTO2'), "precio": 6500, "foto": 'carne.jpg'},
    {"nombre": this.translate1.instant('COMIDA.FIDEOS'), "descripcion": this.translate1.instant('COMIDA.TEXTO3'), "precio": 3400, "foto": 'fideos.jpg'}
  ]

  "bebidas"= [
    {"nombre": this.translate1.instant('BEBIDA.AGUA'), "descripcion": this.translate1.instant('BEBIDA.TEXTO1'), "precio": 2000, "foto": 'agua.jpg'},
    {"nombre": this.translate1.instant('BEBIDA.COCACOLA'), "descripcion": this.translate1.instant('BEBIDA.TEXTO2'), "precio": 3000, "foto": 'coca.jpg'},
    {"nombre": this.translate1.instant('BEBIDA.VINO'), "descripcion": this.translate1.instant('BEBIDA.TEXTO3'), "precio": 5000, "foto": 'vino.jpg'}
  ]

  "postres"= [
    {"nombre": this.translate1.instant('POSTRE.FLAN'), "descripcion": this.translate1.instant('POSTRE.TEXTO1'), "precio": 4500, "foto": 'flan.jpg'},
    {"nombre": this.translate1.instant('POSTRE.HELADO'), "descripcion": this.translate1.instant('POSTRE.TEXTO2'), "precio": 5000, "foto": 'helado.jpg'},
    {"nombre": this.translate1.instant('POSTRE.VOLCAN_CHOCOLATE'), "descripcion": this.translate1.instant('POSTRE.TEXTO3'), "precio": 9500, "foto": 'volcan.jpg'}
  ]

  moverAlLogin() {
    this.router.navigate(['/inicio']);
  }
}
