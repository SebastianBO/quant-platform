// Hot stocks sitemap - Top 100 most traded stocks
// Updated frequently for maximum SEO value
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 1800 // 30 minutes for hot stocks

// Top 100 stocks by market cap / trading volume
const HOT_STOCKS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'UNH', 'JNJ',
  'V', 'XOM', 'WMT', 'JPM', 'MA', 'PG', 'HD', 'CVX', 'MRK', 'ABBV',
  'LLY', 'PEP', 'KO', 'COST', 'AVGO', 'TMO', 'MCD', 'CSCO', 'ACN', 'ABT',
  'DHR', 'NKE', 'ADBE', 'CRM', 'TXN', 'CMCSA', 'VZ', 'NEE', 'PM', 'INTC',
  'AMD', 'QCOM', 'HON', 'UNP', 'RTX', 'LOW', 'AMGN', 'IBM', 'CAT', 'BA',
  'GE', 'SBUX', 'INTU', 'DE', 'SPGI', 'GS', 'BLK', 'GILD', 'AXP', 'MDLZ',
  'ISRG', 'ADI', 'BKNG', 'SYK', 'REGN', 'VRTX', 'MMC', 'PLD', 'LRCX', 'ZTS',
  'PANW', 'C', 'ETN', 'SCHW', 'CI', 'CB', 'SO', 'MO', 'DUK', 'CME',
  'BDX', 'BSX', 'NOW', 'EQIX', 'AON', 'ITW', 'NOC', 'PNC', 'SHW', 'ICE',
  'SNOW', 'PLTR', 'CRWD', 'DDOG', 'NET', 'ZS', 'MDB', 'COIN', 'HOOD', 'SOFI'
]

export async function GET() {
  const today = new Date().toISOString().split('T')[0]
  const baseUrl = 'https://lician.com'

  const urls = HOT_STOCKS.map((ticker, index) => {
    // Top 20 get highest priority
    const priority = index < 20 ? 1.0 : index < 50 ? 0.9 : 0.8

    return `
  <url>
    <loc>${baseUrl}/stock/${ticker}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>${priority}</priority>
  </url>`
  }).join('')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, s-maxage=3600', // 30min cache, 1hr CDN
      'X-Sitemap-Tier': 'hot',
      'X-Sitemap-Generated': new Date().toISOString(),
    },
  })
}
