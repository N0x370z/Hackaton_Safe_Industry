'use client'

import { useState, useEffect, useCallback } from 'react'

const LS_KEY = 'safe_industry_dismissed_alerts'
const EXPIRY_MS = 2 * 60 * 1000 // 2 min — tras este tiempo la alerta reaparece si sigue activa
const SYNC_EVENT = 'dismissed-alerts-changed'

interface Entry { id: string; expiresAt: number }

function read(): Entry[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}

function write(entries: Entry[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(entries)) } catch {}
}

function active(entries: Entry[]): Entry[] {
  return entries.filter((e) => e.expiresAt > Date.now())
}

export function useDismissedAlerts() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  function sync() {
    const entries = active(read())
    write(entries) // limpia los expirados
    setDismissed(new Set(entries.map((e) => e.id)))
  }

  useEffect(() => {
    sync()
    const onEvent = () => sync()
    window.addEventListener(SYNC_EVENT, onEvent)
    // re-evalúa expiración cada 30s para que la alerta reaparezca sola
    const t = setInterval(sync, 30_000)
    return () => { window.removeEventListener(SYNC_EVENT, onEvent); clearInterval(t) }
  }, [])

  const dismiss = useCallback((id: string) => {
    const entries = active(read())
    if (!entries.find((e) => e.id === id)) {
      entries.push({ id, expiresAt: Date.now() + EXPIRY_MS })
    }
    write(entries)
    setDismissed(new Set(entries.map((e) => e.id)))
    window.dispatchEvent(new CustomEvent(SYNC_EVENT))
  }, [])

  const restore = useCallback(() => {
    write([])
    setDismissed(new Set())
    window.dispatchEvent(new CustomEvent(SYNC_EVENT))
  }, [])

  return { dismissed, dismiss, restore }
}
