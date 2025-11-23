import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CredentialsInterface } from '../../../shared/model/credentials.interface';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginService = inject(AuthService);

  formLogin = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  iniciarSesion(){
    let credenciales : CredentialsInterface = {
      email: this.formLogin.value.email!,
      password: this.formLogin.value.password!,
    }
    this.loginService.authenticate(credenciales).subscribe(
      (value)=>{
        console.log(value);        
      }
    );
  }
}
