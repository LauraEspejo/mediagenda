import { apiRequest, clearAuthTokens, saveAuthTokens } from './api';
import { jwtDecode } from 'jwt-decode';

export type UsuarioRol = 'PACIENTE' | 'ADMIN';

export interface RegistroPayload {
  username: string;
  first_name?: string;
  last_name?: string;
  email: string;
  password: string;
  rol?: UsuarioRol;
}

export interface UsuarioResponse {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  rol: UsuarioRol;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface TokenPairResponse {
  access: string;
  refresh: string;
  rol?: UsuarioRol;
}

interface JwtPayload {
  rol?: string;
}

export const obtenerRolDesdeToken = (token: string): UsuarioRol => {
  try {
    const payload = jwtDecode<JwtPayload>(token);
    return payload.rol === 'ADMIN' || payload.rol === 'ADMINISTRADOR' ? 'ADMIN' : 'PACIENTE';
  } catch {
    return 'PACIENTE';
  }
};

export const registrarUsuario = async (payload: RegistroPayload) =>
  apiRequest<UsuarioResponse>('/usuarios/registro/', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(payload),
  });

export const iniciarSesion = async (payload: LoginPayload) => {
  const tokens = await apiRequest<TokenPairResponse>('/usuarios/login/', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(payload),
  });

  saveAuthTokens(tokens.access, tokens.refresh);
  return tokens;
};

export const obtenerPerfil = async () => apiRequest<UsuarioResponse>('/usuarios/me/');

export const refrescarToken = async () => {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) {
    throw new Error('No hay refresh token disponible.');
  }

  const response = await apiRequest<{ access: string }>('/usuarios/token/refresh/', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ refresh }),
  });

  localStorage.setItem('access_token', response.access);
  return response.access;
};

export const cerrarSesion = () => {
  clearAuthTokens();
};

