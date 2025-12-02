import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { JwtService } from '../../../core/services/jwt';

interface Proyecto {
  id?: number;
  idUsuario?: number;
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  estado: string;
}

@Component({
  selector: 'app-form-proyecto',
  imports: [CommonModule, FormsModule],
  templateUrl: './form-proyecto.html',
  styleUrl: './form-proyecto.scss',
})
export class FormProyecto implements OnInit {
  proyecto: Proyecto = {
    nombre: '',
    descripcion: '',
    fechaInicio: '',
    estado: 'planificacion'
  };
  
  modoEdicion = false;
  cargando = false;

  private apiProyectosUrl = 'http://localhost:8080/api/v1/proyectos';

  constructor(
    private http: HttpClient,
    private jwtService: JwtService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.modoEdicion = true;
      this.cargarProyecto(+id);
    }
  }

  cargarProyecto(id: number): void {
    this.cargando = true;
    this.http.get<Proyecto>(`${this.apiProyectosUrl}/${id}`).subscribe({
      next: (data) => {
        this.proyecto = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar proyecto:', error);
        this.cargando = false;
        this.volver();
      }
    });
  }

  guardarProyecto(): void {
    const idUsuario = this.jwtService.getUserId();

    if (!idUsuario) {
      console.error("Token no contiene el idUsuario");
      return;
    }

    this.cargando = true;
    const proyectoEnviar = {
      ...this.proyecto,
      id_usuario: idUsuario
    };

    if (this.modoEdicion && this.proyecto.id) {
      this.http.put<Proyecto>(`${this.apiProyectosUrl}/${this.proyecto.id}`, proyectoEnviar).subscribe({
        next: () => {
          this.cargando = false;
          this.volver();
        },
        error: (error) => {
          console.error('Error al actualizar:', error);
          this.cargando = false;
        }
      });
    } else {
      this.http.post<Proyecto>(`${this.apiProyectosUrl}/crear`, proyectoEnviar).subscribe({
        next: () => {
          this.cargando = false;
          this.volver();
        },
        error: (error) => {
          console.error('Error al crear:', error);
          this.cargando = false;
        }
      });
    }
  }

  volver(): void {
    this.router.navigate(['/proyectos']);
  }
}