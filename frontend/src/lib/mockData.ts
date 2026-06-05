import { DashboardData, Zone } from './types'

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

const LS_LOCAL_ZONES = 'plague_tracker_local_zones'

function getLocalZones(): Zone[] {
  if (typeof window === 'undefined') return []
  try {
    const raw: { id: string; nombre: string; imageUrl?: string; createdAt: string }[] = JSON.parse(
      localStorage.getItem(LS_LOCAL_ZONES) || '[]'
    )
    return raw.map((z) => ({
      id: z.id,
      name: z.nombre,
      camera: {
        imageUrl: z.imageUrl ?? '',
        analyzed: false,
        lastAnalyzed: null,
        pestsDetected: false,
        pestType: null,
        wasteLevel: 0,
        cleanlinessScore: 100,
        structuralIssues: false,
        confidence: 0,
      },
      riskScore: 0,
      riskLevel: 'low' as const,
      lastUpdated: z.createdAt,
      history: generateHistory(0),
    }))
  } catch {
    return []
  }
}

export function generateMockData(): DashboardData {
  const now = new Date()

  return {
    zones: [
      {
        id: 'z1',
        name: 'Cocina Principal',
        camera: {
          imageUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=225&fit=crop',
          analyzed: true,
          lastAnalyzed: new Date(now.getTime() - 8 * 60000).toISOString(),
          pestsDetected: false,
          pestType: null,
          wasteLevel: 65,
          cleanlinessScore: 42,
          structuralIssues: false,
          confidence: 87,
        },
        riskScore: 78,
        riskLevel: 'high',
        lastUpdated: now.toISOString(),
        history: generateHistory(78),
      },
      {
        id: 'z2',
        name: 'Almacén Frío',
        camera: {
          imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=225&fit=crop',
          analyzed: true,
          lastAnalyzed: new Date(now.getTime() - 3 * 60000).toISOString(),
          pestsDetected: false,
          pestType: null,
          wasteLevel: 20,
          cleanlinessScore: 83,
          structuralIssues: false,
          confidence: 92,
        },
        riskScore: 18,
        riskLevel: 'low',
        lastUpdated: now.toISOString(),
        history: generateHistory(18),
      },
      {
        id: 'z3',
        name: 'Área de Carga',
        camera: {
          imageUrl: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=400&h=225&fit=crop',
          analyzed: true,
          lastAnalyzed: new Date(now.getTime() - 5 * 60000).toISOString(),
          pestsDetected: true,
          pestType: 'roedor',
          wasteLevel: 80,
          cleanlinessScore: 22,
          structuralIssues: true,
          confidence: 94,
        },
        riskScore: 91,
        riskLevel: 'critical',
        lastUpdated: now.toISOString(),
        history: generateHistory(91),
      },
      {
        id: 'z4',
        name: 'Bodega Seca',
        camera: {
          imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=225&fit=crop',
          analyzed: true,
          lastAnalyzed: new Date(now.getTime() - 15 * 60000).toISOString(),
          pestsDetected: false,
          pestType: null,
          wasteLevel: 45,
          cleanlinessScore: 61,
          structuralIssues: false,
          confidence: 79,
        },
        riskScore: 42,
        riskLevel: 'medium',
        lastUpdated: now.toISOString(),
        history: generateHistory(42),
      },
      ...getLocalZones(),
    ],
    alerts: [
      {
        id: 'a1',
        zoneId: 'z3',
        zoneName: 'Área de Carga',
        message: 'Cámara detectó roedor + daño estructural. Residuos al 80%. Intervención inmediata requerida.',
        severity: 'danger',
        timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
      },
      {
        id: 'a2',
        zoneId: 'z1',
        zoneName: 'Cocina Principal',
        message: 'Nivel de residuos elevado (65%) y limpieza baja (42%). Revisar área de preparación.',
        severity: 'warning',
        timestamp: new Date(now.getTime() - 12 * 60000).toISOString(),
      },
    ],
  }
}
