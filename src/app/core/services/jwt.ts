import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class JwtService {
  idUsuario: number | null = null; //  <-- 🔥 NECESARIO

  // 🔥 Lee token desde localStorage
  getToken(): string | null {
    return localStorage.getItem("token") ?? null;
  }

  getPayload(): any {
  const token = localStorage.getItem('token');

  if (!token) {
    console.warn("No hay token almacenado");
    return null;
  }

  try {
    const data: any = jwtDecode(token);  // 📌 Aquí decodificas el token correctamente
    console.log("Payload decodificado:", data);

    this.idUsuario = data.idUsuario ?? null;   // 🔥 Guarda idUsuario si existe
    return data; // ⬅ EL PAYLOAD COMPLETO
  } 
  catch (e) {
    console.error("❌ Error decodificando token:", e);
    return null;
  }
}

  // 🔥 Extrae ID del usuario desde el token (claim SUB, ID o EMAIL)
  getUserId(): number | null {
    const payload = this.getPayload();
    return payload?.id || payload?.userId || null;
  }
}