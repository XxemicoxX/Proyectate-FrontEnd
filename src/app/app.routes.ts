import { Routes } from '@angular/router';
import { Inicio } from './features/public/inicio/inicio';
import { NoEncontrado } from './features/public/no-encontrado/no-encontrado';
import { Nosotros } from './features/public/nosotros/nosotros';
import { Contacto } from './features/public/contacto/contacto';
import { Login } from './features/auth/login/login';
import { Registro } from './features/auth/registro/registro';

export const routes: Routes = [

    {path: '', component: Inicio, title: 'Inicio | Proyectate'},
    {
        path: 'nosotros', component: Nosotros, title: 'Nosotros | Proyectate'
    },
    {
        path: 'contacto', component: Contacto, title: 'Contacto | Proyectate'
    },
    {
        path: 'inicio-sesion', component: Login, title: 'Iniciar Sesión | Proyectate'
    },
    {
        path: 'registro', component: Registro, title: 'Registro | Proyectate'
    },
    {
        path: '**', component: NoEncontrado, title: 'Página no encontrada'
    }
];
