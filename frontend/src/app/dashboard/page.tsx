'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useDashboard } from '@/hooks/useDashboard'
import { AlertPanel } from '@/components/AlertPanel'
import { RiskGauge } from '@/components/RiskGauge'
import { getRiskBg, getRiskLabel, getRiskColor } from '@/lib/utils'

export default function DashboardPage() {
  const { data } = useDashboard()

  const criticalCount = data.zones.filter((z) => z.riskLevel === 'critical').length
  const avgRisk = Math.round(data.zones.reduce((a, z) => a + z.riskScore, 0) / data.zones.length)

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
        <div className={`rounded-xl border p-3 sm:p-4 text-center ${data.alerts.length > 0 ? 'border-yellow-500/40 bg-yellow-500/10' : 'border-slate-700/60 bg-slate-800/40'}`}>
          <p className={`text-xl sm:text-2xl font-bold ${data.alerts.length > 0 ? 'text-yellow-400' : 'text-white'}`}>{data.alerts.length}</p>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1">Alertas activas</p>
        </div>
      </div>

      {/* Alertas */}
      {data.alerts.length > 0 && (
        <div id="alertas" className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4">
          <h2 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Alertas activas</h2>
          <AlertPanel alerts={data.alerts} />
        </div>
      )}

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
                      { label: 'Humedad', value: `${zone.sensors.humidity}%`, warn: zone.sensors.humidity > 70 },
                      { label: 'Temperatura', value: `${zone.sensors.temperature}°C`, warn: zone.sensors.temperature > 28 },
                      { label: 'Residuos', value: `${zone.sensors.wasteLevel}%`, warn: zone.sensors.wasteLevel > 60 },
                      { label: 'Sin limpiar', value: `${zone.sensors.timeSinceClean}h`, warn: zone.sensors.timeSinceClean > 4 },
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
