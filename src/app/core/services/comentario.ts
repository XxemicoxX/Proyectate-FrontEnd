import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ComentarioInterface } from "../../shared/model/comentario.interface";

@Injectable({
    providedIn: 'root'
})
export class ComentarioService {
    private apiUrl = 'http://localhost:8080/api/v1/comentarios';

    http = inject(HttpClient);

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    getComentariosByTarea(tareaId: number): Observable<ComentarioInterface[]> {
        return this.http.get<ComentarioInterface[]>(
            `${this.apiUrl}/tarea/${tareaId}`,
            { headers: this.getHeaders() }
        );
    }

    crearComentario(comentario: ComentarioInterface): Observable<ComentarioInterface> {
        return this.http.post<ComentarioInterface>(
            `${this.apiUrl}/crear`,
            comentario,
            { headers: this.getHeaders() }
        );
    }

    actualizarComentario(id: number, comentario: ComentarioInterface): Observable<ComentarioInterface> {
        return this.http.put<ComentarioInterface>(
            `${this.apiUrl}/${id}`,
            comentario,
            { headers: this.getHeaders() }
        );
    }

    eliminarComentario(id: number): Observable<string> {
        return this.http.delete<string>(
            `${this.apiUrl}/${id}`,
            { headers: this.getHeaders(), responseType: 'text' as 'json' }
        );
    }
}