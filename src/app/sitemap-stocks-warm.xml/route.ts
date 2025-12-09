// Warm stocks sitemap - Database-driven from Supabase
// Fetches next 90K stocks after hot tier (paginated)
import { NextResponse } from 'next/server'

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
    const response = await fetch(
      `https://wcckhqxkmhyzfpynthte.supabase.co/functions/v1/dynamic-sitemap?tier=warm&page=${page}`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 },
      }
    )

    if (response.ok) {
      let sitemap = await response.text()

      // Transform URLs from portfoliocare format to quant-platform format
      sitemap = sitemap.replace(/https:\/\/www\.lician\.com\/stocks\//g, `${baseUrl}/stock/`)

      // Extract unique stock symbols and create clean URLs
      const stockMatches = sitemap.match(/\/stock\/([A-Z0-9.]+)/g) || []
      const uniqueStocks = [...new Set(stockMatches.map(m => m.replace('/stock/', '')))]

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
    console.error('Failed to fetch warm tier from edge function:', error)
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
