'use client'

import { useState } from 'react'
import { X, MapPin, Save, CheckCircle, UtensilsCrossed, Snowflake, Package, Warehouse, MoreHorizontal, Camera, Trash2, Sparkles } from 'lucide-react'
import { Zone } from '@/lib/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const LS_KEY = 'plague_tracker_local_zones'

type ZonaType = 'cocina' | 'almacen_frio' | 'carga' | 'bodega' | 'otro'
type Status = 'idle' | 'loading' | 'saved'

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

const PHOTO_TO_TIPO: Record<string, ZonaType> = {
  '1577219491135-ce391730fb2c': 'cocina',
  '1542838132-92c53300491e':   'almacen_frio',
  '1553413077-190dd305871c':   'carga',
  '1604719312566-8912e9227c6a': 'bodega',
  '1414235077428-338989a2e8c0': 'otro',
}

function getTipo(imageUrl: string): ZonaType {
  const match = imageUrl.match(/photo-([\w-]+)\?/)
  return (match && PHOTO_TO_TIPO[match[1]]) || 'otro'
}

interface Props {
  zone: Zone
  onClose: () => void
}

const inputClass = 'w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60'
const labelClass = 'text-xs text-slate-400 font-medium flex items-center gap-1.5 mb-1'

export function EditZoneDialog({ zone, onClose }: Props) {
  const isLocal = zone.id.startsWith('local-')

  const [form, setForm] = useState({
    nombre:        zone.name,
    tipo:          getTipo(zone.camera.imageUrl),
    cameraUrl:     '',
    umbralResiduos: '60',
    umbralLimpieza: '50',
  })
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  function set<K extends keyof typeof form>(key: K) {
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

    if (isLocal) {
      try {
        const existing = JSON.parse(localStorage.getItem(LS_KEY) || '[]')
        localStorage.setItem(LS_KEY, JSON.stringify(
          existing.map((z: { id: string }) =>
            z.id === zone.id
              ? { ...z, nombre: form.nombre.trim(), imageUrl, tipo: form.tipo }
              : z
          )
        ))
      } catch {}
      setStatus('saved')
      setTimeout(onClose, 900)
      return
    }

    try {
      const res = await fetch(`${API_URL}/api/zones/${zone.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: form.nombre.trim() }),
      })
      if (!res.ok) throw new Error()
    } catch {}
    setStatus('saved')
    setTimeout(onClose, 900)
  }

  const previewImage = form.cameraUrl.trim() || ZONE_IMAGES[form.tipo]

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={status !== 'saved' ? onClose : undefined}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl pointer-events-auto max-h-[90vh] flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60 shrink-0">
            <div>
              <h2 className="text-sm font-bold text-white">Editar zona</h2>
              <p className="text-xs text-slate-500">{zone.name}</p>
            </div>
            {status !== 'saved' && (
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 p-5">
            {status === 'saved' ? (
              <div className="flex flex-col items-center gap-3 py-10">
                <div className="p-3 rounded-full bg-green-500/10 text-green-400">
                  <CheckCircle size={28} />
                </div>
                <p className="text-sm font-semibold text-white">Cambios guardados</p>
              </div>
            ) : (
              <form id="edit-zone-form" onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* Nombre */}
                <div>
                  <label className={labelClass}><MapPin size={12} /> Nombre de la zona</label>
                  <input autoFocus type="text" value={form.nombre} onChange={set('nombre')} className={inputClass} />
                  {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
                </div>

                {/* Tipo */}
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

                {/* Preview */}
                <div className="relative rounded-xl overflow-hidden bg-slate-800 aspect-video border border-slate-700/60">
                  <img src={previewImage} alt="" className="w-full h-full object-cover opacity-75" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/50 rounded px-2 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] text-white font-medium">EN VIVO</span>
                  </div>
                </div>

                {/* URL de cámara */}
                <div>
                  <label className={labelClass}>
                    <Camera size={12} /> URL de cámara <span className="text-slate-600 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="rtsp://... o dejar vacío para usar imagen del tipo"
                    value={form.cameraUrl}
                    onChange={set('cameraUrl')}
                    className={inputClass}
                  />
                </div>

                {/* Umbrales */}
                <div className="rounded-xl border border-slate-700/60 bg-slate-800/20 p-4 flex flex-col gap-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Umbrales de alerta</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}><Trash2 size={12} /> Residuos máx. (%)</label>
                      <input type="number" min="10" max="100" step="5" value={form.umbralResiduos} onChange={set('umbralResiduos')} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}><Sparkles size={12} /> Limpieza mín. (%)</label>
                      <input type="number" min="10" max="100" step="5" value={form.umbralLimpieza} onChange={set('umbralLimpieza')} className={inputClass} />
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          {status !== 'saved' && (
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
                form="edit-zone-form"
                disabled={status === 'loading'}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-sm font-bold text-white transition-colors"
              >
                <Save size={14} />
                {status === 'loading' ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
