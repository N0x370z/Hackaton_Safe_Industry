'use client'

import { RiskLevel } from '@/lib/types'
import { getRiskColor, getRiskLabel } from '@/lib/utils'

interface RiskGaugeProps {
  score: number
  level: RiskLevel
  size?: number
}

export function RiskGauge({ score, level, size = 120 }: RiskGaugeProps) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  // Only fill 75% of circle (270 degrees) for the arc gauge look
  const arcLength = circumference * 0.75
  const filled = arcLength * (score / 100)
  const color = getRiskColor(level)

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-[135deg]">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth={10}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div className="flex flex-col items-center -mt-2">
        <span className="text-2xl font-bold text-white">{score}</span>
        <span className="text-xs font-medium" style={{ color }}>{getRiskLabel(level)}</span>
      </div>
    </div>
  )
}
