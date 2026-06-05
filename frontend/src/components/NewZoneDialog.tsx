'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, MapPin, Plus, CheckCircle, WifiOff } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const LS_KEY = 'plague_tracker_local_zones'

interface Props {
  onClose: () => void
}

type Status = 'idle' | 'loading' | 'success' | 'offline'

function saveLocalZone(nombre: string): string {
  const id = `local-${crypto.randomUUID()}`
  try {
    const existing = JSON.parse(localStorage.getItem(LS_KEY) || '[]')
    existing.push({ id, nombre, createdAt: new Date().toISOString() })
    localStorage.setItem(LS_KEY, JSON.stringify(existing))
  } catch {}
  return id
}

export function NewZoneDialog({ onClose }: Props) {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim()) { setError('El nombre es obligatorio.'); return }
    setError('')
    setStatus('loading')

    const payload = {
      nombre: nombre.trim(),
      temperatura_max_ideal: 25,
      humedad_max_ideal: 60,
      tiempo_limpieza_max_horas: 4,
    }

    try {
      const res = await fetch(`${API_URL}/api/zones/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setStatus('success')
      setTimeout(() => { onClose(); router.push(`/dashboard/${data.id}`) }, 900)
    } catch {
      const localId = saveLocalZone(nombre.trim())
      setStatus('offline')
      setTimeout(() => { onClose(); router.push(`/dashboard/${localId}`) }, 1000)
    }
  }

  const isSettled = status === 'success' || status === 'offline'

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={isSettled ? undefined : onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60">
            <div>
              <h2 className="text-sm font-bold text-white">Nueva zona</h2>
              <p className="text-xs text-slate-500">Añade una zona de monitoreo con cámara</p>
            </div>
            {!isSettled && (
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="p-5">
            {status === 'success' && (
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="p-3 rounded-full bg-green-500/10 text-green-400">
                  <CheckCircle size={28} />
                </div>
                <p className="text-sm font-semibold text-white">Zona creada</p>
                <p className="text-xs text-slate-500">Redirigiendo a la nueva zona…</p>
              </div>
            )}

            {status === 'offline' && (
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="p-3 rounded-full bg-yellow-500/10 text-yellow-400">
                  <WifiOff size={28} />
                </div>
                <p className="text-sm font-semibold text-white">Guardada localmente</p>
                <p className="text-xs text-slate-500">Redirigiendo a la nueva zona…</p>
              </div>
            )}

            {(status === 'idle' || status === 'loading') && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <MapPin size={12} /> Nombre de la zona
                  </label>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Ej. Cocina Principal, Almacén Norte…"
                    value={nombre}
                    onChange={(e) => { setNombre(e.target.value); setError('') }}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60"
                  />
                  {error && <p className="text-xs text-red-400">{error}</p>}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-sm font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-sm font-bold text-white transition-colors"
                  >
                    <Plus size={14} />
                    {status === 'loading' ? 'Creando…' : 'Crear zona'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
