'use client'

import { useDashboard } from '@/hooks/useDashboard'
import { ZoneCard } from '@/components/ZoneCard'
import { AlertPanel } from '@/components/AlertPanel'
import { RiskChart } from '@/components/RiskChart'
import { Shield, Wifi, WifiOff } from 'lucide-react'

export default function Dashboard() {
  const { data, connected, selectedZone, setSelectedZone } = useDashboard()

  const criticalCount = data.zones.filter((z) => z.riskLevel === 'critical').length
  const avgRisk = Math.round(data.zones.reduce((a, z) => a + z.riskScore, 0) / data.zones.length)

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700/60 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-orange-400" />
            <span className="font-bold text-white">SafeIndustry</span>
            <span className="text-slate-500 text-sm">· Monitor de Riesgo</span>
          </div>
          <div className="flex items-center gap-2">
            {connected ? (
              <span className="flex items-center gap-1.5 text-xs text-green-400">
                <Wifi size={12} />
                En vivo
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <WifiOff size={12} />
                Simulado
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4 mb-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Zones grid */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Zonas del establecimiento</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.zones.map((zone) => (
                <ZoneCard
                  key={zone.id}
                  zone={zone}
                  selected={selectedZone?.id === zone.id}
                  onClick={() => setSelectedZone(zone.id === selectedZone?.id ? null : zone)}
                />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Alerts */}
            <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4">
              <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                Alertas activas
              </h2>
              <AlertPanel alerts={data.alerts} />
            </div>

            {/* Chart */}
            <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4">
              <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                Tendencia de riesgo
              </h2>
              <p className="text-xs text-slate-500 mb-3">Zona de mayor riesgo — últimos 60 min</p>
              <RiskChart data={data.history} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
