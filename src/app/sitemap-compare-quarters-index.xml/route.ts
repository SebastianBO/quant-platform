import { NextResponse } from 'next/server'
import { ALL_STOCKS_FULL, QUARTERS } from '@/lib/stocks-full'

// Sitemap index for quarterly comparison pages - SPLIT into chunks
// Too many sitemaps (11K+) so we split into multiple index files

export const revalidate = 86400

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const chunk = parseInt(searchParams.get('chunk') || '1')
  const sitemapsPerChunk = 1000 // 1000 sitemaps per index chunk

  const n = ALL_STOCKS_FULL.length
  const totalPairs = (n * (n - 1)) / 2
  const totalUrls = totalPairs * QUARTERS.length
  const perPage = 50000
  const totalSitemaps = Math.ceil(totalUrls / perPage)
  const totalChunks = Math.ceil(totalSitemaps / sitemapsPerChunk)

  // If no chunk specified, return index of indexes
  if (!searchParams.has('chunk')) {
    const currentDate = new Date().toISOString().split('T')[0]
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from({ length: totalChunks }, (_, i) => `  <sitemap>
    <loc>https://lician.com/sitemap-compare-quarters-index.xml?chunk=${i + 1}</loc>
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

  // Return specific chunk of sitemaps
  const start = (chunk - 1) * sitemapsPerChunk
  const end = Math.min(start + sitemapsPerChunk, totalSitemaps)
  const currentDate = new Date().toISOString().split('T')[0]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from({ length: end - start }, (_, i) => `  <sitemap>
    <loc>https://lician.com/sitemap-compare-quarters.xml?page=${start + i + 1}</loc>
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
