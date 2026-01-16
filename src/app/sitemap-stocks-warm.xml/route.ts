// Warm stocks sitemap - Database-driven from Supabase
// Fetches next 90K stocks after hot tier (paginated)
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // 1 hour for warm stocks

const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')

  const today = new Date().toISOString().split('T')[0]
  const baseUrl = 'https://lician.com'

  try {
    // Fetch from Supabase edge function - warm tier
    // Add timestamp to bust cache during development
    const response = await fetch(
      `https://wcckhqxkmhyzfpynthte.supabase.co/functions/v1/dynamic-sitemap?tier=warm&page=${page}`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Disable cache for now
      }
    )

    logger.debug('Warm tier fetch response', { status: response.status })

    if (response.ok) {
      let sitemap = await response.text()
      logger.debug('Warm sitemap raw response', { length: sitemap.length })

      // Transform URLs from portfoliocare format to quant-platform format (lowercase for canonical consistency)
      sitemap = sitemap.replace(/https:\/\/www\.lician\.com\/stocks\/([A-Z0-9.-]+)/gi, (_, ticker) =>
        `${baseUrl}/stock/${ticker.toLowerCase()}`
      )
      logger.debug('Transformed sitemap', { preview: sitemap.substring(0, 200) })

      // Extract unique stock symbols (letters, numbers, dots, hyphens) and normalize to lowercase
      const stockMatches = sitemap.match(/\/stock\/([A-Za-z0-9._-]+)/g) || []
      const uniqueStocks = [...new Set(stockMatches.map(m => m.replace('/stock/', '').toLowerCase()))]
      logger.debug('Warm sitemap extracted stocks', { matchCount: stockMatches.length, uniqueCount: uniqueStocks.length })

      const urls = uniqueStocks.map(ticker => `
  <url>
    <loc>${baseUrl}/stock/${ticker}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`).join('')

      const cleanSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`

      return new NextResponse(cleanSitemap, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=7200',
          'X-Sitemap-Tier': 'warm',
          'X-Sitemap-Page': page.toString(),
          'X-Sitemap-Source': 'supabase-edge',
          'X-URL-Count': uniqueStocks.length.toString(),
          'X-Sitemap-Generated': new Date().toISOString(),
        },
      })
    }
  } catch (error) {
    logger.error('Failed to fetch warm sitemap from edge function', { error: error instanceof Error ? error.message : 'Unknown' })
  }

  // Fallback - empty sitemap if edge function fails
  const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`

  return new NextResponse(fallback, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      'X-Sitemap-Tier': 'warm',
      'X-Sitemap-Source': 'fallback',
    },
  })
}
