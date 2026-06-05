from rest_framework import serializers
from django.utils import timezone
from .models import Zona, MetricasActuales, HistorialMetricas, Reporte


def calcular_nivel_riesgo(score):
    if score >= 90:
        return 'critical'
    if score >= 70:
        return 'high'
    if score >= 30:
        return 'medium'
    return 'low'


def calcular_score(humedad, temperatura, residuos, integridad, ultima_limpieza, zona):
    score = 0.0
    if humedad > zona.humedad_max_ideal:
        score += (humedad - zona.humedad_max_ideal) * 1.5
    if temperatura > zona.temperatura_max_ideal:
        score += (temperatura - zona.temperatura_max_ideal) * 2.0
    if residuos > 50:
        score += (residuos - 50) * 0.8
    if integridad == 'DAÑADO':
        score += 20
    elif integridad == 'CRÍTICO':
        score += 40
    if ultima_limpieza:
        horas = (timezone.now() - ultima_limpieza).total_seconds() / 3600
        if horas > zona.tiempo_limpieza_max_horas:
            score += (horas - zona.tiempo_limpieza_max_horas) * 1.5
    return min(100, max(0, int(score)))


class SensoresSerializer(serializers.Serializer):
    humidity = serializers.FloatField(source='humedad')
    temperature = serializers.FloatField(source='temperatura')
    wasteLevel = serializers.FloatField(source='residuos')
    timeSinceClean = serializers.SerializerMethodField()
    structuralOk = serializers.SerializerMethodField()

    def get_timeSinceClean(self, obj):
        if obj.ultima_limpieza:
            return int((timezone.now() - obj.ultima_limpieza).total_seconds() / 3600)
        return 0

    def get_structuralOk(self, obj):
        return obj.integridad_estructural == 'OK'


class HistorialPuntoSerializer(serializers.ModelSerializer):
    time = serializers.SerializerMethodField()
    riskScore = serializers.IntegerField(source='score_riesgo')

    class Meta:
        model = HistorialMetricas
        fields = ['time', 'riskScore']

    def get_time(self, obj):
        return obj.capturado_en.strftime('%H:%M')


class ZonaDashboardSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='nombre')
    sensors = serializers.SerializerMethodField()
    riskScore = serializers.SerializerMethodField()
    riskLevel = serializers.SerializerMethodField()
    lastUpdated = serializers.SerializerMethodField()
    history = serializers.SerializerMethodField()

    class Meta:
        model = Zona
        fields = ['id', 'name', 'sensors', 'riskScore', 'riskLevel', 'lastUpdated', 'history']

    def _metricas(self, obj):
        try:
            return obj.metricas_actuales
        except MetricasActuales.DoesNotExist:
            return None

    def get_sensors(self, obj):
        m = self._metricas(obj)
        if not m:
            return {'humidity': 0, 'temperature': 0, 'wasteLevel': 0, 'timeSinceClean': 0, 'structuralOk': True}
        return SensoresSerializer(m).data

    def get_riskScore(self, obj):
        m = self._metricas(obj)
        return m.score_riesgo if m else 0

    def get_riskLevel(self, obj):
        m = self._metricas(obj)
        return calcular_nivel_riesgo(m.score_riesgo if m else 0)

    def get_lastUpdated(self, obj):
        m = self._metricas(obj)
        return m.actualizado_en.isoformat() if m else timezone.now().isoformat()

    def get_history(self, obj):
        puntos = list(reversed(list(obj.historial.all()[:12])))
        return HistorialPuntoSerializer(puntos, many=True).data


class TelemetriaInputSerializer(serializers.Serializer):
    humedad = serializers.FloatField(min_value=0, max_value=100)
    temperatura = serializers.FloatField()
    residuos = serializers.FloatField(min_value=0, max_value=100)
    ultima_limpieza = serializers.DateTimeField(required=False, allow_null=True)
    integridad_estructural = serializers.ChoiceField(choices=['OK', 'DAÑADO', 'CRÍTICO'], default='OK')

    def save_telemetria(self, zona):
        data = self.validated_data
        ultima = data.get('ultima_limpieza') or timezone.now()
        score = calcular_score(
            data['humedad'], data['temperatura'], data['residuos'],
            data['integridad_estructural'], ultima, zona
        )
        metricas, _ = MetricasActuales.objects.update_or_create(
            zona=zona,
            defaults={
                'humedad': data['humedad'],
                'temperatura': data['temperatura'],
                'residuos': data['residuos'],
                'ultima_limpieza': ultima,
                'integridad_estructural': data['integridad_estructural'],
                'score_riesgo': score,
            }
        )
        HistorialMetricas.objects.create(
            zona=zona,
            humedad=data['humedad'],
            temperatura=data['temperatura'],
            residuos=data['residuos'],
            integridad_estructural=data['integridad_estructural'],
            score_riesgo=score,
        )
        return metricas


class ReporteSerializer(serializers.ModelSerializer):
    zoneId = serializers.CharField(write_only=True, required=False, allow_blank=True)
    zoneName = serializers.CharField(source='zona_nombre')
    type = serializers.CharField(source='tipo')
    description = serializers.CharField(source='descripcion', allow_blank=True, default='')
    timestamp = serializers.DateTimeField(source='creado_en', read_only=True)

    class Meta:
        model = Reporte
        fields = ['id', 'zoneId', 'zoneName', 'type', 'description', 'timestamp']

    def create(self, validated_data):
        zone_id = validated_data.pop('zoneId', None)
        zona = None
        if zone_id:
            try:
                zona = Zona.objects.get(pk=int(zone_id))
            except (Zona.DoesNotExist, ValueError):
                pass
        return Reporte.objects.create(zona=zona, **validated_data)
