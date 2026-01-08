import { NextResponse } from 'next/server'
import { ALL_STOCKS_FULL as ALL_STOCKS } from '@/lib/stocks-full'

// Generate sitemap for ALL stock comparisons
// Formula: n * (n-1) / 2 unique pairs (order doesn't matter for SEO)
// 288 stocks = 41,328 unique comparison pages

export const revalidate = 86400 // Regenerate daily

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const perPage = 10000 // 10K URLs per sitemap page (under 50K limit)

  // Generate all unique pairs (alphabetically sorted to be canonical)
  const allPairs: string[] = []

  for (let i = 0; i < ALL_STOCKS.length; i++) {
    for (let j = i + 1; j < ALL_STOCKS.length; j++) {
      const t1 = ALL_STOCKS[i].toLowerCase()
      const t2 = ALL_STOCKS[j].toLowerCase()
      // Alphabetical order for canonical URLs
      const [first, second] = [t1, t2].sort()
      allPairs.push(`${first}-vs-${second}`)
    }
  }

  // Pagination
  const totalPages = Math.ceil(allPairs.length / perPage)
  const start = (page - 1) * perPage
  const end = start + perPage
  const pagePairs = allPairs.slice(start, end)

  const currentDate = new Date().toISOString().split('T')[0]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pagePairs.map(pair => `  <url>
    <loc>https://lician.com/compare/${pair}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
