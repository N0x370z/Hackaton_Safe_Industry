'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, MapPin, Plus, CheckCircle, WifiOff, UtensilsCrossed, Snowflake, Package, Warehouse, MoreHorizontal, Camera, Trash2, Sparkles } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const LS_KEY = 'plague_tracker_local_zones'

type ZonaType = 'cocina' | 'almacen_frio' | 'carga' | 'bodega' | 'otro'
type Status = 'idle' | 'loading' | 'success' | 'offline'

const ZONE_TYPES: { value: ZonaType; label: string; icon: React.ReactNode }[] = [
  { value: 'cocina',       label: 'Cocina',        icon: <UtensilsCrossed size={13} /> },
  { value: 'almacen_frio', label: 'Almacén Frío',  icon: <Snowflake size={13} /> },
  { value: 'carga',        label: 'Área de Carga', icon: <Package size={13} /> },
  { value: 'bodega',       label: 'Bodega',        icon: <Warehouse size={13} /> },
  { value: 'otro',         label: 'Otro',          icon: <MoreHorizontal size={13} /> },
]

const ZONE_IMAGES: Record<ZonaType, string> = {
  cocina:       'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=225&fit=crop',
  almacen_frio: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=225&fit=crop',
  carga:        'https://images.unsplash.com/photo-1553413077-190dd305871c?w=400&h=225&fit=crop',
  bodega:       'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=225&fit=crop',
  otro:         'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=225&fit=crop',
}

interface ZonaForm {
  nombre: string
  tipo: ZonaType
  cameraUrl: string
  umbralResiduos: string
  umbralLimpieza: string
}

interface Props {
  onClose: () => void
}

function saveLocalZone(form: ZonaForm): string {
  const id = `local-${crypto.randomUUID()}`
  const imageUrl = form.cameraUrl.trim() || ZONE_IMAGES[form.tipo]
  try {
    const existing = JSON.parse(localStorage.getItem(LS_KEY) || '[]')
    existing.push({ id, nombre: form.nombre, imageUrl, tipo: form.tipo, createdAt: new Date().toISOString() })
    localStorage.setItem(LS_KEY, JSON.stringify(existing))
  } catch {}
  return id
}

const inputClass = 'w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60'
const labelClass = 'text-xs text-slate-400 font-medium flex items-center gap-1.5 mb-1'

