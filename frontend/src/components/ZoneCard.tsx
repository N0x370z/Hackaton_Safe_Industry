'use client'

import { useState } from 'react'
import { ClipboardList, Camera, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { Zone } from '@/lib/types'
import { getRiskBg, getRiskLabel, formatTime } from '@/lib/utils'
import { RiskGauge } from './RiskGauge'
import { ZoneSidebar } from './ZoneSidebar'
import { EditZoneDialog } from './EditZoneDialog'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const LS_KEY = 'plague_tracker_local_zones'

interface ZoneCardProps {
  zone: Zone
  selected: boolean
  onClick: () => void
}

export function ZoneCard({ zone, selected, onClick }: ZoneCardProps) {
  const [showSidebar, setShowSidebar] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [hidden, setHidden] = useState(false)

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (zone.id.startsWith('local-')) {
      try {
        const existing = JSON.parse(localStorage.getItem(LS_KEY) || '[]')
        localStorage.setItem(LS_KEY, JSON.stringify(existing.filter((z: { id: string }) => z.id !== zone.id)))
      } catch {}
    } else {
      try { await fetch(`${API_URL}/api/zones/${zone.id}/`, { method: 'DELETE' }) } catch {}
    }
    setHidden(true)
  }

  if (hidden) return null

  return (
    <>
      <div
        onClick={onClick}
        className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
          selected
            ? 'border-slate-500 bg-slate-800'
            : 'border-slate-700/60 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/80'
        }`}
      >
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">{zone.name}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Actualizado: {formatTime(zone.lastUpdated)}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getRiskBg(zone.riskLevel)}`}>
              {getRiskLabel(zone.riskLevel)}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); setShowEdit(true) }}
              className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors"
              title="Editar zona"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(true) }}
              className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Eliminar zona"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Confirmación inline de eliminación */}
        {confirmDelete && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mb-3 flex items-center gap-2 p-2.5 rounded-xl border border-red-500/30 bg-red-500/10"
          >
            <AlertTriangle size={13} className="text-red-400 shrink-0" />
            <span className="text-xs text-red-300 flex-1">¿Eliminar esta zona?</span>
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(false) }}
              className="text-[11px] px-2 py-0.5 rounded border border-slate-600 text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="text-[11px] px-2 py-0.5 rounded bg-red-500/30 border border-red-500/50 text-red-300 hover:bg-red-500/50 transition-colors"
            >
              Eliminar
            </button>
          </div>
        )}

        <div className="flex items-center gap-4 mb-4">
          <RiskGauge score={zone.riskScore} level={zone.riskLevel} size={100} />
          <div className="flex-1">
            <p className="text-xs text-slate-400 mb-1">Score de riesgo</p>
            <div className="w-full bg-slate-700 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${zone.riskScore}%`,
                  backgroundColor: zone.riskLevel === 'critical' ? '#ef4444' : zone.riskLevel === 'high' ? '#f97316' : zone.riskLevel === 'medium' ? '#eab308' : '#22c55e',
                }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">{zone.riskScore}/100</p>
          </div>
        </div>

        {/* Mini camera preview */}
        <div className="relative rounded-lg overflow-hidden bg-slate-900 h-20 border border-slate-700/60">
          {zone.camera.imageUrl ? (
            <img src={zone.camera.imageUrl} alt="" className="w-full h-full object-cover opacity-70" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera size={20} className="text-slate-600" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/50 rounded px-1.5 py-0.5">
            <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[9px] text-white">EN VIVO</span>
          </div>
          {zone.camera.pestsDetected && (
            <div className="absolute bottom-1.5 right-1.5 bg-red-500/80 rounded px-1.5 py-0.5">
              <span className="text-[9px] text-white font-semibold">¡Plaga detectada!</span>
            </div>
          )}
        </div>

        {/* Botón principal — ancho completo, no puede perderse */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowSidebar(true) }}
          className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 hover:text-orange-200 font-semibold text-sm py-2.5 transition-all"
        >
          <ClipboardList size={15} />
          Reportar / Ver detalles
        </button>
      </div>

      {showSidebar && <ZoneSidebar zone={zone} onClose={() => setShowSidebar(false)} />}
      {showEdit && <EditZoneDialog zone={zone} onClose={() => setShowEdit(false)} />}
    </>
  )
}
