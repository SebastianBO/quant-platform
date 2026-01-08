import { NextResponse } from 'next/server'
import { ALL_STOCKS_FULL, YEARS } from '@/lib/stocks-full'

// Generate sitemap for historical year stock comparisons
// Formula: (n * (n-1) / 2) * years = ~290M pages

export const revalidate = 86400

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const perPage = 50000 // 50K URLs per page

  // Calculate which pairs and years to include for this page
  const n = ALL_STOCKS_FULL.length
  const pairsPerYear = (n * (n - 1)) / 2
  const totalUrls = pairsPerYear * YEARS.length

  const start = (page - 1) * perPage
  const end = Math.min(start + perPage, totalUrls)

  // Generate URLs for this page
  const urls: string[] = []

  for (let idx = start; idx < end; idx++) {
    const yearIdx = Math.floor(idx / pairsPerYear)
    const pairIdx = idx % pairsPerYear

    if (yearIdx >= YEARS.length) break

    const year = YEARS[yearIdx]

    // Convert pairIdx to i,j coordinates
    // pairIdx = i*(2n-i-1)/2 + (j-i-1)
    // Solve for i: i = floor((2n-1 - sqrt((2n-1)^2 - 8*pairIdx)) / 2)
    const temp = 2 * n - 1
    const i = Math.floor((temp - Math.sqrt(temp * temp - 8 * pairIdx)) / 2)
    const j = pairIdx - (i * (2 * n - i - 1)) / 2 + i + 1

    if (i < n && j < n) {
      const t1 = ALL_STOCKS_FULL[i].toLowerCase()
      const t2 = ALL_STOCKS_FULL[j].toLowerCase()
      const [first, second] = [t1, t2].sort()
      urls.push(`/compare/${first}-vs-${second}/${year}`)
    }
  }

  const currentDate = new Date().toISOString().split('T')[0]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>https://lician.com${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
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
