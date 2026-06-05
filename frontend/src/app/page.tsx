import Link from 'next/link'
import { Shield, Activity, Bell, ClipboardList, ArrowRight } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-700/60 px-6 h-14 flex items-center">
        <div className="flex items-center gap-2">
          <Shield size={20} className="text-orange-400" />
          <span className="font-bold text-white">SafeIndustry</span>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-8">
        <div className="flex flex-col items-center gap-4 max-w-xl">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
            <Shield size={32} className="text-orange-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            SafeIndustry
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Sistema de detección temprana y gestión predictiva de fauna nociva para la industria alimentaria.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
          {[
            { icon: <Activity size={18} />, title: 'Monitoreo en tiempo real', desc: 'Sensores por zona del establecimiento' },
            { icon: <Bell size={18} />, title: 'Alertas predictivas', desc: 'Detecta riesgos antes de que escalen' },
            { icon: <ClipboardList size={18} />, title: 'Reporte de incidencias', desc: 'Documenta lo que observas en campo' },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4 text-left flex flex-col gap-2">
              <span className="text-orange-400">{f.icon}</span>
              <p className="text-sm font-semibold text-white">{f.title}</p>
              <p className="text-xs text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>

        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 font-bold text-white transition-colors text-sm"
        >
          Ir al Dashboard <ArrowRight size={16} />
        </Link>
      </main>

      <footer className="text-center text-xs text-slate-600 py-4">
        Hackathon Safe Industry 2026
      </footer>
    </div>
  )
}
