from django.db import models

class Establecimiento(models.Model):
    nombre = models.CharField(max_length=150)
    direccion = models.TextField()
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre

class Zona(models.Model):
    establecimiento = models.ForeignKey(Establecimiento, on_delete=models.CASCADE, related_name='zonas')
    nombre = models.CharField(max_length=100) # Ej: "Cocina Principal", "Almacén"
    
    # Valores umbral ideales para el cálculo de riesgo (Garantiza intervención no invasiva)
    temperatura_max_ideal = models.FloatField(default=24.0)
    humedad_max_ideal = models.FloatField(default=60.0)
    tiempo_limpieza_max_horas = models.IntegerField(default=4)

    def __str__(self):
        return f"{self.nombre} - {self.establecimiento.nombre}"

class MetricasActuales(models.Model):
    """
    Guarda el estado en tiempo real de cada zona. 
    Se sobrescribe o actualiza constantemente para el Dashboard rápido.
    """
    zona = models.OneToOneField(Zona, on_delete=models.CASCADE, primary_key=True, related_name='metricas_actuales')
    humedad = models.FloatField() # Porcentaje (ej. 74)
    temperatura = models.FloatField() # Celsius (ej. 29)
    residuos = models.FloatField() # Porcentaje de llenado/acumulación (ej. 65)
    ultima_limpieza = models.DateTimeField() # Para calcular las horas transcurridas (ej. 3h)
    integridad_estructural = models.CharField(max_length=20, default="OK") # OK, DAÑADO, CRÍTICO
    score_riesgo = models.IntegerField(default=0) # 0 a 100
    actualizado_en = models.DateTimeField(auto_now=True)

class HistorialMetricas(models.Model):
    """
    Para el análisis de patrones (Data-Driven). Cada lectura de sensor o simulación 
    crea un registro aquí para poder graficar o predecir tendencias después.
    """
    zona = models.ForeignKey(Zona, on_delete=models.CASCADE, related_name='historial')
    humedad = models.FloatField()
    temperatura = models.FloatField()
    residuos = models.FloatField()
    integridad_estructural = models.CharField(max_length=20)
    score_riesgo = models.IntegerField()
    capturado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-capturado_en']