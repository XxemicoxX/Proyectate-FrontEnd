import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

export interface Invitacion {
  id?: number;
  id_proyecto: number;
  nombre_proyecto?: string;
  descripcion_proyecto?: string;
  id_usuario_invitado?: number;
  email_invitado: string;
  nombre_invitado?: string;
  id_usuario_invitador?: number;
  nombre_invitador?: string;
  rol_asignado: string;
  estado?: string;
  fecha_invitacion?: string;
  fecha_respuesta?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvitacionService {
  private apiUrl = 'http://localhost:8080/api/v1/invitaciones';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  enviarInvitacion(invitacion: Invitacion): Observable<Invitacion> {
    return this.http.post<Invitacion>(
      `${this.apiUrl}/enviar`,
      invitacion,
      { headers: this.getHeaders() }
    );
  }

  getInvitacionesPendientes(): Observable<Invitacion[]> {
    return this.http.get<Invitacion[]>(
      `${this.apiUrl}/pendientes`,
      { headers: this.getHeaders() }
    );
  }

  contarInvitacionesPendientes(): Observable<number> {
    return this.http.get<number>(
      `${this.apiUrl}/pendientes/contador`,
      { headers: this.getHeaders() }
    );
  }

  getInvitacionesEnviadas(): Observable<Invitacion[]> {
    return this.http.get<Invitacion[]>(
      `${this.apiUrl}/enviadas`,
      { headers: this.getHeaders() }
    );
  }

  getInvitacionesPorProyecto(proyectoId: number): Observable<Invitacion[]> {
    return this.http.get<Invitacion[]>(
      `${this.apiUrl}/proyecto/${proyectoId}`,
      { headers: this.getHeaders() }
    );
  }

  responderInvitacion(id: number, aceptar: boolean): Observable<Invitacion> {
    return this.http.put<Invitacion>(
      `${this.apiUrl}/${id}/responder?aceptar=${aceptar}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  cancelarInvitacion(id: number): Observable<string> {
    return this.http.delete<string>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders(), responseType: 'text' as 'json' }
    );
  }
}