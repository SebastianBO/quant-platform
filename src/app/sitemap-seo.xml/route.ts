// SEO-focused sitemap with programmatic landing pages
// Includes image sitemap for rich snippets
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // 1 hour

// Top 200 stocks for SEO pages
const TOP_STOCKS = [
  'AAPL', 'ABBV', 'ABT', 'ACN', 'ADBE', 'ADI', 'ADP', 'ADSK', 'AEP', 'AES',
  'AFL', 'AIG', 'AIZ', 'AJG', 'AKAM', 'ALB', 'ALGN', 'ALL', 'ALLE', 'AMAT',
  'AMCR', 'AMD', 'AME', 'AMGN', 'AMP', 'AMT', 'AMZN', 'ANET', 'ANSS', 'AON',
  'AOS', 'APA', 'APD', 'APH', 'APTV', 'ARE', 'ATO', 'AVB', 'AVGO', 'AVY',
  'AWK', 'AXP', 'AZO', 'BA', 'BAC', 'BAX', 'BBY', 'BDX', 'BEN', 'BF.B',
  'BIIB', 'BIO', 'BK', 'BKNG', 'BLK', 'BMY', 'BR', 'BRK.B', 'BRO', 'BSX',
  'BWA', 'BXP', 'C', 'CAG', 'CAH', 'CARR', 'CAT', 'CB', 'CBOE', 'CBRE',
  'CCI', 'CCL', 'CDNS', 'CDW', 'CE', 'CEG', 'CF', 'CFG', 'CHD', 'CHRW',
  'CHTR', 'CI', 'CINF', 'CL', 'CLX', 'CMA', 'CMCSA', 'CME', 'CMG', 'CMI',
  'CMS', 'CNC', 'CNP', 'COF', 'COO', 'COP', 'COST', 'CPB', 'CPRT', 'CPT',
  'CRL', 'CRM', 'CSCO', 'CSGP', 'CSX', 'CTAS', 'CTLT', 'CTRA', 'CTSH', 'CTVA',
  'CVS', 'CVX', 'CZR', 'D', 'DAL', 'DD', 'DE', 'DFS', 'DG', 'DGX',
  'DHI', 'DHR', 'DIS', 'DLR', 'DLTR', 'DOV', 'DOW', 'DPZ', 'DRI', 'DTE',
  'DUK', 'DVA', 'DVN', 'DXCM', 'EA', 'EBAY', 'ECL', 'ED', 'EFX', 'EG',
  'EIX', 'EL', 'EMN', 'EMR', 'ENPH', 'EOG', 'EPAM', 'EQIX', 'EQR', 'EQT',
  'ES', 'ESS', 'ETN', 'ETR', 'EVRG', 'EW', 'EXC', 'EXPD', 'EXPE', 'EXR',
  'F', 'FANG', 'FAST', 'FCX', 'FDS', 'FDX', 'FE', 'FFIV', 'FIS', 'FITB',
  'FLT', 'FMC', 'FOX', 'FOXA', 'FRT', 'FSLR', 'FTNT', 'FTV', 'GD', 'GE',
  'GEHC', 'GEN', 'GILD', 'GIS', 'GL', 'GLW', 'GM', 'GNRC', 'GOOG', 'GOOGL',
  'GPC', 'GPN', 'GRMN', 'GS', 'GWW', 'HAL', 'HAS', 'HBAN', 'HCA', 'HD'
]

// Popular comparison pairs
const COMPARISON_PAIRS = [
  ['AAPL', 'MSFT'], ['GOOGL', 'META'], ['NVDA', 'AMD'], ['TSLA', 'F'],
  ['AMZN', 'WMT'], ['JPM', 'BAC'], ['V', 'MA'], ['DIS', 'NFLX'],
  ['KO', 'PEP'], ['NKE', 'LULU'], ['COST', 'TGT'], ['HD', 'LOW'],
  ['AAPL', 'GOOGL'], ['MSFT', 'AMZN'], ['NVDA', 'INTC'], ['META', 'SNAP'],
]

// Filter categories
const CATEGORIES = ['dividend', 'growth', 'value', 'tech', 'healthcare', 'energy', 'ai']

// Filter combinations (NomadList style)
const FILTER_COMBOS = [
  'technology', 'healthcare', 'finance', 'energy', 'consumer',
  'dividend', 'growth', 'value', 'ai', 'large-cap', 'mid-cap',
  'under-50', 'under-100',
  // 2-way combinations
  'dividend-technology', 'growth-technology', 'dividend-healthcare',
  'ai-technology', 'value-finance', 'growth-ai', 'dividend-energy',
  'large-cap-technology', 'large-cap-dividend', 'growth-healthcare',
]

export async function GET() {
  const today = new Date().toISOString().split('T')[0]
  const baseUrl = 'https://lician.com'

  let urls: string[] = []

  // Should I Buy pages (high-intent keywords) with OG images
  TOP_STOCKS.forEach((ticker) => {
    urls.push(`
  <url>
    <loc>${baseUrl}/should-i-buy/${ticker.toLowerCase()}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <image:image>
      <image:loc>${baseUrl}/api/og/should-i-buy/${ticker.toLowerCase()}</image:loc>
      <image:title>Should I Buy ${ticker} Stock?</image:title>
    </image:image>
  </url>`)
  })

  // Prediction pages with OG images
  TOP_STOCKS.forEach((ticker) => {
    urls.push(`
  <url>
    <loc>${baseUrl}/prediction/${ticker.toLowerCase()}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${baseUrl}/api/og/prediction/${ticker.toLowerCase()}</image:loc>
      <image:title>${ticker} Stock Price Prediction</image:title>
    </image:image>
  </url>`)
  })

  // Comparison pages with OG images
  COMPARISON_PAIRS.forEach(([ticker1, ticker2]) => {
    const slug = `${ticker1.toLowerCase()}-vs-${ticker2.toLowerCase()}`
    urls.push(`
  <url>
    <loc>${baseUrl}/compare/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${baseUrl}/api/og/compare/${slug}</image:loc>
      <image:title>${ticker1} vs ${ticker2} Stock Comparison</image:title>
    </image:image>
  </url>`)
  })

  // Category pages
  CATEGORIES.forEach((category) => {
    urls.push(`
  <url>
    <loc>${baseUrl}/best-stocks/${category}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <image:image>
      <image:loc>${baseUrl}/api/og/best-stocks/${category}</image:loc>
      <image:title>Best ${category.charAt(0).toUpperCase() + category.slice(1)} Stocks</image:title>
    </image:image>
  </url>`)
  })

  // Filter combination pages (NomadList style)
  FILTER_COMBOS.forEach((combo) => {
    urls.push(`
  <url>
    <loc>${baseUrl}/stocks/${combo}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${baseUrl}/api/og/stocks/${combo}</image:loc>
      <image:title>Best ${combo.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Stocks</image:title>
    </image:image>
  </url>`)
  })

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls.join('')}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=7200',
      'X-Sitemap-Type': 'seo-pages',
      'X-URL-Count': urls.length.toString(),
    },
  })
}
