# Safe Industry — Gestión Predictiva de Fauna Nociva

**Hackathon Safe Industry · Track 2**

Sistema de detección temprana y predicción de riesgo de infestaciones en establecimientos de la industria alimentaria. Monitorea condiciones ambientales en tiempo real y anticipa problemas antes de que ocurran.

---

## El problema

El control de plagas en la industria alimentaria es reactivo: se actúa cuando la infestación ya es visible. No existen sistemas accesibles que detecten los factores de riesgo ambientales (humedad, temperatura, acumulación de residuos, fallas estructurales) antes de que el problema escale.

## La solución

Dashboard web que:
- Consulta lecturas de sensores IoT (o simuladas) por zona del establecimiento
- Calcula un **score de riesgo** usando un modelo predictivo entrenado con datos ambientales
- Muestra **alertas automáticas** cuando el riesgo supera el umbral crítico
- Permite al encargado intervenir de forma mínima y preventiva antes de que haya infestación

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Django + Django REST Framework |
| Modelo predictivo | scikit-learn + pandas |
| Base de datos | MySQL |
| Comunicación | REST API (polling cada 5s) |
| Frontend | Next.js + Recharts |
| Simulación IoT | Script Python generador de datos |

---

## Arquitectura

```
[Sensores / Simulador IoT]
         |
         v
   [Django REST Backend]
   - Recibe lecturas de sensores
   - Ejecuta modelo ML
   - Calcula score de riesgo
   - Expone endpoints REST
         |
         v
   [MySQL — histórico]
         |
         v
   [Next.js Dashboard]  ←── polling cada 5s ──→  GET /api/dashboard/
   - Zonas del establecimiento
   - Gráficas de tendencia por sensor
   - Panel de alertas
   - Historial de lecturas
```

---

## Estructura del proyecto

```
Hackaton_Safe_Industry/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── safe_industry/       # Proyecto Django
│   │   └── settings.py
│   ├── monitor/             # App principal
│   │   ├── models.py        # Zone, SensorReading, Alert
│   │   ├── serializers.py
│   │   ├── views.py         # Endpoints REST
│   │   ├── urls.py
│   │   └── ml/
│   │       ├── train.py     # Entrenamiento del modelo
│   │       └── predictor.py # Inferencia de riesgo
│   └── simulator.py         # Generador de datos IoT
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   └── page.tsx     # Dashboard principal
│   │   ├── components/
│   │   │   ├── ZoneCard.tsx
│   │   │   ├── RiskGauge.tsx
│   │   │   ├── SensorCard.tsx
│   │   │   ├── AlertPanel.tsx
│   │   │   └── RiskChart.tsx
│   │   ├── hooks/
│   │   │   └── useDashboard.ts  # Polling REST API
│   │   └── lib/
│   │       ├── types.ts
│   │       ├── mockData.ts
│   │       └── utils.ts
│   └── package.json
└── README.md
```

---

## Endpoints REST

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/dashboard/` | Zonas, alertas e historial completo |
| `GET` | `/api/zones/` | Lista de zonas |
| `GET` | `/api/zones/<id>/` | Detalle de una zona |
| `POST` | `/api/sensors/` | Recibir lectura de sensor |
| `GET` | `/api/alerts/` | Alertas activas |

---

## Variables monitoreadas

| Sensor | Umbral de riesgo |
|---|---|
| Humedad relativa | > 70% |
| Temperatura | > 28°C en zonas de almacenamiento |
| Nivel de residuos | > 60% de capacidad |
| Tiempo sin limpieza | > 4 horas |
| Integridad estructural | Sellos dañados detectados |

---

## Cómo correr el proyecto

### Backend
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Simulador IoT
```bash
cd backend
python simulator.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

El frontend corre en `http://localhost:3000` y consulta el backend en `http://localhost:8000`.  
Si el backend no está disponible, el dashboard usa datos simulados automáticamente.

---

## Equipo

| Rol | Responsabilidad |
|---|---|
| Backend / ML | Django REST Framework + modelo predictivo |
| Backend / DB | Modelos MySQL + endpoints + datos simulados |
| Frontend | Dashboard Next.js + gráficas + zonas |
| Frontend / UX | UI + panel de alertas + demo |

---

*Hackathon Safe Industry 2026*
