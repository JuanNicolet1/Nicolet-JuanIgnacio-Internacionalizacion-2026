import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faGlassMartiniAlt, faClock, faCheckCircle } from '@fortawesome/free-solid-svg-icons'; 
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-bartender-delivery',
  templateUrl: './bartender-delivery.component.html',
  styleUrls: ['./bartender-delivery.component.scss'],
  standalone: true,
  imports: [FontAwesomeModule, RouterLink, CommonModule, TranslateModule],
})
export class BartenderDeliveryComponent implements OnInit {
  private translate = inject(TranslateService)

  faArrowLeft = faArrowLeft;
  faGlassMartiniAlt = faGlassMartiniAlt;
  faClock = faClock;
  faCheckCircle = faCheckCircle;

  pedidos: any[] = [];
  subscription: Subscription | null = null;
  isLoading: boolean = true;

  constructor(protected auth: AuthService, protected db: DatabaseService) {}

  ngOnInit() {
    this.isLoading = true;
    const observable = this.db.traerDelivery();

    this.subscription = observable.subscribe((resultado) => {

      this.pedidos = (resultado as any[]).filter(
        (pedido) =>
          pedido.productos.some((p: any) => p.tipoProducto === 'bebida') && 
          !pedido.barFinalizado && 
          pedido.estadoDelivery === 'aceptado' 
      );
      this.isLoading = false;
    });
  }

  async finalizarPedido(pedido: any) {
    this.isLoading = true;
    pedido.barFinalizado = true;

  
    const tieneComida = pedido.productos.some((p: any) => p.tipoProducto === 'comida');
    const cocinaTermino = pedido.cocinaFinalizada || !tieneComida;

    await this.db.ModificarObjeto(pedido, 'delivery');


    if (pedido.barFinalizado && cocinaTermino) {
        
        await this.db.enviarNotificacion('dueño', {
          tituloKey: 'NOTIFICACIONES_COCINA_DELIVERY.LISTO',
          cuerpoKey: 'NOTIFICACIONES_COCINA_DELIVERY.CUERPO1',
          params: {
            cliente: pedido.cliente
          },
          pedidoId: pedido.id
        });
        await this.db.enviarNotificacion('supervisor', {
          tituloKey: 'NOTIFICACIONES_COCINA_DELIVERY.LISTO',
          cuerpoKey: 'NOTIFICACIONES_COCINA_DELIVERY.CUERPO1',
          params: {
            cliente: pedido.cliente
          }
        });

        Swal.fire({
            title: this.translate.instant('SWAL_BARTENDER.PEDIDO_FINALIZADO'),
            text: this.translate.instant('SWAL_BARTENDER.NOTIFICADO'),
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            background: '#333',
            color: '#fff'
        });
    } else {
       
        Swal.fire({
            title: this.translate.instant('SWAL_BARTENDER.BEBIDAS_FINALIZADAS'),
            text: this.translate.instant('SWAL_BARTENDER.ESPERANDO'),
            icon: 'info',
            timer: 1500,
            showConfirmButton: false,
            background: '#333',
            color: '#fff'
        });
    }

    this.isLoading = false;
  }
}