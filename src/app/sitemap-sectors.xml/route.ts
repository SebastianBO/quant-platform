import { NextResponse } from 'next/server'
import { SECTORS, INDUSTRIES, RANKING_METRICS } from '@/lib/sectors'
import { YEARS } from '@/lib/stocks-full'

// Sitemap for sector, industry, and ranking pages
// Sectors: 11 × 12 years = 132 pages
// Industries: 90 × 12 years = 1,080 pages
// Rankings: 40 metrics × 11 sectors = 440 pages
// Total: ~1,650 pages

export const revalidate = 86400

export async function GET() {
  const urls: string[] = []
  const currentDate = new Date().toISOString().split('T')[0]

  // Sector pages
  for (const sector of SECTORS) {
    urls.push(`/sector/${sector}`)
    for (const year of YEARS) {
      urls.push(`/sector/${sector}/${year}`)
    }
  }

  // Industry pages
  for (const industry of INDUSTRIES) {
    urls.push(`/industry/${industry}`)
    for (const year of YEARS) {
      urls.push(`/industry/${industry}/${year}`)
    }
  }

  // Ranking pages (metric × sector combinations)
  for (const metric of RANKING_METRICS) {
    urls.push(`/top/${metric}`)
    for (const sector of SECTORS) {
      urls.push(`/top/${metric}/${sector}`)
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>https://lician.com${url}</loc>
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
