import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CredentialsInterface } from '../../shared/model/credentials.interface';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  
  URL = `${environment.apiURL}/authenticate`;
  http = inject(HttpClient);


  // Variable temporal, luege se debe borrar
  public token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbkBtYWlsLmNvbSIsImlhdCI6MTc2NDEyNjYzNSwiZXhwIjoxNzY0NzMxNDM1fQ.n7rjlUSkY2NaPk9ebizf-SaEdail6-1VrKvs7bkBHeBamZEZTWlfXCu0DqzUbLvUw0dV7pAMJiFz6mf8Xqiedg";

  // Observable para conocer si está autenticado
  private isAuth = new BehaviorSubject<boolean>(this.hasToken());
  public isAutenticado$ = this.isAuth.asObservable();

  authenticate(credenciales : CredentialsInterface) {
    return this.http.post<any>(this.URL,credenciales);
  }
  

  private hasToken(): boolean {
    return true;
  }
}