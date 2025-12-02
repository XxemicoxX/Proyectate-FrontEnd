import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Invitacion, InvitacionService } from '../../../core/services/invitacion';

@Component({
  selector: 'app-mis-invitaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-invitaciones.html',
  styleUrls: ['./mis-invitaciones.scss']
})
export class MisInvitaciones implements OnInit {
  invitaciones: Invitacion[] = [];
  cargando = true;

  constructor(
    private invitacionService: InvitacionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarInvitaciones();
  }

  cargarInvitaciones(): void {
    this.cargando = true;
    this.invitacionService.getInvitacionesPendientes().subscribe({
      next: (data) => {
        this.invitaciones = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.cargando = false;
      }
    });
  }

  responder(id: number, aceptar: boolean): void {
  const mensaje = aceptar ? '¿Unirte a este proyecto?' : '¿Rechazar esta invitación?';
  
  if (confirm(mensaje)) {
    this.invitacionService.responderInvitacion(id, aceptar).subscribe({
      next: () => {
        const mensajeExito = aceptar ? '¡Te uniste al proyecto exitosamente!' : 'Invitación rechazada';
        alert(mensajeExito);
        this.cargarInvitaciones();
        
        // Emitir evento para actualizar el header
        window.dispatchEvent(new Event('invitacionRespondida'));
        
        if (aceptar) {
          this.router.navigate(['/proyectos']);
        }
      },
      error: (err) => {
        alert('Error al responder invitación');
        console.error(err);
      }
    });
  }
}

  verProyecto(proyectoId: number): void {
    this.router.navigate(['/proyectos', proyectoId]);
  }
}
