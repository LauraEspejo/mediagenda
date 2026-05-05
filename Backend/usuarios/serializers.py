from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


Usuario = get_user_model()


def resolve_user_role(user) -> str:
    if user.is_superuser:
        return Usuario.Rol.ADMIN
    return user.rol or Usuario.Rol.PACIENTE


class UsuarioRegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = Usuario
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'password', 'rol')
        read_only_fields = ('id', 'rol')

    def create(self, validated_data):
        validated_data['rol'] = Usuario.Rol.PACIENTE
        password = validated_data.pop('password')
        usuario = Usuario(**validated_data)
        usuario.set_password(password)
        usuario.save()
        return usuario


class UsuarioPerfilSerializer(serializers.ModelSerializer):
    rol = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'rol')
        read_only_fields = fields

    def get_rol(self, obj):
        return resolve_user_role(obj)


class UsuarioAdminListSerializer(serializers.ModelSerializer):
    rol = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'rol', 'is_active', 'last_login')
        read_only_fields = fields

    def get_rol(self, obj):
        return resolve_user_role(obj)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['rol'] = resolve_user_role(user)
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['rol'] = resolve_user_role(self.user)
        return data

