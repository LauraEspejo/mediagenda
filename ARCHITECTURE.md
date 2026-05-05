# MediAgenda - Arquitectura Técnica

## 📐 Diagrama de Flujo de Autenticación

```
Cliente (Browser)
    ↓
[LoginPage.tsx]
    ↓ POST /api/usuarios/login/
[CustomTokenObtainPairSerializer]
    ↓ Valida credenciales + genera JWT
Respuesta: { access: TOKEN, refresh: TOKEN, rol: "ADMIN"|"PACIENTE" }
    ↓
[LoginPage] Decodifica JWT con jwt-decode
    ↓ obtenerRolDesdeToken()
    ↓ Redirige según rol
    ├─→ rol === "ADMIN" → /admin-dashboard
    └─→ rol === "PACIENTE" → /paciente-dashboard
```

## 🔐 Estructura JWT

```json
{
  "token_type": "access",
  "exp": 1234567890,
  "iat": 1234567800,
  "jti": "abc123",
  "user_id": 1,
  "username": "admin",
  "rol": "ADMIN"
}
```

El campo `rol` se inyecta en `CustomTokenObtainPairSerializer.get_token()`.

## 🏗️ Arquitectura Backend

### Modelos
```
Usuario (extends AbstractUser)
├── rol: Rol.ADMIN | Rol.PACIENTE (default)
├── save() → fuerza rol=ADMIN si is_superuser=True

Cita
├── paciente: FK(Usuario)
├── fecha: Date
├── hora: Time
├── motivo: Text
├── estado: Estado.PENDIENTE | .CONFIRMADA | .CANCELADA
├── constraints: unique(fecha, hora)
```

### Vistas (Viewsets)

#### UsuarioListView
- Permiso: AdminOnly (solo ADMIN puede listar todos)
- GET /api/usuarios/ → Lista de usuarios (admin only)

#### UsuarioPerfilView
- Permiso: IsAuthenticated
- GET /api/usuarios/me/ → Datos del usuario actual + rol

#### CustomTokenObtainPairView
- Permiso: AllowAny
- POST /api/usuarios/login/ → { access, refresh, rol }

#### CitaViewSet
- Permiso: IsAuthenticated
- GET /api/citas/ → Filtrado automáticamente por rol
  - Admin: Todas las citas
  - Paciente: Solo sus citas
- POST /api/citas/ → Crear cita (auto-asigna paciente al usuario)
- PATCH /api/citas/{id}/ → Actualizar estado
- DELETE /api/citas/{id}/ → Cancelar cita
- GET /api/citas/disponibilidad/?fecha=YYYY-MM-DD → Horarios ocupados

### Serializers

#### UsuarioRegistroSerializer
- Validación: password min 8 caracteres
- Crea usuario con rol=PACIENTE por defecto
- Hash automático de contraseña

#### UsuarioPerfilSerializer
- Read-only (get_rol vía helper function)

#### CustomTokenObtainPairSerializer
- Inyecta `rol` en token access + respuesta JSON

#### CitaSerializer
- Validación: NO permite agendar en horario ocupado
- Campo `paciente_detalle` populate (nested user data)

## 📱 Arquitectura Frontend

### Estructura de Rutas

```
App.tsx
├── / → LandingPage
├── /login → LoginPage
├── /registro → RegisterPage
├── /admin-dashboard → DashboardPage (rol=ADMIN)
├── /paciente-dashboard → DashboardPage (rol=PACIENTE)
└── /dashboard → DashboardPage (fallback)
```

### Context/State Management

Estado manejado localmente en componentes (React hooks):
- `LoginPage`: username, password, error, loading
- `DashboardPage`: usuario (perfil), citas, filtros
- `AdminDashboard`: searchTerm, filterStatus
- `PatientDashboard`: selectedDate, selectedTime, motivo

### API Client

```
api.ts
├── buildUrl() → Normaliza endpoint + query params
├── getAccessToken() → Lee de localStorage
├── apiRequest<T>() → Fetch con auto-headers (Content-Type, Authorization)
├── saveAuthTokens() → Persiste en localStorage
└── clearAuthTokens() → Limpia en logout
```

Interceptor manual:
- Si response = 401 → tokens inválidos → logout + redirect /login
- Si response = 403 → permisos insuficientes → error message

### Componentes Principales

#### LoginPage.tsx
- Form con username + password
- Valida y hace POST /api/usuarios/login/
- Decodifica JWT + extrae rol
- Redirige a dashboard según rol
- Error handling

#### DashboardPage.tsx
- Carga perfil usuario vía /api/usuarios/me/
- Renderiza AdminDashboard o PatientDashboard según rol

#### AdminDashboard.tsx
- Carga todas las citas vía GET /api/citas/
- Tabla con buscar y filtrar
- Stats: citas hoy, pendientes, confirmadas, canceladas
- Actions: confirmar, cancelar citas

#### PatientDashboard.tsx
- Carga citas propias vía GET /api/citas/
- Grid de tarjetas por cita
- Modal para agendar nueva cita
- Selecciona fecha → carga disponibilidad
- Selecciona hora (bloquea ocupadas)
- Motivo + confirmar

## 🔒 RBAC (Role-Based Access Control)

### Niveles de Control

1. **Modelo/Queryset** (backend enforced)
   - `CitaViewSet.get_queryset()` filtra automáticamente
   - Admin ve todo; Paciente solo sus datos

2. **Serializador** (validación)
   - `CitaSerializer` valida horarios únicos

3. **Vista** (permisos)
   - `UsuarioListView` → solo para AdminOnly
   - `CitaViewSet` → para IsAuthenticated

