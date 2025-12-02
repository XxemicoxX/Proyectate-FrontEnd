export interface ComentarioInterface {
  id?: number;
  contenido: string;
  fecha_creacion?: string;
  usuario_id?: number;
  nombre_usuario?: string;
  tarea_id: number;
}