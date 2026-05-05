import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { iniciarSesion, obtenerRolDesdeToken } from '../utils/auth';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const tokens = await iniciarSesion({ username, password });
      const rol = obtenerRolDesdeToken(tokens.access);
      navigate(rol === 'ADMIN' ? '/admin-dashboard' : '/paciente-dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <div className="app-shell__container flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-2xl backdrop-blur">
          <div className="grid lg:grid-cols-[1.05fr,0.95fr]">
            <div className="hidden flex-col justify-between gap-10 p-10 lg:flex">
              <div>
                <div className="logo-mark">M</div>
                <h1 className="mt-6 text-4xl text-slate-900">Bienvenido de vuelta</h1>
                <p className="mt-4 text-slate-600">
                  Accede al panel para coordinar citas y visualizar el estado de tu agenda.
                </p>
              </div>
              <div className="panel-muted rounded-2xl p-6 text-sm text-slate-600">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-800/70">Seguridad</p>
                <p className="mt-3 text-base font-semibold text-slate-900">Acceso protegido</p>
                <p className="mt-2">
                  Tus datos se resguardan con autenticacion JWT y controles por rol.
                </p>
              </div>
            </div>

            <div className="p-8 sm:p-10">
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Acceso</p>
                <h1 className="mt-3 text-3xl text-slate-900">Iniciar sesion</h1>
                <p className="mt-2 text-sm text-slate-600">Ingresa tus credenciales</p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-slate-900">
                    Usuario
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Tu usuario"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-900">
                    Contrasena
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Tu contrasena"
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Iniciando sesion...' : 'Iniciar Sesion'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                No tienes cuenta?{' '}
                <Link to="/registro" className="font-semibold text-emerald-700 hover:text-emerald-800">
                  Registrate aqui
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
