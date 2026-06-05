from django.urls import path
from .views import DashboardView, ZonaListView, ZonaDetailView, TelemetriaView, ReporteView

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('zones/', ZonaListView.as_view(), name='zona-list'),
    path('zones/<int:pk>/', ZonaDetailView.as_view(), name='zona-detail'),
    path('zones/<int:pk>/telemetria/', TelemetriaView.as_view(), name='zona-telemetria'),
    path('reports/', ReporteView.as_view(), name='reportes'),
]
