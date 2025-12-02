import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Invitacion, InvitacionService } from '../../../core/services/invitacion';

@Component({
  selector: 'app-invitar-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invitar-usuario.html',
  styleUrls: ['./invitar-usuario.scss']
})
export class InvitarUsuario implements OnInit {
  proyectoId: number = 0;
  nombreProyecto: string = '';
  nuevaInvitacion: Invitacion = {
    id_proyecto: 0,
    email_invitado: '',
    rol_asignado: 'MEMBER'
  };
  invitacionesPendientes: Invitacion[] = [];
  enviando = false;
  mensajeExito = '';
  mensajeError = '';

  constructor(
    private invitacionService: InvitacionService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.proyectoId = +id;
      this.nuevaInvitacion.id_proyecto = this.proyectoId;
      this.cargarInvitacionesPendientes();
    }
  }

  cargarInvitacionesPendientes(): void {
    this.invitacionService.getInvitacionesPorProyecto(this.proyectoId).subscribe({
      next: (data) => {
        this.invitacionesPendientes = data.filter(inv => inv.estado === 'PENDIENTE');
      },
      error: (err) => console.error('Error al cargar invitaciones:', err)
    });
  }

  enviarInvitacion(): void {
    this.enviando = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    this.invitacionService.enviarInvitacion(this.nuevaInvitacion).subscribe({
      next: (response) => {
        this.mensajeExito = '✓ Invitación enviada exitosamente';
        this.nuevaInvitacion.email_invitado = '';
        this.nuevaInvitacion.rol_asignado = 'MEMBER';
        this.cargarInvitacionesPendientes();
        this.enviando = false;
        
        setTimeout(() => this.mensajeExito = '', 5000);
      },
      error: (error) => {
        this.mensajeError = error.error || 'Error al enviar invitación';
        this.enviando = false;
        setTimeout(() => this.mensajeError = '', 5000);
      }
    });
  }

  cancelarInvitacion(id: number): void {
    if (confirm('¿Cancelar esta invitación?')) {
      this.invitacionService.cancelarInvitacion(id).subscribe({
        next: () => {
          this.cargarInvitacionesPendientes();
          this.mensajeExito = '✓ Invitación cancelada';
          setTimeout(() => this.mensajeExito = '', 3000);
        },
        error: (error) => {
          this.mensajeError = 'Error al cancelar invitación';
          setTimeout(() => this.mensajeError = '', 3000);
        }
      });
    }
  }

  volver(): void {
    this.router.navigate(['/proyectos', this.proyectoId, 'tareas']);
  }
}