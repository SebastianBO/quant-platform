import { NextResponse } from 'next/server'
import { ALL_STOCKS_FULL, QUARTERS } from '@/lib/stocks-full'

// Sitemap index for quarterly comparison pages
// Formula: (n * (n-1) / 2) * quarters = 24M * 24 = 581M pages
// Split into 50K per sitemap = 11,620 sitemaps

export const revalidate = 86400

export async function GET() {
  const n = ALL_STOCKS_FULL.length
  const totalPairs = (n * (n - 1)) / 2
  const totalUrls = totalPairs * QUARTERS.length
  const perPage = 50000
  const totalPages = Math.ceil(totalUrls / perPage)

  const currentDate = new Date().toISOString().split('T')[0]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from({ length: totalPages }, (_, i) => `  <sitemap>
    <loc>https://lician.com/sitemap-compare-quarters.xml?page=${i + 1}</loc>
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
