import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { JwtService } from '../../../core/services/jwt';
import { Router } from '@angular/router';

interface Proyecto {
  id?: number;
  idUsuario?: number;
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  estado: string;
}

@Component({
  selector: 'app-lista-proyectos',
  imports: [CommonModule],
  templateUrl: './lista-proyectos.html',
  styleUrl: './lista-proyectos.scss',
})
export class ListaProyectos implements OnInit {
  proyectos: Proyecto[] = [];
  proyectoMenuAbierto: number | null = null;

  private apiProyectosUrl = 'http://localhost:8080/api/v1/proyectos';

  constructor(
    private http: HttpClient,
    private jwtService: JwtService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarProyectos();
  }

  cargarProyectos(): void {
    this.http.get<Proyecto[]>(this.apiProyectosUrl).subscribe({
      next: (data) => {
        this.proyectos = data ?? [];
        console.log('Proyectos cargados:', this.proyectos);
      },
      error: (err) => {
        console.error('Error al cargar proyectos:', err);
        this.proyectos = [];
      }
    });
  }

  navegarACrear(): void {
    this.router.navigate(['/proyectos/crear']);
  }

  editarProyecto(proyecto: Proyecto): void {
    this.router.navigate(['/proyectos/editar', proyecto.id]);
  }

  eliminarProyecto(id: number | undefined, event: Event): void {
    event.stopPropagation();
    if (!id) return;

    if (confirm('¿Estás seguro de eliminar este proyecto?')) {
      this.http.delete(`${this.apiProyectosUrl}/${id}`).subscribe({
        next: () => {
          // Actualizar la lista local inmediatamente
          this.proyectos = this.proyectos.filter(p => p.id !== id);
          console.log('Proyecto eliminado. Proyectos restantes:', this.proyectos.length);
        },
        error: (error) => {
          console.error('Error al eliminar:', error);
          alert('Error al eliminar el proyecto');
        }
      });
    }
  }

  toggleMenu(proyectoId: number | undefined, event: Event): void {
    event.stopPropagation();
    this.proyectoMenuAbierto = this.proyectoMenuAbierto === proyectoId ? null : proyectoId ?? null;
  }

  cerrarMenus(): void {
    this.proyectoMenuAbierto = null;
  }

  navegarATareas(proyecto: Proyecto, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/proyectos', proyecto.id, 'tareas']);
    this.proyectoMenuAbierto = null;
  }

  navegarAUsuarios(proyecto: Proyecto, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/proyectos', proyecto.id, 'usuarios']);
    this.proyectoMenuAbierto = null;
  }

  verDetalles(proyecto: Proyecto): void {
    this.router.navigate(['/proyectos', proyecto.id]);
  }

  obtenerTextoEstado(estado: string): string {
    const estados: { [key: string]: string } = {
      'planificacion': 'Planificación',
      'en_progreso': 'En Progreso',
      'completado': 'Completado',
      'pausado': 'Pausado'
    };
    return estados[estado] || estado;
  }
}