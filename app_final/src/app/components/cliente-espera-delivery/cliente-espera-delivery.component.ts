import { Component, inject, NgZone} from '@angular/core';
import { RouterLink, Router} from '@angular/router';
import { ViewDidLeave, ViewWillEnter, ViewWillLeave } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import { pushService } from 'src/app/services/serviciosPush/push-notifications.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faUtensils, faMotorcycle, faFlagCheckered, faGamepad, faClipboardList, faReceipt, faCommentDots, faBan } from '@fortawesome/free-solid-svg-icons';
import { PedidoService } from 'src/app/services/pedido.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-cliente-espera-delivery',
  templateUrl: './cliente-espera-delivery.component.html',
  styleUrls: ['./cliente-espera-delivery.component.scss'],
  standalone: true,
  imports: [RouterLink, CommonModule, FontAwesomeModule, TranslateModule] 
})
export class ClienteEsperaDeliveryComponent  implements ViewWillEnter, ViewDidLeave {
  private translate = inject(TranslateService)
  
  mostrarNotificacion = true;
  faCheck = faCheck;
  faUtensils = faUtensils;
  faMotorcycle = faMotorcycle;
  faFlagCheckered = faFlagCheckered;
  faGamepad = faGamepad;
  faClipboardList = faClipboardList;
  faReceipt = faReceipt;
  faCommentDots = faCommentDots;
  faBan = faBan;

  delivery: any = null;
  subscription4: Subscription | null = null;
  subscriptionRechazo: Subscription | null = null;
  isLoading: boolean = true; 


  pasoActual: number = 0; 
  mensajeEstado: string = this.translate.instant('DELIVERY_ESTADO.ESPERANDO');

  motivoRechazo: string = '';

  constructor(
    protected db: DatabaseService, 
    protected auth: AuthService, 
    private router: Router, 
    private pushService: pushService,
    private ngZone: NgZone,
    private pedidoService: PedidoService
  ) { }

  private traducirNotificacion(notif: any) {
  const titulo = notif.tituloKey
    ? this.translate.instant(notif.tituloKey, notif.params || {})
    : notif.titulo;

  const cuerpo = notif.cuerpoKey
    ? this.translate.instant(notif.cuerpoKey, notif.params || {})
    : notif.cuerpo;

    return { titulo, cuerpo };
  }

  ionViewWillEnter(): void {
    this.isLoading = true; 
    this.mostrarNotificacion = true;

    this.db.traerDeliveryPorCliente(this.auth.usuarioIngresado.nombre).subscribe((deliverys) => {
      
      this.ngZone.run(() => {
        if (deliverys.length > 0) {
          this.delivery = deliverys[0];
          this.calcularEstado(); 

          if (this.delivery.estadoDelivery === 'cancelado') {
             this.manejarRechazo();
          } else {

             this.iniciarEscuchaGeneral();
          }
        }
        this.isLoading = false; 
      });
    });
  }

 ionViewDidLeave(): void {
      console.log('👋 Saliendo: Limpiando suscripciones...');
      if (this.subscription4) {
        this.subscription4.unsubscribe();
        this.subscription4 = null;
      }
      if (this.subscriptionRechazo) {
        this.subscriptionRechazo.unsubscribe();
        this.subscriptionRechazo = null;
      }
  }

  iniciarEscuchaGeneral() {
    if (this.subscription4) return;

    const observableClientes = this.db.traerNotificacion('cliente');
    this.subscription4 = observableClientes.subscribe((resultado) => {
      if (resultado.length > 0) {
        const ultimaNotificacion: any = resultado[0];
        
        if (this.auth.usuarioIngresado.tipoCliente === 'cliente' && this.pasoActual !== -1) {
          console.log(ultimaNotificacion);
          if (!ultimaNotificacion.recibida) {
            const { titulo, cuerpo } = this.traducirNotificacion(ultimaNotificacion);
            this.pushService.send(
              titulo,
              cuerpo,
              ''
            );
            this.db.actualizarNotificacion('cliente', ultimaNotificacion.id, { recibida: true });
          }
        }
      }
    });
  }

