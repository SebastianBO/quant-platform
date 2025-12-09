// Dynamic sitemap index - references all sub-sitemaps
// Includes tiered stock sitemaps (hot/warm/cold) from Supabase
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // 1 hour

export async function GET() {
  const today = new Date().toISOString().split('T')[0]
  const baseUrl = 'https://lician.com'

  // Number of warm sitemap pages (10k stocks each, ~9 pages for 90k stocks)
  const warmSitemapCount = 9

  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Core pages -->
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>

  <!-- SEO landing pages (should-i-buy, predictions, comparisons, filters) -->
  <sitemap>
    <loc>${baseUrl}/sitemap-seo.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>

  <!-- Hot tier: Top stocks by market cap (hourly updates) -->
  <sitemap>
    <loc>${baseUrl}/sitemap-stocks-hot.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>

  <!-- Warm tier: Next 90k stocks (daily updates) -->
${Array.from({ length: warmSitemapCount }, (_, i) => `  <sitemap>
    <loc>${baseUrl}/sitemap-stocks-warm.xml?page=${i + 1}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`).join('\n')}

  <!-- Cold tier: Long-tail stocks (weekly updates) -->
  <sitemap>
    <loc>${baseUrl}/sitemap-stocks-cold.xml?page=1</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`

  return new NextResponse(sitemapIndex, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=7200',
      'X-Warm-Sitemaps': warmSitemapCount.toString(),
    },
  })
}
