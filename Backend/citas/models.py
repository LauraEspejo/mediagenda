from django.conf import settings
from django.db import models


class Cita(models.Model):
    class Estado(models.TextChoices):
        PENDIENTE = 'PENDIENTE', 'Pendiente'
        CONFIRMADA = 'CONFIRMADA', 'Confirmada'
        CANCELADA = 'CANCELADA', 'Cancelada'

    paciente = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='citas',
    )
    fecha = models.DateField()
    hora = models.TimeField()
    motivo = models.TextField()
    estado = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.PENDIENTE,
    )

    class Meta:
        ordering = ['fecha', 'hora']
        constraints = [
            models.UniqueConstraint(
                fields=['fecha', 'hora'],
                name='unique_cita_fecha_hora',
            )
        ]

    def __str__(self) -> str:
        return f'{self.paciente_id} - {self.fecha} {self.hora} ({self.get_estado_display()})'

