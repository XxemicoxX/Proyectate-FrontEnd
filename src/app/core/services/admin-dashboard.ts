import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats, ProyectoReciente } from '../../shared/model/admin-dashboard.model';

@Injectable({
    providedIn: 'root'
})
export class AdminDashboardService {
    private apiUrl = 'http://localhost:8080/api/v1/api/admin/dashboard';

    constructor(private http: HttpClient) { }

    getEstadisticas(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(`${this.apiUrl}/estadisticas`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
    }


    getProyectosRecientes(): Observable<ProyectoReciente[]> {
        return this.http.get<ProyectoReciente[]>(`${this.apiUrl}/proyectos-recientes`);
    }
}