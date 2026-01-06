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
      `${baseUrl}/sitemap-index.xml`,  // Main index with all sub-sitemaps
      `${baseUrl}/sitemap.xml`,         // Core pages
      `${baseUrl}/sitemap-seo.xml`,     // SEO landing pages
    ],
    // Note: Next.js will automatically serve this at /robots.txt
  }
}
