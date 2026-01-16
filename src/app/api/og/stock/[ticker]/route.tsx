import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { logger } from '@/lib/logger'

export const runtime = 'edge'

// Cache for 1 hour
export const revalidate = 3600

interface StockData {
  price?: number
  change?: number
  changePercent?: number
  companyName?: string
  sector?: string
  licianScore?: number
}

async function getStockData(ticker: string): Promise<StockData> {
  try {
    // Use internal API to get stock data
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    const response = await fetch(`${baseUrl}/api/stock?ticker=${ticker}`, {
      next: { revalidate: 3600 }
    })

    if (!response.ok) return {}

    const data = await response.json()

    return {
      price: data.snapshot?.price,
      change: data.snapshot?.day_change,
      changePercent: data.snapshot?.day_change_percent,
      companyName: data.companyFacts?.name,
      sector: data.companyFacts?.sector || data.snapshot?.sector,
      licianScore: undefined, // Would need to fetch from score API
    }
  } catch (error) {
    logger.error('Error fetching stock data for OG', { error: error instanceof Error ? error.message : 'Unknown' })
    return {}
  }
}

function getScoreColor(score: number): string {
  if (score >= 8) return '#10b981' // emerald
  if (score >= 6) return '#3b82f6' // blue
  if (score >= 4) return '#eab308' // yellow
  return '#ef4444' // red
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params
  const tickerUpper = ticker.toUpperCase()

  // Get stock data
  const stockData = await getStockData(tickerUpper)

  const price = stockData.price?.toFixed(2) || '—'
  const change = stockData.change || 0
  const changePercent = stockData.changePercent || 0
  const isPositive = change >= 0
  const companyName = stockData.companyName || tickerUpper
  const sector = stockData.sector || 'Stock'

  // Simulated Lician Score (in production, fetch from API)
  const licianScore = stockData.licianScore || 7.2

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0a0a0a',
          padding: 60,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Top bar with Lician branding */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                backgroundColor: '#10b981',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: 20,
              }}
            >
              L
            </div>
            <span style={{ color: '#71717a', fontSize: 24 }}>lician.com</span>
          </div>

          {/* Lician Score Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 20px',
              backgroundColor: `${getScoreColor(licianScore)}20`,
              borderRadius: 12,
              border: `2px solid ${getScoreColor(licianScore)}40`,
            }}
          >
            <span style={{ color: '#a1a1aa', fontSize: 18 }}>Lician Score</span>
            <span
              style={{
                color: getScoreColor(licianScore),
                fontSize: 28,
                fontWeight: 'bold',
              }}
            >
              {licianScore.toFixed(1)}
            </span>
            <span style={{ color: '#52525b', fontSize: 18 }}>/10</span>
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {/* Ticker and Company Name */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
              <span
                style={{
                  fontSize: 72,
                  fontWeight: 'bold',
                  color: 'white',
                  letterSpacing: '-0.02em',
                }}
              >
                {tickerUpper}
              </span>
              <span
                style={{
                  fontSize: 24,
                  color: '#71717a',
                }}
              >
                {sector}
              </span>
            </div>

            <span
              style={{
                fontSize: 28,
                color: '#a1a1aa',
                marginTop: 8,
                marginBottom: 32,
              }}
            >
              {companyName}
            </span>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
              <span
                style={{
                  fontSize: 64,
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                ${price}
              </span>

              {/* Change */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  backgroundColor: isPositive ? '#10b98120' : '#ef444420',
                  borderRadius: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 'bold',
                    color: isPositive ? '#10b981' : '#ef4444',
                  }}
                >
                  {isPositive ? '+' : ''}{change.toFixed(2)}
                </span>
                <span
                  style={{
                    fontSize: 24,
                    color: isPositive ? '#10b981' : '#ef4444',
                  }}
                >
                  ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Right side - Mini snowflake visualization */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 200,
            }}
          >
            {/* Simple score visualization */}
            <div
              style={{
                width: 160,
                height: 160,
                borderRadius: '50%',
                border: `6px solid ${getScoreColor(licianScore)}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: `${getScoreColor(licianScore)}10`,
              }}
            >
              <span
                style={{
                  fontSize: 48,
                  fontWeight: 'bold',
                  color: getScoreColor(licianScore),
                }}
              >
                {licianScore.toFixed(1)}
              </span>
              <span style={{ fontSize: 16, color: '#71717a' }}>
                out of 10
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 40,
            paddingTop: 24,
            borderTop: '1px solid #27272a',
          }}
        >
          <span style={{ color: '#52525b', fontSize: 18 }}>
            AI-Powered Stock Analysis • Real-Time Data • Free
          </span>
          <span style={{ color: '#71717a', fontSize: 18 }}>
            Updated {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
