from django.contrib.auth import get_user_model
from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView

from .permissions import IsAdminOrSuperuser
from .serializers import (
    CustomTokenObtainPairSerializer,
    UsuarioAdminListSerializer,
    UsuarioPerfilSerializer,
    UsuarioRegistroSerializer,
)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegistroUsuarioView(generics.CreateAPIView):
    serializer_class = UsuarioRegistroSerializer
    permission_classes = [permissions.AllowAny]


class UsuarioPerfilView(generics.RetrieveAPIView):
    serializer_class = UsuarioPerfilSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UsuarioListView(generics.ListAPIView):
    serializer_class = UsuarioAdminListSerializer
    permission_classes = [IsAdminOrSuperuser]

    def get_queryset(self):
        Usuario = get_user_model()
        return Usuario.objects.filter(is_active=True).order_by('username')

