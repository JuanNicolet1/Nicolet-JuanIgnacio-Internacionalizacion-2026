import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faComment, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { ModalController, Platform, ViewDidLeave, ViewWillEnter } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import { PedidoService } from 'src/app/services/pedido.service';
import Swal from 'sweetalert2';
import { TranslateModule, TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-ahorcado',
  standalone:true,
  imports: [RouterLink, FontAwesomeModule, TranslateModule],
  templateUrl: './ahorcado.html',
  styleUrl: './ahorcado.scss'
})
export class Ahorcado implements ViewWillEnter, ViewDidLeave {
  private translate = inject(TranslateService)

  faRightFromBracket = faRightFromBracket;
  faComent = faComment;
//primero fijarme que hacer con el icono
//arreglar el problema con volver a empezar el juego

  palabras = [this.translate.instant('AHORCADO.FIDEO'), this.translate.instant('AHORCADO.MILANESA'), this.translate.instant('AHORCADO.CARNE'), this.translate.instant('AHORCADO.POLLO'), this.translate.instant('AHORCADO.POLENTA'), this.translate.instant('AHORCADO.ARROZ')];
  vida = 6;
  vida_descuento = 1;
  mensaje = '';
  puestoA = false;
  puestoB = false;
  puestoC = false;
  puestoD = false;
  puestoE = false;
  puestoF = false;
  puestoG = false;
  puestoH = false;
  puestoI = false;
  puestoJ = false;
  puestoK = false;
  puestoL = false;
  puestoM = false;
  puestoN = false;
  puestoENIE = false;
  puestoO = false;
  puestoP = false;
  puestoQ = false;
  puestoR = false;
  puestoS = false;
  puestoT = false;
  puestoU = false;
  puestoV = false;
  puestoW = false;
  puestoX = false;
  puestoY = false;
  puestoZ = false;
  puestoLetra = false;

  usuario = '';
  letras_usadas = 0;
  palabra_acertada = 0;
  reiniciar = false

  constructor(protected auth: AuthService,
        protected router: Router,
        private modalController: ModalController,
        protected platform: Platform,
        protected db: DatabaseService,
      private pedidoService: PedidoService) {}

  ionViewWillEnter() {
    this.pedidoService.setMostrarInfo(false);
  }

  ionViewDidLeave() {
    this.pedidoService.setMostrarInfo(true);
  }

  getRandomPalabra(): string {
    const randomIndex = Math.floor(Math.random() * this.palabras.length);
    return this.palabras[randomIndex];
  }

  palabra = this.getRandomPalabra();
  palabraOculta = '_'.repeat(this.palabra.length).trim()
  letra = '';
  letrasUsadas: string[] = [];

