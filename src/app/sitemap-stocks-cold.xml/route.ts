// Cold stocks sitemap - Database-driven from Supabase
// Fetches long-tail stocks (200K+) with weekly updates
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 7200 // 2 hours for cold stocks

const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')

  const today = new Date().toISOString().split('T')[0]
  const baseUrl = 'https://lician.com'

  try {
    // Fetch from Supabase edge function - cold tier
    const response = await fetch(
      `https://wcckhqxkmhyzfpynthte.supabase.co/functions/v1/dynamic-sitemap?tier=cold&page=${page}`,
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

      // Transform URLs from portfoliocare format to quant-platform format (lowercase for canonical consistency)
      sitemap = sitemap.replace(/https:\/\/www\.lician\.com\/stocks\/([A-Z0-9.-]+)/gi, (_, ticker) =>
        `${baseUrl}/stock/${ticker.toLowerCase()}`
      )

      // Extract unique stock symbols (letters, numbers, dots, hyphens) and normalize to lowercase
      const stockMatches = sitemap.match(/\/stock\/([A-Za-z0-9._-]+)/g) || []
      const uniqueStocks = [...new Set(stockMatches.map(m => m.replace('/stock/', '').toLowerCase()))]

      const urls = uniqueStocks.map(ticker => `
  <url>
    <loc>${baseUrl}/stock/${ticker}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`).join('')

      const cleanSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`

      return new NextResponse(cleanSitemap, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=7200, s-maxage=14400',
          'X-Sitemap-Tier': 'cold',
          'X-Sitemap-Page': page.toString(),
          'X-Sitemap-Source': 'supabase-edge',
          'X-URL-Count': uniqueStocks.length.toString(),
          'X-Sitemap-Generated': new Date().toISOString(),
        },
      })
    }
  } catch (error) {
    console.error('Failed to fetch cold tier from edge function:', error)
  }

  // Fallback - empty sitemap if edge function fails
  const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`

  return new NextResponse(fallback, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      'X-Sitemap-Tier': 'cold',
      'X-Sitemap-Source': 'fallback',
    },
  })
}
