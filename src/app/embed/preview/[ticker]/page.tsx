'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

interface StockData {
  ticker: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  error?: string
}

export default function WidgetPreview() {
  const params = useParams()
  const searchParams = useSearchParams()
  const ticker = params.ticker as string
  const theme = searchParams.get('theme') || 'light'

  const [data, setData] = useState<StockData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/embed/stock?ticker=${ticker}`)
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [ticker])

  const isDark = theme === 'dark'
  const bgColor = isDark ? '#1a1a2e' : '#ffffff'
  const textColor = isDark ? '#ffffff' : '#1a1a2e'
  const subTextColor = isDark ? '#888888' : '#666666'
  const borderColor = isDark ? '#333333' : '#e5e5e5'

  if (loading) {
    return (
      <div style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: bgColor,
        color: textColor,
        padding: '16px',
        borderRadius: '8px',
        border: `1px solid ${borderColor}`,
        minHeight: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        Loading {ticker}...
      </div>
    )
  }

  if (data?.error || !data) {
    return (
      <div style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: bgColor,
        color: '#e74c3c',
        padding: '16px',
        borderRadius: '8px',
        border: `1px solid ${borderColor}`,
        textAlign: 'center',
      }}>
        Ticker not found
      </div>
    )
  }

  const changeColor = data.change >= 0 ? '#10b981' : '#ef4444'
  const changePrefix = data.change >= 0 ? '+' : ''

  const formatNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
    return num.toString()
  }

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: bgColor,
      color: textColor,
      padding: '16px',
      borderRadius: '8px',
      border: `1px solid ${borderColor}`,
      boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 700 }}>{data.ticker}</div>
          <div style={{ fontSize: '12px', opacity: 0.7, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {data.name}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '20px', fontWeight: 700 }}>
            ${data.price?.toFixed(2) || 'N/A'}
          </div>
          <div style={{ fontSize: '13px', color: changeColor, fontWeight: 600 }}>
            {changePrefix}{data.changePercent?.toFixed(2) || '0.00'}%
          </div>
        </div>
      </div>

      {data.volume && (
        <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '8px' }}>
          Vol: {formatNumber(data.volume)}
        </div>
      )}

      <a
        href={`https://lician.com/stock/${data.ticker}`}
        target="_blank"
        rel="noopener"
        style={{
          display: 'block',
          textAlign: 'right',
          fontSize: '10px',
          color: subTextColor,
          textDecoration: 'none',
          marginTop: '8px',
        }}
      >
        Powered by <span style={{ color: isDark ? '#60a5fa' : '#3b82f6', fontWeight: 600 }}>Lician</span>
      </a>
    </div>
  )
}
