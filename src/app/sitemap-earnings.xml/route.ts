import { NextResponse } from 'next/server'
import { ALL_STOCKS_FULL, QUARTERS } from '@/lib/stocks-full'

// Generate sitemap for quarterly earnings pages
// Formula: stocks * quarters = 6960 * 24 = 167K pages

export const revalidate = 86400

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const perPage = 50000

  const allUrls: string[] = []

  for (const ticker of ALL_STOCKS_FULL) {
    for (const quarter of QUARTERS) {
      allUrls.push(`/earnings/${ticker.toLowerCase()}/${quarter}`)
    }
  }

  const start = (page - 1) * perPage
  const end = start + perPage
  const pageUrls = allUrls.slice(start, end)

  const currentDate = new Date().toISOString().split('T')[0]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pageUrls.map(url => `  <url>
    <loc>https://lician.com${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>quarterly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
