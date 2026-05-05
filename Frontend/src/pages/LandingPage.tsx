import { Calendar, Check, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingPage = () => {
  return (
    <main className="app-shell">
      <div className="app-shell__container mx-auto min-h-screen w-full max-w-7xl px-6 py-8 md:px-10">
        <header className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="logo-mark">M</div>
            <div>
              <p className="text-base text-slate-900">MediAgenda</p>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Clinica Digital</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost">
              Ingresar
            </Link>
            <Link to="/registro" className="btn-primary">
              Crear cuenta
            </Link>
          </div>
        </header>

        <section className="grid gap-8 py-12 lg:grid-cols-[1.15fr,0.85fr] lg:py-16">
          <div className="animate-fade-up">
            <div className="hero-chip">MVP listo para produccion</div>
            <h1 className="mt-6 max-w-3xl text-4xl leading-tight text-slate-900 md:text-6xl">
              Agenda medica con control por rol, seguridad y experiencia profesional.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
              Gestiona disponibilidad en tiempo real, administra citas de forma centralizada y da
              autonomia al paciente desde una interfaz clara.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/login" className="btn-primary">
                Iniciar sesion
              </Link>
              <Link to="/registro" className="btn-outline">
                Registrarse
              </Link>
            </div>
          </div>

          <aside className="glass-panel animate-float rounded-3xl p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-800/70">Estado del sistema</p>
            <h2 className="mt-3 text-2xl text-slate-900">Panel integral MediAgenda</h2>
            <div className="mt-6 space-y-4">
              <div className="panel-muted flex items-center gap-3 rounded-2xl p-4">
                <Calendar className="h-5 w-5 text-emerald-700" />
                <div>
                  <p className="text-sm text-slate-500">Modulo citas</p>
                  <p className="text-slate-900">Agenda y seguimiento en tiempo real</p>
                </div>
              </div>
              <div className="panel-muted flex items-center gap-3 rounded-2xl p-4">
                <Users className="h-5 w-5 text-emerald-700" />
                <div>
                  <p className="text-sm text-slate-500">RBAC activo</p>
                  <p className="text-slate-900">Vistas separadas para Admin y Paciente</p>
                </div>
              </div>
              <div className="panel-muted flex items-center gap-3 rounded-2xl p-4">
                <Clock className="h-5 w-5 text-emerald-700" />
                <div>
                  <p className="text-sm text-slate-500">Disponibilidad</p>
                  <p className="text-slate-900">Bloqueo de horarios ocupados</p>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-4 pb-10 md:grid-cols-3">
          <article className="panel rounded-2xl p-5">
            <div className="mb-3 inline-flex rounded-xl bg-emerald-100 p-2 text-emerald-700">
              <Check className="h-4 w-4" />
            </div>
            <h3 className="text-slate-900">Seguridad reforzada</h3>
            <p className="mt-2 text-sm text-slate-600">Autenticacion JWT y control de acceso por roles.</p>
          </article>
          <article className="panel rounded-2xl p-5">
            <div className="mb-3 inline-flex rounded-xl bg-emerald-100 p-2 text-emerald-700">
              <Calendar className="h-4 w-4" />
            </div>
            <h3 className="text-slate-900">Agenda centralizada</h3>
            <p className="mt-2 text-sm text-slate-600">Gestion de citas para clinica y pacientes en un solo flujo.</p>
          </article>
          <article className="panel rounded-2xl p-5">
            <div className="mb-3 inline-flex rounded-xl bg-emerald-100 p-2 text-emerald-700">
              <Users className="h-4 w-4" />
            </div>
            <h3 className="text-slate-900">Experiencia profesional</h3>
            <p className="mt-2 text-sm text-slate-600">Interfaz moderna lista para demo y despliegue en Render.</p>
          </article>
        </section>
      </div>
    </main>
  );
};

