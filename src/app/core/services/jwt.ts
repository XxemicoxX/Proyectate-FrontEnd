import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class JwtService {
  idUsuario: number | null = null;

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  getPayload(): any {
    const token = this.getToken();

    if (!token) {
      console.warn("No hay token almacenado");
      return null;
    }

    try {
      const data: any = jwtDecode(token);
      console.log("Payload decodificado:", data);
      return data;
    } catch (e) {
      console.error("❌ Error decodificando token:", e);
      return null;
    }
  }

  getUserId(): number | null {
    const payload = this.getPayload();
    return payload?.idUsuario ?? null;
  }

  // 🔥 NUEVO: Obtener rol
  getUserRole(): string | null {
    const payload = this.getPayload();
    return payload?.roles?.[0]?.authority ?? null;
  }

}
