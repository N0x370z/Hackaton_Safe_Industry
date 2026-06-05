from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Zona, Reporte
from .serializers import (
    ZonaDashboardSerializer,
    TelemetriaInputSerializer,
    ReporteSerializer,
    calcular_nivel_riesgo,
)


def _generar_alertas(zonas):
    alertas = []
    for z in zonas:
        try:
            m = z.metricas_actuales
        except Exception:
            continue

        nivel = calcular_nivel_riesgo(m.score_riesgo)

        if nivel == 'critical' and m.integridad_estructural != 'OK':
            alertas.append({
                'id': f'a-{z.id}-struct',
                'zoneId': str(z.id),
                'zoneName': z.nombre,
                'message': f'Sello estructural dañado + residuos al {int(m.residuos)}%. Riesgo crítico de ingreso de roedores.',
                'severity': 'danger',
                'timestamp': m.actualizado_en.isoformat(),
            })
        elif m.humedad > 70:
            alertas.append({
                'id': f'a-{z.id}-humid',
                'zoneId': str(z.id),
                'zoneName': z.nombre,
                'message': f'Humedad elevada ({int(m.humedad)}%) favorece proliferación de insectos. Revisar ventilación.',
                'severity': 'warning',
                'timestamp': m.actualizado_en.isoformat(),
            })
        elif m.residuos > 70:
            alertas.append({
                'id': f'a-{z.id}-waste',
                'zoneId': str(z.id),
                'zoneName': z.nombre,
                'message': f'Nivel de residuos crítico ({int(m.residuos)}%). Programar limpieza inmediata.',
                'severity': 'danger' if nivel == 'critical' else 'warning',
                'timestamp': m.actualizado_en.isoformat(),
            })
    return alertas


class DashboardView(APIView):
    def get(self, request):
        zonas = list(Zona.objects.prefetch_related('historial').all())
        zonas_data = ZonaDashboardSerializer(zonas, many=True).data
        alertas = _generar_alertas(zonas)
        return Response({'zones': zonas_data, 'alerts': alertas})


class ZonaListView(APIView):
    def get(self, request):
        zonas = Zona.objects.all()
        return Response(ZonaDashboardSerializer(zonas, many=True).data)


class ZonaDetailView(APIView):
    def get(self, request, pk):
        zona = get_object_or_404(Zona, pk=pk)
        return Response(ZonaDashboardSerializer(zona).data)


class TelemetriaView(APIView):
    def post(self, request, pk):
        zona = get_object_or_404(Zona, pk=pk)
        serializer = TelemetriaInputSerializer(data=request.data)
        if serializer.is_valid():
            metricas = serializer.save_telemetria(zona)
            return Response(
                {'message': 'Telemetría registrada', 'score_riesgo': metricas.score_riesgo},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReporteView(APIView):
    def get(self, request):
        reportes = Reporte.objects.all()[:50]
        return Response(ReporteSerializer(reportes, many=True).data)

    def post(self, request):
        serializer = ReporteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
