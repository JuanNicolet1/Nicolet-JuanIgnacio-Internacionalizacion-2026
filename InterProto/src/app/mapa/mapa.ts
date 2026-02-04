import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, inject, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Importante para *ngIf
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faSearch, faMapMarkerAlt, faLocationArrow } from '@fortawesome/free-solid-svg-icons';
import * as L from 'leaflet';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

@Component({
  selector: 'app-map-direccion-pedido',
  templateUrl: './mapa.html',
  styleUrls: ['./mapa.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    TranslateModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Mapa implements AfterViewInit {

  faArrowLeft = faArrowLeft;
  faSearch = faSearch;
  faMapMarkerAlt = faMapMarkerAlt;
  faLocationArrow = faLocationArrow;

  private cdr = inject(ChangeDetectorRef);
  private translate = inject(TranslateService);
  router = inject(Router);
  
  map!: L.Map;
  marker!: L.Marker;
  
  coordenadaSeleccionada: { lat: number; lng: number } | null = null;
  direccion: string = '';
  buscando: boolean = false;

  ngAfterViewInit() {
    this.initMap();
  }

 initMap() {
    const centro = L.latLng(-34.6037, -58.3816); 
    
    this.map = L.map('map', {
        center: centro,
        zoom: 13,
        zoomControl: true, // Cámbialo a true si quieres los botones con el estilo nuevo
    });

    // Forzar renderizado correcto
    setTimeout(() => {
        this.map.invalidateSize();
    }, 100);

    


     L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '© OpenStreetMap, © CartoDB',
          maxZoom: 19
        }).addTo(this.map);



    this.map.on('click', async (e: L.LeafletMouseEvent) => {

    this.marcarUbicacion(e.latlng);
    

    this.direccion = "Buscando nombre de la calle...";
    
   
    await this.obtenerDireccion(e.latlng.lat, e.latlng.lng);
  });
    

    setTimeout(() => { this.map.invalidateSize(); }, 500);
  }

  marcarUbicacion(latLng: L.LatLng) {
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    this.marker = L.marker(latLng).addTo(this.map);
    

    this.map.flyTo(latLng, 16, { duration: 1.5 });

    this.coordenadaSeleccionada = {
      lat: latLng.lat,
      lng: latLng.lng
    };
  }

  async buscarDireccion() {
    if(!this.direccion.trim()) return;
    
    this.buscando = true;

    try {
      const response = await fetch(
        `https://servidor-local.onrender.com/buscar?q=${encodeURIComponent(this.direccion)}`
      );

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latLng = L.latLng(parseFloat(lat), parseFloat(lon));

        this.marcarUbicacion(latLng);
        


      } else {
        this.mostrarError('Dirección no encontrada');
      }

    } catch (error) {
      console.error('Error:', error);
      this.mostrarError('Error de conexión');
    } finally {
      this.buscando = false;
    }
  }

  

  volver() {
    this.router.navigate(['/inicio']);
  }

  mostrarError(msg: string){
    Swal.fire({
        text: msg,
        icon: 'error',
        toast: true,
        position: 'top',
        background: '#d84f45',
        color: '#fff',
        showConfirmButton: false,
        timer: 2000
    });
  }

  async obtenerDireccion(lat: number, lng: number) {
  try {
    const response = await fetch(
      `https://servidor-local.onrender.com/reverse?lat=${lat}&lon=${lng}`
    );
    const data = await response.json();

    if (data && data.address) {
      // 2. Extraer el código del país (ej: 'ar', 'br', 'ru')
      const codigoPais = data.address.country_code.toLowerCase();
      
      // 3. Llamar a la función que cambia el idioma
      this.cambiarIdiomaPorGps(codigoPais);

      // Actualizar texto de dirección
      this.direccion = data.display_name;
    }
    this.cdr.detectChanges();
  } catch (error) {
    console.error('Error:', error);
  }
}

cambiarIdiomaPorGps(codigo: string) {
  const mapeo: { [key: string]: string } = {
    'br': 'pt', 'pt': 'pt', 'ao': 'pt', 'tl': 'pt',   // Portugués
    'us': 'en', 'gb': 'en', 'ca': 'en', 'bz': 'en', 'za': 'en', 'au': 'en',   // Inglés
    'nz': 'en', 'bs': 'en',                     // Inglés
    'de': 'de', 'at': 'de',                     // Alemán
    'fr': 'fr', 'be': 'fr',                     // Francés
    'ru': 'ru', 'by': 'ru', 'kz': 'ru',         // Ruso
    'ar': 'es', 'cl': 'es', 'mx': 'es', 'uy': 'es', 'co': 'es' // Español
  };

  // Si el país no está en la lista, usa 'es' (español por defecto)
  const nuevoIdioma = mapeo[codigo] || 'es';
  
  this.translate.use(nuevoIdioma);
  console.log("Idioma cambiado a:", nuevoIdioma);
}
}