import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { IdiomaService } from 'src/app/services/idiomas.service';

@Component({
  selector: 'app-idiomas',
  standalone: true,
  templateUrl: './idiomas.component.html',
  styleUrls: ['./idiomas.component.scss'],
  imports: [TranslateModule, FontAwesomeModule],
})
export class IdiomasComponent {

  faArrowLeft = faArrowLeft;

  constructor(
    private idiomaService: IdiomaService,
    private router: Router
  ) {}

  cambiarIdioma(lang: string) {
    this.idiomaService.cambiarIdioma(lang);
  }

  moverAlLogin() {
    this.router.navigate(['/login']);
  }
}
