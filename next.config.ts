import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Set output file tracing root to avoid lockfile detection issues
  outputFileTracingRoot: __dirname,

  // Experimental performance optimizations
  experimental: {
    // Optimize CSS for better performance
    optimizeCss: true,
    // Tree-shake large packages automatically
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'date-fns',
      'lodash',
    ],
  },

  // Image optimization for Core Web Vitals
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
      },
    ],
  },

  // Compression and performance
  compress: true,
  poweredByHeader: false,

  // Redirects for www to non-www (SEO canonical)
  async redirects() {
    return [
      // Redirect www to non-www for SEO
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.lician.com',
          },
        ],
        destination: 'https://lician.com/:path*',
        permanent: true,
      },
    ];
  },

  // Rewrites for AI search optimization
  async rewrites() {
    return [
      // .well-known/llms.txt serves the same as /llms.txt
      {
        source: '/.well-known/llms.txt',
        destination: '/llms.txt',
      },
    ];
  },

  // Headers for SEO, security, and caching
  async headers() {
    return [
      {
        source: '/llms.txt',
        headers: [
          { key: 'Content-Type', value: 'text/plain; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=604800' },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          { key: 'Content-Type', value: 'text/plain; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
      // Cache static assets aggressively
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Cache fonts
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Security headers
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
