import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

interface Proyecto {
  id?: number;
  idUsuario?: number;
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  estado: string;
}

interface Etiqueta {
  id: number;
  nombre: string;
}

interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

interface Tarea {
  id?: number;
  idProyecto?: number;
  idEtiqueta: number;
  titulo: string;
  descripcion: string;
  prioridad: string;
  estado: string;
  etiqueta?: Etiqueta;
  usuarioAsignado?: Usuario;
}

interface UsuarioProyecto {
  id?: number;
  idUsuario: number;
  idProyecto: number;
  rol: string;
  usuario?: Usuario;
}

@Component({
  selector: 'app-detalle-proyecto',
  imports: [CommonModule],
  templateUrl: './detalle-proyecto.html',
  styleUrl: './detalle-proyecto.scss',
})
export class DetalleProyecto implements OnInit {
  proyecto: Proyecto | null = null;
  proyectoId: number = 0;
  
  tareas: Tarea[] = [];
  usuariosProyecto: UsuarioProyecto[] = [];
  etiquetas: Etiqueta[] = [];
  
  cargando = true;
  menuAbierto = false;

  private apiProyectosUrl = 'http://localhost:8080/api/v1/proyectos';
  private apiTareasUrl = 'http://localhost:8080/api/v1/tareas';
  private apiUsuariosProyectoUrl = 'http://localhost:8080/api/v1/usuarios-proyectos';
  private apiEtiquetasUrl = 'http://localhost:8080/api/v1/etiquetas';
  private apiUsuariosUrl = 'http://localhost:8080/api/v1/usuarios';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.proyectoId = +id;
      this.cargarDatos();
    }
  }

  cargarDatos(): void {
    this.cargando = true;
    
    // Cargar proyecto
    this.http.get<Proyecto>(`${this.apiProyectosUrl}/${this.proyectoId}`).subscribe({
      next: (data) => {
        this.proyecto = data;
        this.cargarTareas();
        this.cargarUsuarios();
        this.cargarEtiquetas();
      },
      error: (err) => {
        console.error('Error al cargar proyecto:', err);
        this.volver();
      }
    });
  }

  cargarTareas(): void {
    this.http.get<Tarea[]>(`${this.apiTareasUrl}/proyecto/${this.proyectoId}`).subscribe({
      next: (data) => {
        this.tareas = data ?? [];
        this.cargando = false;
      },
      error: () => {
        this.tareas = [];
        this.cargando = false;
      }
    });
  }

  cargarUsuarios(): void {
    this.http.get<UsuarioProyecto[]>(`${this.apiUsuariosProyectoUrl}/proyecto/${this.proyectoId}`).subscribe({
      next: (data) => {
        this.usuariosProyecto = data ?? [];
        // Cargar datos completos de usuarios
        this.cargarDatosUsuarios();
      },
      error: () => this.usuariosProyecto = []
    });
  }

  cargarDatosUsuarios(): void {
    this.http.get<Usuario[]>(this.apiUsuariosUrl).subscribe({
      next: (usuarios) => {
        this.usuariosProyecto.forEach(up => {
          up.usuario = usuarios.find(u => u.id === up.idUsuario);
        });
      },
      error: (err) => console.error('Error al cargar usuarios:', err)
    });
  }

  cargarEtiquetas(): void {
    this.http.get<Etiqueta[]>(this.apiEtiquetasUrl).subscribe({
      next: (data) => this.etiquetas = data ?? [],
      error: () => this.etiquetas = []
    });
  }

  obtenerNombreEtiqueta(idEtiqueta: number): string {
    return this.etiquetas.find(e => e.id === idEtiqueta)?.nombre || 'Sin etiqueta';
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

  obtenerTextoPrioridad(prioridad: string): string {
    const prioridades: { [key: string]: string } = {
      'baja': 'Baja',
      'media': 'Media',
      'alta': 'Alta'
    };
    return prioridades[prioridad] || prioridad;
  }

  obtenerTextoEstadoTarea(estado: string): string {
    const estados: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'en_progreso': 'En Progreso',
      'completada': 'Completada'
    };
    return estados[estado] || estado;
  }

  obtenerTextoRol(rol: string): string {
    const roles: { [key: string]: string } = {
      'administrador': 'Administrador',
      'colaborador': 'Colaborador',
      'observador': 'Observador'
    };
    return roles[rol] || rol;
  }

  obtenerIniciales(nombre: string): string {
  if (!nombre || nombre.trim() === '') return 'U';
  return nombre.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();
}

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu(): void {
    this.menuAbierto = false;
  }

  editarProyecto(): void {
    this.router.navigate(['/proyectos/editar', this.proyectoId]);
  }

  eliminarProyecto(): void {
    if (confirm('¿Estás seguro de eliminar este proyecto? Se eliminarán todas las tareas y asignaciones.')) {
      this.http.delete(`${this.apiProyectosUrl}/${this.proyectoId}`).subscribe({
        next: () => {
          this.volver();
        },
        error: (error) => {
          console.error('Error al eliminar:', error);
          alert('Error al eliminar el proyecto');
        }
      });
    }
  }

  navegarATareas(): void {
    this.router.navigate(['/proyectos', this.proyectoId, 'tareas']);
  }

  navegarAUsuarios(): void {
    this.router.navigate(['/proyectos', this.proyectoId, 'usuarios']);
  }

  navegarAEtiquetas(): void {
    this.router.navigate(['/etiquetas']);
  }

  volver(): void {
    this.router.navigate(['/proyectos']);
  }

  // Estadísticas del proyecto
  get totalTareas(): number {
    return this.tareas.length;
  }

  get tareasCompletadas(): number {
    return this.tareas.filter(t => t.estado === 'completada').length;
  }

  get tareasEnProgreso(): number {
    return this.tareas.filter(t => t.estado === 'en_progreso').length;
  }

  get tareasPendientes(): number {
    return this.tareas.filter(t => t.estado === 'pendiente').length;
  }

  get porcentajeCompletado(): number {
    if (this.totalTareas === 0) return 0;
    return Math.round((this.tareasCompletadas / this.totalTareas) * 100);
  }
}