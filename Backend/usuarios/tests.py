from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
import jwt
import json

Usuario = get_user_model()


class UsuarioRegistroTest(TestCase):
    """Test creación de usuario con validación de cifrado de contraseña."""

    def test_crear_usuario_exitoso(self):
        """Test 1: Creación exitosa de un usuario con contraseña cifrada."""
        usuario = Usuario.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='SecurePass123',
            first_name='Test',
            last_name='User',
        )

        self.assertIsNotNone(usuario.id)
        self.assertEqual(usuario.username, 'testuser')
        self.assertEqual(usuario.email, 'test@example.com')
        self.assertEqual(usuario.rol, Usuario.Rol.PACIENTE)
        self.assertTrue(usuario.check_password('SecurePass123'))
        self.assertFalse(usuario.check_password('WrongPassword'))

    def test_usuario_nuevo_tiene_rol_paciente_por_defecto(self):
        """Test: Nuevo usuario registrado siempre tiene rol PACIENTE."""
        usuario = Usuario.objects.create_user(
            username='paciente',
            password='Pass123!',
        )
        self.assertEqual(usuario.rol, Usuario.Rol.PACIENTE)

    def test_superuser_recibe_rol_admin_automaticamente(self):
        """Test: Superusuario automáticamente recibe rol ADMIN."""
        admin = Usuario.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='AdminPass123',
        )
        self.assertEqual(admin.rol, Usuario.Rol.ADMIN)
        self.assertTrue(admin.is_superuser)

    def test_password_no_guardado_en_texto_plano(self):
        """Test: La contraseña se cifra y no se guarda en texto plano."""
        password_plain = 'MySecretPass123'
        usuario = Usuario.objects.create_user(
            username='secureuser',
            password=password_plain,
        )
        self.assertNotEqual(usuario.password, password_plain)
        self.assertTrue(usuario.password.startswith('pbkdf2_sha256$'))


