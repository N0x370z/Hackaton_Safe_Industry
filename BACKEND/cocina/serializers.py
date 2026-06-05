from rest_framework import serializers
from django.utils import timezone
from .models import Establecimiento, Zona, MetricasActuales, HistorialMetricas

class EstablecimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Establecimiento
        fields = '__all__'


class MetricasActualesSerializer(serializers.ModelSerializer):
    nivel_riesgo = serializers.SerializerMethodField()
    horas_sin_limpieza = serializers.SerializerMethodField()

    class Meta:
        model = MetricasActuales
        exclude = ['zona'] # Excluimos la relación directa para meterla en el objeto superior

    def get_nivel_riesgo(self, obj):
        # Mapea el score numérico al string que usas en tu botón/badge de Next.js
        if obj.score_riesgo >= 70:
            return "Alto"
        elif obj.score_riesgo >= 40:
            return "Medio"
        return "Bajo"

    def get_horas_sin_limpieza(self, obj):
        # Calcula dinámicamente el tiempo transcurrido para el "3h" de tu interfaz
        if obj.ultima_limpieza:
            diferencia = timezone.now() - obj.ultima_limpieza
            return f"{int(diferencia.total_seconds() // 3600)}h"
        return "0h"


class ZonaDashboardSerializer(serializers.ModelSerializer):
    """
    Este serializador estructura el JSON exactamente como lo necesita tu 
    página de Next.js para la 'Cocina Principal'.
    """
    metricas = MetricasActualesSerializer(source='metricas_actuales', read_only=True)

    class Meta:
        model = Zona
        fields = ['id', 'nombre', 'metricas']


class TelemetriaInputSerializer(serializers.Serializer):
    """
    Serializador de ENTRADA. No está amarrado a un solo modelo porque al recibir 
    un POST, actualiza 'MetricasActuales' y además crea un 'HistorialMetricas'.
    """
    humedad = serializers.FloatField(min_value=0, max_value=100)
    temperatura = serializers.FloatField()
    residuos = serializers.FloatField(min_value=0, max_value=100)
    ultima_limpieza = serializers.DateTimeField(required=False)
    integridad_estructural = serializers.CharField(max_length=20, default="OK")

    def _calcular_score_riesgo(self, validated_data, zona):
        """
        Lógica Data-Driven preventiva: Calcula el score basado en precursores ambientales.
        """
        score = 0
        humedad = validated_data.get('humedad')
        temperatura = validated_data.get('temperatura')
        residuos = validated_data.get('residuos')
        integridad = validated_data.get('integridad_estructural', 'OK').upper()
        
        # 1. Penalización por Humedad (Ideal para hongos e insectos)
        if humedad > zona.humedad_max_ideal:
            # Suma puntos proporcionalmente al exceso de humedad
            score += (humedad - zona.humedad_max_ideal) * 1.5
            
        # 2. Penalización por Temperatura (Acelera ciclos biológicos de plagas)
        if temperatura > zona.temperatura_max_ideal:
            score += (temperatura - zona.temperatura_max_ideal) * 2.0

        # 3. Penalización por Residuos (Foco de atracción directo)
        if residuos > 50:
            score += (residuos - 50) * 0.8
            
        # 4. Penalización por Integridad Estructural (Vías de acceso para roedores)
        if integridad == "DAÑADO":
            score += 20
        elif m_integridad := integridad == "CRÍTICO":
            score += 40

        # 5. Penalización por tiempo sin limpieza
        if ultima_limpieza := validated_data.get('ultima_limpieza'):
            horas = (timezone.now() - ultima_limpieza).total_seconds() // 3600