import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params
  const path = slug.join('/')

  // Parse the path to determine page type
  let title = 'Lician'
  let subtitle = 'AI-Powered Stock Research'
  let ticker = ''
  let pageType = 'default'

  if (path.startsWith('stock/')) {
    ticker = path.replace('stock/', '').toUpperCase()
    title = `${ticker} Stock Analysis`
    subtitle = 'Real-time quotes, AI insights & valuations'
    pageType = 'stock'
  } else if (path.startsWith('should-i-buy/')) {
    ticker = path.replace('should-i-buy/', '').toUpperCase()
    title = `Should I Buy ${ticker}?`
    subtitle = 'AI-powered investment analysis'
    pageType = 'should-i-buy'
  } else if (path.startsWith('prediction/')) {
    ticker = path.replace('prediction/', '').toUpperCase()
    const year = new Date().getFullYear()
    title = `${ticker} Price Prediction ${year}`
    subtitle = 'Bull, Base & Bear case forecasts'
    pageType = 'prediction'
  } else if (path.startsWith('compare/')) {
    const slugPart = path.replace('compare/', '')
    const [t1, t2] = slugPart.split('-vs-').map(t => t.toUpperCase())
    title = `${t1} vs ${t2}`
    subtitle = 'Head-to-head stock comparison'
    pageType = 'compare'
  } else if (path.startsWith('best-stocks/')) {
    const category = path.replace('best-stocks/', '')
    title = `Best ${category.charAt(0).toUpperCase() + category.slice(1)} Stocks`
    subtitle = `Top picks for ${new Date().getFullYear()}`
    pageType = 'category'
  } else if (path.startsWith('stocks/')) {
    // Handle filter combo pages like stocks/dividend-technology
    const filters = path.replace('stocks/', '').split('-')
    const formatted = filters.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(' ')
    title = `Best ${formatted} Stocks`
    subtitle = `Curated picks for ${new Date().getFullYear()}`
    pageType = 'category'
  }

  // Color schemes based on page type
  const colors = {
    stock: { bg: '#0a0a0a', accent: '#22c55e', text: '#ffffff' },
    'should-i-buy': { bg: '#0a0a0a', accent: '#3b82f6', text: '#ffffff' },
    prediction: { bg: '#0a0a0a', accent: '#f59e0b', text: '#ffffff' },
    compare: { bg: '#0a0a0a', accent: '#8b5cf6', text: '#ffffff' },
    category: { bg: '#0a0a0a', accent: '#ec4899', text: '#ffffff' },
    default: { bg: '#0a0a0a', accent: '#22c55e', text: '#ffffff' },
  }

  const scheme = colors[pageType as keyof typeof colors] || colors.default

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: scheme.bg,
          backgroundImage: `radial-gradient(circle at 25% 25%, ${scheme.accent}15 0%, transparent 50%), radial-gradient(circle at 75% 75%, ${scheme.accent}10 0%, transparent 50%)`,
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              backgroundColor: scheme.accent,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}
          >
            <span style={{ fontSize: 32, fontWeight: 'bold', color: '#000' }}>L</span>
          </div>
          <span style={{ fontSize: 36, fontWeight: 'bold', color: scheme.text }}>Lician</span>
        </div>

        {/* Ticker badge if applicable */}
        {ticker && (
          <div
            style={{
              display: 'flex',
              padding: '12px 32px',
              backgroundColor: `${scheme.accent}20`,
              borderRadius: 50,
              border: `2px solid ${scheme.accent}40`,
              marginBottom: 24,
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 'bold', color: scheme.accent }}>{ticker}</span>
          </div>
        )}

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: 56,
            fontWeight: 'bold',
            color: scheme.text,
            textAlign: 'center',
            maxWidth: 900,
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            color: '#9ca3af',
            marginTop: 20,
            textAlign: 'center',
          }}
        >
          {subtitle}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: 40,
            alignItems: 'center',
            gap: 16,
          }}
        >
          <span style={{ fontSize: 20, color: '#6b7280' }}>lician.com</span>
          <div style={{ width: 4, height: 4, backgroundColor: '#6b7280', borderRadius: '50%' }} />
          <span style={{ fontSize: 20, color: scheme.accent }}>AI-Powered Research</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
