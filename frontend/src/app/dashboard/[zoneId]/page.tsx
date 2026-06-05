'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useDashboard } from '@/hooks/useDashboard'
import { ZoneSection } from '@/components/ZoneSection'

export default function ZoneDetailPage() {
  const { zoneId } = useParams<{ zoneId: string }>()
  const { data } = useDashboard()

  const zone = data.zones.find((z) => z.id === zoneId)

  if (!zone) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
        <p className="text-sm">Zona no encontrada</p>
        <Link href="/dashboard" className="text-orange-400 text-xs hover:underline">← Volver al dashboard</Link>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-6">
      {/* Back */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors w-fit"
      >
        <ArrowLeft size={16} /> Volver al dashboard
      </Link>

      {/* Sección completa de la zona */}
      <ZoneSection zone={zone} />
    </div>
  )
}
