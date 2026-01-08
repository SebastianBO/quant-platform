import { NextResponse } from 'next/server'
import { ALL_STOCKS_FULL, QUARTERS } from '@/lib/stocks-full'

// Sitemap index for quarterly earnings pages
// Formula: stocks * quarters = 6960 * 24 = 167K pages

export const revalidate = 86400

export async function GET() {
  const totalUrls = ALL_STOCKS_FULL.length * QUARTERS.length
  const perPage = 50000
  const totalPages = Math.ceil(totalUrls / perPage)

  const currentDate = new Date().toISOString().split('T')[0]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from({ length: totalPages }, (_, i) => `  <sitemap>
    <loc>https://lician.com/sitemap-earnings.xml?page=${i + 1}</loc>
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
