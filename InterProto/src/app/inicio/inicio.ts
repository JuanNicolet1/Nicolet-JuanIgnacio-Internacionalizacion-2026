import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, TranslateModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {

}
