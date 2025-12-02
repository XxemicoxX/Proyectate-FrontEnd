import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CredentialsInterface } from '../../../shared/model/credentials.interface';
import { AuthService } from '../../../core/services/auth';
import { JwtService } from '../../../core/services/jwt';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule, NgIf],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  loginService = inject(AuthService);
  router = inject(Router);
  jwtService = inject(JwtService);
  errorMessage: string | null = null;

  formLogin = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  iniciarSesion() {
    this.errorMessage = null; // limpiar
    
    let credenciales: CredentialsInterface = {
      email: this.formLogin.value.email!,
      contrasena: this.formLogin.value.password!,
    };
    
    this.loginService.authenticate(credenciales).subscribe({
      next: () => {
        const rol = this.jwtService.getUserRole();
        console.log("ROL DECODIFICADO:", rol);
  
        if (rol === "ROLE_ADMIN") {
          this.router.navigate(['/dashboard']);
        } else if (rol === "ROLE_USER") {
          this.router.navigate(['/proyectos']);
        }
      },
      error: (err) => {
        console.error("ERROR LOGIN:", err);

        if (err.status === 404) {
          this.errorMessage = "El correo no está registrado.";
        } else if (err.status === 401) {
          this.errorMessage = "Contraseña incorrecta.";
        } else {
          this.errorMessage = "Ocurrió un error inesperado.";
        }
      }
    });
  }
}
