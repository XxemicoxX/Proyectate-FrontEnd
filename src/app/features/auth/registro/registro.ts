import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.scss'
})
export class Registro {
   formRegistro = new FormGroup({
    nombre: new FormControl('', [
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

  get nombre() {
    return this.formRegistro.get('nombre')!;
  }

  get email() {
    return this.formRegistro.get('email')!;
  }

  get password() {
    return this.formRegistro.get('password')!;
  }

  enviarRegistro() {
    console.log(this.formRegistro.value);
  }
}
