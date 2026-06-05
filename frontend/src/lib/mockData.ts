import { DashboardData } from './types'

function generateHistory(baseScore: number, points = 12) {
  const now = new Date()
  return Array.from({ length: points }, (_, i) => ({
    time: new Date(now.getTime() - (points - 1 - i) * 5 * 60000).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    riskScore: Math.max(0, Math.min(100, Math.floor(baseScore + (Math.random() - 0.5) * 20))),
  }))
}

export function generateMockData(): DashboardData {
  const now = new Date()

  return {
    zones: [
      {
        id: 'z1',
        name: 'Cocina Principal',
        sensors: { humidity: 74, temperature: 29, wasteLevel: 65, timeSinceClean: 3, structuralOk: true },
        riskScore: 78,
        riskLevel: 'high',
        lastUpdated: now.toISOString(),
        history: generateHistory(78),
      },
      {
        id: 'z2',
        name: 'Almacén Frío',
        sensors: { humidity: 55, temperature: 4, wasteLevel: 20, timeSinceClean: 1, structuralOk: true },
        riskScore: 18,
        riskLevel: 'low',
        lastUpdated: now.toISOString(),
        history: generateHistory(18),
      },
      {
        id: 'z3',
        name: 'Área de Carga',
        sensors: { humidity: 68, temperature: 27, wasteLevel: 80, timeSinceClean: 6, structuralOk: false },
        riskScore: 91,
        riskLevel: 'critical',
        lastUpdated: now.toISOString(),
        history: generateHistory(91),
      },
      {
        id: 'z4',
        name: 'Bodega Seca',
        sensors: { humidity: 62, temperature: 24, wasteLevel: 45, timeSinceClean: 2, structuralOk: true },
        riskScore: 42,
        riskLevel: 'medium',
        lastUpdated: now.toISOString(),
        history: generateHistory(42),
      },
    ],
    alerts: [
      {
        id: 'a1',
        zoneId: 'z3',
        zoneName: 'Área de Carga',
        message: 'Nivel de residuos crítico (80%) + sello estructural dañado. Riesgo de ingreso de roedores.',
        severity: 'danger',
        timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
      },
      {
        id: 'a2',
        zoneId: 'z1',
        zoneName: 'Cocina Principal',
        message: 'Humedad elevada (74%) favorece proliferación de insectos. Revisar ventilación.',
        severity: 'warning',
        timestamp: new Date(now.getTime() - 12 * 60000).toISOString(),
      },
    ],
  }
}
