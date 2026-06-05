from django.contrib import admin
from .models import Establecimiento, Zona, MetricasActuales, HistorialMetricas, Reporte

admin.site.register(Establecimiento)
admin.site.register(Zona)
admin.site.register(MetricasActuales)
admin.site.register(HistorialMetricas)
admin.site.register(Reporte)
