import { useEffect, useState } from 'react';
import { Calendar, Clock, User, LogOut, Plus, X } from 'lucide-react';
import {
  cancelarCita,
  Cita,
  crearCita,
  EstadoCita,
  obtenerDisponibilidad,
  obtenerCitas,
} from '../../utils/citasApi';
import { UsuarioResponse } from '../../utils/auth';

interface PatientDashboardProps {
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
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const formatTime = (value: string) => value.slice(0, 5);

const availableTimes = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
];

export function PatientDashboard({ onLogout, usuario }: PatientDashboardProps) {
  const [appointments, setAppointments] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [motivo, setMotivo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [ocupados, setOcupados] = useState<string[]>([]);
  const [loadingDisponibilidad, setLoadingDisponibilidad] = useState(false);

  const loadAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await obtenerCitas();
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar tus citas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    if (!selectedDate) {
      setOcupados([]);
      return;
    }

    let isActive = true;
    setLoadingDisponibilidad(true);
    obtenerDisponibilidad(selectedDate)
      .then((data) => {
        if (!isActive) return;
        setOcupados(data.ocupados ?? []);
      })
      .catch((err) => {
        if (!isActive) return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar la disponibilidad.');
      })
      .finally(() => {
        if (isActive) setLoadingDisponibilidad(false);
      });

    return () => {
      isActive = false;
    };
  }, [selectedDate]);

  const handleCreateAppointment = async () => {
    if (!selectedDate || !selectedTime || !motivo.trim()) {
      setError('Completa fecha, hora y motivo para agendar tu cita.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const nueva = await crearCita({
        fecha: selectedDate,
        hora: selectedTime,
        motivo: motivo.trim(),
      });
      setAppointments((prev) => [nueva, ...prev]);
      setShowNewAppointment(false);
      setSelectedDate('');
      setSelectedTime('');
      setMotivo('');
      setOcupados([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo agendar la cita.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelAppointment = async (id: number) => {
    setCancelingId(id);
    setError('');
    try {
      const updated = await cancelarCita(id);
      setAppointments((prev) => prev.map((apt) => (apt.id === id ? updated : apt)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cancelar la cita.');
    } finally {
      setCancelingId(null);
    }
  };

  const fullName = `${usuario.first_name ?? ''} ${usuario.last_name ?? ''}`.trim();

  return (
    <div className="app-shell">
      <div className="app-shell__container">
        <header className="sticky top-0 z-10 border-b border-white/40 bg-white/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-8 w-8 text-[#10b981]" />
            <h1 className="text-2xl text-black">MediAgenda</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2">
              <User className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-black">{fullName || usuario.username}</p>
                <p className="text-xs text-gray-500">Paciente</p>
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
          <h2 className="text-3xl text-black">Mis citas médicas</h2>
          <p className="mt-2 text-gray-600">Agenda y revisa tu historial de citas.</p>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <button onClick={() => setShowNewAppointment(true)} className="btn-primary">
            <Plus className="h-5 w-5" />
            Agendar nueva cita
          </button>
          <button type="button" onClick={loadAppointments} className="btn-ghost">
            Actualizar
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="panel col-span-full rounded-2xl p-10 text-center text-gray-600">
              Cargando tus citas...
            </div>
          ) : (
            appointments.map((appointment) => (
              <div key={appointment.id} className="panel rounded-2xl p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-black">Cita #{appointment.id}</h3>
                    <p className="text-sm text-gray-600">{appointment.motivo}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${statusColor[appointment.estado]}`}
                  >
                    {statusLabel[appointment.estado]}
                  </span>
                </div>
                <div className="space-y-2 text-gray-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#10b981]" />
                    <span>{formatDate(appointment.fecha)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#10b981]" />
                    <span>{formatTime(appointment.hora)}</span>
                  </div>
                </div>
                {appointment.estado !== 'CANCELADA' && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <button
                      onClick={() => handleCancelAppointment(appointment.id)}
                      disabled={cancelingId === appointment.id}
                      className="text-sm text-red-600 transition-colors hover:text-red-700 disabled:opacity-50"
                    >
                      Cancelar cita
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {!loading && appointments.length === 0 && (
          <div className="panel mt-8 rounded-2xl p-12 text-center">
            <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="text-lg text-black">Aun no tienes citas agendadas</h3>
            <p className="mt-2 text-gray-600">Agenda tu primera consulta en segundos.</p>
          </div>
        )}
      </div>

      {showNewAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl text-black">Agendar nueva cita</h3>
              <button
                onClick={() => setShowNewAppointment(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-black">Motivo de la consulta</label>
                <textarea
                  value={motivo}
                  onChange={(event) => setMotivo(event.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 focus:border-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Describe brevemente tu consulta"
                />
              </div>

              <div>
                <label className="mb-2 block text-black">Fecha de la cita</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 focus:border-emerald-400/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-black">Horario disponible</label>
                {selectedDate && (
                  <p className="mb-3 text-xs text-gray-500">
                    {loadingDisponibilidad
                      ? 'Revisando disponibilidad...'
                      : ocupados.length > 0
                        ? `Horarios ocupados: ${ocupados.join(', ')}`
                        : 'Todos los horarios estan disponibles'}
                  </p>
                )}
                <div className="grid grid-cols-4 gap-2">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      disabled={ocupados.includes(time)}
                      className={`rounded-2xl border px-4 py-2 transition-colors ${
                        ocupados.includes(time)
                          ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                          : selectedTime === time
                            ? 'border-[#10b981] bg-[#10b981] text-white'
                            : 'border-white/70 bg-white/80 text-black hover:border-[#10b981]'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <button onClick={() => setShowNewAppointment(false)} className="btn-outline flex-1">
                  Cancelar
                </button>
                <button
                  onClick={handleCreateAppointment}
                  disabled={!selectedDate || !selectedTime || !motivo.trim() || submitting}
                  className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Agendando...' : 'Confirmar cita'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
