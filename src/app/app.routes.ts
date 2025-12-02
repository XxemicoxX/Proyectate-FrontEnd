import { Routes } from '@angular/router';
import { Inicio } from './features/public/inicio/inicio';
import { NoEncontrado } from './features/public/no-encontrado/no-encontrado';
import { Nosotros } from './features/public/nosotros/nosotros';
import { Contacto } from './features/public/contacto/contacto';
import { Login } from './features/auth/login/login';
import { Registro } from './features/auth/registro/registro';
import { Proyecto } from './features/user/proyecto/proyecto';
import { authGuard } from './core/guards/auth-guard';
import { CrearProyecto } from './features/user/crear-proyecto/crear-proyecto';
import { ListaProyectos } from './features/user/lista-proyectos/lista-proyectos';
import { GestionTareas } from './features/user/gestion-tareas/gestion-tareas';
import { GestionUsuarios } from './features/user/gestion-usuarios/gestion-usuarios';
import { FormProyecto } from './features/user/form-proyecto/form-proyecto';
import { Dashboard } from './features/admin/dashboard/dashboard';
import { roleGuard } from './core/guards/role-guard';
import { NoAutorizado } from './features/public/no-autorizado/no-autorizado';

export const routes: Routes = [

    { path: '', component: Inicio, title: 'Inicio | Proyectate' },
    { path: 'nosotros', component: Nosotros, title: 'Nosotros | Proyectate' },
    { path: 'contacto', component: Contacto, title: 'Contacto | Proyectate' },
    { path: 'inicio-sesion', component: Login, title: 'Iniciar Sesión | Proyectate' },
    { path: 'registro', component: Registro, title: 'Registro | Proyectate' },
    { path: 'crear-proyecto', component: CrearProyecto, title: 'Crear Proyecto | Proyectate' },
    {path: 'dashboard', component: Dashboard, title: 'Dashboard | Admin', canActivate: [roleGuard], data: { roles: ["ADMIN"] }},
    { path: 'proyectos', children: [
        {path: '', component: ListaProyectos},
        {path: 'crear', component: FormProyecto},
        {path: 'crear', component: FormProyecto},
        {path: 'editar/:id', component: FormProyecto},
        {path: ':id/tareas', component: GestionTareas},
        {path: ':id/usuarios', component: GestionUsuarios}
    ],  canActivate: [roleGuard], data: { roles: ["USER"] }},
    { path: '', redirectTo: '/proyectos', pathMatch: 'full'},
    { path: '**', component: NoEncontrado, title: 'Página no encontrada' },
    { path: 'no-autorizado', component: NoAutorizado, title: 'Pagina no accesible'}
];