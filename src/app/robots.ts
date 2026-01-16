import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://lician.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Admin and settings routes
          '/admin/',
          '/admin/*',
          '/settings/',
          '/settings/*',

          // API routes - should never be indexed
          '/api/',
          '/api/*',

          // Cron jobs and webhooks
          '/api/cron/*',
          '/api/webhook/*',
          '/api/stripe/webhook',
          '/api/plaid/webhook',
          '/api/tink/webhook',

          // User-specific routes
          '/api/user/*',
          '/api/portfolio/*',
          '/api/watchlist/*',

          // Debug and monitoring routes
          '/api/debug/*',
          '/api/monitoring/*',

          // Private pages (login is indexed for SEO)
          '/dashboard*', // Block dynamic dashboard queries

          // Prevent duplicate content from URL parameters
          '/*?*ticker=*', // Block search parameter variations
          '/*?*utm_*', // Block UTM tracking parameters
        ],
      },
      // Specific rules for AI search crawlers (Google Gemini, ChatGPT, etc.)
      {
        userAgent: [
          'GPTBot',           // OpenAI ChatGPT
          'ChatGPT-User',     // ChatGPT user agent
          'Google-Extended',  // Google Gemini
          'CCBot',            // Common Crawl
          'anthropic-ai',     // Claude
          'Claude-Web',       // Claude web crawler
          'Applebot-Extended', // Apple Intelligence
        ],
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/settings/',
        ],
        // Allow AI crawlers to access all public content for better understanding
        crawlDelay: 1, // Be respectful with crawl rate
      },
      // Specific rules for Google
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/settings/',
          '/api/cron/*',
        ],
      },
      // Specific rules for Bing
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/settings/',
        ],
      },
    ],
    sitemap: [
      // Primary sitemaps
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap-index.xml`,
      `${baseUrl}/sitemap-seo.xml`,
      // Tiered stock pages
      `${baseUrl}/sitemap-stocks-hot.xml`,
      `${baseUrl}/sitemap-stocks-warm.xml?page=1`,
      `${baseUrl}/sitemap-stocks-warm.xml?page=2`,
      `${baseUrl}/sitemap-stocks-warm.xml?page=3`,
      `${baseUrl}/sitemap-stocks-cold.xml?page=1`,
      // Comparison pages
      `${baseUrl}/sitemap-compare-index.xml`,
      `${baseUrl}/sitemap-compare-years-index.xml`,
      `${baseUrl}/sitemap-compare-quarters-index.xml`,
      // Metric pages (107 metrics × stocks)
      `${baseUrl}/sitemap-metrics-index.xml`,
      // Earnings pages
      `${baseUrl}/sitemap-earnings-index.xml`,
      // Sector & industry pages
      `${baseUrl}/sitemap-sectors.xml`,
      // Per-stock data pages
      `${baseUrl}/sitemap-institutional-index.xml`,
      `${baseUrl}/sitemap-insider-index.xml`,
      `${baseUrl}/sitemap-short-interest-index.xml`,
    ],
    // Note: Next.js will automatically serve this at /robots.txt
  }
}
