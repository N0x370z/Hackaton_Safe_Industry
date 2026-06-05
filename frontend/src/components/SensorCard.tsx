'use client'

import { Droplets, Thermometer, Trash2, Clock, ShieldAlert, ShieldCheck } from 'lucide-react'
import { SensorReading } from '@/lib/types'

interface SensorCardProps {
  sensors: SensorReading
}

function Metric({
  icon,
  label,
  value,
  unit,
  warn,
}: {
  icon: React.ReactNode
  label: string
  value: number | boolean
  unit?: string
  warn: boolean
}) {
  return (
    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 border ${warn ? 'border-red-500/40 bg-red-500/10' : 'border-slate-700 bg-slate-800/60'}`}>
      <span className={warn ? 'text-red-400' : 'text-slate-400'}>{icon}</span>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className={`text-sm font-semibold ${warn ? 'text-red-300' : 'text-white'}`}>
          {typeof value === 'boolean' ? (value ? 'OK' : 'Dañado') : `${value}${unit ?? ''}`}
        </p>
      </div>
    </div>
  )
}

export function SensorCard({ sensors }: SensorCardProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Metric icon={<Droplets size={14} />} label="Humedad" value={sensors.humidity} unit="%" warn={sensors.humidity > 70} />
      <Metric icon={<Thermometer size={14} />} label="Temperatura" value={sensors.temperature} unit="°C" warn={sensors.temperature > 28} />
      <Metric icon={<Trash2 size={14} />} label="Residuos" value={sensors.wasteLevel} unit="%" warn={sensors.wasteLevel > 60} />
      <Metric icon={<Clock size={14} />} label="Sin limpieza" value={sensors.timeSinceClean} unit="h" warn={sensors.timeSinceClean > 4} />
      <div className="col-span-2">
        <Metric
          icon={sensors.structuralOk ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
          label="Integridad estructural"
          value={sensors.structuralOk}
          warn={!sensors.structuralOk}
        />
      </div>
    </div>
  )
}
