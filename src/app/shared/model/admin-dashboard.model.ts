export interface DashboardStats {
  totalUsuarios: number;
  totalProyectos: number;
  proyectosActivos: number;
  proyectosCompletados: number;
}

export interface ProyectoReciente {
  id: number;
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  estado: string;
  nombreUsuario: string;
  emailUsuario: string;
}