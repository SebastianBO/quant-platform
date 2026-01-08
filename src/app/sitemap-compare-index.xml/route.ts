import { NextResponse } from 'next/server'
import { ALL_STOCKS_FULL as ALL_STOCKS } from '@/lib/stocks-full'

// Sitemap index for all comparison sitemaps
// Links to paginated sitemap-compare.xml?page=N

export const revalidate = 86400 // Daily

export async function GET() {
  // Calculate total pairs
  const totalPairs = (ALL_STOCKS.length * (ALL_STOCKS.length - 1)) / 2
  const perPage = 10000
  const totalPages = Math.ceil(totalPairs / perPage)

  const currentDate = new Date().toISOString().split('T')[0]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from({ length: totalPages }, (_, i) => `  <sitemap>
    <loc>https://lician.com/sitemap-compare.xml?page=${i + 1}</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
