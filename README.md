# PlagueTracker

> Sistema de detección temprana de fauna nociva mediante cámaras e inteligencia artificial para la industria alimentaria.

**Hackathon Safe Industry · Track 2 · 2026**

---

## Índice

1. [El problema](#el-problema)
2. [La solución](#la-solución)
3. [Stack tecnológico](#stack-tecnológico)
4. [Arquitectura](#arquitectura)
5. [Estructura del proyecto](#estructura-del-proyecto)
6. [Backend — API REST](#backend--api-rest)
7. [Cálculo del score de riesgo](#cálculo-del-score-de-riesgo)
8. [Frontend — Funcionalidades](#frontend--funcionalidades)
9. [Modo offline](#modo-offline)
10. [Cómo correr el proyecto](#cómo-correr-el-proyecto)
11. [Variables de entorno](#variables-de-entorno)
12. [Equipo](#equipo)

---

## El problema

El control de plagas en la industria alimentaria es fundamentalmente reactivo: se actúa cuando la infestación ya es visible. Los enfoques existentes tienen limitaciones claras:

- **Inspecciones manuales** — costosas, intermitentes, no detectan riesgos en tiempo real.
- **Sensores IoT** — miden condiciones ambientales (temperatura, humedad) pero no detectan directamente la presencia de fauna nociva.
- **Sin trazabilidad** — cuando ocurre un incidente, no hay historial que permita entender su origen ni prevenir recurrencias.

El resultado es que las multas, cierres y daños a la reputación son predecibles pero no se previenen.

---

## La solución

**PlagueTracker** es un dashboard web que convierte las cámaras de vigilancia ya instaladas en un sistema de detección activa de riesgos sanitarios. Sin hardware adicional.

Lo que hace:

- **Analiza el feed de cada cámara** por zona del establecimiento (cocina, almacén, área de carga, etc.)
- **Detecta visualmente** plagas (insectos y roedores), nivel de residuos, estado de limpieza y daños estructurales
- **Calcula un score de riesgo 0–100** por zona y lo actualiza en tiempo real
- **Genera alertas automáticas** cuando el riesgo supera los umbrales configurados
- **Registra incidencias manualmente** — el encargado puede reportar lo que observa en campo como respaldo al análisis visual
- **Muestra tendencias temporales** por zona para detectar patrones de deterioro
- **Funciona offline** con datos simulados cuando el backend no está disponible

---

## Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Backend | Django + Django REST Framework | 6.0.6 / 3.16.0 |
| Base de datos | MySQL | — |
| CORS | django-cors-headers | 4.7.0 |
| Frontend | Next.js | 16.2.7 |
| UI | Tailwind CSS | 4.x |
| Gráficas | Recharts | 3.x |
| Iconos | lucide-react | 1.x |
| Lenguaje | TypeScript | 5.x |
| Deploy | Vercel (frontend) | — |

---

## Arquitectura

```
┌─────────────────────────┐
│   Cámaras IP / RTSP     │
│   (stream por zona)     │
└────────────┬────────────┘
             │  POST /api/zones/{id}/telemetria/
             ▼
┌─────────────────────────┐
│   Django REST Backend   │
│  ┌───────────────────┐  │
│  │ Cálculo de score  │  │
│  │ Generación alertas│  │
│  └───────────────────┘  │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│         MySQL           │
│  Zona · MetricasActuales│
│  HistorialMetricas      │
│  Reporte                │
└────────────┬────────────┘
             │  GET /api/dashboard/  (polling cada 5 s)
             ▼
┌─────────────────────────────────────────────────────┐
│                Next.js Dashboard                    │
│                                                     │
│  Landing → Dashboard → [zoneId] → Alertas → Reportes│
│                                                     │
│  • Feed "EN VIVO" por zona                          │
│  • Score de riesgo + gauge + gráfica de tendencia   │
│  • Detecciones: plagas / residuos / limpieza /      │
│    estructura                                       │
│  • Alertas automáticas con dismiss persistente      │
│  • CRUD de zonas (crear / editar / eliminar)        │
│  • Reportes manuales de incidencias                 │
└─────────────────────────────────────────────────────┘
```

---

## Estructura del proyecto

```
Hackaton_Safe_Industry/
│
├── BACKEND/
│   ├── manage.py
│   ├── requirements.txt
│   ├── core/                          # Configuración Django
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   └── cocina/                        # App principal
│       ├── models.py                  # Modelos de datos
│       ├── serializers.py             # Serialización + lógica de riesgo
│       ├── views.py                   # Vistas REST
│       └── urls.py                    # Rutas de la API
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── icon.png               # Favicon (bug naranja)
    │   │   ├── layout.tsx             # Root layout + metadata
    │   │   ├── page.tsx               # Landing page
    │   │   └── dashboard/
    │   │       ├── layout.tsx         # Sidebar + nav responsive
    │   │       ├── page.tsx           # Vista general: grid de zonas
    │   │       ├── [zoneId]/
    │   │       │   └── page.tsx       # Detalle completo de una zona
    │   │       ├── alertas/
    │   │       │   └── page.tsx       # Historial de alertas
    │   │       ├── reportes/
    │   │       │   └── page.tsx       # Reportes registrados
    │   │       └── zonas/nueva/       # (legacy, reemplazado por dialog)
    │   │
    │   ├── components/
    │   │   ├── CameraCard.tsx         # Feed + detecciones + botón Re-analizar
    │   │   ├── NewZoneDialog.tsx      # Modal para crear zona
    │   │   ├── EditZoneDialog.tsx     # Modal para editar zona
    │   │   ├── ZoneCard.tsx           # Tarjeta resumen en el dashboard
    │   │   ├── ZoneSection.tsx        # Vista completa: gauge + cámara + gráfica + reportes
    │   │   ├── ZoneSidebar.tsx        # Panel lateral deslizable
    │   │   ├── AlertPanel.tsx         # Panel de alertas activas
    │   │   ├── AppSidebar.tsx         # Sidebar de navegación con quick-report
    │   │   ├── RiskGauge.tsx          # Indicador semicircular de riesgo
    │   │   ├── RiskChart.tsx          # Gráfica de tendencia temporal
    │   │   └── ReportModal.tsx        # Modal de reporte rápido
    │   │
    │   ├── hooks/
    │   │   ├── useDashboard.ts        # Polling REST cada 5 s + fallback mock
    │   │   └── useDismissedAlerts.ts  # Persistencia de alertas descartadas
    │   │
    │   └── lib/
    │       ├── types.ts               # Tipos TypeScript (Zone, CameraAnalysis, Alert…)
    │       ├── mockData.ts            # Datos simulados + zonas creadas localmente
    │       └── utils.ts               # Helpers (formatTime, getRiskColor…)
    │
    └── package.json
```

---

## Backend — API REST

Base URL: `http://localhost:8000/api/`

### Endpoints

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/dashboard/` | Todas las zonas con métricas actuales, historial y alertas generadas |
| `GET` | `/api/zones/` | Lista de zonas |
| `POST` | `/api/zones/` | Crear una zona nueva |
| `GET` | `/api/zones/<id>/` | Detalle de una zona |
| `POST` | `/api/zones/<id>/telemetria/` | Enviar lectura de cámara/sensor y actualizar el score |
| `GET` | `/api/reports/` | Últimos 50 reportes de incidencias |
| `POST` | `/api/reports/` | Registrar un reporte de incidencia |

---

### POST `/api/zones/`

Crea una zona y le asigna métricas iniciales en cero.

```json
// Request
{
  "nombre": "Cocina Norte",
  "temperatura_max_ideal": 25.0,
  "humedad_max_ideal": 60.0,
  "tiempo_limpieza_max_horas": 4
}

// Response 201
{
  "id": 5,
  "name": "Cocina Norte",
  "riskScore": 0,
  "riskLevel": "low",
  "lastUpdated": "2026-06-05T14:00:00Z",
  "history": []
}
```

---

### POST `/api/zones/<id>/telemetria/`

Recibe una lectura de la cámara/sensor, calcula el score de riesgo y lo persiste en `MetricasActuales` e `HistorialMetricas`.

```json
// Request
{
  "humedad": 74.0,
  "temperatura": 29.5,
  "residuos": 65.0,
  "integridad_estructural": "OK",
  "ultima_limpieza": "2026-06-05T10:00:00Z"
}

// Response 201
{
  "message": "Telemetría registrada",
  "score_riesgo": 78
}
```

Valores válidos para `integridad_estructural`: `"OK"`, `"DAÑADO"`, `"CRÍTICO"`

---

### POST `/api/reports/`

```json
// Request
{
  "zoneId": "3",
  "zoneName": "Área de Carga",
  "type": "roedor_avistado",
  "description": "Se observó un roedor cerca de la puerta trasera."
}

// Response 201
{
  "id": 12,
  "zoneName": "Área de Carga",
  "type": "roedor_avistado",
  "description": "Se observó un roedor cerca de la puerta trasera.",
  "timestamp": "2026-06-05T14:32:10Z"
}
```

Tipos de reporte válidos: `insecto_avistado`, `roedor_avistado`, `residuos_acumulados`, `dano_estructural`, `mal_olor`, `otro`

---

### GET `/api/dashboard/`

```json
// Response 200
{
  "zones": [
    {
      "id": 1,
      "name": "Cocina Principal",
      "riskScore": 78,
      "riskLevel": "high",
      "lastUpdated": "2026-06-05T14:00:00Z",
      "history": [
        { "time": "13:30", "riskScore": 72 },
        { "time": "13:35", "riskScore": 75 }
      ]
    }
  ],
  "alerts": [
    {
      "id": "a-1-struct",
      "zoneId": "1",
      "zoneName": "Cocina Principal",
      "message": "Humedad elevada (74%) favorece proliferación de insectos.",
      "severity": "warning",
      "timestamp": "2026-06-05T14:00:00Z"
    }
  ]
}
```

---

## Cálculo del score de riesgo

El score (0–100) se calcula en `cocina/serializers.py` con la siguiente fórmula al recibir cada lectura de telemetría:

```python
score = 0

# Humedad por encima del umbral ideal de la zona
if humedad > zona.humedad_max_ideal:
    score += (humedad - zona.humedad_max_ideal) * 1.5

# Temperatura por encima del umbral ideal
if temperatura > zona.temperatura_max_ideal:
    score += (temperatura - zona.temperatura_max_ideal) * 2.0

# Nivel de residuos por encima del 50%
if residuos > 50:
    score += (residuos - 50) * 0.8

# Integridad estructural
if integridad == 'DAÑADO':
    score += 20
elif integridad == 'CRÍTICO':
    score += 40

# Tiempo sin limpieza
horas_sin_limpiar = (now - ultima_limpieza).horas
if horas_sin_limpiar > zona.tiempo_limpieza_max_horas:
    score += (horas_sin_limpiar - zona.tiempo_limpieza_max_horas) * 1.5

score = min(100, max(0, int(score)))
```

### Niveles de riesgo

| Score | Nivel | Color |
|---|---|---|
| 0 – 29 | `low` | Verde |
| 30 – 69 | `medium` | Amarillo |
| 70 – 89 | `high` | Naranja |
| 90 – 100 | `critical` | Rojo |

### Generación de alertas

Las alertas se generan automáticamente en `DashboardView` al servir `GET /api/dashboard/`. No se persisten en BD; se calculan en cada request:

- **`danger`** — zona crítica + integridad estructural no OK
- **`warning`** — humedad > 70%
- **`danger/warning`** — residuos > 70%

---

## Frontend — Funcionalidades

### Dashboard principal (`/dashboard`)

- Grid de `ZoneCard` con el estado de todas las zonas
- Cada tarjeta muestra: nombre, badge de nivel, gauge de riesgo, mini preview de cámara y datos clave de detección
- Botones de **editar** (lápiz) y **eliminar** (papelera) con confirmación inline por tarjeta
- Botón "Nueva" en el sidebar abre el `NewZoneDialog`

### Detalle de zona (`/dashboard/[zoneId]`)

Compuesto por `ZoneSection`:
- **Score de riesgo** — gauge semicircular + barra de progreso
- **Cámara** — `CameraCard` con feed EN VIVO, detecciones y botón Re-analizar (animación de 2.2 s con resultado mock)
- **Tendencia** — gráfica de línea de los últimos 60 min con líneas de referencia en 70 y 90
- **Métricas** — tendencia (mejorando / estable / empeorando), objetivo de score, acción recomendada
- **Reporte inline** — formulario de incidencia directamente en la vista
- **Editar / Eliminar** — botones en el header, eliminar redirige al dashboard

### Alertas (`/dashboard/alertas`)

- Lista completa de alertas activas + desestimadas
- Cada alerta se puede descartar (dismiss); el estado persiste en `localStorage` con expiración de 24 h
- Badge en el sidebar con conteo de alertas activas pendientes

### Reportes (`/dashboard/reportes`)

- Historial de todas las incidencias registradas (manuales)
- Persistidas en `localStorage` como respaldo independientemente del backend
- Filtros por tipo, zona y búsqueda por texto

### Crear zona — `NewZoneDialog`

Modal inline activado desde el sidebar. Campos:
- **Nombre** (obligatorio)
- **Tipo de zona** — chips: Cocina · Almacén Frío · Área de Carga · Bodega · Otro
- **Preview de cámara** — actualiza en tiempo real según el tipo seleccionado
- **URL de cámara** — opcional, RTSP o HTTP; si se omite usa imagen predeterminada del tipo
- **Umbral de residuos** (%) — default 60
- **Umbral de limpieza** (%) — default 50

Tras crear, navega directamente a `/dashboard/{id}` de la nueva zona.

### Editar zona — `EditZoneDialog`

Mismo form que creación pero pre-poblado con los datos actuales. Accesible desde la tarjeta y desde la vista de detalle.

### Imágenes por tipo de zona

| Tipo | Imagen asignada automáticamente |
|---|---|
| Cocina | Chef en cocina profesional |
| Almacén Frío | Exhibidor refrigerado de productos |
| Área de Carga | Almacén industrial con estantería |
| Bodega | Pasillo con productos almacenados |
| Otro | Comedor de restaurante |

### Detecciones de cámara (`CameraAnalysis`)

| Campo | Descripción | Umbral de alerta |
|---|---|---|
| `pestsDetected` | Plaga visible (insecto / roedor) | Cualquier detección |
| `pestType` | Tipo: `insecto` o `roedor` | — |
| `wasteLevel` | Nivel de residuos estimado (%) | > 60% (configurable) |
| `cleanlinessScore` | Puntuación de limpieza (%) | < 50% (configurable) |
| `structuralIssues` | Daño estructural visible | Cualquier detección |
| `confidence` | Confianza del análisis IA (%) | — |

---

## Modo offline

El frontend está diseñado para funcionar sin backend:

- `useDashboard` intenta `GET /api/dashboard/` cada 5 segundos
- Si falla (backend caído o no disponible), carga `generateMockData()` con 4 zonas de demostración pre-cargadas con detecciones reales
- Las zonas creadas mediante el dialog se guardan en `localStorage` bajo la clave `plague_tracker_local_zones` y se incluyen automáticamente en los datos simulados
- Los reportes se guardan siempre en `localStorage` (`plague_tracker_reports`) como respaldo, independientemente de si el backend los aceptó
- Las alertas descartadas se guardan en `plague_tracker_dismissed_alerts` con expiración de 24 horas

### Claves de `localStorage`

| Clave | Contenido |
|---|---|
| `plague_tracker_local_zones` | Zonas creadas offline |
| `plague_tracker_reports` | Reportes de incidencias (respaldo) |
| `plague_tracker_dismissed_alerts` | IDs de alertas descartadas + timestamp |

---

## Cómo correr el proyecto

### Requisitos previos

- Python 3.11+
- Node.js 18+
- MySQL corriendo localmente (o ajustar `settings.py` para SQLite en desarrollo)

### Backend

```bash
cd BACKEND
pip install -r requirements.txt

# Configurar base de datos en core/settings.py
python manage.py migrate
python manage.py createsuperuser   # opcional, para el admin
python manage.py runserver
```

El backend queda disponible en `http://localhost:8000`.  
Panel de administración: `http://localhost:8000/admin/`

#### Crear datos iniciales (fixture)

```bash
python manage.py loaddata cocina/fixtures/initial_data.json
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend queda disponible en `http://localhost:3000`.

### Build de producción

```bash
cd frontend
npm run build
npm start
```

---

## Variables de entorno

### Frontend (`.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Si no se define, el frontend usa `http://localhost:8000` por defecto.

### Backend (`core/settings.py`)

Configurar la sección `DATABASES` con las credenciales de MySQL:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'plaguetracker',
        'USER': 'root',
        'PASSWORD': '',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

CORS ya está configurado mediante `django-cors-headers`. Ajustar `CORS_ALLOWED_ORIGINS` en `settings.py` para producción.

---

## Equipo

| Rol | Responsabilidad |
|---|---|
| Backend / ML | Django REST Framework · modelo de score de riesgo · endpoints |
| Backend / DB | Modelos MySQL · fixtures · telemetría |
| Frontend | Dashboard Next.js · gráficas · sistema de zonas · alertas |
| Frontend / UX | UI · panel de alertas · flujo de demo |

---

*PlagueTracker · Hackathon Safe Industry 2026*
