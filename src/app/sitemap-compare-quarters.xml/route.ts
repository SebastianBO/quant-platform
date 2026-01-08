import { NextResponse } from 'next/server'
import { ALL_STOCKS_FULL, QUARTERS } from '@/lib/stocks-full'

// Generate sitemap for quarterly stock comparisons
// Formula: (n * (n-1) / 2) * quarters = ~581M pages

export const revalidate = 86400

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const perPage = 50000

  const n = ALL_STOCKS_FULL.length
  const pairsPerQuarter = (n * (n - 1)) / 2
  const totalUrls = pairsPerQuarter * QUARTERS.length

  const start = (page - 1) * perPage
  const end = Math.min(start + perPage, totalUrls)

  const urls: string[] = []

  for (let idx = start; idx < end; idx++) {
    const quarterIdx = Math.floor(idx / pairsPerQuarter)
    const pairIdx = idx % pairsPerQuarter

    if (quarterIdx >= QUARTERS.length) break

    const quarter = QUARTERS[quarterIdx]

    // Convert pairIdx to i,j coordinates
    const temp = 2 * n - 1
    const i = Math.floor((temp - Math.sqrt(temp * temp - 8 * pairIdx)) / 2)
    const j = pairIdx - (i * (2 * n - i - 1)) / 2 + i + 1

    if (i < n && j < n) {
      const t1 = ALL_STOCKS_FULL[i].toLowerCase()
      const t2 = ALL_STOCKS_FULL[j].toLowerCase()
      const [first, second] = [t1, t2].sort()
      urls.push(`/compare/${first}-vs-${second}/q/${quarter}`)
    }
  }

  const currentDate = new Date().toISOString().split('T')[0]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>https://lician.com${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>quarterly</changefreq>
    <priority>0.5</priority>
  </url>`).join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
