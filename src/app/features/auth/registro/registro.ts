import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { RegisterInterface } from '../../../shared/model/register.interface';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './registro.html',
  styleUrl: './registro.scss'
})
export class Registro {

  registerService = inject(AuthService);
  router = inject(Router);

  formRegistro = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8)
    ])
  });

  get name() {
    return this.formRegistro.get('name')!;
  }

  get email() {
    return this.formRegistro.get('email')!;
  }

  get password() {
    return this.formRegistro.get('password')!;
  }

  enviarRegistro() {
    let data: RegisterInterface = {
      name: this.formRegistro.value.name!,
      email: this.formRegistro.value.email!,
      password: this.formRegistro.value.password!,
    }

    this.registerService.register(data).subscribe({
      next: (res) => {
        console.log("Usuario registrado:", res);

        // Guardamos el token
        localStorage.setItem("token", res.access_token);

        // Avisamos que está autenticado
        this.registerService['isAuth'].next(true);

        // Redireccionamos
        this.router.navigate(['/proyectos']);
      },
      error: (err) => {
        console.error("Error al registrar:", err);
      }
    });
  }
}
