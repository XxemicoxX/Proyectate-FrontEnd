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

  // urls
  private URL_LOGIN = `${environment.apiURL}/authenticate`;
  private URL_REGISTER = `${environment.apiURL}/register`;

  http = inject(HttpClient);

  // Token temporal asignado
  public token = "";

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

  // login
  authenticate(credenciales: CredentialsInterface) {
    return this.http.post<any>(this.URL_LOGIN, credenciales).pipe(
      tap(resp => {
        console.log("RESPUESTA DEL LOGIN:", resp);

        const accessToken = resp?.access_token;

        if (!accessToken) {
          console.error("❌ Error: backend no devolvió access_token");
          return;
        }

        localStorage.setItem("token", accessToken);

        this.token = accessToken;
        this.isAuth.next(true);
      })
    );
  }

  //registro
  register(data: { name: string; email: string; password: string; }) {
    return this.http.post<any>(this.URL_REGISTER, data).pipe(
      tap(resp => {
        console.log("RESPUESTA DEL REGISTRO:", resp);
        if (resp?.access_token) {
          localStorage.setItem("token", resp.access_token);
          this.token = resp.access_token;
          this.isAuth.next(true);
        }

      })
    );
  }

  //token y estado
  private hasToken(): boolean {
    return localStorage.getItem('token') !== null;
  }

  get userId(): number | null {
    if (!this.token) return null;

    const decoded: any = jwtDecode(this.token);
    return decoded.id || decoded.userId || null;
  }

  //cerrar sesion
  logout() {
    localStorage.removeItem('token');
    this.token = "";
    this.isAuth.next(false);
  }

  get role(): string | null {
    if (!this.token) return null;

    const decoded: any = jwtDecode(this.token);
    return decoded.role || null;
  }

}
