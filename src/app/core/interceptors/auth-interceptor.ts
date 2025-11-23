import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // No agregar token a las rutas de autenticación
  if (req.url.includes('/authenticate')) {
    return next(req);
  }
  const token = authService.token;

  if(token){
    const cloneReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(cloneReq);
  }
  
  return next(req);

};
