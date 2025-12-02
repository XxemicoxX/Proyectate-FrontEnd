import { Component, OnInit } from '@angular/core';
import { DashboardStats, ProyectoReciente } from '../../../shared/model/admin-dashboard.model';
import { AdminDashboardService } from '../../../core/services/admin-dashboard';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [NgIf, NgFor, NgClass, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {

  stats: DashboardStats | null = null;
  proyectosRecientes: ProyectoReciente[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private dashboardService: AdminDashboardService) { }

  ngOnInit(): void {
    this.cargarDatosSecuencial();
  }

  cargarDatosSecuencial(): void {
    this.isLoading = true;
    this.error = null;

    // Primero cargar estadísticas
    this.dashboardService.getEstadisticas().subscribe({
      next: (data) => {
        this.stats = data;
        console.log('Estadísticas cargadas:', data);

        // Luego cargar proyectos
        this.dashboardService.getProyectosRecientes().subscribe({
          next: (proyectos) => {
            this.proyectosRecientes = proyectos;
            console.log('Proyectos cargados:', proyectos);
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error al cargar proyectos:', err);
            this.error = 'Error al cargar proyectos recientes';
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
        this.error = 'Error al cargar estadísticas';
        this.isLoading = false;
      }
    });
  }


  getEstadoClass(estado: string): string {
    const estadoLower = estado?.toLowerCase();
    switch (estadoLower) {
      case 'activo':
        return 'estado-progreso';
      case 'completado':
        return 'estado-completado';
      default:
        return 'estado-default';
    }
  }

}
