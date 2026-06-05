'use client'

import { useState, useEffect } from 'react'
import { Bug, Rat, Trash2, ShieldAlert, Wind, MoreHorizontal, ClipboardList, Trash } from 'lucide-react'
import { ReportType } from '@/lib/types'

const LS_KEY = 'safe_industry_reports'

interface SavedReport {
  id: string
  zoneId: string
  zoneName: string
  type: ReportType
  description: string
  timestamp: string
}

const TYPE_META: Record<ReportType, { label: string; icon: React.ReactNode; color: string }> = {
  insecto_avistado:    { label: 'Insecto avistado',    icon: <Bug size={12} />,          color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  roedor_avistado:    { label: 'Roedor avistado',     icon: <Rat size={12} />,           color: 'text-red-400 bg-red-500/10 border-red-500/30' },
  residuos_acumulados:{ label: 'Residuos acumulados', icon: <Trash2 size={12} />,        color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  dano_estructural:   { label: 'Daño estructural',    icon: <ShieldAlert size={12} />,   color: 'text-red-400 bg-red-500/10 border-red-500/30' },
  mal_olor:           { label: 'Mal olor',             icon: <Wind size={12} />,          color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  otro:               { label: 'Otro',                 icon: <MoreHorizontal size={12} />,color: 'text-slate-400 bg-slate-700/40 border-slate-600' },
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function ReportesPage() {
  const [reports, setReports] = useState<SavedReport[]>([])

  useEffect(() => {
    try {
      setReports(JSON.parse(localStorage.getItem(LS_KEY) || '[]'))
    } catch {
      setReports([])
    }
  }, [])

  function clearAll() {
    localStorage.removeItem(LS_KEY)
    setReports([])
  }

  function removeOne(id: string) {
    const updated = reports.filter((r) => r.id !== id)
    localStorage.setItem(LS_KEY, JSON.stringify(updated))
    setReports(updated)
  }

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Reportes locales</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Incidencias registradas en este dispositivo — {reports.length} en total
          </p>
        </div>
        {reports.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-400 hover:text-red-400 hover:border-red-500/40 transition-colors"
          >
            <Trash size={12} /> Limpiar todo
          </button>
        )}
      </div>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
          <ClipboardList size={36} className="text-slate-700" />
          <p className="text-sm">No hay reportes guardados aún.</p>
          <p className="text-xs text-slate-600">Cuando envíes una incidencia desde una zona, aparecerá aquí.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((r) => {
            const meta = TYPE_META[r.type] ?? TYPE_META.otro
            return (
              <div
                key={r.id}
                className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4 flex gap-4"
              >
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-white">{r.zoneName}</span>
                    <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${meta.color}`}>
                      {meta.icon}{meta.label}
                    </span>
                  </div>
                  {r.description && (
                    <p className="text-xs text-slate-400 leading-relaxed">{r.description}</p>
                  )}
                  <p className="text-[10px] text-slate-600">{formatDate(r.timestamp)}</p>
                </div>
                <button
                  onClick={() => removeOne(r.id)}
                  className="shrink-0 text-slate-700 hover:text-red-400 transition-colors mt-0.5"
                  aria-label="Eliminar reporte"
                >
                  <Trash size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
