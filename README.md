# Safe Industry — Gestión Predictiva de Fauna Nociva

**Hackathon Safe Industry · Track 2**

Sistema de detección temprana y predicción de riesgo de infestaciones en establecimientos de la industria alimentaria. Monitorea condiciones ambientales en tiempo real y anticipa problemas antes de que ocurran.

---

## El problema

El control de plagas en la industria alimentaria es reactivo: se actúa cuando la infestación ya es visible. No existen sistemas accesibles que detecten los factores de riesgo ambientales (humedad, temperatura, acumulación de residuos, fallas estructurales) antes de que el problema escale.

## La solución

Dashboard en tiempo real que:
- Recibe lecturas de sensores IoT (o simuladas) por zona del establecimiento
- Calcula un **score de riesgo** usando un modelo predictivo entrenado con datos ambientales
- Emite **alertas automáticas** cuando el riesgo supera el umbral crítico
- Permite al encargado intervenir de forma mínima y preventiva antes de que haya infestación

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | FastAPI (Python) |
| Modelo predictivo | scikit-learn + pandas |
| Base de datos | MySQL |
| Tiempo real | WebSockets |
| Frontend | Next.js + Recharts |
| Simulación IoT | Script Python generador de datos |

---

## Arquitectura

```
[Sensores / Simulador IoT]
         |
         v
   [FastAPI Backend]
   - Recibe lecturas
   - Ejecuta modelo ML
   - Calcula score de riesgo
   - Emite alertas vía WebSocket
         |
         v
   [MySQL — histórico]
         |
         v
   [Next.js Dashboard]
   - Mapa de zonas del establecimiento
   - Gráficas de tendencia por sensor
   - Panel de alertas en tiempo real
   - Historial de lecturas
```

---

## Estructura del proyecto

```
Hackaton_Safe_Industry/
├── backend/
│   ├── main.py              # FastAPI app + WebSockets
│   ├── model/
│   │   ├── train.py         # Entrenamiento del modelo
│   │   └── predictor.py     # Inferencia
│   ├── routes/
│   │   ├── sensors.py       # Endpoints de lecturas
│   │   └── alerts.py        # Endpoints de alertas
│   ├── db/
│   │   ├── connection.py
│   │   └── schema.sql
│   └── simulator.py         # Generador de datos IoT
├── frontend/
│   ├── app/
│   │   ├── page.tsx         # Dashboard principal
│   │   ├── zones/           # Vista por zona
│   │   └── alerts/          # Panel de alertas
│   ├── components/
│   │   ├── RiskGauge.tsx    # Medidor de riesgo
│   │   ├── SensorCard.tsx   # Tarjeta por sensor
│   │   └── AlertBanner.tsx  # Banner de alertas
│   └── lib/
│       └── websocket.ts     # Cliente WebSocket
└── README.md
```

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
uvicorn main:app --reload
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

---

## Equipo

| Rol | Responsabilidad |
|---|---|
| Backend / ML | FastAPI + modelo predictivo + WebSockets |
| Backend / DB | Esquema MySQL + endpoints REST + datos simulados |
| Frontend | Dashboard Next.js + gráficas + mapa de zonas |
| Frontend / UX | UI + sistema de alertas + demo |

---

*Hackathon Safe Industry 2026*
