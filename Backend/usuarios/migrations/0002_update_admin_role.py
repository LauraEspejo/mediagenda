from django.db import migrations, models


def normalize_roles(apps, schema_editor):
    Usuario = apps.get_model('usuarios', 'Usuario')
    Usuario.objects.filter(rol='ADMINISTRADOR').update(rol='ADMIN')
    Usuario.objects.filter(is_superuser=True).update(rol='ADMIN')


def rollback_roles(apps, schema_editor):
    Usuario = apps.get_model('usuarios', 'Usuario')
    Usuario.objects.filter(rol='ADMIN').update(rol='ADMINISTRADOR')


class Migration(migrations.Migration):
    dependencies = [
        ('usuarios', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(normalize_roles, rollback_roles),
        migrations.AlterField(
            model_name='usuario',
            name='rol',
            field=models.CharField(
                choices=[('PACIENTE', 'Paciente'), ('ADMIN', 'Administrador')],
                default='PACIENTE',
                max_length=20,
            ),
        ),
    ]
