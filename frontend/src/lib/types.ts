export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface SensorReading {
  humidity: number
  temperature: number
  wasteLevel: number
  timeSinceClean: number
  structuralOk: boolean
}

export interface Zone {
  id: string
  name: string
  sensors: SensorReading
  riskScore: number
  riskLevel: RiskLevel
  lastUpdated: string
}

export interface Alert {
  id: string
  zoneId: string
  zoneName: string
  message: string
  severity: 'warning' | 'danger'
  timestamp: string
}

export interface HistoryPoint {
  time: string
  riskScore: number
  zone: string
}

export interface DashboardData {
  zones: Zone[]
  alerts: Alert[]
  history: HistoryPoint[]
}
