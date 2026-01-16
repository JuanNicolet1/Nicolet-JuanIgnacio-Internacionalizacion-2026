import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faUtensils, faClock, faBan, faCheckCircle, faClipboardList } from '@fortawesome/free-solid-svg-icons';
import { Subscription, firstValueFrom } from 'rxjs'; 
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-confirmar-pedido',
  templateUrl: './confirmar-pedido.component.html',
  styleUrls: ['./confirmar-pedido.component.scss'],
  standalone: true,
  imports: [FontAwesomeModule, RouterLink, CommonModule, TranslateModule],
})
export class ConfirmarPedidoComponent implements OnInit {
  private translate = inject(TranslateService)
  faArrowLeft = faArrowLeft;
  faUtensils = faUtensils;
  faClock = faClock;
  faBan = faBan;
  faCheckCircle = faCheckCircle;
  faClipboardList = faClipboardList;

  pedidosPendientes: any[] = [];
  subscription: Subscription | null = null;
  isLoading: boolean = true; 

  constructor(protected auth: AuthService, protected db: DatabaseService) {}

  ngOnInit(): void {
    this.isLoading = true;
    setTimeout(() => { if(this.isLoading && this.pedidosPendientes.length === 0) this.isLoading = false; }, 1000);

    const observable = this.db.traerPedidos();

    this.subscription = observable.subscribe((resultado) => {
      this.pedidosPendientes = (resultado as any[]).filter((doc) => doc.estadoPedido === 'porAceptar');
      this.isLoading = false; 
    });
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

  async confirmarPedido(pedido: any) {
    const { value: tiempo } = await Swal.fire({
      title: this.translate.instant('SWAL_MESERO.ACEPTAR_PEDIDO'),
      text: `${this.translate.instant('SWAL_DUENO.MESA')} ${pedido.mesa} - ${this.translate.instant('SWAL_MESERO.CONFIRMAR_PEDIDO')}:`,
      input: 'number',
      inputValue: 30,
      inputLabel: this.translate.instant('SWAL_MESERO.MINUTOS'),
      background: '#333',
      color: '#fff',
      confirmButtonColor: '#4caf50',
      confirmButtonText: this.translate.instant('SWAL_GENERAL.CONFIRMAR'),
      showCancelButton: true,
      cancelButtonText: this.translate.instant('SWAL_GENERAL.CANCELAR')
    });

    if (!tiempo) return; 

    this.isLoading = true; 

    try {

        await this.db.enviarNotificacion('chef', {
            titulo: this.translate.instant('NOTIFICACIONES_PRODUCTOS.NUEVO_PEDIDO'),
            cuerpo: `${this.translate.instant('NOTIFICACIONES_PRODUCTOS.MESA')} ${pedido.mesa} ${this.translate.instant('NOTIFICACIONES_PRODUCTOS.ESPERA')}.`,
        });

        const hayBebidas = pedido.productos.some((p:any) => p.tipoProducto === 'bebida');
        if(hayBebidas) {
            await this.db.enviarNotificacion('bartender', {
                titulo: this.translate.instant('NOTIFICACIONES_PRODUCTOS.NUEVA_BEBIDA'),
                cuerpo: `${this.translate.instant('NOTIFICACIONES_PRODUCTOS.MESA')} ${pedido.mesa} ${this.translate.instant('NOTIFICACIONES_PRODUCTOS.ESPERA2')}.`,
            });
        }
  

        pedido.estadoPedido = 'enPreparacion';
        pedido.tiempoEstimado = tiempo; 
        await this.db.ModificarObjeto(pedido, 'pedidos');


        await this.actualizarEstadoCliente(pedido.cliente, 'enPreparacion');

        Swal.fire({
            icon: 'success',
            title: this.translate.instant('SWAL_MESERO.ENVIADO'),
            timer: 1500,
            showConfirmButton: false,
            background: '#333', color: '#fff'
        });

    } catch (error) {
        console.error(error);
    } finally {
        this.isLoading = false;
    }
  }

  async rechazarPedido(pedido: any) {
    const { value: motivo } = await Swal.fire({
        title: this.translate.instant('SWAL_MESERO.RECHAZAR'),
        input: 'text',
        inputPlaceholder: this.translate.instant('SWAL_MESERO.MOTIVO'),
        showCancelButton: true,
        confirmButtonText: this.translate.instant('SWAL_GENERAL.RECHAZAR'),
        confirmButtonColor: '#d33',
        background: '#333', color: '#fff'
    });

    if (!motivo) return;

    this.isLoading = true;

    await this.db.enviarNotificacion('cliente', {
        titulo: this.translate.instant('NOTIFICACIONES_PRODUCTOS.RECHAZADO'),
        cuerpo: `${this.translate.instant('NOTIFICACIONES_PRODUCTOS.MOTIVO')}: ${motivo}. ${this.translate.instant('NOTIFICACIONES_PRODUCTOS.INDICAR_MOTIVO')}.`,
        cliente: pedido.cliente 
    });

   
    pedido.productos = []; 
    pedido.estadoPedido = 'cancelado';
    pedido.motivoRechazo = motivo;
    await this.db.ModificarObjeto(pedido, 'pedidos');
    

    await this.actualizarEstadoCliente(pedido.cliente, 'cancelado');

    this.isLoading = false;
  }
}