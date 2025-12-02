import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

interface Proyecto {
  id?: number;
  nombre: string;
  descripcion: string;
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
  titulo: string;
  descripcion: string;
  prioridad: string;
  estado: string;
  idProyecto: number;
  idEtiqueta?: number | null;
  idUsuario?: number | null;
}

interface TareaDetalle extends Tarea {
  nombreEtiqueta?: string;
  nombreUsuario?: string;
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
  
  tareas: TareaDetalle[] = [];
  etiquetas: Etiqueta[] = [];
  usuarios: Usuario[] = [];
  
  // Formulario
  tareaForm: Tarea = {
    titulo: '',
    descripcion: '',
    prioridad: 'media',
    estado: 'pendiente',
    idProyecto: 0,
    idEtiqueta: null,
    idUsuario: null
  };
  
  tareaEditandoId: number | null = null;
  mostrarFormulario = false;
  cargando = false;

  private apiProyectosUrl = 'http://localhost:8080/api/v1/proyectos';
  private apiTareasUrl = 'http://localhost:8080/api/v1/tareas';
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
      this.tareaForm.idProyecto = this.proyectoId;
      this.cargarProyecto();
      this.cargarDatosIniciales();
    }
  }

  cargarDatosIniciales(): void {
    // Cargar etiquetas, usuarios y tareas en paralelo
    forkJoin({
      etiquetas: this.http.get<Etiqueta[]>(this.apiEtiquetasUrl),
      usuarios: this.http.get<any[]>(`http://localhost:8080/api/v1/usuarios-proyectos/proyecto/${this.proyectoId}/detalles`),
      tareas: this.http.get<any[]>(`${this.apiTareasUrl}/proyecto/${this.proyectoId}`)
    }).subscribe({
      next: (data) => {
        // Procesar etiquetas
        this.etiquetas = data.etiquetas ?? [];
        console.log('Etiquetas cargadas:', this.etiquetas);

        // Procesar usuarios
        this.usuarios = (data.usuarios ?? []).map(up => ({
          id: up.id_usuario,
          nombre: up.nombre_usuario,
          email: up.email_usuario
        }));
        console.log('Usuarios del proyecto cargados:', this.usuarios);

        // Procesar tareas (ahora con usuarios ya cargados)
        this.tareas = (data.tareas ?? []).map(tarea => ({
          id: tarea.id,
          titulo: tarea.titulo,
          descripcion: tarea.descripcion,
          prioridad: tarea.prioridad,
          estado: tarea.estado,
          idProyecto: tarea.id_proyecto,
          idEtiqueta: tarea.id_etiqueta,
          idUsuario: tarea.id_usuario,
          nombreEtiqueta: this.obtenerNombreEtiqueta(tarea.id_etiqueta),
          nombreUsuario: this.obtenerNombreUsuario(tarea.id_usuario)
        }));
        console.log('Tareas procesadas:', this.tareas);
      },
      error: (err) => {
        console.error('Error al cargar datos:', err);
        this.etiquetas = [];
        this.usuarios = [];
        this.tareas = [];
      }
    });
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
      next: (data) => {
        console.log('Etiquetas recargadas:', data);
        this.etiquetas = data ?? [];
      },
      error: (err) => {
        console.error('Error al cargar etiquetas:', err);
        this.etiquetas = [];
      }
    });
  }

  cargarUsuarios(): void {
    // Cargar usuarios que pertenecen al proyecto usando el endpoint de usuarios-proyectos
    this.http.get<any[]>(`http://localhost:8080/api/v1/usuarios-proyectos/proyecto/${this.proyectoId}/detalles`).subscribe({
      next: (data) => {
        console.log('Usuarios recargados:', data);
        // Mapear los usuarios del proyecto a la estructura de Usuario
        this.usuarios = (data ?? []).map(up => ({
          id: up.id_usuario,
          nombre: up.nombre_usuario,
          email: up.email_usuario
        }));
      },
      error: (err) => {
        console.error('Error al cargar usuarios del proyecto:', err);
        this.usuarios = [];
      }
    });
  }

  cargarTareas(): void {
    this.http.get<any[]>(`${this.apiTareasUrl}/proyecto/${this.proyectoId}`).subscribe({
      next: (data) => {
        console.log('Tareas recargadas (raw):', data);
        // Mapear de snake_case a camelCase y enriquecer con nombres
        this.tareas = (data ?? []).map(tarea => ({
          id: tarea.id,
          titulo: tarea.titulo,
          descripcion: tarea.descripcion,
          prioridad: tarea.prioridad,
          estado: tarea.estado,
          idProyecto: tarea.id_proyecto,
          idEtiqueta: tarea.id_etiqueta,
          idUsuario: tarea.id_usuario,
          nombreEtiqueta: this.obtenerNombreEtiqueta(tarea.id_etiqueta),
          nombreUsuario: this.obtenerNombreUsuario(tarea.id_usuario)
        }));
        console.log('Tareas procesadas después de recarga:', this.tareas);
      },
      error: (err) => {
        console.error('Error al cargar tareas:', err);
        this.tareas = [];
      }
    });
  }

  mostrarFormNuevo(): void {
    this.tareaEditandoId = null;
    this.tareaForm = {
      titulo: '',
      descripcion: '',
      prioridad: 'media',
      estado: 'pendiente',
      idProyecto: this.proyectoId,
      idEtiqueta: null,
      idUsuario: null
    };
    this.mostrarFormulario = true;
  }

  editarTarea(tarea: TareaDetalle): void {
    this.tareaEditandoId = tarea.id ?? null;
    // AUTOCOMPLETAR todos los campos del formulario
    this.tareaForm = {
      id: tarea.id,
      titulo: tarea.titulo,
      descripcion: tarea.descripcion,
      prioridad: tarea.prioridad,
      estado: tarea.estado,
      idProyecto: tarea.idProyecto,
      idEtiqueta: tarea.idEtiqueta ?? null,
      idUsuario: tarea.idUsuario ?? null
    };
    this.mostrarFormulario = true;
    console.log('Editando tarea:', this.tareaForm);
  }

  guardarTarea(): void {
    if (!this.tareaForm.titulo.trim()) {
      alert('El título es obligatorio');
      return;
    }

    this.cargando = true;

    // Preparar datos para enviar con nombres snake_case que espera el backend
    const tareaData: any = {
      titulo: this.tareaForm.titulo.trim(),
      descripcion: this.tareaForm.descripcion?.trim() || '',
      prioridad: this.tareaForm.prioridad,
      estado: this.tareaForm.estado,
      id_proyecto: this.proyectoId  // Backend espera snake_case
    };

    // Solo agregar id_etiqueta si tiene un valor válido
    if (this.tareaForm.idEtiqueta && this.tareaForm.idEtiqueta > 0) {
      tareaData.id_etiqueta = this.tareaForm.idEtiqueta;
    }

    // Solo agregar id_usuario si tiene un valor válido
    if (this.tareaForm.idUsuario && this.tareaForm.idUsuario > 0) {
      tareaData.id_usuario = this.tareaForm.idUsuario;
    }

    console.log('Formulario original:', this.tareaForm);
    console.log('Datos a enviar:', tareaData);
    console.log('Datos JSON:', JSON.stringify(tareaData));

    if (this.tareaEditandoId) {
      // ACTUALIZAR
      this.http.put<Tarea>(
        `${this.apiTareasUrl}/${this.tareaEditandoId}`,
        tareaData
      ).subscribe({
        next: () => {
          this.cargarTareas();
          this.cancelarFormulario();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al actualizar tarea:', error);
          alert('Error al actualizar la tarea');
          this.cargando = false;
        }
      });
    } else {
      // CREAR
      this.http.post<Tarea>(`${this.apiTareasUrl}/crear`, tareaData).subscribe({
        next: () => {
          this.cargarTareas();
          this.cancelarFormulario();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al crear tarea:', error);
          alert('Error al crear la tarea');
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
    this.tareaEditandoId = null;
    this.tareaForm = {
      titulo: '',
      descripcion: '',
      prioridad: 'media',
      estado: 'pendiente',
      idProyecto: this.proyectoId,
      idEtiqueta: null,
      idUsuario: null
    };
    this.mostrarFormulario = false;
  }

  obtenerNombreEtiqueta(idEtiqueta: number | null | undefined): string {
    if (!idEtiqueta) return 'Sin etiqueta';
    const etiqueta = this.etiquetas.find(e => e.id === idEtiqueta);
    return etiqueta?.nombre || 'Sin etiqueta';
  }

  obtenerNombreUsuario(idUsuario: number | null | undefined): string {
    if (!idUsuario) return 'Sin asignar';
    const usuario = this.usuarios.find(u => u.id === idUsuario);
    return usuario?.nombre || 'Sin asignar';
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

  volver(): void {
    this.router.navigate(['/proyectos', this.proyectoId]);
  }
}