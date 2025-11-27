import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { CredentialsInterface } from '../../shared/model/credentials.interface';
import { environment } from '../../../environments/environment.development';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  
  URL = `${environment.apiURL}/authenticate`;
  http = inject(HttpClient);


  // Variable temporal, luege se debe borrar
  public token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbkBtYWlsLmNvbSIsImlhdCI6MTc2NDI2NDgyNCwiZXhwIjoxNzY0ODY5NjI0fQ.cWY7JVkQfCv82dgg7LMHJI5uJdq2c3NW4Mt6E3XbkB4JBE1JPgz1bwmc5nbl6DGDSmBtqOYItOBsagZrOsa2dA";

  // Observable para conocer si está autenticado
  private isAuth = new BehaviorSubject<boolean>(this.hasToken());
  public isAutenticado$ = this.isAuth.asObservable();

  constructor() {
    const savedToken = localStorage.getItem('token');  // Recupera token si existe
    if (savedToken) {
      this.token = savedToken;   // Lo asigna para usarlo en interceptores
      this.isAuth.next(true);    // Le dice al sistema que el usuario está autenticado
    }
  }

  authenticate(credenciales : CredentialsInterface) {
    return this.http.post<any>(this.URL, credenciales).pipe(
    tap(resp => {
      localStorage.setItem("token", resp.token);   // 🔥 guardar token
    })
  );
  }  

  private hasToken(): boolean {
    return localStorage.getItem('token') !== null;
  }

  get userId(): number | null {
    if (!this.token) return null;

    const decoded: any = jwtDecode(this.token);
    return decoded.id || decoded.userId || null;  
  }
}