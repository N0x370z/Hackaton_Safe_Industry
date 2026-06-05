from django.urls import path
from .views import ZonaDashboardView

urlpatterns = [
    # Ruta para el dashboard de una zona específica (GET)
    # Y para recibir la simulación/telemetría de esa zona (POST)
    path('zonas/<int:pk>/dashboard/', ZonaDashboardView.as_view(), name='zona-dashboard'),
    path('zonas/<int:pk>/telemetria/', ZonaDashboardView.as_view(), name='zona-telemetria'),
]