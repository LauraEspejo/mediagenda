import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminDashboard } from '../app/components/AdminDashboard';
import { PatientDashboard } from '../app/components/PatientDashboard';
import { cerrarSesion, obtenerPerfil, UsuarioResponse } from '../utils/auth';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<UsuarioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    const cargarPerfil = async () => {
      try {
        const perfil = await obtenerPerfil();
        if (!isActive) return;
        setUsuario(perfil);
      } catch (err) {
        if (!isActive) return;
        setError(err instanceof Error ? err.message : 'No fue posible cargar tu perfil.');
        cerrarSesion();
      } finally {
        if (isActive) setLoading(false);
      }
    };

    cargarPerfil();

    return () => {
      isActive = false;
    };
  }, []);

  const handleLogout = () => {
    cerrarSesion();
    navigate('/');
  };

  if (loading) {
    return (
      <main className="app-shell">
        <div className="app-shell__container flex min-h-screen items-center justify-center px-6">
          <section className="glass-panel w-full max-w-lg rounded-3xl p-8 text-center">
            <p className="text-sm font-semibold text-emerald-700">Cargando panel...</p>
          </section>
        </div>
      </main>
    );
  }

  if (error || !usuario) {
    return (
      <main className="app-shell">
        <div className="app-shell__container flex min-h-screen items-center justify-center px-6">
          <section className="glass-panel w-full max-w-lg rounded-3xl p-8 text-center">
            <h1 className="text-2xl font-semibold text-slate-900">Sesion no disponible</h1>
            <p className="mt-3 text-sm text-red-700">
              {error || 'Tu sesion expiro. Inicia sesion nuevamente.'}
            </p>
            <button type="button" onClick={() => navigate('/login')} className="btn-primary mt-6">
              Ir al login
            </button>
          </section>
        </div>
      </main>
    );
  }

  if (usuario.rol === 'ADMIN') {
    return <AdminDashboard usuario={usuario} onLogout={handleLogout} />;
  }

  return <PatientDashboard usuario={usuario} onLogout={handleLogout} />;
};
