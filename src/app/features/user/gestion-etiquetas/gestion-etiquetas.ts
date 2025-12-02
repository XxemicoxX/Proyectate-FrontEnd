import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Etiqueta {
  id?: number;
  nombre: string;
}

@Component({
  selector: 'app-gestion-etiquetas',
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-etiquetas.html',
  styleUrl: './gestion-etiquetas.scss',
})
export class GestionEtiquetas implements OnInit {
  etiquetas: Etiqueta[] = [];
  nuevaEtiqueta: Etiqueta = { nombre: '' };
  etiquetaEditando: Etiqueta | null = null;
  
  mostrarFormulario = false;
  modoEdicion = false;
  cargando = false;

  private apiEtiquetasUrl = 'http://localhost:8080/api/v1/etiquetas';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarEtiquetas();
  }

  cargarEtiquetas(): void {
    this.http.get<Etiqueta[]>(this.apiEtiquetasUrl).subscribe({
      next: (data) => this.etiquetas = data ?? [],
      error: () => this.etiquetas = []
    });
  }

  mostrarFormCrear(): void {
    this.nuevaEtiqueta = { nombre: '' };
    this.modoEdicion = false;
    this.mostrarFormulario = true;
  }

  editarEtiqueta(etiqueta: Etiqueta): void {
    this.nuevaEtiqueta = { ...etiqueta };
    this.modoEdicion = true;
    this.mostrarFormulario = true;
  }

  guardarEtiqueta(): void {
    this.cargando = true;

    if (this.modoEdicion && this.nuevaEtiqueta.id) {
      this.http.put<Etiqueta>(`${this.apiEtiquetasUrl}/${this.nuevaEtiqueta.id}`, this.nuevaEtiqueta).subscribe({
        next: () => {
          this.cargarEtiquetas();
          this.cancelarFormulario();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al actualizar etiqueta:', error);
          this.cargando = false;
        }
      });
    } else {
      this.http.post<Etiqueta>(`${this.apiEtiquetasUrl}/crear`, this.nuevaEtiqueta).subscribe({
        next: () => {
          this.cargarEtiquetas();
          this.cancelarFormulario();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al crear etiqueta:', error);
          this.cargando = false;
        }
      });
    }
  }

  eliminarEtiqueta(id: number | undefined): void {
    if (!id) return;

    if (confirm('¿Eliminar esta etiqueta? Las tareas que la usen quedarán sin etiqueta.')) {
      this.http.delete(`${this.apiEtiquetasUrl}/${id}`).subscribe({
        next: () => {
          this.etiquetas = this.etiquetas.filter(e => e.id !== id);
        },
        error: (error) => console.error('Error al eliminar:', error)
      });
    }
  }

  cancelarFormulario(): void {
    this.nuevaEtiqueta = { nombre: '' };
    this.mostrarFormulario = false;
    this.modoEdicion = false;
  }

  volver(): void {
    this.router.navigate(['/proyectos']);
  }
}