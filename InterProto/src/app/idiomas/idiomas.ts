import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { IdiomasService } from '../servicio/idiomas';

@Component({
  selector: 'app-idiomas',
  standalone: true,
  templateUrl: './idiomas.html',
  styleUrls: ['./idiomas.css'],
  imports: [TranslateModule, FontAwesomeModule],
})
export class IdiomasComponent {

  faArrowLeft = faArrowLeft;

  constructor(
    private idiomaService: IdiomasService,
    private router: Router
  ) {}

  cambiarIdioma(lang: string) {
    this.idiomaService.cambiarIdioma(lang);
  }

  moverAlLogin() {
    this.router.navigate(['/inicio']);
  }
}

