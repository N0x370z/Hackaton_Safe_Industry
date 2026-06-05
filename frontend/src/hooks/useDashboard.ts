'use client'

import { useState, useEffect } from 'react'
import { DashboardData, Zone } from '@/lib/types'
import { generateMockData } from '@/lib/mockData'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const POLL_INTERVAL = 5000

export function useDashboard() {
  const [data, setData] = useState<DashboardData>(generateMockData())
  const [connected, setConnected] = useState(false)
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch(`${API_URL}/api/dashboard/`)
        if (!res.ok) throw new Error('bad response')
        const json: DashboardData = await res.json()
        setData(json)
        setConnected(true)
      } catch {
        setConnected(false)
        setData(generateMockData())
      }
    }

    fetchDashboard()
    const interval = setInterval(fetchDashboard, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  return { data, connected, selectedZone, setSelectedZone }
}
