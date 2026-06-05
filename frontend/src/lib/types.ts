export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface CameraAnalysis {
  imageUrl: string
  analyzed: boolean
  lastAnalyzed: string | null
  pestsDetected: boolean
  pestType: 'insecto' | 'roedor' | null
  wasteLevel: number
  cleanlinessScore: number
  structuralIssues: boolean
  confidence: number
}

export interface HistoryPoint {
  time: string
  riskScore: number
}

export interface Zone {
  id: string
  name: string
  camera: CameraAnalysis
  riskScore: number
  riskLevel: RiskLevel
  lastUpdated: string
  history: HistoryPoint[]
}

export interface Alert {
  id: string
  zoneId: string
  zoneName: string
  message: string
  severity: 'warning' | 'danger'
  timestamp: string
}

export interface DashboardData {
  zones: Zone[]
  alerts: Alert[]
}

export type ReportType =
  | 'insecto_avistado'
  | 'roedor_avistado'
  | 'residuos_acumulados'
  | 'dano_estructural'
  | 'mal_olor'
  | 'otro'

export interface ReportPayload {
  zoneId: string
  zoneName: string
  type: ReportType
  description: string
}