4. **Frontend** (UX)
   - DashboardPage renderiza según rol
   - AdminDashboard oculta opciones que Paciente no tiene

## 🗄️ Base de Datos

### Esquema

```sql
usuarios_usuario
├── id (PK)
├── username (UNIQUE)
├── email
├── first_name, last_name
├── password (hashed)
├── rol (ENUM: PACIENTE, ADMIN)
├── is_superuser, is_staff, is_active
└── last_login

citas_cita
├── id (PK)
├── paciente (FK → usuarios_usuario)
├── fecha (DATE)
├── hora (TIME)
├── motivo (TEXT)
├── estado (ENUM: PENDIENTE, CONFIRMADA, CANCELADA)
├── created_at, updated_at
└── UNIQUE (fecha, hora)
```

### Migraciones

1. `0001_initial.py` → Crea usuarios_usuario y citas_cita
2. `0002_update_admin_role.py` → Normaliza ADMINISTRADOR → ADMIN

## 🔧 Seguridad

### Capas de Hardening

1. **Entrada**
   - CORS restringido (solo .onrender.com en prod)
   - Validación de JSON en request body
   - Rate limiting via SECURE_HEADERS

2. **Procesamiento**
   - Password hashing PBKDF2-SHA256
   - JWT: expiración 5 min (access), refresh 24h
   - CSRF tokens en cookies

3. **Salida**
   - Serializers no exponen datos sensibles
   - Status codes explícitos (401, 403, 404, 500)

4. **Transporte**
   - HTTPS force en producción
   - Secure cookies (HttpOnly, Secure, SameSite)
   - HSTS headers

### .env Variables Sensibles

```
SECRET_KEY=<50+ chars random>
DATABASE_URL=postgresql://...
CORS_ALLOWED_ORIGINS=https://mediagenda-frontend.onrender.com
```

## 📦 Despliegue (Render Blueprint)

### render.yaml

```yaml
databases:
  - name: mediagenda-db
    databaseName: mediagenda
    user: mediagenda
    # Password: auto-generated, readable en environment

services:
  - type: web
    name: mediagenda-backend
    runtime: python
    rootDir: Backend/
    buildCommand: pip install -r requirements.txt
    startCommand: python manage.py migrate && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: mediagenda-db
          property: connectionString  # Auto-injected
      - key: SECRET_KEY
        generateValue: true  # Auto-generated en deploy
      - key: DEBUG
        value: "False"
      - key: ALLOWED_HOSTS
        value: ".onrender.com,localhost,127.0.0.1"

  - type: static_site
    name: mediagenda-frontend
    rootDir: Frontend/
    buildCommand: npm install && npm run build
    staticPublishPath: dist/
    envVars:
      - key: VITE_API_URL
        value: "https://mediagenda-backend.onrender.com/api"
```

### Flujo de Deploy

1. Render detecta `render.yaml` en root
2. Crea PostgreSQL database
3. Build backend: `pip install` (wheels cachean)
4. Build frontend: `npm install && npm run build`
5. Start backend: migrations + gunicorn
6. Publish frontend: dist/ → CDN
7. Bind services vía internal networking

## 🧪 Testing Strategy

### Unit Tests (Backend)

#### usuarios/tests.py
- `UsuarioRegistroTest.test_crear_usuario_exitoso()`
  - Verifica password hashing (bcrypt)
  - Rol default = PACIENTE
  
- `UsuarioRegistroTest.test_superuser_recibe_rol_admin_automaticamente()`
  - Crea superuser
  - Verifica is_superuser=True
  - Verifica rol='ADMIN' en save()

- `JWTTokenTest.test_token_contiene_rol_paciente()`
  - Login → extrae access token
  - Decodifica con jwt_decode
  - Verifica rol en payload

#### citas/tests.py
- `CitaAgendamientoTest.test_no_agendar_en_horario_ocupado()`
  - Crea cita con (fecha, hora)
  - Intenta crear otra en mismo horario
  - Verifica 400 BAD_REQUEST + mensaje

- `CitaAgendamientoTest.test_paciente_ve_solo_sus_citas()`
  - Crea 2 citas para pacientes diferentes
  - Login como paciente1
  - GET /api/citas/
  - Verifica solo 1 cita en response

- `RBACTest.test_admin_puede_listar_usuarios()`
  - Login como admin
  - GET /api/usuarios/
  - Status 200

- `RBACTest.test_paciente_no_puede_listar_usuarios()`
  - Login como paciente
  - GET /api/usuarios/
  - Status 403 FORBIDDEN

### E2E (Recomendado: pytest + Playwright)

```python
# No incluido en MVP, pero recomendado post-launch
test_login_redirect_by_role()
test_admin_can_confirm_appointment()
test_patient_sees_only_own_appointments()
```

## 🚀 Performance Optimizations

1. **Backend**
   - `select_related('paciente')` en CitaViewSet
   - Indexación automática en FK y UNIQUE constraints
   - WhiteNoise comprime estáticos
   - Gunicorn workers = CPU cores

2. **Frontend**
   - Vite: code splitting automático
   - Lazy loading de rutas
   - Image optimization
   - CSS purging con Tailwind

3. **Database**
   - PostgreSQL connection pooling en Render
   - Query optimization vía ORM
   - Índices en fecha, paciente_id

## 📊 Monitoreo

### Logs en Render
- Django logs: stderr/stdout captados automáticamente
- HTTP logs: status codes, response times
- Database logs: query errors, slow queries

### Alertas Recomendadas
- 500 errors spike
- DB connection pool exhausted
- High memory usage
- API response time > 500ms

---

**Última actualización:** 2026-05-05
**Versión MVP:** 1.0.0
**Status:** Production-ready ✅
