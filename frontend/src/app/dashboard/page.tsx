'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useDashboard } from '@/hooks/useDashboard'
import { useDismissedAlerts } from '@/hooks/useDismissedAlerts'
import { AlertPanel } from '@/components/AlertPanel'
import { RiskGauge } from '@/components/RiskGauge'
import { getRiskBg, getRiskLabel, getRiskColor } from '@/lib/utils'

export default function DashboardPage() {
  const { data } = useDashboard()
  const { dismissed } = useDismissedAlerts()

  const criticalCount = data.zones.filter((z) => z.riskLevel === 'critical').length
  const avgRisk = Math.round(data.zones.reduce((a, z) => a + z.riskScore, 0) / data.zones.length)
  const visibleAlertCount = data.alerts.filter((a) => !dismissed.has(a.id)).length

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-6">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-3 sm:p-4 text-center">
          <p className="text-xl sm:text-2xl font-bold text-white">{avgRisk}</p>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1">Riesgo promedio</p>
        </div>
        <div className={`rounded-xl border p-3 sm:p-4 text-center ${criticalCount > 0 ? 'border-red-500/40 bg-red-500/10' : 'border-slate-700/60 bg-slate-800/40'}`}>
          <p className={`text-xl sm:text-2xl font-bold ${criticalCount > 0 ? 'text-red-400' : 'text-white'}`}>{criticalCount}</p>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1">Zonas críticas</p>
        </div>
        <div className={`rounded-xl border p-3 sm:p-4 text-center ${visibleAlertCount > 0 ? 'border-yellow-500/40 bg-yellow-500/10' : 'border-slate-700/60 bg-slate-800/40'}`}>
          <p className={`text-xl sm:text-2xl font-bold ${visibleAlertCount > 0 ? 'text-yellow-400' : 'text-white'}`}>{visibleAlertCount}</p>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1">Alertas activas</p>
        </div>
      </div>

      {/* Alertas */}
      <div id="alertas" className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alertas activas</h2>
          {visibleAlertCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
              {visibleAlertCount} activa{visibleAlertCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <AlertPanel alerts={data.alerts} />
      </div>

      {/* Zonas */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Zonas del establecimiento</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.zones.map((zone) => (
            <Link
              key={zone.id}
              href={`/dashboard/${zone.id}`}
              className="group rounded-2xl border border-slate-700/60 bg-slate-800/40 hover:bg-slate-800 hover:border-slate-600 transition-all overflow-hidden"
            >
              {/* Franja de color por nivel */}
              <div className="h-1 w-full" style={{ backgroundColor: getRiskColor(zone.riskLevel) }} />

              <div className="p-4 flex items-center gap-4">
                <RiskGauge score={zone.riskScore} level={zone.riskLevel} size={90} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-bold text-white truncate">{zone.name}</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${getRiskBg(zone.riskLevel)}`}>
                      {getRiskLabel(zone.riskLevel)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    {[
                      { label: 'Residuos', value: `${zone.camera.wasteLevel}%`, warn: zone.camera.wasteLevel > 60 },
                      { label: 'Limpieza', value: `${zone.camera.cleanlinessScore}%`, warn: zone.camera.cleanlinessScore < 50 },
                      { label: 'Plagas', value: zone.camera.pestsDetected ? (zone.camera.pestType === 'roedor' ? 'Roedor' : 'Insecto') : 'Ninguna', warn: zone.camera.pestsDetected },
                      { label: 'Estructura', value: zone.camera.structuralIssues ? 'Daño' : 'OK', warn: zone.camera.structuralIssues },
                    ].map((s) => (
                      <div key={s.label}>
                        <span className="text-[10px] text-slate-500">{s.label} </span>
                        <span className={`text-[10px] font-semibold ${s.warn ? 'text-red-400' : 'text-slate-300'}`}>{s.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 mt-3 text-orange-400 text-xs font-semibold group-hover:gap-2 transition-all">
                    Ver zona <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
