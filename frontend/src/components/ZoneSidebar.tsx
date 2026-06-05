'use client'

import { useState } from 'react'
import { X, Send, Bug, Rat, Trash2, ShieldAlert, Wind, MoreHorizontal, Droplets, Thermometer, Clock, ClipboardList, BarChart2 } from 'lucide-react'
import { Zone, ReportType, ReportPayload } from '@/lib/types'
import { getRiskBg, getRiskLabel, getRiskColor } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const REPORT_TYPES: { value: ReportType; label: string; icon: React.ReactNode }[] = [
  { value: 'insecto_avistado', label: 'Insecto avistado', icon: <Bug size={14} /> },
  { value: 'roedor_avistado', label: 'Roedor avistado', icon: <Rat size={14} /> },
  { value: 'residuos_acumulados', label: 'Residuos acumulados', icon: <Trash2 size={14} /> },
  { value: 'dano_estructural', label: 'Daño estructural', icon: <ShieldAlert size={14} /> },
  { value: 'mal_olor', label: 'Mal olor', icon: <Wind size={14} /> },
  { value: 'otro', label: 'Otro', icon: <MoreHorizontal size={14} /> },
]

type Tab = 'report' | 'details'
type Status = 'idle' | 'loading' | 'success' | 'error'

interface ZoneSidebarProps {
  zone: Zone
  onClose: () => void
}

function Meter({ label, value, max = 100, warn, unit, icon }: {
  label: string; value: number; max?: number; warn: boolean; unit: string; icon: React.ReactNode
}) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-slate-400">{icon}{label}</span>
        <span className={`text-xs font-semibold ${warn ? 'text-red-400' : 'text-white'}`}>{value}{unit}</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: warn ? '#ef4444' : '#22c55e' }}
        />
      </div>
    </div>
  )
}

export function ZoneSidebar({ zone, onClose }: ZoneSidebarProps) {
  const [tab, setTab] = useState<Tab>('report')
  const [type, setType] = useState<ReportType>('insecto_avistado')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    const payload: ReportPayload = { zoneId: zone.id, zoneName: zone.name, type, description }
    try {
      const res = await fetch(`${API_URL}/api/reports/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      setTimeout(() => { setStatus('idle'); setDescription('') }, 2000)
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm z-50 flex flex-col bg-slate-900 border-l border-slate-700 shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-700/60 shrink-0">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Zona seleccionada</p>
            <h2 className="text-base font-bold text-white">{zone.name}</h2>
            <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getRiskBg(zone.riskLevel)}`}>
              {getRiskLabel(zone.riskLevel)} · {zone.riskScore}/100
            </span>
          </div>
          <button onClick={onClose} className="mt-1 text-slate-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700/60 shrink-0">
          {([
            { id: 'report', label: 'Reportar', icon: <ClipboardList size={13} /> },
            { id: 'details', label: 'Detalles', icon: <BarChart2 size={13} /> },
          ] as { id: Tab; label: string; icon: React.ReactNode }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all border-b-2 ${
                tab === t.id
                  ? 'border-orange-500 text-orange-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* --- TAB: REPORT --- */}
          {tab === 'report' && (
            status === 'success' ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <div className="text-4xl">✓</div>
                <p className="text-sm text-green-400 font-medium">Reporte enviado correctamente</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <p className="text-xs text-slate-400 mb-2.5">¿Qué observaste?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {REPORT_TYPES.map((rt) => (
                      <button
                        key={rt.value}
                        type="button"
                        onClick={() => setType(rt.value)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                          type === rt.value
                            ? 'border-orange-500/60 bg-orange-500/15 text-orange-300'
                            : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-500 hover:text-white'
                        }`}
                      >
                        {rt.icon}{rt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-2">Descripción adicional</p>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe la situación con detalle..."
                    rows={4}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60 resize-none"
                  />
                </div>

                {status === 'error' && (
                  <p className="text-xs text-red-400">Error al enviar. Intenta de nuevo.</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 px-4 py-3 text-sm font-bold text-white transition-colors"
                >
                  <Send size={14} />
                  {status === 'loading' ? 'Enviando...' : 'Enviar reporte'}
                </button>
              </form>
            )
          )}

          {/* --- TAB: DETAILS --- */}
          {tab === 'details' && (
            <div className="flex flex-col gap-5">
              {/* Risk arc */}
              <div className="flex flex-col items-center rounded-xl border border-slate-700/60 bg-slate-800/40 py-5 gap-2">
                <p className="text-xs text-slate-400">Score de riesgo actual</p>
                <p className="text-5xl font-black" style={{ color: getRiskColor(zone.riskLevel) }}>
                  {zone.riskScore}
                </p>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getRiskBg(zone.riskLevel)}`}>
                  {getRiskLabel(zone.riskLevel)}
                </span>
              </div>

              {/* Sensors */}
              <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4 flex flex-col gap-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Lecturas de sensores</p>
                <Meter label="Humedad" value={zone.sensors.humidity} unit="%" warn={zone.sensors.humidity > 70} icon={<Droplets size={12} />} />
                <Meter label="Temperatura" value={zone.sensors.temperature} max={50} unit="°C" warn={zone.sensors.temperature > 28} icon={<Thermometer size={12} />} />
                <Meter label="Nivel de residuos" value={zone.sensors.wasteLevel} unit="%" warn={zone.sensors.wasteLevel > 60} icon={<Trash2 size={12} />} />
                <Meter label="Sin limpieza" value={zone.sensors.timeSinceClean} max={8} unit="h" warn={zone.sensors.timeSinceClean > 4} icon={<Clock size={12} />} />
              </div>

              {/* Structural */}
              <div className={`rounded-xl border p-4 flex items-center gap-3 ${zone.sensors.structuralOk ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
                <ShieldAlert size={18} className={zone.sensors.structuralOk ? 'text-green-400' : 'text-red-400'} />
                <div>
                  <p className="text-xs font-semibold text-white">Integridad estructural</p>
                  <p className={`text-xs mt-0.5 ${zone.sensors.structuralOk ? 'text-green-400' : 'text-red-400'}`}>
                    {zone.sensors.structuralOk ? 'Sin daños detectados' : 'Sello o acceso dañado'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
