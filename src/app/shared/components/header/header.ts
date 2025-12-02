import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { AsyncPipe, NgIf, NgStyle } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterLink, NgIf, AsyncPipe],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  auth = inject(AuthService);
  router = inject(Router);

  cerrarSesion() {
    this.auth.logout();
    this.router.navigate(['/inicio-sesion']);
  }
}
