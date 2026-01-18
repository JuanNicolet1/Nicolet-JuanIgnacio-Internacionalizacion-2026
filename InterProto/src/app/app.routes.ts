import { Routes } from '@angular/router';

export const routes: Routes = [
    {path: '', redirectTo: 'inicio', pathMatch: 'full'},
    {
     path: 'inicio',
     loadComponent: () =>
       import('./inicio/inicio').then(
         (m) => m.Inicio
       ),
   },
   {
     path: 'mapa',
     loadComponent: () =>
       import('./mapa/mapa').then(
         (m) => m.Mapa
       ),
   },
   {
     path: 'menu',
     loadComponent: () =>
       import('./menu/menu').then(
         (m) => m.Menu
       ),
   },
   {
     path: 'idiomas',
     loadComponent: () =>
       import('./idiomas/idiomas').then(
         (m) => m.IdiomasComponent
       ),
   },
];
