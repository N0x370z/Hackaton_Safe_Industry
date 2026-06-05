'use client'

import { AlertTriangle, XCircle, ShieldCheck } from 'lucide-react'
import { useDashboard } from '@/hooks/useDashboard'
import { useDismissedAlerts } from '@/hooks/useDismissedAlerts'
import { AlertPanel } from '@/components/AlertPanel'

export default function AlertasPage() {
  const { data } = useDashboard()
  const { dismissed } = useDismissedAlerts()

  const total = data.alerts.length
  const danger = data.alerts.filter((a) => a.severity === 'danger').length
  const warning = data.alerts.filter((a) => a.severity === 'warning').length
  const silenced = data.alerts.filter((a) => dismissed.has(a.id)).length
  const visible = total - silenced

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-white">Alertas del sistema</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Generadas automáticamente según sensores. Se actualizan cada 5 s.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`rounded-xl border p-3 text-center ${visible > 0 ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-slate-700/60 bg-slate-800/40'}`}>
          <p className={`text-2xl font-bold ${visible > 0 ? 'text-yellow-400' : 'text-white'}`}>{visible}</p>
          <p className="text-[11px] text-slate-400 mt-1">Activas</p>
        </div>
        <div className={`rounded-xl border p-3 text-center ${danger > 0 ? 'border-red-500/30 bg-red-500/5' : 'border-slate-700/60 bg-slate-800/40'}`}>
          <p className={`text-2xl font-bold ${danger > 0 ? 'text-red-400' : 'text-white'}`}>{danger}</p>
          <p className="text-[11px] text-slate-400 mt-1">Peligro</p>
        </div>
        <div className={`rounded-xl border p-3 text-center ${warning > 0 ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-slate-700/60 bg-slate-800/40'}`}>
          <p className={`text-2xl font-bold ${warning > 0 ? 'text-yellow-400' : 'text-white'}`}>{warning}</p>
          <p className="text-[11px] text-slate-400 mt-1">Advertencia</p>
        </div>
        <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-3 text-center">
          <p className="text-2xl font-bold text-slate-400">{silenced}</p>
          <p className="text-[11px] text-slate-400 mt-1">Silenciadas</p>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><XCircle size={12} className="text-red-400" /> Peligro — condición crítica, acción inmediata</span>
        <span className="flex items-center gap-1.5"><AlertTriangle size={12} className="text-yellow-400" /> Advertencia — monitorear o programar limpieza</span>
        <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-green-400" /> X silencia 2 min; reaparece sola si persiste</span>
      </div>

      {/* Panel */}
      <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4">
        <AlertPanel alerts={data.alerts} />
      </div>
    </div>
  )
}
