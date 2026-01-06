// Hot stocks sitemap - Database-driven from Supabase
// Fetches from seo_stock_pages table via edge function
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 1800 // 30 minutes for hot stocks

const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET() {
  const today = new Date().toISOString().split('T')[0]
  const baseUrl = 'https://lician.com'

  try {
    // Try to fetch from Supabase edge function
    const response = await fetch(
      'https://wcckhqxkmhyzfpynthte.supabase.co/functions/v1/dynamic-sitemap?tier=hot',
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Disable cache for now
      }
    )

    if (response.ok) {
      let sitemap = await response.text()

      // Transform URLs from portfoliocare format to quant-platform format
      // www.lician.com/stocks/AAPL -> lician.com/stock/aapl (lowercase for canonical consistency)
      sitemap = sitemap.replace(/https:\/\/www\.lician\.com\/stocks\/([A-Z0-9.-]+)/gi, (_, ticker) =>
        `${baseUrl}/stock/${ticker.toLowerCase()}`
      )
      sitemap = sitemap.replace(/\/analysis<\/loc>/g, '</loc>') // Remove /analysis suffix
      sitemap = sitemap.replace(/\/chart<\/loc>/g, '</loc>') // Remove /chart suffix

      // Update stale lastmod dates to today - critical for Google crawl prioritization
      sitemap = sitemap.replace(/<lastmod>[^<]+<\/lastmod>/g, `<lastmod>${today}</lastmod>`)

      // Remove duplicate URLs after transformation
      const urlRegex = /<url>[\s\S]*?<\/url>/g
      const urls = sitemap.match(urlRegex) || []
      const uniqueUrls = [...new Set(urls)]

      const cleanSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls.join('\n')}
</urlset>`

      return new NextResponse(cleanSitemap, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=1800, s-maxage=3600',
          'X-Sitemap-Tier': 'hot',
          'X-Sitemap-Source': 'supabase-edge',
          'X-Sitemap-Generated': new Date().toISOString(),
        },
      })
    }
  } catch (error) {
    console.error('Failed to fetch from edge function:', error)
  }

  // Fallback to hardcoded list if edge function fails
  const HOT_STOCKS = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'UNH', 'JNJ',
    'V', 'XOM', 'WMT', 'JPM', 'MA', 'PG', 'HD', 'CVX', 'MRK', 'ABBV',
    'LLY', 'PEP', 'KO', 'COST', 'AVGO', 'TMO', 'MCD', 'CSCO', 'ACN', 'ABT',
    'DHR', 'NKE', 'ADBE', 'CRM', 'TXN', 'CMCSA', 'VZ', 'NEE', 'PM', 'INTC',
    'AMD', 'QCOM', 'HON', 'UNP', 'RTX', 'LOW', 'AMGN', 'IBM', 'CAT', 'BA',
  ]

  const urls = HOT_STOCKS.map((ticker, index) => {
    const priority = index < 20 ? 1.0 : index < 50 ? 0.9 : 0.8
    return `
  <url>
    <loc>${baseUrl}/stock/${ticker.toLowerCase()}</loc>
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
      'Cache-Control': 'public, max-age=1800, s-maxage=3600',
      'X-Sitemap-Tier': 'hot',
      'X-Sitemap-Source': 'fallback',
      'X-Sitemap-Generated': new Date().toISOString(),
    },
  })
}
