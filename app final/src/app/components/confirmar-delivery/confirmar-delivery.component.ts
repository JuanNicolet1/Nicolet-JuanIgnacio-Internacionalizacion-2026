import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import Swal from 'sweetalert2';
import { Subscription, firstValueFrom } from 'rxjs'; 
import { pushService } from 'src/app/services/serviciosPush/push-notifications.service';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faMapMarkerAlt, faClock, faUtensils, faMotorcycle } from '@fortawesome/free-solid-svg-icons'; 
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-confirmar-delivery',
  templateUrl: './confirmar-delivery.component.html',
  styleUrls: ['./confirmar-delivery.component.scss'],
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterLink, IonicModule, TranslateModule]
})
export class ConfirmarDeliveryComponent implements OnInit {
  private translate = inject(TranslateService)

  faArrowLeft = faArrowLeft;
  faMapMarkerAlt = faMapMarkerAlt;
  faClock = faClock;
  faUtensils = faUtensils;
  faMotorcycle = faMotorcycle;

  pedidosPendientes: any[] = [];
  pedidosListos: any[] = []; 
  isLoading: boolean = true;
  subscription: Subscription | null = null;

  constructor(
    protected auth: AuthService, 
    protected db: DatabaseService,
    private pushService: pushService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    const observable = this.db.traerDelivery();

    this.subscription = observable.subscribe((resultado:any[]) => {
    
      this.pedidosPendientes = (resultado as any[]).filter((doc) => doc.estadoDelivery === 'pendiente');
      console.log(this.pedidosPendientes)

      this.pedidosListos = resultado.filter((doc) => 
          doc.estadoDelivery === 'aceptado' && 
          doc.cocinaFinalizada === true && 
          (doc.barFinalizado === true || !doc.productos.some((p: any) => p.tipoProducto === 'bebida'))
      );

      this.isLoading = false;
    });
  }


  async aceptarPedido(pedido: any) {
    

    const confirm = await Swal.fire({
        title: this.translate.instant('SWAL_DUENO.ACEPTAR_PEDIDO'),
        text: `${this.translate.instant('SWAL_DUENO.CLIENTE')}: ${pedido.cliente} - ${this.translate.instant('SWAL_GENERAL.TOTAL')}: $${pedido.total}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: this.translate.instant('SWAL_LOGIN.SI')+ ', ' + this.translate.instant('SWAL_GENERAL.ACEPTAR'),
        confirmButtonColor: '#4caf50',
        cancelButtonText: this.translate.instant('SWAL_LOGIN.CANCELAR'),
        cancelButtonColor: '#d33',
        background: '#333',
        color: '#fff',
        heightAuto: false
    });

    if (!confirm.isConfirmed) return;

    this.isLoading = true;

    try {
        
        await this.db.enviarNotificacion('chef', {
          tituloKey: 'NOTIFICACIONES_DELIVERY.NUEVO_DELIVERY',
          cuerpoKey: 'NOTIFICACIONES_DELIVERY.CUERPO',
        });

        await this.db.enviarNotificacion('bartender', {
          tituloKey: 'NOTIFICACIONES_DELIVERY.NUEVO_DELIVERY',
          cuerpoKey: 'NOTIFICACIONES_DELIVERY.BEBIDAS',
        });

       /*
        await this.pushService.send(
             'Pedido Aceptado',
             `Tu pedido está en preparación. Tiempo aprox: ${pedido.tiempoEstimado} min.`,
             '', 
        ); */

       
        pedido.estadoPedido = 'enPreparacion'; 
        pedido.estadoDelivery = 'aceptado'; 
        
        await this.db.ModificarObjeto(pedido, 'delivery');

        Swal.fire({
            title: this.translate.instant('SWAL_DUENO.PEDIDO_ENVIADO'),
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            background: '#333', 
            color: '#fff'
        });

    } catch (e) {
        console.error(e);
    } finally {
        this.isLoading = false;
    }
  }

  async rechazarPedido(pedido: any) {
      const { value: motivo } = await Swal.fire({
          title: this.translate.instant('SWAL_DUENO.RECHAZAR_DELIVERY'),
          input: 'text',
          inputPlaceholder: this.translate.instant('SWAL_DUENO.INPUT'),
          showCancelButton: true,
          confirmButtonText: this.translate.instant('SWAL_GENERAL.RECHAZAR'),
          confirmButtonColor: '#d33',
          background: '#333', color: '#fff'
      });

      if (!motivo) return; 

      this.isLoading = true;

      await this.db.enviarNotificacion('cliente', {
        tituloKey: 'NOTIFICACIONES_DELIVERY.RECHAZADO',
        cuerpoKey: 'NOTIFICACIONES_DELIVERY.MODIFIQUE',
        params: {
          motivo: motivo
        },
        cliente: pedido.cliente
      });

      pedido.productos = []; 
      pedido.estadoDelivery = 'cancelado';
      pedido.estadoPedido = 'cancelado';
      pedido.motivoRechazo = motivo;

      await this.db.ModificarObjeto(pedido, 'delivery');

      await this.actualizarEstadoCliente(pedido.cliente, 'cancelado');

      
 

      this.isLoading = false;
  }
  

  async actualizarEstadoCliente(nombreCliente: string, nuevoEstado: string) {
      try {
  
        const clientes = await firstValueFrom(this.db.TraerUsuario('clientes'));
        
  
        const clienteEncontrado: any = (clientes as any[]).find(c => c.nombre === nombreCliente);
  
        if (clienteEncontrado) {
          clienteEncontrado.estadoPedido = nuevoEstado;
          await this.db.ModificarObjeto(clienteEncontrado, 'clientes');
          console.log(`Estado del cliente ${nombreCliente} actualizado a: ${nuevoEstado}`);
        } else {
          console.warn(`Cliente ${nombreCliente} no encontrado.`);
        }
      } catch (error) {
        console.error('Error actualizando cliente:', error);
      }
    }
  

  async entregarAlDelivery(pedido: any) {
    
    const confirm = await Swal.fire({
        title: this.translate.instant('SWAL_DUENO.ENTREGAR_PREGUNTA'),
        text: `${this.translate.instant('SWAL_DUENO.TEXTO_DELIVERY1')} ${pedido.cliente} ${this.translate.instant('SWAL_DUENO.TEXTO_DELIVERY2')}.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: this.translate.instant('SWAL_LOGIN.SI') +', ' + this.translate.instant('SWAL_DUENO.ENTREGAR'),
        confirmButtonColor: '#d84f45',
        background: '#333',
        color: '#fff',
        heightAuto: false
    });

    if (!confirm.isConfirmed) return;

    this.isLoading = true;

    try {
       
        pedido.estadoDelivery = 'confirmado'; 
        pedido.estadoPedido = 'porEntregar';

        await this.db.ModificarObjeto(pedido, 'delivery');

       
        await this.db.enviarNotificacion('delivery', {
          tituloKey: 'NOTIFICACIONES_DELIVERY.LISTO',
          cuerpoKey: 'NOTIFICACIONES_DELIVERY.ENTREGAR',
          params: {
            cliente: pedido.cliente
          }
        });

        Swal.fire({
            title: this.translate.instant('SWAL_DUENO.ENTREGADO'),
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            background: '#333', 
            color: '#fff'
        });

    } catch (e) {
        console.error(e);
    } finally {
        this.isLoading = false;
    }
  }
}