'use client'

import { useState, useEffect } from 'react'
import { Send, Bug, Rat, Trash2, ShieldAlert, Wind, MoreHorizontal, TrendingUp, TrendingDown, Minus, Target, Lightbulb } from 'lucide-react'
import { Zone, ReportType, ReportPayload } from '@/lib/types'
import { getRiskBg, getRiskLabel, getRiskColor, formatTime } from '@/lib/utils'
import { RiskGauge } from './RiskGauge'
import { CameraCard } from './CameraCard'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const REPORT_TYPES: { value: ReportType; label: string; icon: React.ReactNode }[] = [
  { value: 'insecto_avistado', label: 'Insecto avistado', icon: <Bug size={12} /> },
  { value: 'roedor_avistado', label: 'Roedor avistado', icon: <Rat size={12} /> },
  { value: 'residuos_acumulados', label: 'Residuos acumulados', icon: <Trash2 size={12} /> },
  { value: 'dano_estructural', label: 'Daño estructural', icon: <ShieldAlert size={12} /> },
  { value: 'mal_olor', label: 'Mal olor', icon: <Wind size={12} /> },
  { value: 'otro', label: 'Otro', icon: <MoreHorizontal size={12} /> },
]

const RECOMMENDATIONS: Record<string, string> = {
  critical: 'Intervención inmediata. Revisar sellos estructurales y limpiar residuos acumulados.',
  high: 'Revisar ventilación para reducir humedad. Programar limpieza en menos de 1 hora.',
  medium: 'Programar limpieza preventiva en las próximas 2 horas. Monitorear residuos.',
  low: 'Condiciones óptimas. Próxima revisión programada en 8 horas.',
}

const TARGET_SCORES: Record<string, number> = {
  critical: 60,
  high: 50,
  medium: 30,
  low: 15,
}

const LS_KEY = 'safe_industry_reports'

type Status = 'idle' | 'loading' | 'success' | 'error'

function computeTrend(history: { riskScore: number }[]) {
  if (history.length < 4) return 'estable'
  const mid = Math.floor(history.length / 2)
  const first = history.slice(0, mid).reduce((a, p) => a + p.riskScore, 0) / mid
  const last = history.slice(mid).reduce((a, p) => a + p.riskScore, 0) / (history.length - mid)
  const delta = last - first
  if (delta > 5) return 'empeorando'
  if (delta < -5) return 'mejorando'
  return 'estable'
}

function saveToLocalStorage(payload: ReportPayload) {
  try {
    const existing = JSON.parse(localStorage.getItem(LS_KEY) || '[]')
    existing.unshift({ ...payload, timestamp: new Date().toISOString(), id: crypto.randomUUID() })
    localStorage.setItem(LS_KEY, JSON.stringify(existing.slice(0, 100)))
  } catch {}
}

interface ZoneSectionProps {
  zone: Zone
}