 calcularEstado() {
    if (!this.delivery) return;

    this.ngZone.run(() => {
        const estadoP = this.delivery.estadoPedido;
        const estadoD = this.delivery.estadoDelivery;

        console.log('Estado Pedido:', estadoP);
        console.log('Estado Delivery:', estadoD);

        // 2. Lógica paso a paso
        if (estadoD === 'cancelado') {
            this.pasoActual = -1;
            this.mensajeEstado = this.translate.instant('DELIVERY_ESTADO.RECHAZADO');
            this.motivoRechazo = this.delivery.motivoRechazo || this.translate.instant('DELIVERY_ESTADO.NMOTIVO');
        }
        else if (estadoD === 'pendiente') {
          this.pasoActual = 1;
          this.mensajeEstado = this.translate.instant('DELIVERY_ESTADO.REVISANDO');
        } 
        // Agregamos 'aceptado' aquí explícitamente
        else if (estadoD === 'aceptado' || estadoP === 'enPreparacion' || estadoD === 'confirmado') {
          this.pasoActual = 2;
          this.mensajeEstado = this.translate.instant('DELIVERY_ESTADO.COCINANDO');
          this.pedidoService.setMostrarInfo(true);
          this.pedidoService.setPedidoActual(this.delivery);
    
        } 
        else if (estadoP === 'enCamino' || estadoD === 'enCamino') {
          this.pasoActual = 3;
          this.mensajeEstado = this.translate.instant('DELIVERY_ESTADO.CAMINO');
        } 
        else if (estadoP === 'pedidoEntregado' || estadoD === 'entregado' || estadoP === 'cuentaSolicitada') {
          this.pasoActual = 4;
          this.mensajeEstado = this.translate.instant('DELIVERY_ESTADO.ENTREGADO');
          this.pedidoService.setMostrarInfo(false);
          this.pedidoService.setPedidoActual(this.delivery);
        }
        else {
            console.warn('El estado no coincide con ninguna etapa:', estadoD, estadoP);
        }
    });
  }

  manejarRechazo() {
    if (this.subscription4) {
        this.subscription4.unsubscribe();
        this.subscription4 = null;
    }

    const rol = this.auth.usuarioIngresado.tipoCliente;
    const obsNotif = this.db.traerNotificacion(rol);
    
    if (this.subscriptionRechazo) {
  this.subscriptionRechazo.unsubscribe();
}

this.subscriptionRechazo = obsNotif.subscribe((res: any[]) => {
  if (res && res.length > 0) {
    const notif = res[0];

    if (!notif.recibida && this.mostrarNotificacion) {
        const { titulo, cuerpo } = this.traducirNotificacion(notif);

        this.pushService.send(
          titulo,
          cuerpo,
          '/delivery',
          true,
          '',
          'abrirDelivery'
        );

        this.db.actualizarNotificacion(rol, notif.id, { recibida: true });
        this.mostrarNotificacion = false;
        }
      }
    });
  }

  pedirCuenta() {
    if(!this.delivery) return;
    
    this.auth.usuarioIngresado.estadoPedido = 'cuentaSolicitada';
    this.isLoading = true;
    this.db.ModificarObjeto({
        ...this.delivery,
        estadoPedido: 'cuentaSolicitada',
        fechaCuentaSolicitada: new Date()
      }, 'delivery');

    this.db.ModificarObjeto(this.auth.usuarioIngresado, 'clientes');
    console.log(this.translate.instant('NOTIFICACIONES_CLIDEL.CUENTA'));
    this.db.enviarNotificacion('delivery', {
      tituloKey: 'NOTIFICACIONES_CLIDEL.CUENTA',
      cuerpoKey: 'NOTIFICACIONES_CLIDEL.MENSAJE',
      params: {
        cliente: this.auth.usuarioIngresado.nombre
      },
      pedidoId: this.delivery.id,
      pedido: this.delivery
    })
    .then(() => {
        this.isLoading = false;
        this.ngZone.run(() => {
            this.router.navigateByUrl('/pedir-cuenta');
        });
    });
  }

  volverAlListado(){
    this.delivery.estadoPedido = '';
    this.delivery.estadoDelivery = '';
    this.db.ModificarObjeto(this.delivery, 'delivery')
    this.auth.usuarioIngresado.estadoPedido = '';
    this.db.ModificarObjeto(this.auth.usuarioIngresado, 'clientes');
    this.router.navigate(['/delivery'])
  }

  verificarAcceso() {
    if (this.auth.usuarioIngresado.encuestaCompletada) {
      Swal.fire({
        heightAuto: false,
        title: this.translate.instant('SWAL_CLIENTED.ENCUESTA'),
        text: this.translate.instant('SWAL_CLIENTED.RESULTADOS'),
        icon: 'info',
        background: '#333',
        color: '#fff',
        confirmButtonColor: '#d84f45',
        confirmButtonText: this.translate.instant('CLIENTE_PEDIDO.GRAFICOS'),
        showCancelButton: true,
        cancelButtonText: this.translate.instant('CLIENTE_PEDIDO.CANCELAR')
      }).then((resp) => {
        if (resp.isConfirmed) {
            this.ngZone.run(() => this.router.navigateByUrl('/resultado-encuestas-cliente'));
        }
      });
    } else {
        this.ngZone.run(() => this.router.navigateByUrl('encuesta-cliente'));
    }
  }
}