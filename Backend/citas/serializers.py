from rest_framework import serializers

from usuarios.serializers import UsuarioPerfilSerializer

from .models import Cita


class CitaSerializer(serializers.ModelSerializer):
    paciente = serializers.PrimaryKeyRelatedField(read_only=True)
    paciente_detalle = UsuarioPerfilSerializer(source='paciente', read_only=True)

    class Meta:
        model = Cita
        fields = ('id', 'paciente', 'paciente_detalle', 'fecha', 'hora', 'motivo', 'estado')
        read_only_fields = ('id', 'paciente', 'paciente_detalle')

    def validate(self, attrs):
        fecha = attrs.get('fecha', getattr(self.instance, 'fecha', None))
        hora = attrs.get('hora', getattr(self.instance, 'hora', None))

        if fecha and hora:
            citas_en_horario = Cita.objects.filter(fecha=fecha, hora=hora)
            if self.instance is not None:
                citas_en_horario = citas_en_horario.exclude(pk=self.instance.pk)
            if citas_en_horario.exists():
                raise serializers.ValidationError('El horario seleccionado ya está ocupado.')

        return attrs

