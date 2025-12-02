import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { AsyncPipe, NgIf, NgStyle } from '@angular/common';
import { interval, Subscription, switchMap } from 'rxjs';
import { InvitacionService } from '../../../core/services/invitacion';

@Component({
  selector: 'app-header',
  imports: [RouterLink, NgIf, AsyncPipe],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit, OnDestroy {
  cantidadInvitaciones = 0;
  private subscripcion?: Subscription;

  auth = inject(AuthService);
  invitacionService = inject(InvitacionService);
  router = inject(Router);

  ngOnInit(): void {
    this.auth.isAutenticado$.subscribe(autenticado => {
      if (autenticado) {
        this.cargarCantidadInvitaciones();
        this.iniciarActualizacionAutomatica();
      } else {
        this.cantidadInvitaciones = 0;
        this.detenerActualizacionAutomatica();
      }
    });
    // Escuchar evento de invitación respondida
    window.addEventListener('invitacionRespondida', () => {
      this.cargarCantidadInvitaciones();
    });
  }

  ngOnDestroy(): void {
    this.detenerActualizacionAutomatica();
  }

  cargarCantidadInvitaciones(): void {
    this.invitacionService.getInvitacionesPendientes().subscribe({
      next: (invitaciones) => {
        this.cantidadInvitaciones = invitaciones.length;
      },
      error: (err) => {
        console.error('Error al cargar invitaciones:', err);
        this.cantidadInvitaciones = 0;
      }
    });
  }

  iniciarActualizacionAutomatica(): void {
    // Actualizar cada 30 segundos
    this.subscripcion = interval(30000)
      .pipe(
        switchMap(() => this.invitacionService.getInvitacionesPendientes())
      )
      .subscribe({
        next: (invitaciones) => {
          this.cantidadInvitaciones = invitaciones.length;
        },
        error: (err) => console.error('Error en actualización automática:', err)
      });
  }

  detenerActualizacionAutomatica(): void {
    if (this.subscripcion) {
      this.subscripcion.unsubscribe();
    }
  }

  cerrarSesion() {
    this.auth.logout();
    this.router.navigate(['/inicio-sesion']);
  }
}
