# PlagueTracker — Detección Visual de Plagas

**Hackathon Safe Industry · Track 2**

Sistema de detección temprana de fauna nociva mediante **cámaras e inteligencia artificial** para establecimientos de la industria alimentaria. Analiza imágenes en tiempo real, calcula un score de riesgo por zona y genera alertas automáticas antes de que el problema escale.

---

## El problema

El control de plagas en la industria alimentaria es reactivo: se actúa cuando la infestación ya es visible. Los sistemas tradicionales basados en sensores IoT son costosos, difíciles de mantener y no detectan directamente la presencia de fauna nociva.

## La solución

Dashboard web con visión artificial que:
- Analiza el feed de cámara de cada zona del establecimiento
- Detecta visualmente **plagas, nivel de residuos, estado de limpieza y daños estructurales**
- Calcula un **score de riesgo 0–100** a partir de las detecciones
- Lanza **alertas automáticas** cuando el riesgo supera el umbral configurado
- Permite registrar incidencias manualmente como respaldo
- Funciona **offline** con datos simulados cuando el backend no está disponible

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Django + Django REST Framework |
| Base de datos | MySQL |
| Comunicación | REST API (polling cada 5 s) |
| Frontend | Next.js + Tailwind CSS + Recharts |
| Análisis visual | Cámara IP / RTSP + visión IA (demo con mock) |

---

## Arquitectura

```
[Cámaras IP / Streams RTSP]
         |
         v
   [Django REST Backend]
   - Recibe snapshots / resultados de análisis
   - Calcula score de riesgo por zona
   - Expone endpoints REST
         |
         v
   [MySQL — histórico + zonas]
         |
         v
   [Next.js Dashboard]  ←── polling cada 5s ──→  GET /api/dashboard/
   - Feed "EN VIVO" por zona
   - Detecciones: plagas, residuos, limpieza, estructura
   - Score de riesgo + tendencia temporal
   - Panel de alertas + historial de reportes
```

---

## Estructura del proyecto

```
Hackaton_Safe_Industry/
├── BACKEND/
│   ├── manage.py
│   ├── requirements.txt
│   ├── core/                    # Configuración Django
│   └── cocina/                  # App principal
│       ├── models.py            # Zona, MetricasActuales, HistorialMetricas, Reporte
│       ├── serializers.py
│       ├── views.py             # Endpoints REST
│       └── urls.py
└── frontend/
    └── src/
        ├── app/
        │   ├── page.tsx                      # Landing
        │   └── dashboard/
        │       ├── layout.tsx                # Sidebar + nav
        │       ├── page.tsx                  # Vista general de zonas
        │       ├── [zoneId]/page.tsx         # Detalle de zona
        │       ├── alertas/page.tsx          # Historial de alertas
        │       └── reportes/page.tsx         # Reportes registrados
        ├── components/
        │   ├── CameraCard.tsx               # Feed de cámara + detecciones + Re-analizar
        │   ├── NewZoneDialog.tsx            # Modal para crear zona (tipo, URL cámara, umbrales)
        │   ├── ZoneCard.tsx                 # Tarjeta resumen de zona
        │   ├── ZoneSection.tsx              # Vista completa: gauge + cámara + gráfica
        │   ├── ZoneSidebar.tsx              # Panel lateral: reportar + detalles de cámara
        │   ├── AlertPanel.tsx               # Panel de alertas activas
        │   ├── AppSidebar.tsx               # Sidebar de navegación
        │   ├── RiskGauge.tsx                # Indicador semicircular de riesgo
        │   └── RiskChart.tsx                # Gráfica de tendencia temporal
        ├── hooks/
        │   ├── useDashboard.ts              # Polling REST + fallback mock
        │   └── useDismissedAlerts.ts        # Persistencia de alertas descartadas
        └── lib/
            ├── types.ts                     # Zone, CameraAnalysis, Alert, Report…
            ├── mockData.ts                  # Datos simulados + zonas locales desde localStorage
            └── utils.ts
```

---

## Endpoints REST

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/dashboard/` | Zonas, alertas e historial completo |
| `GET` | `/api/zones/` | Lista de zonas |
| `POST` | `/api/zones/` | Crear zona nueva |
| `GET` | `/api/zones/<id>/` | Detalle de una zona |
| `POST` | `/api/reports/` | Registrar reporte de incidencia |
| `GET` | `/api/alerts/` | Alertas activas |

---

## Detecciones de cámara

| Campo | Descripción | Umbral de alerta (default) |
|---|---|---|
| `pestsDetected` | Plaga visible (insecto / roedor) | Cualquier detección |
| `wasteLevel` | Nivel de residuos (%) | > 60% |
| `cleanlinessScore` | Puntuación de limpieza (%) | < 50% |
| `structuralIssues` | Daño estructural visible | Cualquier detección |
| `confidence` | Confianza del análisis IA (%) | — |

Los umbrales de `wasteLevel` y `cleanlinessScore` son configurables por zona al crearla.

---

## Cómo correr el proyecto

### Backend
```bash
cd BACKEND
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

El frontend corre en `http://localhost:3000` y consulta el backend en `http://localhost:8000`.  
Si el backend no está disponible, el dashboard usa datos simulados automáticamente (incluyendo zonas creadas localmente en `localStorage`).

---

## Equipo

| Rol | Responsabilidad |
|---|---|
| Backend / ML | Django REST Framework + modelo predictivo |
| Backend / DB | Modelos MySQL + endpoints + datos simulados |
| Frontend | Dashboard Next.js + gráficas + zonas |
| Frontend / UX | UI + panel de alertas + demo |

---

*PlagueTracker · Hackathon Safe Industry 2026*