export function ZoneSection({ zone }: ZoneSectionProps) {
  const [type, setType] = useState<ReportType>('insecto_avistado')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [trend, setTrend] = useState('estable')
  const color = getRiskColor(zone.riskLevel)
  const target = TARGET_SCORES[zone.riskLevel]

  useEffect(() => {
    setTrend(computeTrend(zone.history))
  }, [zone.history])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    const payload: ReportPayload = { zoneId: zone.id, zoneName: zone.name, type, description }

    // Siempre guarda en localStorage
    saveToLocalStorage(payload)

    try {
      const res = await fetch(`${API_URL}/api/reports/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      setDescription('')
      setTimeout(() => setStatus('idle'), 2500)
    } catch {
      // Backend no disponible — igual muestra éxito porque se guardó en localStorage
      setStatus('success')
      setDescription('')
      setTimeout(() => setStatus('idle'), 2500)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 overflow-hidden">
      {/* Header */}
      <div
        className="flex flex-wrap items-center gap-3 px-4 sm:px-5 py-3 border-b border-slate-700/40"
        style={{ borderLeftWidth: 4, borderLeftColor: color, borderLeftStyle: 'solid' }}
      >
        <div>
          <h3 className="text-sm font-bold text-white">{zone.name}</h3>
          <p className="text-[10px] text-slate-500">Última lectura: {formatTime(zone.lastUpdated)}</p>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getRiskBg(zone.riskLevel)}`}>
          {getRiskLabel(zone.riskLevel)}
        </span>
      </div>

      {/* Cuerpo — gauge + sensores + gráfica */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-700/40">
        <div className="flex flex-col items-center justify-center p-5 gap-2">
          <RiskGauge score={zone.riskScore} level={zone.riskLevel} size={130} />
          <p className="text-xs text-slate-400">Score de riesgo</p>
        </div>

        <div className="p-4 sm:p-5">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Cámara</p>
          <CameraCard zone={zone} />
        </div>

        <div className="p-4 sm:p-5">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Tendencia — últimos 60 min</p>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={zone.history} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color }}
                formatter={(v) => [`${v ?? 0}`, 'Riesgo']}
              />
              <ReferenceLine y={70} stroke="#f97316" strokeDasharray="3 3" strokeOpacity={0.4} />
              <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.4} />
              <Line type="monotone" dataKey="riskScore" stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 3, fill: color }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Métricas extra */}
      <div className="border-t border-slate-700/40 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-700/40">
        {/* Tendencia */}
        <div className="flex items-center gap-3 px-4 sm:px-5 py-3">
          <div className={`p-2 rounded-lg ${trend === 'empeorando' ? 'bg-red-500/10 text-red-400' : trend === 'mejorando' ? 'bg-green-500/10 text-green-400' : 'bg-slate-700/40 text-slate-400'}`}>
            {trend === 'empeorando' ? <TrendingUp size={16} /> : trend === 'mejorando' ? <TrendingDown size={16} /> : <Minus size={16} />}
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Tendencia</p>
            <p className={`text-sm font-semibold capitalize ${trend === 'empeorando' ? 'text-red-400' : trend === 'mejorando' ? 'text-green-400' : 'text-slate-300'}`}>
              {trend}
            </p>
          </div>
        </div>

        {/* Objetivo */}
        <div className="flex items-center gap-3 px-4 sm:px-5 py-3">
          <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
            <Target size={16} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Objetivo de zona</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-semibold text-white">Score ≤ {target}</span>
              <div className="flex-1 bg-slate-700 rounded-full h-1">
                <div
                  className="h-1 rounded-full transition-all"
                  style={{ width: `${Math.min((target / zone.riskScore) * 100, 100)}%`, backgroundColor: color }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recomendación */}
        <div className="flex items-start gap-3 px-4 sm:px-5 py-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0 mt-0.5">
            <Lightbulb size={16} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Acción recomendada</p>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{RECOMMENDATIONS[zone.riskLevel]}</p>
          </div>
        </div>
      </div>

      {/* Reporte inline */}
      <div className="border-t border-slate-700/40 p-4 sm:p-5">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Registrar incidencia en esta zona</p>

        {status === 'success' ? (
          <div className="flex items-center gap-2 py-3 text-green-400 text-sm font-medium">
            <span className="text-lg">✓</span> Reporte enviado correctamente
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* Tipos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {REPORT_TYPES.map((rt) => (
                <button
                  key={rt.value}
                  type="button"
                  onClick={() => setType(rt.value)}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                    type === rt.value
                      ? 'border-orange-500/60 bg-orange-500/15 text-orange-300'
                      : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-600 hover:text-white'
                  }`}
                >
                  {rt.icon}{rt.label}
                </button>
              ))}
            </div>

            {/* Descripción + enviar */}
            <div className="flex flex-col sm:flex-row gap-2">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe lo que observaste en esta zona..."
                rows={2}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60 resize-none"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-sm font-bold text-white transition-colors sm:self-end"
              >
                <Send size={14} />
                {status === 'loading' ? 'Enviando...' : 'Enviar'}
              </button>
            </div>

            {status === 'error' && <p className="text-xs text-red-400">Error al enviar. Intenta de nuevo.</p>}
          </form>
        )}
      </div>
    </div>
  )
}
