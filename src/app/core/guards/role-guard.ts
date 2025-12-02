import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { JwtService } from '../services/jwt';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const jwtService = inject(JwtService);

  const allowedRoles = route.data['roles'] as string[];
  const userRole = jwtService.getUserRole(); // Ej: "ROLE_ADMIN"

  console.log("Guard → allowed:", allowedRoles, "userRole:", userRole);

  if (!userRole) {
    return router.parseUrl('/inicio-sesion');
  }

  // 🔥 Normalizar: si viene "ROLE_ADMIN", extraer "ADMIN"
  const cleanRole = userRole.replace("ROLE_", "");

  if (allowedRoles.includes(userRole.replace("ROLE_", ""))) {
    return true;
  }


  return router.parseUrl('/no-autorizado');
};
