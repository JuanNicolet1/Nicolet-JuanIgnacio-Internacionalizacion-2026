import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faUtensils, faClock, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-cocina',
  templateUrl: './cocina.component.html',
  styleUrls: ['./cocina.component.scss'],
  standalone: true,
  imports: [FontAwesomeModule, RouterLink, CommonModule, TranslateModule],
})
export class CocinaComponent implements OnInit {
  private translate = inject(TranslateService)
  
  faArrowLeft = faArrowLeft;
  faUtensils = faUtensils;
  faClock = faClock;
  faCheckCircle = faCheckCircle;

  pedidos: any[] = [];
  subscription: Subscription | null = null;
  isLoading: boolean = true; 

  constructor(protected auth: AuthService, protected db: DatabaseService) {}

  ngOnInit() {
    this.isLoading = true;
    setTimeout(() => { if(this.isLoading && this.pedidos.length === 0) this.isLoading = false; }, 1000);

    const observable = this.db.TraerUsuario('pedidos');

    this.subscription = observable.subscribe((resultado) => {
      this.pedidos = (resultado as any[]).filter(
        (pedido) =>
          pedido.productos.some((prod: any) => 
           
            prod.tipoProducto === 'comida' || prod.tipoProducto === 'postre'
          ) &&
          !pedido.cocinaFinalizada &&
          pedido.estadoPedido === 'enPreparacion'
      );
      this.isLoading = false;
    });
  }

 
  async finalizarPedido(pedido: any) {
    this.isLoading = true;
    pedido.cocinaFinalizada = true;

   
    let barFinalizado;
    if (pedido.barFinalizado) {
      barFinalizado = true;
    } else {
      barFinalizado = false;
    }

    
    await this.db.enviarNotificacion('mesero', {
      titulo: this.translate.instant('NOTIFICACIONES_COCINA.FINALIZADO'),
      cuerpo: `${this.translate.instant('NOTIFICACIONES_COCINA.LISTAS')}`,
      pedidoEnProduccion: true,
      cocinaFinalizada: true,
      barFinalizado: barFinalizado, 
      noRedirigir: true,
      mesa: pedido.mesa,
    });

  
    if (pedido.cocinaFinalizada && barFinalizado) {
      pedido.estadoPedido = 'porEntregar';
    }
    
    await this.db.ModificarObjeto(pedido, 'pedidos');

    this.isLoading = false;

    Swal.fire({
      heightAuto: false,
      title: this.translate.instant('SWAL_CHEF.COMIDAS_NOTIFICADAS'),
      icon: 'success',
      background: '#333',
      color: '#fff',
      confirmButtonColor: '#780000',
      confirmButtonText: this.translate.instant('SWAL_GENERAL.ACEPTAR'),
    });
  }
}