export function NewZoneDialog({ onClose }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<ZonaForm>({
    nombre: '',
    tipo: 'cocina',
    cameraUrl: '',
    umbralResiduos: '60',
    umbralLimpieza: '50',
  })
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  function set<K extends keyof ZonaForm>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((p) => ({ ...p, [key]: e.target.value }))
      if (key === 'nombre') setError('')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre.trim()) { setError('El nombre es obligatorio.'); return }
    setStatus('loading')

    const imageUrl = form.cameraUrl.trim() || ZONE_IMAGES[form.tipo]
    const payload = {
      nombre: form.nombre.trim(),
      tipo: form.tipo,
      camera_url: form.cameraUrl.trim() || null,
      umbral_residuos: parseInt(form.umbralResiduos) || 60,
      umbral_limpieza: parseInt(form.umbralLimpieza) || 50,
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
      const localId = saveLocalZone(form)
      setStatus('offline')
      setTimeout(() => { onClose(); router.push(`/dashboard/${localId}`) }, 1000)
    }
  }

  const isSettled = status === 'success' || status === 'offline'
  const previewImage = form.cameraUrl.trim() || ZONE_IMAGES[form.tipo]

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={isSettled ? undefined : onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl pointer-events-auto max-h-[90vh] flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60 shrink-0">
            <div>
              <h2 className="text-sm font-bold text-white">Nueva zona</h2>
              <p className="text-xs text-slate-500">Configura una zona de monitoreo con cámara</p>
            </div>
            {!isSettled && (
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 p-5">
            {status === 'success' && (
              <div className="flex flex-col items-center gap-3 py-10">
                <div className="p-3 rounded-full bg-green-500/10 text-green-400">
                  <CheckCircle size={28} />
                </div>
                <p className="text-sm font-semibold text-white">Zona creada</p>
                <p className="text-xs text-slate-500">Redirigiendo a la nueva zona…</p>
              </div>
            )}

            {status === 'offline' && (
              <div className="flex flex-col items-center gap-3 py-10">
                <div className="p-3 rounded-full bg-yellow-500/10 text-yellow-400">
                  <WifiOff size={28} />
                </div>
                <p className="text-sm font-semibold text-white">Guardada localmente</p>
                <p className="text-xs text-slate-500">Redirigiendo a la nueva zona…</p>
              </div>
            )}

            {(status === 'idle' || status === 'loading') && (
              <form id="new-zone-form" onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* Nombre */}
                <div>
                  <label className={labelClass}><MapPin size={12} /> Nombre de la zona</label>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Ej. Cocina Principal, Almacén Norte…"
                    value={form.nombre}
                    onChange={set('nombre')}
                    className={inputClass}
                  />
                  {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
                </div>

                {/* Tipo de zona */}
                <div>
                  <label className={labelClass}><Package size={12} /> Tipo de zona</label>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {ZONE_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, tipo: t.value }))}
                        className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border text-[11px] font-medium transition-all ${
                          form.tipo === t.value
                            ? 'border-orange-500/60 bg-orange-500/15 text-orange-300'
                            : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-600 hover:text-white'
                        }`}
                      >
                        {t.icon}
                        <span className="leading-tight text-center">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview de imagen */}
                <div className="relative rounded-xl overflow-hidden bg-slate-800 aspect-video border border-slate-700/60">
                  <img
                    src={previewImage}
                    alt="Vista previa"
                    className="w-full h-full object-cover opacity-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/50 rounded px-2 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] text-white font-medium">EN VIVO</span>
                  </div>
                  <div className="absolute bottom-2 left-2 text-[10px] text-slate-300 bg-black/50 rounded px-1.5 py-0.5">
                    Vista previa de cámara
                  </div>
                </div>

                {/* URL de cámara */}
                <div>
                  <label className={labelClass}><Camera size={12} /> URL de cámara <span className="text-slate-600 font-normal">(opcional)</span></label>
                  <input
                    type="text"
                    placeholder="rtsp://192.168.1.x/stream o URL de imagen"
                    value={form.cameraUrl}
                    onChange={set('cameraUrl')}
                    className={inputClass}
                  />
                  <p className="text-[10px] text-slate-600 mt-1">Si se deja vacío se usará la imagen predeterminada del tipo de zona.</p>
                </div>

                {/* Umbrales */}
                <div className="rounded-xl border border-slate-700/60 bg-slate-800/20 p-4 flex flex-col gap-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Umbrales de alerta</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}><Trash2 size={12} /> Residuos máx. (%)</label>
                      <input
                        type="number" min="10" max="100" step="5"
                        value={form.umbralResiduos}
                        onChange={set('umbralResiduos')}
                        className={inputClass}
                      />
                      <p className="text-[10px] text-slate-600 mt-1">Alerta si supera este nivel</p>
                    </div>
                    <div>
                      <label className={labelClass}><Sparkles size={12} /> Limpieza mín. (%)</label>
                      <input
                        type="number" min="10" max="100" step="5"
                        value={form.umbralLimpieza}
                        onChange={set('umbralLimpieza')}
                        className={inputClass}
                      />
                      <p className="text-[10px] text-slate-600 mt-1">Alerta si baja de este nivel</p>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Footer con botones */}
          {(status === 'idle' || status === 'loading') && (
            <div className="flex gap-2 px-5 py-4 border-t border-slate-700/60 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="new-zone-form"
                disabled={status === 'loading'}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-sm font-bold text-white transition-colors"
              >
                <Plus size={14} />
                {status === 'loading' ? 'Creando…' : 'Crear zona'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
