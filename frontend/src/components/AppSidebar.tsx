'use client'

import { useState } from 'react'
import { Shield, LayoutDashboard, Bell, ClipboardList, Bug, Rat, Trash2, ShieldAlert, Wind, MoreHorizontal, Send, Wifi, WifiOff, ChevronDown } from 'lucide-react'
import { Zone, ReportType, ReportPayload } from '@/lib/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const REPORT_TYPES: { value: ReportType; label: string; icon: React.ReactNode }[] = [
  { value: 'insecto_avistado', label: 'Insecto avistado', icon: <Bug size={13} /> },
  { value: 'roedor_avistado', label: 'Roedor avistado', icon: <Rat size={13} /> },
  { value: 'residuos_acumulados', label: 'Residuos acumulados', icon: <Trash2 size={13} /> },
  { value: 'dano_estructural', label: 'Daño estructural', icon: <ShieldAlert size={13} /> },
  { value: 'mal_olor', label: 'Mal olor', icon: <Wind size={13} /> },
  { value: 'otro', label: 'Otro', icon: <MoreHorizontal size={13} /> },
]

type NavSection = 'dashboard' | 'alertas' | 'reporte'
type Status = 'idle' | 'loading' | 'success' | 'error'

interface AppSidebarProps {
  zones: Zone[]
  alertCount: number
  connected: boolean
  activeSection: NavSection
  onNavChange: (s: NavSection) => void
}

export function AppSidebar({ zones, alertCount, connected, activeSection, onNavChange }: AppSidebarProps) {
  const [reportOpen, setReportOpen] = useState(false)
  const [selectedZoneId, setSelectedZoneId] = useState(zones[0]?.id ?? '')
  const [type, setType] = useState<ReportType>('insecto_avistado')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  const selectedZone = zones.find((z) => z.id === selectedZoneId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedZone) return
    setStatus('loading')
    const payload: ReportPayload = { zoneId: selectedZone.id, zoneName: selectedZone.name, type, description }
    try {
      const res = await fetch(`${API_URL}/api/reports/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      setDescription('')
      setTimeout(() => setStatus('idle'), 2000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 2000)
    }
  }

  const navItems: { id: NavSection; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { id: 'alertas', label: 'Alertas', icon: <Bell size={16} />, badge: alertCount },
  ]

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col border-r border-slate-700/60 bg-slate-900 overflow-y-auto">
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 h-14 border-b border-slate-700/60 shrink-0">
        <Shield size={18} className="text-orange-400" />
        <span className="font-bold text-white">SafeIndustry</span>
      </div>

      <div className="flex flex-col gap-6 p-4 flex-1">
        {/* Nav */}
        <nav className="flex flex-col gap-1">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider px-2 mb-1">Navegación</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeSection === item.id
                  ? 'bg-orange-500/15 text-orange-300 border border-orange-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2.5">{item.icon}{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="text-[10px] font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Quick Report */}
        <div className="flex flex-col gap-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider px-2">Acciones rápidas</p>

          <button
            onClick={() => setReportOpen(!reportOpen)}
            className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-orange-500/40 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20 text-sm font-semibold transition-all"
          >
            <span className="flex items-center gap-2"><ClipboardList size={15} />Nuevo reporte</span>
            <ChevronDown size={14} className={`transition-transform ${reportOpen ? 'rotate-180' : ''}`} />
          </button>

          {reportOpen && (
            <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-3 flex flex-col gap-3">
              {status === 'success' ? (
                <p className="text-xs text-green-400 text-center py-3">✓ Reporte enviado</p>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  {/* Zone selector */}
                  <div>
                    <p className="text-[10px] text-slate-400 mb-1.5">Zona</p>
                    <div className="relative">
                      <select
                        value={selectedZoneId}
                        onChange={(e) => setSelectedZoneId(e.target.value)}
                        className="w-full appearance-none rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500/60"
                      >
                        {zones.map((z) => (
                          <option key={z.id} value={z.id}>{z.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <p className="text-[10px] text-slate-400 mb-1.5">Tipo de incidencia</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {REPORT_TYPES.map((rt) => (
                        <button
                          key={rt.value}
                          type="button"
                          onClick={() => setType(rt.value)}
                          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-[11px] transition-all ${
                            type === rt.value
                              ? 'border-orange-500/60 bg-orange-500/15 text-orange-300'
                              : 'border-slate-600 bg-slate-700/40 text-slate-400 hover:border-slate-500'
                          }`}
                        >
                          {rt.icon}{rt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe lo que observaste..."
                    rows={3}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60 resize-none"
                  />

                  {status === 'error' && <p className="text-[11px] text-red-400">Error al enviar.</p>}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-50 py-2 text-xs font-bold text-white transition-colors"
                  >
                    <Send size={12} />
                    {status === 'loading' ? 'Enviando...' : 'Enviar'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-700/60 shrink-0">
        <div className={`flex items-center gap-2 text-xs ${connected ? 'text-green-400' : 'text-slate-500'}`}>
          {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
          {connected ? 'Conectado al backend' : 'Usando datos simulados'}
        </div>
      </div>
    </aside>
  )
}
