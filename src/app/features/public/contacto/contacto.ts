import { NgIf } from '@angular/common';
import { Component, model } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-contacto',
  imports: [FormsModule, NgIf],
  templateUrl: './contacto.html',
  styleUrl: './contacto.scss'
})
export class Contacto {

  model = {
    nombre: '',
    email: '',
    mensaje: ''
  };

   enviarConsulta (){
    console.log(this.model);
  }

}
