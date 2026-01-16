import { describe, it, expect } from 'vitest'

/**
 * Tests for sitemap URL transformation logic
 * These utilities are critical for SEO - ensuring correct canonical URLs
 */

describe('Sitemap URL Transformation', () => {
  describe('URL Pattern Transformation', () => {
    // Extract the transform logic from sitemap routes
    function transformStockUrl(input: string, baseUrl: string = 'https://lician.com'): string {
      return input.replace(/https:\/\/www\.lician\.com\/stocks\/([A-Z0-9.-]+)/gi, (_, ticker) =>
        `${baseUrl}/stock/${ticker.toLowerCase()}`
      )
    }

    it('transforms www.lician.com/stocks/ to lician.com/stock/', () => {
      const input = 'https://www.lician.com/stocks/AAPL'
      expect(transformStockUrl(input)).toBe('https://lician.com/stock/aapl')
    })

    it('converts ticker to lowercase', () => {
      const input = 'https://www.lician.com/stocks/MSFT'
      expect(transformStockUrl(input)).toBe('https://lician.com/stock/msft')
    })

    it('handles tickers with dots', () => {
      const input = 'https://www.lician.com/stocks/BRK.B'
      expect(transformStockUrl(input)).toBe('https://lician.com/stock/brk.b')
    })

    it('handles tickers with hyphens', () => {
      const input = 'https://www.lician.com/stocks/BF-A'
      expect(transformStockUrl(input)).toBe('https://lician.com/stock/bf-a')
    })

    it('handles tickers with numbers', () => {
      const input = 'https://www.lician.com/stocks/A123'
      expect(transformStockUrl(input)).toBe('https://lician.com/stock/a123')
    })

    it('handles multiple URLs in content', () => {
      const input = `
        <url><loc>https://www.lician.com/stocks/AAPL</loc></url>
        <url><loc>https://www.lician.com/stocks/GOOGL</loc></url>
      `
      const result = transformStockUrl(input)
      expect(result).toContain('https://lician.com/stock/aapl')
      expect(result).toContain('https://lician.com/stock/googl')
    })

    it('preserves non-matching URLs', () => {
      const input = 'https://example.com/other-page'
      expect(transformStockUrl(input)).toBe('https://example.com/other-page')
    })

    it('is case-insensitive for domain matching', () => {
      const input = 'https://WWW.LICIAN.COM/stocks/AAPL'
      expect(transformStockUrl(input)).toBe('https://lician.com/stock/aapl')
    })
  })

  describe('Stock Symbol Extraction', () => {
    function extractUniqueStocks(sitemap: string): string[] {
      const stockMatches = sitemap.match(/\/stock\/([A-Za-z0-9._-]+)/g) || []
      return [...new Set(stockMatches.map(m => m.replace('/stock/', '').toLowerCase()))]
    }

    it('extracts unique stock symbols from sitemap', () => {
      const sitemap = `
        <loc>https://lician.com/stock/aapl</loc>
        <loc>https://lician.com/stock/msft</loc>
        <loc>https://lician.com/stock/googl</loc>
      `
      const stocks = extractUniqueStocks(sitemap)
      expect(stocks).toEqual(['aapl', 'msft', 'googl'])
    })

    it('deduplicates symbols', () => {
      const sitemap = `
        <loc>https://lician.com/stock/aapl</loc>
        <loc>https://lician.com/stock/aapl</loc>
        <loc>https://lician.com/stock/msft</loc>
      `
      const stocks = extractUniqueStocks(sitemap)
      expect(stocks).toEqual(['aapl', 'msft'])
    })

    it('normalizes to lowercase', () => {
      const sitemap = `
        <loc>https://lician.com/stock/AAPL</loc>
        <loc>https://lician.com/stock/Msft</loc>
      `
      const stocks = extractUniqueStocks(sitemap)
      expect(stocks).toEqual(['aapl', 'msft'])
    })

    it('handles symbols with special characters', () => {
      const sitemap = `
        <loc>https://lician.com/stock/brk.b</loc>
        <loc>https://lician.com/stock/bf-a</loc>
      `
      const stocks = extractUniqueStocks(sitemap)
      expect(stocks).toContain('brk.b')
      expect(stocks).toContain('bf-a')
    })

    it('returns empty array for no matches', () => {
      const sitemap = '<urlset></urlset>'
      const stocks = extractUniqueStocks(sitemap)
      expect(stocks).toEqual([])
    })
  })

  describe('Sitemap XML Generation', () => {
    function generateSitemapXml(stocks: string[], options: {
      baseUrl?: string
      today?: string
      changefreq?: string
      priority?: number
    } = {}): string {
      const {
        baseUrl = 'https://lician.com',
        today = new Date().toISOString().split('T')[0],
        changefreq = 'daily',
        priority = 0.7
      } = options

      const urls = stocks.map(ticker => `
  <url>
    <loc>${baseUrl}/stock/${ticker}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('')

      return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`
    }

    it('generates valid XML structure', () => {
      const xml = generateSitemapXml(['aapl', 'msft'])
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
      expect(xml).toContain('</urlset>')
    })

    it('generates URLs for each stock', () => {
      const xml = generateSitemapXml(['aapl', 'msft', 'googl'])
      expect(xml).toContain('<loc>https://lician.com/stock/aapl</loc>')
      expect(xml).toContain('<loc>https://lician.com/stock/msft</loc>')
      expect(xml).toContain('<loc>https://lician.com/stock/googl</loc>')
    })

    it('includes lastmod date', () => {
      const xml = generateSitemapXml(['aapl'], { today: '2026-01-16' })
      expect(xml).toContain('<lastmod>2026-01-16</lastmod>')
    })

    it('includes changefreq', () => {
      const xml = generateSitemapXml(['aapl'], { changefreq: 'hourly' })
      expect(xml).toContain('<changefreq>hourly</changefreq>')
    })

    it('includes priority', () => {
      const xml = generateSitemapXml(['aapl'], { priority: 0.9 })
      expect(xml).toContain('<priority>0.9</priority>')
    })

    it('uses custom baseUrl', () => {
      const xml = generateSitemapXml(['aapl'], { baseUrl: 'https://example.com' })
      expect(xml).toContain('<loc>https://example.com/stock/aapl</loc>')
    })

    it('handles empty stock array', () => {
      const xml = generateSitemapXml([])
      expect(xml).toContain('<urlset')
      expect(xml).toContain('</urlset>')
      expect(xml).not.toContain('<url>')
    })
  })

  describe('URL Suffix Removal', () => {
    function removeUrlSuffixes(sitemap: string): string {
      return sitemap
        .replace(/\/analysis<\/loc>/g, '</loc>')
        .replace(/\/chart<\/loc>/g, '</loc>')
    }

    it('removes /analysis suffix', () => {
      const input = '<loc>https://lician.com/stock/aapl/analysis</loc>'
      expect(removeUrlSuffixes(input)).toBe('<loc>https://lician.com/stock/aapl</loc>')
    })

    it('removes /chart suffix', () => {
      const input = '<loc>https://lician.com/stock/aapl/chart</loc>'
      expect(removeUrlSuffixes(input)).toBe('<loc>https://lician.com/stock/aapl</loc>')
    })

    it('preserves URLs without suffixes', () => {
      const input = '<loc>https://lician.com/stock/aapl</loc>'
      expect(removeUrlSuffixes(input)).toBe('<loc>https://lician.com/stock/aapl</loc>')
    })

    it('handles multiple URLs', () => {
      const input = `
        <loc>https://lician.com/stock/aapl/analysis</loc>
        <loc>https://lician.com/stock/msft/chart</loc>
        <loc>https://lician.com/stock/googl</loc>
      `
      const result = removeUrlSuffixes(input)
      expect(result).not.toContain('/analysis</loc>')
      expect(result).not.toContain('/chart</loc>')
    })
  })

  describe('Lastmod Date Update', () => {
    function updateLastmodDates(sitemap: string, today: string): string {
      return sitemap.replace(/<lastmod>[^<]+<\/lastmod>/g, `<lastmod>${today}</lastmod>`)
    }

    it('updates all lastmod dates', () => {
      const input = `
        <lastmod>2024-01-01</lastmod>
        <lastmod>2024-06-15</lastmod>
      `
      const result = updateLastmodDates(input, '2026-01-16')
      expect(result).not.toContain('2024-01-01')
      expect(result).not.toContain('2024-06-15')
      expect(result.match(/<lastmod>2026-01-16<\/lastmod>/g)?.length).toBe(2)
    })

    it('handles ISO datetime format', () => {
      const input = '<lastmod>2024-01-01T12:00:00Z</lastmod>'
      const result = updateLastmodDates(input, '2026-01-16')
      expect(result).toBe('<lastmod>2026-01-16</lastmod>')
    })

    it('preserves content without lastmod', () => {
      const input = '<url><loc>https://lician.com/stock/aapl</loc></url>'
      const result = updateLastmodDates(input, '2026-01-16')
      expect(result).toBe(input)
    })
  })
})
