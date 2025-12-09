"use client"

import { useState, useEffect } from "react"
import { Moon, Sun, Clock } from "lucide-react"

interface ExtendedHoursPriceProps {
  ticker: string
  currentPrice: number
  previousClose: number
}

interface ExtendedData {
  price: number
  change: number
  changePercent: number
  timestamp: string
  session: 'premarket' | 'regular' | 'afterhours' | 'overnight' | 'closed'
}

export default function ExtendedHoursPrice({
  ticker,
  currentPrice,
  previousClose
}: ExtendedHoursPriceProps) {
  const [extendedData, setExtendedData] = useState<ExtendedData | null>(null)

  useEffect(() => {
    fetchExtendedHours()
    const interval = setInterval(fetchExtendedHours, 30000) // Update every 30s
    return () => clearInterval(interval)
  }, [ticker])

  const fetchExtendedHours = async () => {
    try {
      // Determine market session
      const now = new Date()
      const nyTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
      const hour = nyTime.getHours()
      const minute = nyTime.getMinutes()
      const day = nyTime.getDay()

      let session: ExtendedData['session'] = 'closed'

      if (day >= 1 && day <= 5) {
        if (hour >= 4 && (hour < 9 || (hour === 9 && minute < 30))) {
          session = 'premarket'
        } else if ((hour === 9 && minute >= 30) || (hour >= 10 && hour < 16)) {
          session = 'regular'
        } else if (hour >= 16 && hour < 20) {
          session = 'afterhours'
        } else if (hour >= 20 || hour < 4) {
          session = 'overnight'
        }
      } else {
        session = 'overnight'
      }

      // For extended hours, we'll show the change from close
      const change = currentPrice - previousClose
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0

      setExtendedData({
        price: currentPrice,
        change,
        changePercent,
        timestamp: nyTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit'
        }),
        session
      })
    } catch (error) {
      console.error('Error fetching extended hours:', error)
    }
  }

  if (!extendedData) return null

  const isPositive = extendedData.change >= 0
  const sessionLabels = {
    premarket: { label: 'Pre-market', icon: Sun, color: 'text-yellow-500' },
    regular: { label: 'Market open', icon: Clock, color: 'text-green-500' },
    afterhours: { label: 'After-hours', icon: Moon, color: 'text-blue-500' },
    overnight: { label: 'Overnight', icon: Moon, color: 'text-purple-500' },
    closed: { label: 'Market closed', icon: Moon, color: 'text-muted-foreground' }
  }

  const sessionInfo = sessionLabels[extendedData.session]
  const SessionIcon = sessionInfo.icon

  // Only show extended hours section if not in regular hours
  if (extendedData.session === 'regular') return null

  return (
    <div className="flex items-center gap-4 text-sm">
      {/* Regular close price */}
      <div>
        <span className="text-2xl font-bold tabular-nums">
          {currentPrice.toFixed(2)}
        </span>
        <div className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          <span>
            {isPositive ? '+' : ''}{extendedData.change.toFixed(2)} ({isPositive ? '+' : ''}{extendedData.changePercent.toFixed(2)}%)
          </span>
        </div>
        <p className="text-xs text-muted-foreground">At close</p>
      </div>

      {/* Extended hours price */}
      {extendedData.session !== 'closed' && (
        <div className="border-l border-border pl-4">
          <div className="flex items-center gap-2 mb-1">
            <SessionIcon className={`w-4 h-4 ${sessionInfo.color}`} />
            <span className={`text-xs ${sessionInfo.color}`}>{sessionInfo.label}</span>
          </div>
          <span className="text-xl font-bold tabular-nums">
            {extendedData.price.toFixed(2)}
          </span>
          <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            <span>
              {isPositive ? '+' : ''}{extendedData.change.toFixed(2)} ({isPositive ? '+' : ''}{extendedData.changePercent.toFixed(2)}%)
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{extendedData.timestamp} EST</p>
        </div>
      )}
    </div>
  )
}
