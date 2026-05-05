from rest_framework.routers import DefaultRouter

from .views import CitaViewSet


app_name = 'citas'

router = DefaultRouter()
router.register('citas', CitaViewSet, basename='cita')

urlpatterns = router.urls

