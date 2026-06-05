'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bug, LayoutDashboard, Bell, ClipboardList, Menu, X, Wifi, WifiOff, Plus } from 'lucide-react'
import { useDashboard } from '@/hooks/useDashboard'
import { useDismissedAlerts } from '@/hooks/useDismissedAlerts'
import { NewZoneDialog } from '@/components/NewZoneDialog'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [reportCount, setReportCount] = useState(0)
  const pathname = usePathname()
  const { data, connected } = useDashboard()
  const { dismissed } = useDismissedAlerts()

  useEffect(() => {
    function syncCount() {
      try {
        setReportCount(JSON.parse(localStorage.getItem('safe_industry_reports') || '[]').length)
      } catch {}
    }
    syncCount()
    window.addEventListener('storage', syncCount)
    // Polled porque storage event no dispara en la misma pestaña
    const t = setInterval(syncCount, 3000)
    return () => { window.removeEventListener('storage', syncCount); clearInterval(t) }
  }, [])

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} />, exact: true },
    { href: '/dashboard/alertas', label: 'Alertas', icon: <Bell size={16} />, badge: data.alerts.filter((a) => !dismissed.has(a.id)).length },
    { href: '/dashboard/reportes', label: 'Reportes', icon: <ClipboardList size={16} />, badge: reportCount, exact: false },
  ]

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
      {/* Overlay móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col
          border-r border-slate-700/60 bg-slate-900
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-slate-700/60 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <Bug size={18} className="text-orange-400" />
            <span className="font-bold text-white">PlagueTracker</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-6 p-4 flex-1 overflow-y-auto">
          {/* Nav */}
          <nav className="flex flex-col gap-1">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider px-2 mb-1">Navegación</p>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive(item.href, item.exact ?? false)
                    ? 'bg-orange-500/15 text-orange-300 border border-orange-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center gap-2.5">{item.icon}{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span className={`text-[10px] font-bold text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center ${item.href.includes('reportes') ? 'bg-orange-500' : 'bg-red-500'}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Zonas */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between px-2 mb-1">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Zonas</p>
              <button
                onClick={() => { setSidebarOpen(false); setDialogOpen(true) }}
                className="flex items-center gap-0.5 text-[10px] font-semibold text-orange-400 hover:text-orange-300 transition-colors"
                title="Añadir zona"
              >
                <Plus size={12} /> Nueva
              </button>
            </div>
            {data.zones.map((zone) => (
              <Link
                key={zone.id}
                href={`/dashboard/${zone.id}`}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  pathname === `/dashboard/${zone.id}`
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="truncate">{zone.name}</span>
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      zone.riskLevel === 'critical' ? '#ef4444'
                      : zone.riskLevel === 'high' ? '#f97316'
                      : zone.riskLevel === 'medium' ? '#eab308'
                      : '#22c55e',
                  }}
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-700/60 shrink-0">
          <div className={`flex items-center gap-2 text-xs ${connected ? 'text-green-400' : 'text-slate-500'}`}>
            {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
            {connected ? 'Conectado' : 'Datos simulados'}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar móvil */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-slate-700/60 lg:hidden shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Bug size={16} className="text-orange-400" />
            <span className="font-bold text-sm">PlagueTracker</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>

      {dialogOpen && <NewZoneDialog onClose={() => setDialogOpen(false)} />}
    </div>
  )
}
