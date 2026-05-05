import { apiRequest } from './api';
import type { UsuarioRol } from './auth';

export type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA';

export interface PacienteDetalle {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  rol: UsuarioRol;
}

export interface DisponibilidadResponse {
  fecha: string;
  ocupados: string[];
}

export interface Cita {
  id: number;
  paciente: number;
  paciente_detalle?: PacienteDetalle;
  fecha: string;
  hora: string;
  motivo: string;
  estado: EstadoCita;
}

export interface CrearCitaPayload {
  fecha: string;
  hora: string;
  motivo: string;
  estado?: EstadoCita;
}

export interface ActualizarCitaPayload {
  fecha?: string;
  hora?: string;
  motivo?: string;
  estado?: EstadoCita;
}

export const obtenerCitas = async () => apiRequest<Cita[]>('/citas/');

export const obtenerCitaPorId = async (id: number) => apiRequest<Cita>(`/citas/${id}/`);

export const obtenerDisponibilidad = async (fecha: string) =>
  apiRequest<DisponibilidadResponse>('/citas/disponibilidad/', {
    queryParams: { fecha },
  });

export const crearCita = async (payload: CrearCitaPayload) =>
  apiRequest<Cita>('/citas/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const actualizarCita = async (id: number, payload: ActualizarCitaPayload) =>
  apiRequest<Cita>(`/citas/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const cancelarCita = async (id: number) =>
  apiRequest<Cita>(`/citas/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ estado: 'CANCELADA' as const }),
  });

export const eliminarCita = async (id: number) =>
  apiRequest<void>(`/citas/${id}/`, {
    method: 'DELETE',
  });

