'use client'

import { useState } from 'react'
import { useDashboard } from '@/hooks/useDashboard'
import { AppSidebar } from '@/components/AppSidebar'
import { ZoneSection } from '@/components/ZoneSection'
import { AlertPanel } from '@/components/AlertPanel'

type NavSection = 'dashboard' | 'alertas' | 'reporte'

export default function Dashboard() {
  const { data, connected } = useDashboard()
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard')

  const criticalCount = data.zones.filter((z) => z.riskLevel === 'critical').length
  const avgRisk = Math.round(data.zones.reduce((a, z) => a + z.riskScore, 0) / data.zones.length)

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
      {/* Sidebar fija */}
      <AppSidebar
        zones={data.zones}
        alertCount={data.alerts.length}
        connected={connected}
        activeSection={activeSection}
        onNavChange={setActiveSection}
      />

      {/* Contenido principal */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 flex flex-col gap-6">

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4 text-center">
              <p className="text-2xl font-bold text-white">{avgRisk}</p>
              <p className="text-xs text-slate-400 mt-1">Riesgo promedio</p>
            </div>
            <div className={`rounded-xl border p-4 text-center ${criticalCount > 0 ? 'border-red-500/40 bg-red-500/10' : 'border-slate-700/60 bg-slate-800/40'}`}>
              <p className={`text-2xl font-bold ${criticalCount > 0 ? 'text-red-400' : 'text-white'}`}>{criticalCount}</p>
              <p className="text-xs text-slate-400 mt-1">Zonas críticas</p>
            </div>
            <div className={`rounded-xl border p-4 text-center ${data.alerts.length > 0 ? 'border-yellow-500/40 bg-yellow-500/10' : 'border-slate-700/60 bg-slate-800/40'}`}>
              <p className={`text-2xl font-bold ${data.alerts.length > 0 ? 'text-yellow-400' : 'text-white'}`}>{data.alerts.length}</p>
              <p className="text-xs text-slate-400 mt-1">Alertas activas</p>
            </div>
          </div>

          {/* Alertas */}
          {data.alerts.length > 0 && (
            <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4">
              <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Alertas activas</h2>
              <AlertPanel alerts={data.alerts} />
            </div>
          )}

          {/* Zonas — cada una independiente */}
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Zonas del establecimiento</h2>
            {data.zones.map((zone) => (
              <ZoneSection key={zone.id} zone={zone} />
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