class JWTTokenTest(APITestCase):
    """Test generación de token JWT con rol incluido."""

    def setUp(self):
        self.client = APIClient()
        self.usuario_paciente = Usuario.objects.create_user(
            username='paciente_test',
            password='TestPass123',
            email='paciente@example.com',
        )
        self.usuario_admin = Usuario.objects.create_superuser(
            username='admin_test',
            password='AdminPass123',
            email='admin@example.com',
        )

    def test_login_exitoso_retorna_tokens(self):
        """Test 2: Login exitoso genera access y refresh tokens."""
        response = self.client.post(
            '/api/usuarios/login/',
            {
                'username': 'paciente_test',
                'password': 'TestPass123',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('rol', response.data)

    def test_token_contiene_rol_paciente(self):
        """Test: Token JWT contiene el rol PACIENTE en payload."""
        response = self.client.post(
            '/api/usuarios/login/',
            {
                'username': 'paciente_test',
                'password': 'TestPass123',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        access_token = response.data['access']
        rol_en_response = response.data['rol']

        self.assertEqual(rol_en_response, 'PACIENTE')
        self.assertEqual(access_token, response.data['access'])

    def test_token_contiene_rol_admin(self):
        """Test: Token JWT contiene el rol ADMIN para superusuario."""
        response = self.client.post(
            '/api/usuarios/login/',
            {
                'username': 'admin_test',
                'password': 'AdminPass123',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        rol_en_response = response.data['rol']
        self.assertEqual(rol_en_response, 'ADMIN')

    def test_refresh_token_valido(self):
        """Test: Refresh token funciona y renueva el access token."""
        login_response = self.client.post(
            '/api/usuarios/login/',
            {
                'username': 'paciente_test',
                'password': 'TestPass123',
            },
            format='json',
        )

        refresh_token = login_response.data['refresh']
        response = self.client.post(
            '/api/usuarios/token/refresh/',
            {'refresh': refresh_token},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_login_invalido_retorna_401(self):
        """Test: Login con credenciales inválidas retorna 401."""
        response = self.client.post(
            '/api/usuarios/login/',
            {
                'username': 'paciente_test',
                'password': 'WrongPassword',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class CitaAgendamientoTest(APITestCase):
    """Test agendamiento de citas con validación de lógica de negocio."""

    def setUp(self):
        self.client = APIClient()
        self.usuario_paciente = Usuario.objects.create_user(
            username='paciente1',
            password='TestPass123',
            email='paciente1@example.com',
        )
        self.usuario_paciente2 = Usuario.objects.create_user(
            username='paciente2',
            password='TestPass123',
            email='paciente2@example.com',
        )
        self.admin = Usuario.objects.create_superuser(
            username='admin',
            password='AdminPass123',
            email='admin@example.com',
        )

        # Autenticar paciente
        self.token_paciente = self._get_token(
            'paciente1',
            'TestPass123',
        )
        self.token_admin = self._get_token('admin', 'AdminPass123')

    def _get_token(self, username, password):
        """Helper para obtener token de un usuario."""
        response = self.client.post(
            '/api/usuarios/login/',
            {'username': username, 'password': password},
            format='json',
        )
        return response.data['access']

    def test_crear_cita_exitosa(self):
        """Test 3: Agendamiento exitoso de cita."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token_paciente}')

        response = self.client.post(
            '/api/citas/',
            {
                'fecha': '2026-05-15',
                'hora': '10:00',
                'motivo': 'Consulta general',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['motivo'], 'Consulta general')
        self.assertEqual(response.data['estado'], 'PENDIENTE')

    def test_no_agendar_en_horario_ocupado(self):
        """Test 3b: No permitir agendar en un horario ya ocupado."""
        from citas.models import Cita

        # Crear una cita en fecha/hora específica
        Cita.objects.create(
            paciente=self.usuario_paciente,
            fecha='2026-05-15',
            hora='10:00',
            motivo='Cita existente',
        )

        # Intentar agendar otro paciente en mismo horario
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token_paciente}')
        response = self.client.post(
            '/api/citas/',
            {
                'fecha': '2026-05-15',
                'hora': '10:00',
                'motivo': 'Otra consulta',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('ocupado', str(response.data).lower())

    def test_paciente_ve_solo_sus_citas(self):
        """Test: Paciente solo ve sus propias citas."""
        from citas.models import Cita

        # Crear cita para paciente1
        Cita.objects.create(
            paciente=self.usuario_paciente,
            fecha='2026-05-15',
            hora='09:00',
            motivo='Mi cita',
        )

        # Crear cita para paciente2
        Cita.objects.create(
            paciente=self.usuario_paciente2,
            fecha='2026-05-15',
            hora='10:00',
            motivo='Su cita',
        )

        # Paciente1 solicita sus citas
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token_paciente}')
        response = self.client.get('/api/citas/', format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['motivo'], 'Mi cita')

    def test_admin_ve_todas_las_citas(self):
        """Test: Administrador ve todas las citas del sistema."""
        from citas.models import Cita

        # Crear citas para diferentes pacientes
        Cita.objects.create(
            paciente=self.usuario_paciente,
            fecha='2026-05-15',
            hora='09:00',
            motivo='Cita paciente 1',
        )
        Cita.objects.create(
            paciente=self.usuario_paciente2,
            fecha='2026-05-15',
            hora='10:00',
            motivo='Cita paciente 2',
        )

        # Admin solicita todas las citas
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token_admin}')
        response = self.client.get('/api/citas/', format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_paciente_no_autenticado_no_puede_agendar(self):
        """Test: Paciente sin autenticación no puede agendar."""
        response = self.client.post(
            '/api/citas/',
            {
                'fecha': '2026-05-15',
                'hora': '10:00',
                'motivo': 'Consulta',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_obtener_disponibilidad_por_fecha(self):
        """Test: Endpoint de disponibilidad retorna horarios ocupados."""
        from citas.models import Cita

        Cita.objects.create(
            paciente=self.usuario_paciente,
            fecha='2026-05-15',
            hora='09:00',
            motivo='Cita 1',
        )
        Cita.objects.create(
            paciente=self.usuario_paciente2,
            fecha='2026-05-15',
            hora='10:00',
            motivo='Cita 2',
        )

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token_paciente}')
        response = self.client.get(
            '/api/citas/disponibilidad/',
            {'fecha': '2026-05-15'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('09:00', response.data['ocupados'])
        self.assertIn('10:00', response.data['ocupados'])


class RBACTest(APITestCase):
    """Test Role-Based Access Control (RBAC)."""

    def setUp(self):
        self.client = APIClient()
        self.admin = Usuario.objects.create_superuser(
            username='admin',
            password='AdminPass123',
            email='admin@example.com',
        )
        self.paciente = Usuario.objects.create_user(
            username='paciente',
            password='TestPass123',
            email='paciente@example.com',
        )

        self.token_admin = self._get_token('admin', 'AdminPass123')
        self.token_paciente = self._get_token('paciente', 'TestPass123')

    def _get_token(self, username, password):
        response = self.client.post(
            '/api/usuarios/login/',
            {'username': username, 'password': password},
            format='json',
        )
        return response.data['access']

    def test_admin_puede_listar_usuarios(self):
        """Test: Solo admin puede listar todos los usuarios."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token_admin}')
        response = self.client.get('/api/usuarios/', format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_paciente_no_puede_listar_usuarios(self):
        """Test: Paciente no tiene permiso para listar usuarios."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token_paciente}')
        response = self.client.get('/api/usuarios/', format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_obtener_perfil_propio(self):
        """Test: Todo usuario autenticado puede obtener su perfil."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token_paciente}')
        response = self.client.get('/api/usuarios/me/', format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'paciente')
        self.assertEqual(response.data['rol'], 'PACIENTE')

    def test_admin_perfil_tiene_rol_admin(self):
        """Test: Perfil de admin muestra rol ADMIN."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token_admin}')
        response = self.client.get('/api/usuarios/me/', format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['rol'], 'ADMIN')
