'use client'

import { useState } from 'react'
import { X, Send, Bug, Rat, Trash2, ShieldAlert, Wind, MoreHorizontal } from 'lucide-react'
import { ReportPayload, ReportType } from '@/lib/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const REPORT_TYPES: { value: ReportType; label: string; icon: React.ReactNode }[] = [
  { value: 'insecto_avistado', label: 'Insecto avistado', icon: <Bug size={14} /> },
  { value: 'roedor_avistado', label: 'Roedor avistado', icon: <Rat size={14} /> },
  { value: 'residuos_acumulados', label: 'Residuos acumulados', icon: <Trash2 size={14} /> },
  { value: 'dano_estructural', label: 'Daño estructural', icon: <ShieldAlert size={14} /> },
  { value: 'mal_olor', label: 'Mal olor', icon: <Wind size={14} /> },
  { value: 'otro', label: 'Otro', icon: <MoreHorizontal size={14} /> },
]

interface ReportModalProps {
  zoneId: string
  zoneName: string
  onClose: () => void
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export function ReportModal({ zoneId, zoneName, onClose }: ReportModalProps) {
  const [type, setType] = useState<ReportType>('insecto_avistado')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')

    const payload: ReportPayload = { zoneId, zoneName, type, description }

    try {
      const res = await fetch(`${API_URL}/api/reports/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      setTimeout(onClose, 1500)
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60">
          <div>
            <p className="text-xs text-slate-400">Nuevo reporte</p>
            <h3 className="text-sm font-semibold text-white">{zoneName}</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {status === 'success' ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10">
            <div className="text-3xl">✓</div>
            <p className="text-sm text-green-400 font-medium">Reporte enviado</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
            {/* Tipo */}
            <div>
              <p className="text-xs text-slate-400 mb-2">Tipo de incidencia</p>
              <div className="grid grid-cols-2 gap-2">
                {REPORT_TYPES.map((rt) => (
                  <button
                    key={rt.value}
                    type="button"
                    onClick={() => setType(rt.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all ${
                      type === rt.value
                        ? 'border-orange-500/60 bg-orange-500/10 text-orange-300'
                        : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {rt.icon}
                    {rt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Descripcion */}
            <div>
              <p className="text-xs text-slate-400 mb-2">Descripción</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe lo que observaste..."
                rows={3}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60 resize-none"
              />
            </div>

            {status === 'error' && (
              <p className="text-xs text-red-400">No se pudo enviar. Intenta de nuevo.</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold text-white transition-colors"
            >
              <Send size={14} />
              {status === 'loading' ? 'Enviando...' : 'Enviar reporte'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
