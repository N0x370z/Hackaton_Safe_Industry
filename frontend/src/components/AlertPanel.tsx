'use client'

import { AlertTriangle, XCircle, Clock } from 'lucide-react'
import { Alert } from '@/lib/types'
import { formatTime } from '@/lib/utils'

interface AlertPanelProps {
  alerts: Alert[]
}

export function AlertPanel({ alerts }: AlertPanelProps) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-500">
        <div className="text-4xl">✓</div>
        <p className="text-sm">Sin alertas activas</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`flex gap-3 rounded-lg border p-3 ${
            alert.severity === 'danger'
              ? 'border-red-500/40 bg-red-500/10'
              : 'border-yellow-500/40 bg-yellow-500/10'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {alert.severity === 'danger' ? (
              <XCircle size={16} className="text-red-400" />
            ) : (
              <AlertTriangle size={16} className="text-yellow-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-300 mb-0.5">{alert.zoneName}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{alert.message}</p>
            <div className="flex items-center gap-1 mt-1.5 text-slate-500">
              <Clock size={10} />
              <span className="text-[10px]">{formatTime(alert.timestamp)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
