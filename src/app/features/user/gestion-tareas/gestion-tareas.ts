import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

interface Etiqueta {
  id: number;
  nombre: string;
}

interface Tarea {
  id?: number;
  idProyecto?: number;
  idEtiqueta: number;
  titulo: string;
  descripcion: string;
  prioridad: string;
  estado: string;
}

interface Proyecto {
  id?: number;
  nombre: string;
  descripcion: string;
}

@Component({
  selector: 'app-gestion-tareas',
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-tareas.html',
  styleUrl: './gestion-tareas.scss',
})
export class GestionTareas implements OnInit {
  proyecto: Proyecto | null = null;
  proyectoId: number = 0;
  
  etiquetas: Etiqueta[] = [];
  tareas: Tarea[] = [];
  
  nuevaTarea: Tarea = this.nuevaTareaVacia();
  mostrarFormulario = false;
  modoEdicion = false;
  cargando = false;

  private apiProyectosUrl = 'http://localhost:8080/api/v1/proyectos';
  private apiEtiquetasUrl = 'http://localhost:8080/api/v1/etiquetas';
  private apiTareasUrl = 'http://localhost:8080/api/v1/tareas';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.proyectoId = +id;
      this.cargarProyecto();
      this.cargarEtiquetas();
      this.cargarTareas();
    }
  }

  nuevaTareaVacia(): Tarea {
    return {
      idEtiqueta: 0,
      titulo: '',
      descripcion: '',
      prioridad: 'media',
      estado: 'pendiente'
    };
  }

  cargarProyecto(): void {
    this.http.get<Proyecto>(`${this.apiProyectosUrl}/${this.proyectoId}`).subscribe({
      next: (data) => this.proyecto = data,
      error: (err) => {
        console.error('Error al cargar proyecto:', err);
        this.volver();
      }
    });
  }

  cargarEtiquetas(): void {
    this.http.get<Etiqueta[]>(this.apiEtiquetasUrl).subscribe({
      next: (data) => this.etiquetas = data ?? [],
      error: () => this.etiquetas = []
    });
  }

  cargarTareas(): void {
    this.http.get<Tarea[]>(`${this.apiTareasUrl}/proyecto/${this.proyectoId}`).subscribe({
      next: (data) => this.tareas = data ?? [],
      error: () => this.tareas = []
    });
  }

  mostrarFormCrear(): void {
    this.nuevaTarea = this.nuevaTareaVacia();
    this.modoEdicion = false;
    this.mostrarFormulario = true;
  }

  editarTarea(tarea: Tarea): void {
    this.nuevaTarea = { ...tarea };
    this.modoEdicion = true;
    this.mostrarFormulario = true;
  }

  guardarTarea(): void {
    this.cargando = true;

    const tareaEnviar = {
      ...this.nuevaTarea,
      id_proyecto: this.proyectoId,
      id_etiqueta: this.nuevaTarea.idEtiqueta
    };

    if (this.modoEdicion && this.nuevaTarea.id) {
      this.http.put<Tarea>(`${this.apiTareasUrl}/${this.nuevaTarea.id}`, tareaEnviar).subscribe({
        next: () => {
          this.cargarTareas();
          this.cancelarFormulario();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al actualizar tarea:', error);
          this.cargando = false;
        }
      });
    } else {
      this.http.post<Tarea>(`${this.apiTareasUrl}/crear`, tareaEnviar).subscribe({
        next: () => {
          this.cargarTareas();
          this.cancelarFormulario();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al crear tarea:', error);
          this.cargando = false;
        }
      });
    }
  }

  eliminarTarea(id: number | undefined): void {
    if (!id) return;

    if (confirm('¿Eliminar esta tarea?')) {
      this.http.delete(`${this.apiTareasUrl}/${id}`).subscribe({
        next: () => {
          this.tareas = this.tareas.filter(t => t.id !== id);
        },
        error: (error) => console.error('Error al eliminar:', error)
      });
    }
  }

  cancelarFormulario(): void {
    this.nuevaTarea = this.nuevaTareaVacia();
    this.mostrarFormulario = false;
    this.modoEdicion = false;
  }

  obtenerNombreEtiqueta(id: number): string {
    return this.etiquetas.find(e => e.id === id)?.nombre || 'Sin etiqueta';
  }

  obtenerTextoPrioridad(prioridad: string): string {
    const prioridades: { [key: string]: string } = {
      'baja': 'Baja',
      'media': 'Media',
      'alta': 'Alta'
    };
    return prioridades[prioridad] || prioridad;
  }

  obtenerTextoEstado(estado: string): string {
    const estados: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'en_progreso': 'En Progreso',
      'completada': 'Completada'
    };
    return estados[estado] || estado;
  }

  volver(): void {
    this.router.navigate(['/proyectos']);
  }
}
