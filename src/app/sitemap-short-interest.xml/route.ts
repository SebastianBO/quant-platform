import { NextResponse } from 'next/server'
import { ALL_STOCKS_FULL } from '@/lib/stocks-full'

export const revalidate = 86400

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const perPage = 50000

  // Only generate base ticker URLs - year-specific routes don't exist
  const urls: string[] = []

  for (const ticker of ALL_STOCKS_FULL) {
    const t = ticker.toLowerCase()
    urls.push(`/short-interest/${t}`)
  }

  const start = (page - 1) * perPage
  const end = start + perPage
  const pageUrls = urls.slice(start, end)

  const currentDate = new Date().toISOString().split('T')[0]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pageUrls.map(url => `  <url>
    <loc>https://lician.com${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
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
