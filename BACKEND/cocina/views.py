from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Zona
from .serializers import ZonaDashboardSerializer, TelemetriaInputSerializer

class ZonaDashboardView(APIView):
    
    # 1. GET /api/zonas/<id>/dashboard/ -> Devuelve los datos para pintar el componente
    def get(self, request, pk):
        zona = get_object_or_404(Zona, pk=pk)
        serializer = ZonaDashboardSerializer(zona)
        return Response(serializer.data)

    # 2. POST /api/zonas/<id>/telemetria/ -> Recibe la simulación de sensores
    def post(self, request, pk):
        zona = get_object_or_404(Zona, pk=pk)
        serializer = TelemetriaInputSerializer(data=request.data)
        
        if serializer.is_valid():
            metricas_actualizadas = serializer.save_telemetria(zona)
            # Opcional: puedes retornar el nuevo dashboard de inmediato
            return Response(
                {"message": "Telemetría registrada con éxito", "score_riesgo": metricas_actualizadas.score_riesgo}, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)