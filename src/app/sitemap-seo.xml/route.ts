// SEO-focused sitemap with programmatic landing pages
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // 1 hour

// Top 100 stocks for SEO pages
const TOP_STOCKS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'UNH', 'JNJ',
  'V', 'XOM', 'WMT', 'JPM', 'MA', 'PG', 'HD', 'CVX', 'MRK', 'ABBV',
  'LLY', 'PEP', 'KO', 'COST', 'AVGO', 'TMO', 'MCD', 'CSCO', 'ACN', 'ABT',
  'DHR', 'NKE', 'ADBE', 'CRM', 'TXN', 'CMCSA', 'VZ', 'NEE', 'PM', 'INTC',
  'AMD', 'QCOM', 'HON', 'UNP', 'RTX', 'LOW', 'AMGN', 'IBM', 'CAT', 'BA',
  'GE', 'SBUX', 'INTU', 'DE', 'SPGI', 'GS', 'BLK', 'GILD', 'AXP', 'MDLZ',
  'ISRG', 'ADI', 'BKNG', 'SYK', 'REGN', 'VRTX', 'MMC', 'PLD', 'LRCX', 'ZTS',
  'PANW', 'C', 'ETN', 'SCHW', 'CI', 'CB', 'SO', 'MO', 'DUK', 'CME',
  'BDX', 'BSX', 'NOW', 'EQIX', 'AON', 'ITW', 'NOC', 'PNC', 'SHW', 'ICE',
  'SNOW', 'PLTR', 'CRWD', 'DDOG', 'NET', 'ZS', 'MDB', 'COIN', 'HOOD', 'SOFI'
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

export async function GET() {
  const today = new Date().toISOString().split('T')[0]
  const baseUrl = 'https://lician.com'

  let urls: string[] = []

  // Should I Buy pages (high-intent keywords)
  TOP_STOCKS.forEach((ticker) => {
    urls.push(`
  <url>
    <loc>${baseUrl}/should-i-buy/${ticker.toLowerCase()}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`)
  })

  // Prediction pages
  TOP_STOCKS.forEach((ticker) => {
    urls.push(`
  <url>
    <loc>${baseUrl}/prediction/${ticker.toLowerCase()}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`)
  })

  // Comparison pages
  COMPARISON_PAIRS.forEach(([ticker1, ticker2]) => {
    urls.push(`
  <url>
    <loc>${baseUrl}/compare/${ticker1.toLowerCase()}-vs-${ticker2.toLowerCase()}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
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
  </url>`)
  })

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}
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
