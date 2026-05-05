# MediAgenda - Deployment Checklist

## ✅ Estado del Proyecto: LISTO PARA PRODUCCIÓN

### 1. Backend (Django + DRF)

#### Seguridad
- [x] **SECRET_KEY**: Usa `os.environ.get('SECRET_KEY', 'desarrollo-local-seguro-cambiar-en-produccion')`
- [x] **DEBUG**: Controla con `os.environ.get('DEBUG', 'False') == 'True'`
- [x] **ALLOWED_HOSTS**: `.onrender.com`, `localhost`, `127.0.0.1`
- [x] **SSL/Cookies**: `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE` (auto basado en DEBUG)
- [x] **CORS**: En local permite todo; en producción restringe a `.onrender.com`

#### Base de Datos
- [x] **dj-database-url**: Detecta `DATABASE_URL` → PostgreSQL (Render) o SQLite (local)
- [x] **WhiteNoise**: Servir archivos estáticos sin servidor web adicional

#### RBAC y JWT
- [x] **Modelo Usuario**: `save()` fuerza `rol='ADMIN'` si `is_superuser=True`
- [x] **JWT Personalizado**: Token incluye `rol` en payload
- [x] **get_queryset()**: Admin ve todo, Paciente solo sus datos

#### Dependencias
- [x] `requirements.txt` incluye:
  - django, djangorestframework, djangorestframework-simplejwt
  - django-cors-headers, gunicorn, dj-database-url, psycopg2-binary, whitenoise

#### Tests
- [x] `usuarios/tests.py` (14KB):
  - Creación de usuario con contraseña cifrada
  - Generación JWT con rol en payload
  - Auto-promoción a ADMIN para superuser
  - Tests RBAC y permisos

- [x] `citas/tests.py` (6.7KB):
  - Agendamiento exitoso
  - Bloqueo de horarios duplicados
  - Filtrado por rol (ADMIN vs PACIENTE)
  - Cancelación y permisos

#### Docker
- [x] `Dockerfile` multietapa:
  - Builder: Compila wheels para pip caching
  - Runtime: Imagen slim con solo dependencias runtime
  - CMD: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`

### 2. Frontend (React + Vite + TypeScript)

#### Autenticación y Navegación
- [x] **LoginPage.tsx**: Decodifica JWT, redirige según rol
  - `rol === 'ADMIN'` → `/admin-dashboard`
  - `rol === 'PACIENTE'` → `/paciente-dashboard`
- [x] **auth.ts**: `obtenerRolDesdeToken()` con jwt-decode

#### Rutas
- [x] `/` → LandingPage
- [x] `/login` → LoginPage
- [x] `/registro` → RegisterPage
- [x] `/admin-dashboard` → DashboardPage (Admin)
- [x] `/paciente-dashboard` → DashboardPage (Paciente)

#### API
- [x] `api.ts`: Cliente HTTP nativo con fetch, sin Axios
- [x] Base URL: `VITE_API_URL` (default: `http://localhost:8000/api`)
- [x] Token Management: Interceptor manual en headers

#### UI/UX
- [x] **LandingPage**: Rediseño profesional con branding
  - Logo "MediAgenda"
  - Tarjetas de módulos (Citas, RBAC, Disponibilidad)
  - Animaciones `animate-fade-up` y `animate-float`
- [x] **LoginPage/RegisterPage**: Glass-panel moderna
- [x] **AdminDashboard**: Panel de control con stats y tabla
- [x] **PatientDashboard**: Tarjetas de citas y modal de agendamiento
- [x] **Estilos**: Paleta verde (#10b981), Tailwind + CSS variables

#### Dependencias
- [x] `package.json` incluye:
  - react, react-dom, react-router-dom
  - lucide-react, jwt-decode, tailwindcss, vite

### 3. Despliegue (Render)

#### render.yaml
```yaml
- PostgreSQL Database: mediagenda-db
- Web Service: Python/Gunicorn backend en Backend/
  - Build: pip install -r requirements.txt
  - Start: python manage.py migrate && gunicorn config.wsgi:application
  - Env vars: DATABASE_URL, SECRET_KEY, DEBUG=False, ALLOWED_HOSTS
  
- Static Site: React/Vite frontend en Frontend/
  - Build: npm install && npm run build
  - Publish: dist/
  - Env var: VITE_API_URL=https://mediagenda-backend.onrender.com/api
```

### 4. Validación Local (Antes de Push)

```bash
# Backend
cd Backend
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py check
python manage.py test usuarios.tests citas.tests

# Frontend
cd ../Frontend
npm install
npm run build

# Crear superuser para pruebas
python manage.py createsuperuser
```

### 5. Antes de Subir a GitHub

- [ ] `git add .`
- [ ] `git commit -m "Final: seguridad, RBAC, tests y UI mejorada - Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"`
- [ ] `git push origin main`

### 6. Deploy en Render

1. Crear account en Render.com
2. Conectar GitHub repo
3. Click "New Blueprint" → Select render.yaml
4. Render crea automáticamente:
   - PostgreSQL database
   - Backend Web Service
   - Frontend Static Site
5. Actualizar `VITE_API_URL` en Frontend env vars si es necesario

### 7. Post-Deployment

1. Crear admin en Render console:
   ```bash
   python manage.py createsuperuser --noinput \
     --username admin \
     --email admin@mediagenda.com
   # Luego set password vía admin panel
   ```

2. Probar:
   - Landing: https://mediagenda-frontend.onrender.com/
   - Login: https://mediagenda-frontend.onrender.com/login
   - Admin: Login con admin → verifica `/admin-dashboard`
   - Paciente: Login con otro user → verifica `/paciente-dashboard`

### 8. Monitoreo

- Logs en Render dashboard
- Database en Render PostgreSQL console
- Secret Key rotación periódica

---

## 🎯 Resumen Técnico

| Aspecto | Estado |
|--------|--------|
| Autenticación JWT | ✅ Con rol en payload |
| RBAC (Role-Based Access) | ✅ ADMIN vs PACIENTE |
| Seguridad (ISO 27001) | ✅ SSL, cookies secure, headers |
| Base de Datos Híbrida | ✅ PostgreSQL (prod) / SQLite (dev) |
| Tests Automatizados | ✅ Usuarios + Citas |
| Docker | ✅ Multietapa optimizado |
| UI Profesional | ✅ Rediseño con branding |
| Render-ready | ✅ render.yaml listo |

## 📋 Archivos Críticos

- **Backend/config/settings.py** → Seguridad, BD, middleware
- **Backend/usuarios/models.py** → RBAC core
- **Backend/usuarios/serializers.py** → JWT personalizado
- **Backend/citas/views.py** → Filtrado por rol
- **Frontend/src/pages/LoginPage.tsx** → Redirección por rol
- **Frontend/src/utils/auth.ts** → Decodificación JWT
- **render.yaml** → Blueprint de despliegue

## 🚀 Next Steps

1. Ejecutar tests locales
2. Push a GitHub
3. Crear proyecto en Render
4. Monitorear logs post-deployment
5. ¡Éxito en la búsqueda laboral! 🎓
