import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const service = inject(AuthService);
  const router = inject(Router);

  return service.isAutenticado$.pipe(
    take(1), map (isAuth =>{
      if(isAuth){
        return true;
      }else{
        router.navigate(["/inicio-sesion"]);
        return false;
      }
    })
  );
};
