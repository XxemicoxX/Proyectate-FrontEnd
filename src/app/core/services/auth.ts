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
  public token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbkBtYWlsLmNvbSIsImlhdCI6MTc2Mzg2ODA2MiwiZXhwIjoxNzY0NDcyODYyfQ.eXnpgnDJf1F8FbwvJuB_AIBMZwspuK_FHIq2B3vbnvAaF3c6RKKILqoNHZ5DrO_cSIHDPoqouJVCwRVAvWzaAg";

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