  comprobarLetra() {
  if (this.palabra.includes(this.letra)) {
    const palabraOcultaArray = this.palabraOculta.split('');
    for (let i = 0; i < this.palabra.length; i++) {
      if (this.palabra[i] === this.letra) {
        palabraOcultaArray[i] = this.letra;
      }
    }
    this.palabraOculta = palabraOcultaArray.join('');
  } else {
    this.vida -=1;
  }

  if(this.palabraOculta === this.palabra) {
    this.palabra_acertada = this.palabra_acertada + 1;
    if(this.auth.usuarioIngresado.descuento === 0){
      if(this.palabra_acertada === 1 && this.vida_descuento === 1){
         Swal.fire({
            title: this.translate.instant('SWAL_JUEGOS.FELICIDADES'),
            text: this.translate.instant('SWAL_JUEGOS.ADIVINADO') + ', ' + this.palabra + ' ' + this.translate.instant('SWAL_JUEGOS.DESCUENTO'),
            icon: 'success',
            confirmButtonText: this.translate.instant('SWAL_JUEGOS.NUEVA_PARTIDA'),
            allowOutsideClick: false,
            allowEscapeKey: false
            }).then(() => {
        this.reiniciarPartida()
      });
        console.log(this.auth.usuarioIngresado.descuento);
        this.auth.usuarioIngresado.descuento = 0.10;
        this.db.ModificarObjeto(this.auth.usuarioIngresado, 'clientes');  
        }else{
            Swal.fire({
            title: this.translate.instant('SWAL_JUEGOS.BIEN'),
            text: this.translate.instant('SWAL_JUEGOS.ADIVINADO') +': ' + this.palabra,
            icon: 'success',
            confirmButtonText: this.translate.instant('SWAL_JUEGOS.NUEVA_PARTIDA'),
            allowOutsideClick: false,
            allowEscapeKey: false
            }).then(() => {
        this.reiniciarPartida()
      });
        }
      }else{
        Swal.fire({
        title: this.translate.instant('SWAL_JUEGOS.BIEN'),
        text: this.translate.instant('SWAL_JUEGOS.ADIVINADO') + ': ' + this.palabra,
        icon: 'success',
        confirmButtonText: this.translate.instant('SWAL_JUEGOS.NUEVA_PARTIDA'),
        allowOutsideClick: false,
        allowEscapeKey: false
        }).then(() => {
        this.reiniciarPartida()
      });
      }
    

      }
    
    
    //this.guardarAhorcado();
  

  if(this.vida === 0) {
    this.vida_descuento -= 1;
    this.mensaje = this.translate.instant('JUEGOS.PERDISTE') + " " + this.palabra;
    this.reiniciar = true;
    Swal.fire({
      title: this.translate.instant('JUEGOS.PERDISTE'),
      text: this.palabra,
      icon: 'error',
      confirmButtonText: this.translate.instant('SWAL_JUEGOS.NUEVA_PARTIDA'),
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then(() => {
      this.reiniciarPartida();
    });
    return;
    //this.guardarAhorcado();
  }
}


  a(){
    this.letra = this.translate.instant('LETRAS.A');
    this.letrasUsadas.push(this.letra);
    this.letras_usadas += 1;
    this.comprobarLetra();
    this.puestoA = true;
  }

  b(){
    this.letra = this.translate.instant('LETRAS.B');
    this.letrasUsadas.push(this.letra);
    this.letras_usadas += 1;
    this.comprobarLetra();
    this.puestoB = true;
  }

  c(){
    this.letra = this.translate.instant('LETRAS.C');
    this.letrasUsadas.push(this.letra);
    this.letras_usadas += 1;
    this.comprobarLetra();
    this.puestoC = true;
  }

  d(){
    this.letra = this.translate.instant('LETRAS.D');
    this.letrasUsadas.push(this.letra);
    this.letras_usadas += 1;
    this.comprobarLetra();
    this.puestoD = true;
  }

  e(){
    this.letra = this.translate.instant('LETRAS.E');
    this.letrasUsadas.push(this.letra);
    this.letras_usadas += 1;
    this.comprobarLetra();
    this.puestoE = true;
  }

  f(){
    this.letra = this.translate.instant('LETRAS.F');
    this.letrasUsadas.push(this.letra);
    this.letras_usadas += 1;
    this.comprobarLetra();
    this.puestoF = true;
  }

  g(){
    this.letra = this.translate.instant('LETRAS.G');
    this.letrasUsadas.push(this.letra);
    this.letras_usadas += 1;
    this.comprobarLetra();
    this.puestoG = true;
  }

  h(){
    this.letra = this.translate.instant('LETRAS.H');
    this.letrasUsadas.push(this.letra);
    this.letras_usadas += 1;
    this.comprobarLetra();
    this.puestoH = true;
  }

  i(){
    this.letra = this.translate.instant('LETRAS.I');
    this.letrasUsadas.push(this.letra);
    this.letras_usadas += 1;
    this.comprobarLetra();
    this.puestoI = true;
  }

  j(){  
    this.letra = this.translate.instant('LETRAS.J');
    this.letrasUsadas.push(this.letra);
    this.letras_usadas += 1;
    this.comprobarLetra();
    this.puestoJ = true;
  }

  k(){
    this.letra = this.translate.instant('LETRAS.K');
    this.letrasUsadas.push(this.letra);
    this.letras_usadas += 1;
    this.comprobarLetra();
    this.puestoK = true;
  }

  l(){
    this.letra = this.translate.instant('LETRAS.L');
    this.letrasUsadas.push(this.letra);
    this.letras_usadas += 1;
    this.comprobarLetra();
    this.puestoL = true;
  }

  m(){
    this.letra = this.translate.instant('LETRAS.M');
    this.letrasUsadas.push(this.letra);
    this.letras_usadas += 1;
    this.comprobarLetra();
    this.puestoM = true;
  }

  n(){
    this.letra = this.translate.instant('LETRAS.N');
    this.letrasUsadas.push(this.letra);
    this.letras_usadas += 1;
    this.comprobarLetra();
    this.puestoN = true;
  }

  enie(){
    this.letra = "Ñ";
    this.letrasUsadas.push(this.letra);
    this.letras_usadas += 1;
    this.comprobarLetra();
    this.puestoENIE = true;
  }

  o(){
    this.letra = this.translate.instant('LETRAS.O');
    this.letrasUsadas.push(this.letra);
    this.letras_usadas += 1;
    this.comprobarLetra();
    this.puestoO = true;
  }

  p(){
    this.letra = this.translate.instant('LETRAS.P');
    this.letrasUsadas.push(this.letra);
    this.letras_usadas += 1;
    this.comprobarLetra();
    this.puestoP = true;
  }

  q(){
    this.letra = this.translate.instant('LETRAS.Q');
    this.letrasUsadas.push(this.letra);
    this.letras_usadas += 1;
    this.comprobarLetra();
    this.puestoQ = true;
  }

  r(){
    this.letra = this.translate.instant('LETRAS.R');
    this.letrasUsadas.push(this.letra);
    this.letras_usadas += 1;
    this.comprobarLetra();
    this.puestoR = true;
  }

  s(){
    this.letra = this.translate.instant('LETRAS.S');
    this.letrasUsadas.push(this.letra);
    this.letras_usadas += 1;
    this.comprobarLetra();
    this.puestoS = true;
  }

  t(){
    this.letra = this.translate.instant('LETRAS.T');
    this.letrasUsadas.push(this.letra);
    this.letras_usadas += 1;
    this.comprobarLetra();
    this.puestoT = true;
  }

  u(){
    this.letra = this.translate.instant('LETRAS.U');
    this.letrasUsadas.push(this.letra);
    this.letras_usadas += 1;
    this.comprobarLetra();
    this.puestoU = true;
  }

  v(){
    this.letra = this.translate.instant('LETRAS.V');
    this.letrasUsadas.push(this.letra);
    this.letras_usadas += 1;
    this.comprobarLetra();
    this.puestoV = true;
  }

  w(){
    this.letra = this.translate.instant('LETRAS.W');
    this.letrasUsadas.push(this.letra);
    this.letras_usadas += 1;
    this.comprobarLetra();
    this.puestoW = true;
  }

  x(){
    this.letra = this.translate.instant('LETRAS.X');
    this.letrasUsadas.push(this.letra);
    this.letras_usadas += 1;
    this.comprobarLetra();
    this.puestoX = true;
  }

  y(){
    this.letra = this.translate.instant('LETRAS.Y');
    this.letrasUsadas.push(this.letra);
    this.letras_usadas += 1;
    this.comprobarLetra();
    this.puestoY = true;
  }

  z(){
    this.letra = this.translate.instant('LETRAS.Z');
    this.letrasUsadas.push(this.letra);
    this.letras_usadas += 1;
    this.comprobarLetra();
    this.puestoZ = true;
  }

  letraRusa(){
    this.letra = "Ц";
    this.letrasUsadas.push(this.letra);
    this.letras_usadas += 1;
    this.comprobarLetra();
    this.puestoLetra = true;
  }

  reiniciarPartida(){
    this.reiniciar = false
    this.vida = 6
    this.getRandomPalabra();
    this.palabra = this.getRandomPalabra();
    this.palabraOculta = '_'.repeat(this.palabra.length).trim();
    this.puestoA = false;
    this.puestoB = false;
    this.puestoC = false;
    this.puestoD = false;
    this.puestoE = false;
    this.puestoF = false;
    this.puestoG = false;
    this.puestoH = false;
    this.puestoI = false;
    this.puestoJ = false;
    this.puestoK = false;
    this.puestoL = false;
    this.puestoM = false;
    this.puestoN = false;
    this.puestoENIE = false;
    this.puestoO = false;
    this.puestoP = false;
    this.puestoQ = false;
    this.puestoR = false;
    this.puestoS = false;
    this.puestoT = false;
    this.puestoU = false;
    this.puestoV = false;
    this.puestoW = false;
    this.puestoX = false;
    this.puestoY = false;
    this.puestoZ = false;
    this.puestoLetra = false;
    this.mensaje = ''
  }

  get esEspanol(): boolean {
    return this.translate.currentLang === 'es';
  }

  get esRuso(): boolean {
    return this.translate.currentLang === 'ru';
  }

  cerrarSesion() {
    this.router.navigateByUrl('/juego');
  }

}
