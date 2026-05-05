from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):
    class Rol(models.TextChoices):
        PACIENTE = 'PACIENTE', 'Paciente'
        ADMIN = 'ADMIN', 'Administrador'

    rol = models.CharField(
        max_length=20,
        choices=Rol.choices,
        default=Rol.PACIENTE,
    )

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.rol = self.Rol.ADMIN
        elif not self.rol:
            self.rol = self.Rol.PACIENTE
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f'{self.username} ({self.get_rol_display()})'

