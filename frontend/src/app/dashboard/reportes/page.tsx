'use client'

import { useState, useEffect, useMemo } from 'react'
import { Bug, Rat, Trash2, ShieldAlert, Wind, MoreHorizontal, ClipboardList, Trash, Search, X } from 'lucide-react'
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
  insecto_avistado:     { label: 'Insecto',    icon: <Bug size={11} />,           color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  roedor_avistado:     { label: 'Roedor',      icon: <Rat size={11} />,           color: 'text-red-400 bg-red-500/10 border-red-500/30' },
  residuos_acumulados: { label: 'Residuos',    icon: <Trash2 size={11} />,        color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  dano_estructural:    { label: 'Estructural', icon: <ShieldAlert size={11} />,   color: 'text-red-400 bg-red-500/10 border-red-500/30' },
  mal_olor:            { label: 'Mal olor',    icon: <Wind size={11} />,          color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  otro:                { label: 'Otro',        icon: <MoreHorizontal size={11} />,color: 'text-slate-400 bg-slate-700/40 border-slate-600' },
}

const ALL_TYPES = Object.keys(TYPE_META) as ReportType[]

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso))
  } catch { return iso }
}

export default function ReportesPage() {
  const [reports, setReports] = useState<SavedReport[]>([])
  const [search, setSearch] = useState('')
  const [activeType, setActiveType] = useState<ReportType | 'all'>('all')

  useEffect(() => {
    try { setReports(JSON.parse(localStorage.getItem(LS_KEY) || '[]')) } catch { setReports([]) }
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return reports.filter((r) => {
      const matchType = activeType === 'all' || r.type === activeType
      const matchSearch = !q || r.zoneName.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
      return matchType && matchSearch
    })
  }, [reports, search, activeType])

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
    <div className="p-4 sm:p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Reportes locales</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {filtered.length} de {reports.length} incidencia{reports.length !== 1 ? 's' : ''}
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

      {reports.length > 0 && (
        <div className="flex flex-col gap-3">
          {/* Buscador */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por zona o descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filtro por tipo */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveType('all')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${activeType === 'all' ? 'border-orange-500/60 bg-orange-500/15 text-orange-300' : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-600 hover:text-white'}`}
            >
              Todos ({reports.length})
            </button>
            {ALL_TYPES.filter((t) => reports.some((r) => r.type === t)).map((t) => {
              const meta = TYPE_META[t]
              const count = reports.filter((r) => r.type === t).length
              return (
                <button
                  key={t}
                  onClick={() => setActiveType(activeType === t ? 'all' : t)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${activeType === t ? `border-current ${meta.color}` : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-600 hover:text-white'}`}
                >
                  {meta.icon}{meta.label} ({count})
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
          <ClipboardList size={36} className="text-slate-700" />
          {reports.length === 0
            ? <><p className="text-sm">No hay reportes guardados aún.</p><p className="text-xs text-slate-600">Envía una incidencia desde la página de una zona.</p></>
            : <p className="text-sm">Ningún reporte coincide con el filtro.</p>
          }
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((r) => {
            const meta = TYPE_META[r.type] ?? TYPE_META.otro
            return (
              <div key={r.id} className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4 flex gap-4">
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-white">{r.zoneName}</span>
                    <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${meta.color}`}>
                      {meta.icon}{meta.label}
                    </span>
                  </div>
                  {r.description && <p className="text-xs text-slate-400 leading-relaxed">{r.description}</p>}
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
