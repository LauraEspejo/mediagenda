from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from .models import Cita

Usuario = get_user_model()


class CitaModelTest(TestCase):
    """Test de modelo Cita."""

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            username='testuser',
            password='TestPass123',
        )

    def test_crear_cita(self):
        """Test: Crear una cita correctamente."""
        cita = Cita.objects.create(
            paciente=self.usuario,
            fecha='2026-05-15',
            hora='10:00',
            motivo='Consulta general',
        )

        self.assertIsNotNone(cita.id)
        self.assertEqual(cita.paciente, self.usuario)
        self.assertEqual(cita.estado, Cita.Estado.PENDIENTE)
        self.assertEqual(str(cita), f'{self.usuario.id} - 2026-05-15 10:00 (Pendiente)')

    def test_constraint_unico_fecha_hora(self):
        """Test: No se pueden crear dos citas con la misma fecha y hora."""
        Cita.objects.create(
            paciente=self.usuario,
            fecha='2026-05-15',
            hora='10:00',
            motivo='Primera cita',
        )

        with self.assertRaises(Exception):
            Cita.objects.create(
                paciente=self.usuario,
                fecha='2026-05-15',
                hora='10:00',
                motivo='Segunda cita en mismo horario',
            )

    def test_cita_estados(self):
        """Test: Estados válidos de cita."""
        cita = Cita.objects.create(
            paciente=self.usuario,
            fecha='2026-05-15',
            hora='10:00',
            motivo='Test',
            estado=Cita.Estado.CONFIRMADA,
        )

        self.assertEqual(cita.estado, Cita.Estado.CONFIRMADA)

        cita.estado = Cita.Estado.CANCELADA
        cita.save()
        cita.refresh_from_db()
        self.assertEqual(cita.estado, Cita.Estado.CANCELADA)


class CitaSerializerTest(APITestCase):
    """Test de validaciones del serializador Cita."""

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            username='testuser',
            password='TestPass123',
        )

    def test_validar_horario_duplicado(self):
        """Test: Validador rechaza horarios duplicados."""
        Cita.objects.create(
            paciente=self.usuario,
            fecha='2026-05-15',
            hora='10:00',
            motivo='Primera cita',
        )

        client = APIClient()
        client.force_authenticate(user=self.usuario)

        response = client.post(
            '/api/citas/',
            {
                'fecha': '2026-05-15',
                'hora': '10:00',
                'motivo': 'Duplicado',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class CitaUpdateDeleteTest(APITestCase):
    """Test de actualización y eliminación de citas."""

    def setUp(self):
        self.client = APIClient()
        self.usuario_paciente = Usuario.objects.create_user(
            username='paciente',
            password='TestPass123',
        )
        self.otro_usuario = Usuario.objects.create_user(
            username='otro',
            password='TestPass123',
        )
        self.token = self._get_token('paciente', 'TestPass123')

    def _get_token(self, username, password):
        from rest_framework_simplejwt.tokens import RefreshToken

        user = Usuario.objects.get(username=username)
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)

    def test_actualizar_estado_cita(self):
        """Test: Actualizar estado de cita."""
        cita = Cita.objects.create(
            paciente=self.usuario_paciente,
            fecha='2026-05-15',
            hora='10:00',
            motivo='Test',
            estado=Cita.Estado.PENDIENTE,
        )

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        response = self.client.patch(
            f'/api/citas/{cita.id}/',
            {'estado': 'CONFIRMADA'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        cita.refresh_from_db()
        self.assertEqual(cita.estado, Cita.Estado.CONFIRMADA)

    def test_cancelar_cita(self):
        """Test: Cancelar una cita."""
        cita = Cita.objects.create(
            paciente=self.usuario_paciente,
            fecha='2026-05-15',
            hora='10:00',
            motivo='Test',
        )

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        response = self.client.patch(
            f'/api/citas/{cita.id}/',
            {'estado': 'CANCELADA'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_eliminar_cita(self):
        """Test: Eliminar una cita."""
        cita = Cita.objects.create(
            paciente=self.usuario_paciente,
            fecha='2026-05-15',
            hora='10:00',
            motivo='Test',
        )

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        response = self.client.delete(f'/api/citas/{cita.id}/', format='json')

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Cita.objects.filter(id=cita.id).exists())

    def test_paciente_no_puede_ver_cita_ajena(self):
        """Test: Paciente no puede ver cita de otro paciente."""
        cita = Cita.objects.create(
            paciente=self.otro_usuario,
            fecha='2026-05-15',
            hora='10:00',
            motivo='Cita ajena',
        )

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        response = self.client.get(f'/api/citas/{cita.id}/', format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_paciente_no_puede_actualizar_cita_ajena(self):
        """Test: Paciente no puede actualizar cita de otro."""
        cita = Cita.objects.create(
            paciente=self.otro_usuario,
            fecha='2026-05-15',
            hora='10:00',
            motivo='Test',
        )

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        response = self.client.patch(
            f'/api/citas/{cita.id}/',
            {'estado': 'CONFIRMADA'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
