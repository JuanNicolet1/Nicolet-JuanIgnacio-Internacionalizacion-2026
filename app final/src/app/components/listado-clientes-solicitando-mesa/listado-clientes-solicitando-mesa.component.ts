import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faChair, faUtensils, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { Cliente } from 'src/app/classes/cliente';
import { Mesa } from 'src/app/classes/mesa';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-listado-clientes-solicitando-mesa',
  templateUrl: './listado-clientes-solicitando-mesa.component.html',
  styleUrls: ['./listado-clientes-solicitando-mesa.component.scss'],
  standalone: true,
  imports: [FontAwesomeModule, RouterLink, CommonModule, TranslateModule],
})
export class ListadoClientesSolicitandoMesaComponent implements OnInit {
  private translate = inject(TranslateService)

  faArrowLeft = faArrowLeft;
  faChair = faChair;
  faUtensils = faUtensils;
  faCheckCircle = faCheckCircle;

  clientes: any[] = [];
  mesas: Mesa[] = [];
  subscription: Subscription | null = null;
  
  mostrarMesasDisponibles: boolean = false;
  usuarioSeleccionado: any | null = null;
  isLoading: boolean = true; 

  constructor(
    protected auth: AuthService,
    protected db: DatabaseService,
    protected router: Router
  ) {}

  ngOnInit() {
    this.isLoading = true;


    const observable = this.db.TraerUsuario('clientes');
    this.subscription = observable.subscribe((resultado) => {
      this.clientes = (resultado as any[])
        .filter((doc) => doc.estadoMesa === 'solicitada')
        .map(
          (doc) =>
            new Cliente(
              doc.nombre,
              doc.apellido,
              doc.dni,
              doc.foto,
              doc.acceso,
              doc.email,
              doc.id,
              doc.estadoMesa
            )
        );

      if(this.mesas.length > 0) this.isLoading = false; 
    });


    const observableMesas = this.db.TraerObjeto('mesas');
    observableMesas.subscribe((resultado) => {
      this.actualizarEstadosDeMesas(resultado);
      if(this.clientes) this.isLoading = false; 
    });
  }

  actualizarEstadosDeMesas(resultado: any[]) {
    const ahora = new Date();
    this.mesas = resultado.map((doc) => {
      const fechaReserva = doc.fechaReserva ? new Date(doc.fechaReserva) : null;


      if (doc.estado === 'desocupada' && fechaReserva && fechaReserva <= ahora) {
          //logica de vencimiento falta
      }

      return new Mesa(
        doc.numero,
        doc.estado,
        doc.ocupadaPor,
        doc.id,
        doc.foto,
        doc.qrString,
        doc.qrImage,
        doc.reservadaPor,
        doc.fechaReserva,
      );
    });
  }


  prepararAsignacion(cliente: Cliente) {
    this.isLoading = true;
    setTimeout(() => { this.isLoading = false; }, 1000);
    this.usuarioSeleccionado = cliente;
    this.mostrarMesasDisponibles = true;
  }

  cerrarModalMesas() {
    this.mostrarMesasDisponibles = false;
    this.usuarioSeleccionado = null;
  }


  async asignarMesa(mesa: Mesa) {
    if (!this.usuarioSeleccionado) return;

    this.isLoading = true; 


    mesa.estado = 'ocupada';
    mesa.ocupadaPor = this.usuarioSeleccionado.nombre;
    await this.db.ModificarObjeto(mesa, 'mesas');

    this.usuarioSeleccionado.estadoMesa = mesa.numero; 
    await this.db.ModificarObjeto(this.usuarioSeleccionado, 'clientes');


    const nombreCliente = this.usuarioSeleccionado.nombre;

    this.isLoading = false;
    

    this.cerrarModalMesas(); 

    await this.db.enviarNotificacion('cliente', {
        titulo: this.translate.instant('NOTIFICACIONES_MESA.ASIGNADA'),
        cuerpo: `${this.translate.instant('NOTIFICACIONES_MESA.DISFRUTES')} ${mesa.numero}`,
    });

    Swal.fire({
      title: this.translate.instant('SWAL_MAITRE.ASIGNAR_MESA'),
      text: `${this.translate.instant('SWAL_MAITRE.MESA')} ${mesa.numero} ${this.translate.instant('SWAL_MAITRE_PARA')} ${nombreCliente}`, 
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
      background: '#333',
      color: '#fff',
      heightAuto: false 
    });
  }

  volver() {
    this.router.navigateByUrl('/home');
  }
}