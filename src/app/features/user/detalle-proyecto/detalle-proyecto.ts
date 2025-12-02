import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

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

interface TareaDetalle {
  id?: number;
  titulo: string;
  descripcion: string;
  prioridad: string;
  estado: string;
  id_proyecto: number;
  id_etiqueta?: number | null;
  id_usuario?: number | null;
  nombreEtiqueta?: string;
  nombreUsuario?: string;
}

interface UsuarioConRol extends Usuario {
  rol: string;
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
  
  tareas: TareaDetalle[] = [];
  usuariosProyecto: UsuarioConRol[] = [];
  etiquetas: Etiqueta[] = [];
  
  cargando = true;
  menuAbierto = false;

  private apiProyectosUrl = 'http://localhost:8080/api/v1/proyectos';
  private apiTareasUrl = 'http://localhost:8080/api/v1/tareas';
  private apiUsuariosProyectoUrl = 'http://localhost:8080/api/v1/usuarios-proyectos';
  private apiEtiquetasUrl = 'http://localhost:8080/api/v1/etiquetas';

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
    
    // Primero cargar el proyecto
    this.http.get<Proyecto>(`${this.apiProyectosUrl}/${this.proyectoId}`).subscribe({
      next: (proyecto) => {
        this.proyecto = proyecto;
        console.log('Proyecto cargado:', this.proyecto);

        // Luego cargar el resto de datos en paralelo
        forkJoin({
          etiquetas: this.http.get<Etiqueta[]>(this.apiEtiquetasUrl),
          usuarios: this.http.get<any[]>(`${this.apiUsuariosProyectoUrl}/proyecto/${this.proyectoId}/detalles`),
          tareas: this.http.get<any[]>(`${this.apiTareasUrl}/proyecto/${this.proyectoId}`)
        }).subscribe({
          next: (data) => {
            // Etiquetas
            this.etiquetas = data.etiquetas ?? [];
            console.log('Etiquetas cargadas:', this.etiquetas);

            // Usuarios con rol
            this.usuariosProyecto = (data.usuarios ?? []).map(up => ({
              id: up.id_usuario,
              nombre: up.nombre_usuario,
              email: up.email_usuario,
              rol: up.rol
            }));
            console.log('Usuarios del proyecto:', this.usuariosProyecto);

            // Tareas enriquecidas con nombres
            this.tareas = (data.tareas ?? []).map(tarea => ({
              id: tarea.id,
              titulo: tarea.titulo,
              descripcion: tarea.descripcion,
              prioridad: tarea.prioridad,
              estado: tarea.estado,
              id_proyecto: tarea.id_proyecto,
              id_etiqueta: tarea.id_etiqueta,
              id_usuario: tarea.id_usuario,
              nombreEtiqueta: this.obtenerNombreEtiqueta(tarea.id_etiqueta),
              nombreUsuario: this.obtenerNombreUsuario(tarea.id_usuario)
            }));
            console.log('Tareas procesadas:', this.tareas);

            this.cargando = false;
          },
          error: (err) => {
            console.error('Error al cargar datos complementarios:', err);
            // Aunque falle, mostramos el proyecto
            this.etiquetas = [];
            this.usuariosProyecto = [];
            this.tareas = [];
            this.cargando = false;
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar proyecto:', err);
        this.cargando = false;
        alert('Error al cargar el proyecto. Puede que no exista o no tengas permisos.');
        this.volver();
      }
    });
  }

  obtenerNombreEtiqueta(idEtiqueta: number | null | undefined): string {
    if (!idEtiqueta) return 'Sin etiqueta';
    const etiqueta = this.etiquetas.find(e => e.id === idEtiqueta);
    return etiqueta?.nombre || 'Sin etiqueta';
  }

  obtenerNombreUsuario(idUsuario: number | null | undefined): string {
    if (!idUsuario) return 'Sin asignar';
    const usuario = this.usuariosProyecto.find(u => u.id === idUsuario);
    return usuario?.nombre || 'Sin asignar';
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
    this.cerrarMenu();
    this.router.navigate(['/proyectos/editar', this.proyectoId]);
  }

  eliminarProyecto(): void {
    this.cerrarMenu();
    if (confirm('¿Estás seguro de eliminar este proyecto? Se eliminarán todas las tareas y asignaciones.')) {
      this.http.delete(`${this.apiProyectosUrl}/${this.proyectoId}`).subscribe({
        next: () => {
          alert('Proyecto eliminado exitosamente');
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

  get totalUsuarios(): number {
    return this.usuariosProyecto.length;
  }
}