import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registrarUsuario } from '../utils/auth';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirm_password) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await registrarUsuario({
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
      });
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
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
                <h1 className="mt-6 text-4xl text-slate-900">Crea tu cuenta</h1>
                <p className="mt-4 text-slate-600">
                  Registra tus datos y agenda tus citas medicas desde cualquier lugar.
                </p>
              </div>
              <div className="panel-muted rounded-2xl p-6 text-sm text-slate-600">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-800/70">Experiencia</p>
                <p className="mt-3 text-base font-semibold text-slate-900">Panel intuitivo</p>
                <p className="mt-2">Agenda, revisa y controla tus citas en minutos.</p>
              </div>
            </div>

            <div className="p-8 sm:p-10">
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Registro</p>
                <h1 className="mt-3 text-3xl text-slate-900">Crear cuenta</h1>
                <p className="mt-2 text-sm text-slate-600">Completa los datos para continuar</p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Tu usuario"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-slate-900">
                      Nombre
                    </label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="Juan"
                    />
                  </div>
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-slate-900">
                      Apellido
                    </label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="Perez"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-900">
                    Correo electronico
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-900">
                    Contrasena
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Minimo 8 caracteres"
                  />
                </div>

                <div>
                  <label htmlFor="confirm_password" className="block text-sm font-medium text-slate-900">
                    Confirmar contrasena
                  </label>
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Confirma tu contrasena"
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Registrando...' : 'Registrarse'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                Ya tienes cuenta?{' '}
                <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
                  Inicia sesion aqui
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
