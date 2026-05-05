from django.utils.dateparse import parse_date
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from usuarios.models import Usuario

from .models import Cita
from .serializers import CitaSerializer


class CitaViewSet(viewsets.ModelViewSet):
    serializer_class = CitaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Cita.objects.select_related('paciente').all()
        if self.request.user.is_superuser or self.request.user.rol == Usuario.Rol.ADMIN:
            return queryset
        return queryset.filter(paciente=self.request.user)

    def perform_create(self, serializer):
        serializer.save(paciente=self.request.user)

    @action(detail=False, methods=['get'], url_path='disponibilidad')
    def disponibilidad(self, request):
        fecha = request.query_params.get('fecha')
        if not fecha:
            return Response({'detail': 'Debes enviar la fecha.'}, status=400)

        parsed = parse_date(fecha)
        if not parsed:
            return Response({'detail': 'La fecha es invalida.'}, status=400)

        horarios = (
            Cita.objects.filter(fecha=parsed)
            .values_list('hora', flat=True)
            .order_by('hora')
        )
        ocupados = [value.strftime('%H:%M') for value in horarios]
        return Response({'fecha': fecha, 'ocupados': ocupados})

