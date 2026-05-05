# MediAgenda - MVP Gestión de Citas Médicas

Plataforma digital para pacientes y administradores de clínica con:
- ✅ **Autenticación JWT** con control por roles (RBAC)
- ✅ **Agenda de citas** en tiempo real con bloqueo de horarios
- ✅ **Panel administrativo** centralizado
- ✅ **Interfaz moderna** y profesional (Tailwind + animaciones)
- ✅ **Seguridad reforzada** (ISO 27001): SSL, cookies seguras, CORS restringido
- ✅ **Tests automatizados** (usuarios, citas, RBAC)
- ✅ **Ready para producción** en Render

## Tech Stack

| Capa | Tecnología |
|------|-----------|
| **Backend** | Python 3.12, Django 6.0, Django REST Framework, JWT |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS |
| **BD** | PostgreSQL (Render) / SQLite (desarrollo local) |
| **Deploy** | Docker (multietapa), Gunicorn, WhiteNoise, Render |

## 🚀 Inicio Rápido (Local)

### 1. Backend
```bash
cd Backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```
🔗 API: `http://localhost:8000/api`

### 2. Frontend
```bash
cd Frontend
npm install
npm run dev
```
🌐 App: `http://localhost:5173`

## 🔐 Acceso por Roles

### Paciente
- **Acceso:** Registro público en `/registro`
- **Dashboard:** `/paciente-dashboard`
- **Permisos:**
  - Ver su agenda de citas
  - Agendar citas con horarios disponibles
  - Cancelar sus propias citas

### Administrador
- **Acceso:** Crear superusuario (`python manage.py createsuperuser`)
- **Dashboard:** `/admin-dashboard`
- **Permisos:**
  - Ver agenda completa (todos los pacientes)
  - Confirmar o cancelar citas
  - Buscar y filtrar por estado
  - Estadísticas diarias

## 📝 Tests

```bash
cd Backend
python manage.py test usuarios.tests
python manage.py test citas.tests
```

Cubre:
- ✅ Creación de usuario con contraseña cifrada
- ✅ Generación de JWT con rol en payload
- ✅ Auto-promoción de superuser a ADMIN
- ✅ Agendamiento y validación de horarios
- ✅ Filtrado RBAC (ADMIN vs PACIENTE)

## 🐳 Docker

```bash
docker build -t mediagenda:latest Backend/
docker run -e SECRET_KEY=tu-secret -p 8000:8000 mediagenda:latest
```

## 📦 Despliegue en Render

### Preparación
1. Push a GitHub (incluye `render.yaml`)
2. Crear cuenta en [Render.com](https://render.com)

### Deploy Automático
1. En Render, seleccionar **Blueprint → New Blueprint**
2. Conectar tu repo GitHub
3. Render detecta `render.yaml` y crea:
   - PostgreSQL database
   - Web Service (backend)
   - Static Site (frontend)

### Variables de Entorno (Render)
```
SECRET_KEY=<auto-generada>
DEBUG=False
ALLOWED_HOSTS=.onrender.com,localhost
DATABASE_URL=<auto-inyectada>
VITE_API_URL=https://mediagenda-backend.onrender.com/api
```

### Post-Deployment
```bash
# Via Render console:
python manage.py createsuperuser --noinput \
  --username admin --email admin@mediagenda.com
```

## 📋 Rutas API

### Autenticación
- `POST /api/usuarios/login/` → Obtener tokens + rol
- `POST /api/usuarios/registro/` → Registrar paciente
- `GET /api/usuarios/me/` → Perfil actual
- `POST /api/usuarios/token/refresh/` → Renovar token

### Citas
- `GET /api/citas/` → Listar (filtrado por rol)
- `POST /api/citas/` → Crear cita
- `PATCH /api/citas/{id}/` → Actualizar estado
- `DELETE /api/citas/{id}/` → Cancelar cita
- `GET /api/citas/disponibilidad/?fecha=YYYY-MM-DD` → Horarios ocupados

## 🔒 Seguridad

- 🔐 **JWT:** Token con rol en payload
- 🔑 **Passwords:** Cifrados con PBKDF2-SHA256
- 🛡️ **SSL:** Redirect automático en producción
- 🍪 **Cookies:** Secure + HttpOnly en producción
- 🔄 **CORS:** Restringido a `.onrender.com` en producción
- 🛠️ **Middleware:** WhiteNoise, SecurityMiddleware

## 📂 Estructura

```
MediAgenda/
├── Backend/
│   ├── config/settings.py      (Seguridad, BD híbrida)
│   ├── usuarios/               (RBAC, JWT)
│   ├── citas/                  (Lógica de citas + tests)
│   ├── requirements.txt        (Dependencias)
│   ├── Dockerfile              (Multietapa)
│   └── manage.py
├── Frontend/
│   ├── src/
│   │   ├── pages/             (Login, Register, Dashboard)
│   │   ├── utils/             (API, Auth, JWT decode)
│   │   ├── app/components/    (AdminDashboard, PatientDashboard)
│   │   └── styles/            (Tailwind, tema)
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── render.yaml                (Blueprint de despliegue)
├── .env.example               (Variables de entorno)
└── DEPLOYMENT_CHECKLIST.md    (Guía post-deploy)
```

## 🎯 Características Principales

### ✨ UX/UI
- Landing page profesional con branding
- Autenticación fluida con redirección por rol
- Panel de admin con búsqueda y filtros
- Modal de agendamiento intuitivo
- Animaciones y transiciones suaves

### 🔧 Backend
- Serializadores validados y seguros
- Queryset filtrado automáticamente por rol
- Migraciones listas para ejecutar
- Tests end-to-end para flujos críticos

### 📱 Responsive
- Diseño mobile-first
- Breakpoints en 640px, 768px, 1024px
- Touch-friendly UI

## 💡 Notas para Reclutadores

Este proyecto demuestra:
- **Fullstack expertise:** Django + React, ambos en producción
- **Security first:** RBAC, JWT, hardening de Django
- **Testing:** Suite de tests que valida lógica de negocio
- **DevOps:** Docker, CI/CD con Render, Blueprint automation
- **Modern frontend:** Vite, TypeScript, Tailwind, componentes reutilizables
- **Database design:** Relaciones normalizadas, constraints únicos

Listo para demo y deployment inmediato.

## 📧 Contacto / Deploy

Para desplegar o consultas:
1. Clonar repo
2. Seguir pasos en "Inicio Rápido"
3. Push a GitHub + crear Blueprint en Render
4. ¡Listo en producción! 🚀
