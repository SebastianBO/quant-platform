import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Code, Database, Zap, Shield, Check, ArrowRight, Globe, Clock, Key } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Financial Data API - Developer Access | Lician',
  description: 'Access 140,000+ company financials via REST API. Income statements, balance sheets, cash flows, insider trades, and more. Free tier available.',
  keywords: [
    'financial data api',
    'stock market api',
    'company financials api',
    'sec filings api',
    'insider trades api',
    'free stock api',
    'financial datasets',
    'market data api'
  ],
  openGraph: {
    title: 'Lician Financial Data API',
    description: 'Access 140,000+ company financials via REST API. Free tier available.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://lician.com/developers',
  },
}

const PRICING_TIERS = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Get started with basic access',
    requests: '100 requests/day',
    features: [
      '100 API requests per day',
      'US company data only',
      'End-of-day prices',
      'Basic financials (annual)',
      'Community support',
    ],
    cta: 'Get API Key',
    ctaLink: '/developers/signup',
    highlighted: false,
  },
  {
    name: 'Basic',
    price: '$29',
    period: '/month',
    description: 'For individual developers',
    requests: '10,000 requests/day',
    features: [
      '10,000 API requests per day',
      'US + EU company data',
      'Real-time prices',
      'Quarterly financials',
      'Insider trades',
      'Email support',
    ],
    cta: 'Start Free Trial',
    ctaLink: '/api/stripe/api-checkout?plan=basic',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$99',
    period: '/month',
    description: 'For growing applications',
    requests: '100,000 requests/day',
    features: [
      '100,000 API requests per day',
      'All company data globally',
      'Real-time + historical prices',
      'All financial statements',
      'Institutional ownership',
      '13F filings',
      'SEC filings',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    ctaLink: '/api/stripe/api-checkout?plan=pro',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large-scale applications',
    requests: 'Unlimited',
    features: [
      'Unlimited API requests',
      'Dedicated infrastructure',
      'Custom data feeds',
      'SLA guarantee',
      'Bulk data exports',
      'Webhook integrations',
      'Dedicated support',
      'Custom integrations',
    ],
    cta: 'Contact Sales',
    ctaLink: 'mailto:api@lician.com',
    highlighted: false,
  },
]

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/v1/financials/income-statements',
    description: 'Income statements (quarterly & annual)',
    params: ['ticker', 'period', 'limit'],
  },
  {
    method: 'GET',
    path: '/api/v1/financials/balance-sheets',
    description: 'Balance sheet data',
    params: ['ticker', 'period', 'limit'],
  },
  {
    method: 'GET',
    path: '/api/v1/financials/cash-flow-statements',
    description: 'Cash flow statements',
    params: ['ticker', 'period', 'limit'],
  },
  {
    method: 'GET',
    path: '/api/v1/insider-trades',
    description: 'Form 4 insider transactions',
    params: ['ticker', 'limit', 'transaction_type'],
  },
  {
    method: 'GET',
    path: '/api/v1/institutional-ownership',
    description: '13F institutional holdings',
    params: ['ticker', 'limit'],
  },
  {
    method: 'GET',
    path: '/api/v1/prices/snapshot',
    description: 'Real-time price quotes',
    params: ['ticker'],
  },
]

const STATS = [
  { value: '141,000+', label: 'Companies' },
  { value: '839,000+', label: 'Financial Records' },
  { value: '5,345', label: 'US Tickers' },
  { value: '106,000+', label: 'EU Companies' },
]

export default function DevelopersPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background text-foreground pt-20">
        {/* Hero */}
        <section className="py-16 md:py-24 border-b border-border">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center gap-2 mb-6">
              <Code className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wide">Developer API</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Financial Data API
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Access comprehensive financial data for 140,000+ companies worldwide.
              Income statements, balance sheets, cash flows, insider trades, and more.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/developers/signup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors"
              >
                Get Free API Key
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#endpoints"
                className="inline-flex items-center gap-2 px-6 py-3 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-lg transition-colors"
              >
                View Documentation
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-12 border-t border-border">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-card/50">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              Why Choose Lician API?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Database className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">Comprehensive Data</h3>
                <p className="text-muted-foreground text-sm">
                  SEC filings, EDGAR data, insider trades, institutional ownership,
                  and EU company financials in one API.
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-7 h-7 text-green-500" />
                </div>
                <h3 className="font-bold text-lg mb-2">Fast & Reliable</h3>
                <p className="text-muted-foreground text-sm">
                  Sub-100ms response times. 99.9% uptime SLA for Pro and Enterprise plans.
                  Global CDN distribution.
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-7 h-7 text-blue-500" />
                </div>
                <h3 className="font-bold text-lg mb-2">Developer Friendly</h3>
                <p className="text-muted-foreground text-sm">
                  RESTful API, consistent JSON responses, comprehensive docs,
                  and SDKs for Python, JavaScript, and more.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16" id="pricing">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Start free, scale as you grow. No hidden fees.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PRICING_TIERS.map((tier) => (
                <div
                  key={tier.name}
                  className={`rounded-2xl p-6 ${
                    tier.highlighted
                      ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary relative'
                      : 'bg-card border border-border'
                  }`}
                >
                  {tier.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.period}</span>
                  </div>
                  <div className="text-sm font-medium text-primary mb-4">{tier.requests}</div>
                  <ul className="space-y-2 text-sm mb-6">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={tier.ctaLink}
                    prefetch={false}
                    className={`block w-full py-2 rounded-lg font-medium text-center transition-colors ${
                      tier.highlighted
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    }`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Endpoints */}
        <section className="py-16 bg-card/50" id="endpoints">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              API Endpoints
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              RESTful JSON API with consistent, predictable responses
            </p>

            <div className="space-y-4 max-w-4xl mx-auto">
              {ENDPOINTS.map((endpoint) => (
                <div
                  key={endpoint.path}
                  className="bg-card border border-border rounded-lg p-4"
                >
                  <div className="flex items-start gap-4">
                    <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-mono font-bold rounded">
                      {endpoint.method}
                    </span>
                    <div className="flex-1">
                      <code className="text-sm font-mono">{endpoint.path}</code>
                      <p className="text-sm text-muted-foreground mt-1">{endpoint.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {endpoint.params.map((param) => (
                          <span
                            key={param}
                            className="px-2 py-0.5 bg-muted text-xs font-mono rounded"
                          >
                            {param}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/developers/docs"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                View Full Documentation
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Code Example */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              Quick Start
            </h2>

            <div className="bg-zinc-900 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-zinc-800 border-b border-zinc-700">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-4 text-sm text-zinc-400">example.py</span>
              </div>
              <pre className="p-6 text-sm overflow-x-auto">
                <code className="text-zinc-100">{`import requests

API_KEY = "your_api_key_here"
BASE_URL = "https://lician.com/api/v1"

# Get Apple's income statements
response = requests.get(
    f"{BASE_URL}/financials/income-statements",
    params={"ticker": "AAPL", "period": "quarterly", "limit": 4},
    headers={"Authorization": f"Bearer {API_KEY}"}
)

data = response.json()
for statement in data["income_statements"]:
    print(f"{statement['period']}: Revenue ${statement['revenue']:,.0f}")`}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary/5">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <Key className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">
              Ready to Build?
            </h2>
            <p className="text-muted-foreground mb-8">
              Get your free API key in seconds. No credit card required.
            </p>
            <Link
              href="/developers/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors"
            >
              Get Free API Key
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
