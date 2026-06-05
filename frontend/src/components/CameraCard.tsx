'use client'

import { useState } from 'react'
import { Camera, ScanLine, Bug, Rat, Trash2, ShieldAlert, ShieldCheck, RefreshCw, Sparkles } from 'lucide-react'
import { Zone } from '@/lib/types'
import { formatTime } from '@/lib/utils'

interface CameraCardProps {
  zone: Zone
  compact?: boolean
}

export function CameraCard({ zone, compact = false }: CameraCardProps) {
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState(zone.camera.analyzed)

  function handleAnalyze() {
    setAnalyzing(true)
    setTimeout(() => {
      setAnalyzing(false)
      setAnalyzed(true)
    }, 2200)
  }

  const cam = zone.camera

  return (
    <div className="flex flex-col gap-3">
      {/* Camera feed */}
      <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video border border-slate-700/60">
        {cam.imageUrl ? (
          <img
            src={cam.imageUrl}
            alt={`Cámara ${zone.name}`}
            className="w-full h-full object-cover opacity-75"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Camera size={32} className="text-slate-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/50 rounded px-2 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] text-white font-medium tracking-wide">EN VIVO</span>
        </div>
        {analyzing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 gap-2">
            <ScanLine size={28} className="text-orange-400 animate-bounce" />
            <p className="text-xs text-orange-300 font-semibold">Analizando imagen...</p>
          </div>
        )}
        {cam.lastAnalyzed && !analyzing && (
          <div className="absolute bottom-2 right-2 text-[9px] text-slate-400 bg-black/50 rounded px-1.5 py-0.5">
            Analizado {formatTime(cam.lastAnalyzed)}
          </div>
        )}
      </div>

      {/* Detection results */}
      {analyzed && !analyzing && (
        <div className="grid grid-cols-2 gap-2">
          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 border ${cam.pestsDetected ? 'border-red-500/40 bg-red-500/10' : 'border-slate-700 bg-slate-800/60'}`}>
            <span className={cam.pestsDetected ? 'text-red-400' : 'text-slate-400'}>
              {cam.pestType === 'roedor' ? <Rat size={14} /> : <Bug size={14} />}
            </span>
            <div>
              <p className="text-xs text-slate-400">Plagas</p>
              <p className={`text-sm font-semibold ${cam.pestsDetected ? 'text-red-300' : 'text-white'}`}>
                {cam.pestsDetected ? (cam.pestType === 'roedor' ? 'Roedor' : 'Insecto') : 'Ninguna'}
              </p>
            </div>
          </div>

          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 border ${cam.wasteLevel > 60 ? 'border-red-500/40 bg-red-500/10' : 'border-slate-700 bg-slate-800/60'}`}>
            <Trash2 size={14} className={cam.wasteLevel > 60 ? 'text-red-400' : 'text-slate-400'} />
            <div>
              <p className="text-xs text-slate-400">Residuos</p>
              <p className={`text-sm font-semibold ${cam.wasteLevel > 60 ? 'text-red-300' : 'text-white'}`}>{cam.wasteLevel}%</p>
            </div>
          </div>

          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 border ${cam.cleanlinessScore < 50 ? 'border-yellow-500/40 bg-yellow-500/10' : 'border-slate-700 bg-slate-800/60'}`}>
            <Sparkles size={14} className={cam.cleanlinessScore < 50 ? 'text-yellow-400' : 'text-slate-400'} />
            <div>
              <p className="text-xs text-slate-400">Limpieza</p>
              <p className={`text-sm font-semibold ${cam.cleanlinessScore < 50 ? 'text-yellow-300' : 'text-white'}`}>{cam.cleanlinessScore}%</p>
            </div>
          </div>

          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 border ${cam.structuralIssues ? 'border-red-500/40 bg-red-500/10' : 'border-slate-700 bg-slate-800/60'}`}>
            {cam.structuralIssues
              ? <ShieldAlert size={14} className="text-red-400" />
              : <ShieldCheck size={14} className="text-slate-400" />}
            <div>
              <p className="text-xs text-slate-400">Estructura</p>
              <p className={`text-sm font-semibold ${cam.structuralIssues ? 'text-red-300' : 'text-white'}`}>
                {cam.structuralIssues ? 'Daño' : 'OK'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer: confidence + analyze button */}
      <div className="flex items-center justify-between">
        {analyzed && !analyzing && (
          <span className="text-[10px] text-slate-500">Confianza IA: {cam.confidence}%</span>
        )}
        {!compact && (
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-medium hover:bg-orange-500/25 disabled:opacity-50 transition-all ml-auto"
          >
            <RefreshCw size={12} className={analyzing ? 'animate-spin' : ''} />
            {analyzing ? 'Analizando...' : analyzed ? 'Re-analizar' : 'Analizar zona'}
          </button>
        )}
      </div>
    </div>
  )
}
