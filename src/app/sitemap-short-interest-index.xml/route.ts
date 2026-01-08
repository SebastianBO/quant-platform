import { NextResponse } from 'next/server'
import { ALL_STOCKS_FULL, YEARS } from '@/lib/stocks-full'

// Sitemap index for short interest pages
// 6960 stocks × 12 years = 83K pages

export const revalidate = 86400

export async function GET() {
  const totalUrls = ALL_STOCKS_FULL.length * (YEARS.length + 1)
  const perPage = 50000
  const totalPages = Math.ceil(totalUrls / perPage)

  const currentDate = new Date().toISOString().split('T')[0]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from({ length: totalPages }, (_, i) => `  <sitemap>
    <loc>https://lician.com/sitemap-short-interest.xml?page=${i + 1}</loc>
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
