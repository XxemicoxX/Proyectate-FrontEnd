import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-proyecto',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './proyecto.html',
  styleUrl: './proyecto.scss',
})
export class Proyecto {

  formProyecto = new FormGroup({
    nombre: new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ]),
    descripcion: new FormControl('', [
      Validators.required,
      Validators.maxLength(100)
    ])
  });

  get nombre() {
    return this.formProyecto.get('nombre')!;
  }

  get descripcion() {
    return this.formProyecto.get('descripcion')!;
  }

  enviarProyecto() {
    console.log(this.formProyecto.value);
  }

  
}
