from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Establecimiento, Zona, MetricasActuales, Reporte
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

    def post(self, request):
        nombre = request.data.get('nombre', '').strip()
        if not nombre:
            return Response({'error': 'El campo nombre es obligatorio.'}, status=status.HTTP_400_BAD_REQUEST)

        establecimiento = Establecimiento.objects.first()
        if not establecimiento:
            return Response({'error': 'No existe ningún establecimiento.'}, status=status.HTTP_400_BAD_REQUEST)

        zona = Zona.objects.create(
            establecimiento=establecimiento,
            nombre=nombre,
            temperatura_max_ideal=float(request.data.get('temperatura_max_ideal', 25.0)),
            humedad_max_ideal=float(request.data.get('humedad_max_ideal', 60.0)),
            tiempo_limpieza_max_horas=int(request.data.get('tiempo_limpieza_max_horas', 4)),
        )
        MetricasActuales.objects.create(
            zona=zona,
            humedad=50.0,
            temperatura=22.0,
            residuos=10.0,
            ultima_limpieza=timezone.now(),
            integridad_estructural='OK',
            score_riesgo=0,
        )
        return Response(ZonaDashboardSerializer(zona).data, status=status.HTTP_201_CREATED)


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
