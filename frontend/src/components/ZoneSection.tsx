'use client'

import { useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { Zone } from '@/lib/types'
import { getRiskBg, getRiskLabel, getRiskColor, formatTime } from '@/lib/utils'
import { RiskGauge } from './RiskGauge'
import { SensorCard } from './SensorCard'
import { ZoneSidebar } from './ZoneSidebar'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface ZoneSectionProps {
  zone: Zone
}

export function ZoneSection({ zone }: ZoneSectionProps) {
  const [showSidebar, setShowSidebar] = useState(false)
  const color = getRiskColor(zone.riskLevel)

  return (
    <>
      <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 overflow-hidden">
        {/* Header de zona */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b border-slate-700/40"
          style={{ borderLeftWidth: 4, borderLeftColor: color, borderLeftStyle: 'solid' }}
        >
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">{zone.name}</h3>
              <p className="text-[10px] text-slate-500">Última lectura: {formatTime(zone.lastUpdated)}</p>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getRiskBg(zone.riskLevel)}`}>
              {getRiskLabel(zone.riskLevel)}
            </span>
          </div>

          <button
            onClick={() => setShowSidebar(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 text-xs font-semibold transition-all"
          >
            <ClipboardList size={13} />
            Reportar / Detalles
          </button>
        </div>

        {/* Cuerpo — gauge + sensores + gráfica */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-700/40">
          {/* Gauge */}
          <div className="flex flex-col items-center justify-center p-5 gap-2">
            <RiskGauge score={zone.riskScore} level={zone.riskLevel} size={130} />
            <p className="text-xs text-slate-400">Score de riesgo</p>
          </div>

          {/* Sensores */}
          <div className="p-5">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Sensores</p>
            <SensorCard sensors={zone.sensors} />
          </div>

          {/* Gráfica propia de la zona */}
          <div className="p-5">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Tendencia — últimos 60 min</p>
            <ResponsiveContainer width="100%" height={140}>
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
                <Line
                  type="monotone"
                  dataKey="riskScore"
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3, fill: color }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {showSidebar && <ZoneSidebar zone={zone} onClose={() => setShowSidebar(false)} />}
    </>
  )
}
