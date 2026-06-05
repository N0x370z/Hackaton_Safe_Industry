'use client'

import Link from 'next/link'
import { AlertTriangle, XCircle, Clock, X, ArrowRight, ShieldCheck } from 'lucide-react'
import { Alert } from '@/lib/types'
import { formatTime } from '@/lib/utils'
import { useDismissedAlerts } from '@/hooks/useDismissedAlerts'

interface AlertPanelProps {
  alerts: Alert[]
}

export function AlertPanel({ alerts }: AlertPanelProps) {
  const { dismissed, dismiss, restore } = useDismissedAlerts()

  const visible = alerts.filter((a) => !dismissed.has(a.id))
  const dismissedCount = alerts.filter((a) => dismissed.has(a.id)).length

  if (visible.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 py-4 px-3 rounded-xl border border-green-500/20 bg-green-500/5">
          <div className="p-2 rounded-lg bg-green-500/10 text-green-400 shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-green-400">Sistema saludable</p>
            <p className="text-xs text-slate-500">
              {dismissed.size > 0
                ? `${dismissed.size} alerta${dismissed.size > 1 ? 's' : ''} silenciada${dismissed.size > 1 ? 's' : ''} — reaparecerán en ~2 min si persiste la condición.`
                : 'Todas las zonas operan dentro de parámetros normales.'}
            </p>
          </div>
        </div>
        {dismissed.size > 0 && (
          <button
            onClick={restore}
            className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors text-right"
          >
            Mostrar ahora ({dismissed.size})
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {visible.map((alert) => (
        <div
          key={alert.id}
          className={`relative flex gap-3 rounded-xl border p-3 transition-all ${
            alert.severity === 'danger'
              ? 'border-red-500/40 bg-red-500/10'
              : 'border-yellow-500/40 bg-yellow-500/10'
          }`}
        >
          {alert.severity === 'danger' && (
            <span className="absolute top-3 left-3 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-30" />
            </span>
          )}

          <div className="mt-0.5 shrink-0 z-10">
            {alert.severity === 'danger' ? (
              <XCircle size={16} className="text-red-400" />
            ) : (
              <AlertTriangle size={16} className="text-yellow-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-xs font-semibold text-slate-300">{alert.zoneName}</p>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${
                  alert.severity === 'danger'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}
              >
                {alert.severity === 'danger' ? 'Peligro' : 'Advertencia'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{alert.message}</p>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-slate-500">
                <Clock size={10} />
                <span className="text-[10px]">{formatTime(alert.timestamp)}</span>
              </div>
              <Link
                href={`/dashboard/${alert.zoneId}`}
                className="flex items-center gap-1 text-[10px] font-semibold text-orange-400 hover:text-orange-300 transition-colors"
              >
                Ir a zona <ArrowRight size={10} />
              </Link>
            </div>
          </div>

          <button
            onClick={() => dismiss(alert.id)}
            className="shrink-0 mt-0.5 text-slate-600 hover:text-slate-400 transition-colors"
            aria-label="Silenciar alerta 2 min"
          >
            <X size={14} />
          </button>
        </div>
      ))}

      {dismissed.size > 0 && (
        <button
          onClick={restore}
          className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors text-right"
        >
          Mostrar {dismissed.size} silenciada{dismissed.size > 1 ? 's' : ''}
        </button>
      )}
    </div>
  )
}
