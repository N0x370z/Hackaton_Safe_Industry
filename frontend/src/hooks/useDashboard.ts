'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardData, Zone } from '@/lib/types'
import { generateMockData } from '@/lib/mockData'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'

export function useDashboard() {
  const [data, setData] = useState<DashboardData>(generateMockData())
  const [connected, setConnected] = useState(false)
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)

  const connectWebSocket = useCallback(() => {
    try {
      const ws = new WebSocket(`${WS_URL}/ws/dashboard`)

      ws.onopen = () => setConnected(true)

      ws.onmessage = (event) => {
        const incoming: DashboardData = JSON.parse(event.data)
        setData(incoming)
      }

      ws.onclose = () => {
        setConnected(false)
        // reconnect after 3s
        setTimeout(connectWebSocket, 3000)
      }

      ws.onerror = () => ws.close()

      return ws
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    const ws = connectWebSocket()

    // Simulate live updates with mock data when backend is not available
    const interval = setInterval(() => {
      if (!connected) {
        setData(generateMockData())
      }
    }, 4000)

    return () => {
      ws?.close()
      clearInterval(interval)
    }
  }, [connectWebSocket, connected])

  return { data, connected, selectedZone, setSelectedZone }
}
