'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Thermometer, Droplets, Clock, Plus, CheckCircle, WifiOff } from 'lucide-react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const LS_KEY = 'safe_industry_local_zones'

interface ZonaForm {
  nombre: string
  temperatura_max_ideal: string
  humedad_max_ideal: string
  tiempo_limpieza_max_horas: string
}

type Status = 'idle' | 'loading' | 'success' | 'offline'

function saveLocalZone(form: ZonaForm) {
  try {
    const existing = JSON.parse(localStorage.getItem(LS_KEY) || '[]')
    existing.push({ ...form, id: `local-${crypto.randomUUID()}`, createdAt: new Date().toISOString() })
    localStorage.setItem(LS_KEY, JSON.stringify(existing))
  } catch {}
}

export default function NuevaZonaPage() {
  const router = useRouter()
  const [form, setForm] = useState<ZonaForm>({
    nombre: '',
    temperatura_max_ideal: '25',
    humedad_max_ideal: '60',
    tiempo_limpieza_max_horas: '4',
  })
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  function update(field: keyof ZonaForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre.trim()) { setError('El nombre de la zona es obligatorio.'); return }
    setError('')
    setStatus('loading')

    const payload = {
      nombre: form.nombre.trim(),
      temperatura_max_ideal: parseFloat(form.temperatura_max_ideal) || 25,
      humedad_max_ideal: parseFloat(form.humedad_max_ideal) || 60,
      tiempo_limpieza_max_horas: parseInt(form.tiempo_limpieza_max_horas) || 4,
    }

    try {
      const res = await fetch(`${API_URL}/api/zones/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch {
      // Backend offline — guardar localmente
      saveLocalZone(form)
      setStatus('offline')
    }
  }

  const inputClass = 'w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60'
  const labelClass = 'text-xs text-slate-400 font-medium mb-1 flex items-center gap-1.5'

  if (status === 'success') {
    return (
      <div className="p-4 sm:p-6 flex flex-col items-center justify-center gap-4 min-h-[40vh]">
        <div className="p-4 rounded-full bg-green-500/10 text-green-400">
          <CheckCircle size={36} />
        </div>
        <p className="text-base font-semibold text-white">Zona creada correctamente</p>
        <p className="text-xs text-slate-500">Redirigiendo al dashboard…</p>
      </div>
    )
  }

  if (status === 'offline') {
    return (
      <div className="p-4 sm:p-6 flex flex-col items-center justify-center gap-4 min-h-[40vh]">
        <div className="p-4 rounded-full bg-yellow-500/10 text-yellow-400">
          <WifiOff size={36} />
        </div>
        <p className="text-base font-semibold text-white">Guardada localmente</p>
        <p className="text-xs text-slate-500 text-center max-w-xs">
          El backend no está disponible. La zona quedó en localStorage y se sincronizará cuando el servidor esté activo.
        </p>
        <Link href="/dashboard" className="mt-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-sm font-bold text-white transition-colors">
          Ir al dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-6 max-w-lg">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="p-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-white">Nueva zona</h1>
          <p className="text-xs text-slate-500">Configura los umbrales para el sistema de alertas</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Nombre */}
        <div className="flex flex-col">
          <label className={labelClass}><MapPin size={13} /> Nombre de la zona</label>
          <input
            type="text"
            placeholder="Ej. Cocina Principal, Almacén Norte…"
            value={form.nombre}
            onChange={update('nombre')}
            className={inputClass}
          />
        </div>

        {/* Umbrales — grid 2 col */}
        <div className="rounded-xl border border-slate-700/60 bg-slate-800/20 p-4 flex flex-col gap-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Umbrales de alerta</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className={labelClass}><Thermometer size={13} /> Temp. máx. ideal (°C)</label>
              <input type="number" min="0" max="50" step="0.5" value={form.temperatura_max_ideal} onChange={update('temperatura_max_ideal')} className={inputClass} />
              <p className="text-[10px] text-slate-600 mt-1">Por encima se penaliza el score</p>
            </div>

            <div className="flex flex-col">
              <label className={labelClass}><Droplets size={13} /> Humedad máx. ideal (%)</label>
              <input type="number" min="0" max="100" step="1" value={form.humedad_max_ideal} onChange={update('humedad_max_ideal')} className={inputClass} />
              <p className="text-[10px] text-slate-600 mt-1">Por encima favorece proliferación</p>
            </div>

            <div className="flex flex-col sm:col-span-2">
              <label className={labelClass}><Clock size={13} /> Tiempo máx. sin limpiar (h)</label>
              <input type="number" min="1" max="24" step="1" value={form.tiempo_limpieza_max_horas} onChange={update('tiempo_limpieza_max_horas')} className={inputClass} />
              <p className="text-[10px] text-slate-600 mt-1">Pasado este tiempo se suma penalización por hora extra</p>
            </div>
          </div>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 font-bold text-white transition-colors"
        >
          <Plus size={16} />
          {status === 'loading' ? 'Creando zona…' : 'Crear zona'}
        </button>
      </form>
    </div>
  )
}
