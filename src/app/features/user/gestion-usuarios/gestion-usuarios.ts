import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

interface UsuarioProyecto {
  id?: number;
  idUsuario: number;
  idProyecto: number;
  rol: string;
}

interface Proyecto {
  id?: number;
  nombre: string;
  descripcion: string;
}

@Component({
  selector: 'app-gestion-usuarios',
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-usuarios.html',
  styleUrl: './gestion-usuarios.scss',
})
export class GestionUsuarios implements OnInit {
  proyecto: Proyecto | null = null;
  proyectoId: number = 0;
  
  usuariosDisponibles: Usuario[] = [];
  usuariosProyecto: UsuarioProyecto[] = [];
  
  usuarioSeleccionado: number = 0;
  rolSeleccionado: string = 'colaborador';
  
  mostrarFormulario = false;
  cargando = false;

  private apiProyectosUrl = 'http://localhost:8080/api/v1/proyectos';
  private apiUsuariosUrl = 'http://localhost:8080/api/v1/usuarios';
  private apiUsuariosProyectoUrl = 'http://localhost:8080/api/v1/usuarios-proyecto';

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
      this.cargarUsuarios();
      this.cargarUsuariosProyecto();
    }
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

  cargarUsuarios(): void {
    this.http.get<Usuario[]>(this.apiUsuariosUrl).subscribe({
      next: (data) => this.usuariosDisponibles = data ?? [],
      error: () => this.usuariosDisponibles = []
    });
  }

  cargarUsuariosProyecto(): void {
    this.http.get<UsuarioProyecto[]>(`${this.apiUsuariosProyectoUrl}/proyecto/${this.proyectoId}`).subscribe({
      next: (data) => this.usuariosProyecto = data ?? [],
      error: () => this.usuariosProyecto = []
    });
  }

  mostrarFormAgregar(): void {
    this.usuarioSeleccionado = 0;
    this.rolSeleccionado = 'colaborador';
    this.mostrarFormulario = true;
  }

  agregarUsuario(): void {
    if (!this.usuarioSeleccionado) return;

    this.cargando = true;
    const usuarioProyecto = {
      id_usuario: this.usuarioSeleccionado,
      id_proyecto: this.proyectoId,
      rol: this.rolSeleccionado
    };

    this.http.post<UsuarioProyecto>(`${this.apiUsuariosProyectoUrl}/agregar`, usuarioProyecto).subscribe({
      next: () => {
        this.cargarUsuariosProyecto();
        this.cancelarFormulario();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al agregar usuario:', error);
        this.cargando = false;
      }
    });
  }

  eliminarUsuario(id: number | undefined): void {
    if (!id) return;

    if (confirm('¿Remover este usuario del proyecto?')) {
      this.http.delete(`${this.apiUsuariosProyectoUrl}/${id}`).subscribe({
        next: () => {
          this.usuariosProyecto = this.usuariosProyecto.filter(u => u.id !== id);
        },
        error: (error) => console.error('Error al eliminar:', error)
      });
    }
  }

  cancelarFormulario(): void {
    this.usuarioSeleccionado = 0;
    this.rolSeleccionado = 'colaborador';
    this.mostrarFormulario = false;
  }

  obtenerUsuario(idUsuario: number): Usuario | undefined {
    return this.usuariosDisponibles.find(u => u.id === idUsuario);
  }

  obtenerNombreUsuario(idUsuario: number): string {
    return this.obtenerUsuario(idUsuario)?.nombre || 'Usuario';
  }

  obtenerEmailUsuario(idUsuario: number): string {
    return this.obtenerUsuario(idUsuario)?.email || '';
  }

  obtenerIniciales(nombre: string): string {
    return nombre.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();
  }

  obtenerTextoRol(rol: string): string {
    const roles: { [key: string]: string } = {
      'administrador': 'Administrador',
      'colaborador': 'Colaborador',
      'observador': 'Observador'
    };
    return roles[rol] || rol;
  }

  volver(): void {
    this.router.navigate(['/proyectos']);
  }
}
