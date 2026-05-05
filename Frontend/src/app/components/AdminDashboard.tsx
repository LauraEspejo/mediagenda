import { useEffect, useMemo, useState } from 'react';
import { Calendar, Users, Clock, TrendingUp, LogOut, Check, X, Search } from 'lucide-react';
import {
  actualizarCita,
  cancelarCita,
  Cita,
  EstadoCita,
  obtenerCitas,
} from '../../utils/citasApi';
import { UsuarioResponse } from '../../utils/auth';

interface AdminDashboardProps {
  onLogout: () => void;
  usuario: UsuarioResponse;
}

const statusColor: Record<EstadoCita, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  CONFIRMADA: 'bg-emerald-100 text-emerald-800',
  CANCELADA: 'bg-red-100 text-red-800',
};

const statusLabel: Record<EstadoCita, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
};

const formatDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const formatTime = (value: string) => value.slice(0, 5);

const todayKey = () => new Date().toLocaleDateString('sv-SE');

export function AdminDashboard({ onLogout, usuario }: AdminDashboardProps) {
  const [appointments, setAppointments] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<EstadoCita | 'ALL'>('ALL');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await obtenerCitas();
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las citas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const stats = useMemo(() => {
    const today = todayKey();
    return {
      totalToday: appointments.filter((apt) => apt.fecha === today).length,
      pending: appointments.filter((apt) => apt.estado === 'PENDIENTE').length,
      confirmed: appointments.filter((apt) => apt.estado === 'CONFIRMADA').length,
      cancelled: appointments.filter((apt) => apt.estado === 'CANCELADA').length,
    };
  }, [appointments]);

  const patientLabel = (appointment: Cita) => {
    const detail = appointment.paciente_detalle;
    if (!detail) {
      return `Paciente #${appointment.paciente}`;
    }

    const fullName = `${detail.first_name ?? ''} ${detail.last_name ?? ''}`.trim();
    return fullName || detail.username;
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const search = searchTerm.trim().toLowerCase();
    const matchesStatus = filterStatus === 'ALL' || appointment.estado === filterStatus;
    if (!search) {
      return matchesStatus;
    }

    const patient = patientLabel(appointment).toLowerCase();
    const matchesSearch =
      patient.includes(search) || appointment.motivo.toLowerCase().includes(search);
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = async (id: number, estado: EstadoCita) => {
    setUpdatingId(id);
    try {
      const updated =
        estado === 'CANCELADA'
          ? await cancelarCita(id)
          : await actualizarCita(id, { estado });
      setAppointments((prev) => prev.map((apt) => (apt.id === id ? updated : apt)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la cita.');
    } finally {
      setUpdatingId(null);
    }
  };

  const adminName = `${usuario.first_name ?? ''} ${usuario.last_name ?? ''}`.trim();

  return (
    <div className="app-shell">
      <div className="app-shell__container">
        <header className="sticky top-0 z-10 border-b border-white/40 bg-white/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-8 w-8 text-[#10b981]" />
            <h1 className="text-2xl text-black">MediAgenda Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-[#10b981] px-4 py-2 text-white">
              <Users className="h-5 w-5" />
              <div className="text-sm">
                <p className="font-semibold">Administrador</p>
                <p className="text-xs opacity-90">{adminName || usuario.username}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-gray-600 transition-colors hover:text-[#10b981]"
            >
              <LogOut className="h-5 w-5" />
              Salir
            </button>
          </div>
        </div>
      </header>

        <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl text-black">Panel de administración</h2>
          <p className="mt-2 text-gray-600">Gestiona el flujo global de citas.</p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="panel rounded-2xl p-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-gray-600">Citas hoy</span>
              <Calendar className="h-5 w-5 text-[#10b981]" />
            </div>
            <p className="text-3xl text-black">{stats.totalToday}</p>
          </div>

          <div className="panel rounded-2xl p-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-gray-600">Pendientes</span>
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-3xl text-black">{stats.pending}</p>
          </div>

          <div className="panel rounded-2xl p-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-gray-600">Confirmadas</span>
              <Check className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-3xl text-black">{stats.confirmed}</p>
          </div>

          <div className="panel rounded-2xl p-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-gray-600">Canceladas</span>
              <TrendingUp className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-3xl text-black">{stats.cancelled}</p>
          </div>
        </div>

        <div className="panel-muted mb-6 rounded-2xl p-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por paciente o motivo..."
                className="w-full rounded-2xl border border-white/70 bg-white/80 py-3 pl-11 pr-4 shadow-sm focus:border-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value as EstadoCita | 'ALL')}
              className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm focus:border-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ALL">Todos los estados</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="CONFIRMADA">Confirmadas</option>
              <option value="CANCELADA">Canceladas</option>
            </select>
            <button
              type="button"
              onClick={loadAppointments}
              className="btn-ghost"
            >
              Actualizar
            </button>
          </div>
          {error && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="panel overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/60 bg-white/70">
                <tr>
                  <th className="px-6 py-4 text-left text-black">Paciente</th>
                  <th className="px-6 py-4 text-left text-black">Motivo</th>
                  <th className="px-6 py-4 text-left text-black">Fecha</th>
                  <th className="px-6 py-4 text-left text-black">Hora</th>
                  <th className="px-6 py-4 text-left text-black">Estado</th>
                  <th className="px-6 py-4 text-left text-black">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-600">
                      Cargando citas...
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-emerald-50/40">
                      <td className="px-6 py-4 text-black">{patientLabel(appointment)}</td>
                      <td className="px-6 py-4 text-gray-700">{appointment.motivo}</td>
                      <td className="px-6 py-4 text-gray-700">{formatDate(appointment.fecha)}</td>
                      <td className="px-6 py-4 text-gray-700">{formatTime(appointment.hora)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-sm ${statusColor[appointment.estado]}`}
                        >
                          {statusLabel[appointment.estado]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {appointment.estado === 'PENDIENTE' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(appointment.id, 'CONFIRMADA')}
                                disabled={updatingId === appointment.id}
                                className="rounded-lg p-2 text-emerald-600 transition-colors hover:bg-emerald-50 disabled:opacity-50"
                                title="Confirmar"
                              >
                                <Check className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(appointment.id, 'CANCELADA')}
                                disabled={updatingId === appointment.id}
                                className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                                title="Cancelar"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          {appointment.estado === 'CONFIRMADA' && (
                            <button
                              onClick={() => handleStatusChange(appointment.id, 'CANCELADA')}
                              disabled={updatingId === appointment.id}
                              className="rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                            >
                              Cancelar cita
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && filteredAppointments.length === 0 && (
            <div className="p-12 text-center">
              <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <p className="text-slate-600">No hay citas con los filtros actuales.</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
