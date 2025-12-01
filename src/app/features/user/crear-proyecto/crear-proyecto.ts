import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { JwtService } from '../../../core/services/jwt';
import { FormsModule } from '@angular/forms';

interface Proyecto {
  id?: number;
  idUsuario?: number;
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  estado: string;
}

@Component({
  selector: 'app-crear-proyecto',
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-proyecto.html',
  styleUrl: './crear-proyecto.scss',
})

export class CrearProyecto implements OnInit {
  proyectos: Proyecto[] = [];
  proyectoActual: Proyecto = this.nuevoProyectoVacio();
  mostrarForm: boolean = false;
  modoEdicion: boolean = false;

  private apiProyectosUrl = 'http://localhost:8080/api/v1/proyectos';

  constructor(
    private http: HttpClient,
    private jwtService: JwtService
  ) { }

  ngOnInit(): void {
    this.cargarProyectos();
  }

  nuevoProyectoVacio(): Proyecto {
    return {
      nombre: '',
      descripcion: '',
      fechaInicio: '',
      estado: 'planificacion'
    };
  }

  cargarProyectos(): void {
    this.http.get<Proyecto[]>(this.apiProyectosUrl).subscribe({
      next: (data) => this.proyectos = data ?? [], // si es null asigna []
      error: () => this.proyectos = []             // evitar crasheo
    });
  }

  mostrarFormulario(): void {
    this.mostrarForm = true;
    this.modoEdicion = false;
    this.proyectoActual = this.nuevoProyectoVacio();
  }

  cancelarFormulario(): void {
    this.mostrarForm = false;
    this.proyectoActual = this.nuevoProyectoVacio();
    this.modoEdicion = false;
  }

  guardarProyecto(): void {
    const idUsuario = this.jwtService.getUserId();

    if (!idUsuario) {
      console.error("Token no contiene el idUsuario");
      return;
    }

    const proyectoEnviar = {
      ...this.proyectoActual,
      //!!IMPORTANTE
      id_usuario: idUsuario   // << necesario para que backend acepte el request
    };

    if (this.modoEdicion && this.proyectoActual.id) {
      this.http.put<Proyecto>(`${this.apiProyectosUrl}/{id}`, proyectoEnviar).subscribe({
        next: () => {
          this.cargarProyectos();
          this.cancelarFormulario();
        },
        error: (error) => console.error('Error al actualizar:', error)
      });
    } else {
      this.http.post<Proyecto>(`${this.apiProyectosUrl}/crear`, proyectoEnviar).subscribe({
        next: () => {
          this.cargarProyectos();
          this.cancelarFormulario();
        },
        error: (error) => console.error('Error al crear:', error)
      });
    }
  }

  editarProyecto(proyecto: Proyecto): void {
    this.proyectoActual = { ...proyecto };
    this.modoEdicion = true;
    this.mostrarForm = true;
  }

  eliminarProyecto(id: number | undefined): void {
    if (!id) return;
    if (confirm('¿Estás seguro de eliminar este proyecto?')) {
      this.http.delete(`${this.apiProyectosUrl}/${id}`).subscribe({
        next: () => {
          //Actualización inmediata
          this.proyectos = this.proyectos.filter(p => p.id !== id);
          console.log('Proyecto eliminado, lista actualizada');
        },
        error: (error) => console.error('Error al eliminar:', error)
      });
    }
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
