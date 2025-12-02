import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ComentarioService } from '../../../core/services/comentario';
import { JwtService } from '../../../core/services/jwt';
import { ComentarioInterface } from '../../../shared/model/comentario.interface';

interface Tarea {
  id?: number;
  titulo: string;
  descripcion: string;
  prioridad: string;
  estado: string;
  id_proyecto?: number;
  id_etiqueta?: number;
  id_usuario?: number;
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

interface Comentario {
  id?: number;
  contenido: string;
  fecha_creacion?: string;
  usuario_id?: number;
  nombre_usuario?: string;
  tarea_id: number;
  usuario?: {
    id: number;
    nombre: string;
  };
}

@Component({
  selector: 'app-detalle-tarea',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-tarea.html',
  styleUrls: ['./detalle-tarea.scss']
})
export class DetalleTarea implements OnInit {
  tareaId: number = 0;
  proyectoId: number = 0;
  tarea: Tarea | null = null;
  etiqueta: Etiqueta | null = null;
  usuarioAsignado: Usuario | null = null;
  comentarios: Comentario[] = [];
  nuevoComentario: string = '';
  usuarioActualId: number | null = null;
  enviandoComentario = false;
  cargando = true;

  private apiTareasUrl = 'http://localhost:8080/api/v1/tareas';
  private apiEtiquetasUrl = 'http://localhost:8080/api/v1/etiquetas';
  private apiUsuariosUrl = 'http://localhost:8080/api/v1/users';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private comentarioService: ComentarioService,
    private jwtService: JwtService
  ) {}

  ngOnInit(): void {
    this.usuarioActualId = this.jwtService.getUserId();
    console.log('👤 Usuario actual ID:', this.usuarioActualId);
    
    const tareaId = this.route.snapshot.paramMap.get('tareaId');
    const proyectoId = this.route.snapshot.paramMap.get('id');
    
    if (tareaId && proyectoId) {
      this.tareaId = +tareaId;
      this.proyectoId = +proyectoId;
      this.cargarTarea();
      this.cargarComentarios();
    } else {
      console.error('❌ Faltan parámetros de ruta');
      this.cargando = false;
    }
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  cargarTarea(): void {
    console.log('📋 Cargando tarea:', this.tareaId);
    this.http.get<Tarea>(`${this.apiTareasUrl}/${this.tareaId}`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        console.log('✅ Tarea cargada:', data);
        this.tarea = data;
        if (data.id_etiqueta) {
          this.cargarEtiqueta(data.id_etiqueta);
        }
        if (data.id_usuario) {
          this.cargarUsuarioAsignado(data.id_usuario);
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar tarea:', err);
        this.cargando = false;
        alert('Error al cargar la tarea');
        this.volver();
      }
    });
  }

  cargarEtiqueta(id: number): void {
    this.http.get<Etiqueta>(`${this.apiEtiquetasUrl}/${id}`).subscribe({
      next: (data) => {
        console.log('✅ Etiqueta cargada:', data);
        this.etiqueta = data;
      },
      error: (err) => {
        console.error('❌ Error al cargar etiqueta:', err);
        this.etiqueta = null;
      }
    });
  }

  cargarUsuarioAsignado(id: number): void {
    this.http.get<Usuario>(`${this.apiUsuariosUrl}/${id}`).subscribe({
      next: (data) => {
        console.log('✅ Usuario asignado cargado:', data);
        this.usuarioAsignado = data;
      },
      error: (err) => {
        console.error('❌ Error al cargar usuario:', err);
        this.usuarioAsignado = null;
      }
    });
  }

  cargarComentarios(): void {
    console.log('💬 Cargando comentarios de tarea:', this.tareaId);
    this.comentarioService.getComentariosByTarea(this.tareaId).subscribe({
      next: (data) => {
        console.log('✅ Comentarios cargados:', data);
        // Procesar comentarios para crear el objeto usuario
        this.comentarios = data.map(c => ({
          ...c,
          usuario: {
            id: c.usuario_id || 0,
            nombre: c.nombre_usuario || 'Usuario'
          }
        }));
      },
      error: (err) => {
        console.error('❌ Error al cargar comentarios:', err);
        this.comentarios = [];
      }
    });
  }

  agregarComentario(): void {
    if (!this.nuevoComentario.trim()) {
      return;
    }

    this.enviandoComentario = true;
    const comentario: Comentario = {
      contenido: this.nuevoComentario.trim(),
      tarea_id: this.tareaId
    };

    console.log('📤 Enviando comentario:', comentario);
    this.comentarioService.crearComentario(comentario).subscribe({
      next: (response) => {
        console.log('✅ Comentario creado:', response);
        this.nuevoComentario = '';
        this.cargarComentarios();
        this.enviandoComentario = false;
      },
      error: (err) => {
        console.error('❌ Error al crear comentario:', err);
        alert('Error al agregar comentario');
        this.enviandoComentario = false;
      }
    });
  }

  eliminarComentario(id: number): void {
    if (!id) {
      console.error('❌ ID de comentario no válido');
      return;
    }

    if (confirm('¿Eliminar este comentario?')) {
      console.log('🗑️ Eliminando comentario:', id);
      this.comentarioService.eliminarComentario(id).subscribe({
        next: () => {
          console.log('✅ Comentario eliminado');
          this.cargarComentarios();
        },
        error: (err) => {
          console.error('❌ Error al eliminar:', err);
          alert('Error al eliminar comentario');
        }
      });
    }
  }

  esComentarioPropio(usuarioId: number | undefined): boolean {
    if (!usuarioId || !this.usuarioActualId) {
      return false;
    }
    return this.usuarioActualId === usuarioId;
  }

  obtenerTextoEstado(estado: string): string {
    const estados: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'en_progreso': 'En Progreso',
      'completada': 'Completada'
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

  obtenerIniciales(nombre: string): string {
    if (!nombre || nombre.trim() === '') return 'U';
    return nombre.split(' ')
      .map(n => n.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  volver(): void {
    this.router.navigate(['/proyectos', this.proyectoId, 'tareas']);
  }
}
