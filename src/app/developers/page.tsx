"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Copy,
  Check,
  Database,
  Zap,
  Shield,
  Globe,
  Code2,
  Terminal,
  FileJson,
  ArrowRight,
  ChevronRight,
  Building2,
  TrendingUp,
  DollarSign,
  Bot,
  Cpu,
  Package,
  ExternalLink,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Stats data
const STATS = [
  { value: "141K+", label: "Companies", icon: Building2 },
  { value: "839K+", label: "Financial Records", icon: Database },
  { value: "12", label: "API Endpoints", icon: Code2 },
  { value: "30+", label: "Years of Data", icon: TrendingUp },
]

// API Endpoints
const ENDPOINTS = [
  {
    method: "GET",
    path: "/v1/prices",
    description: "Historical and real-time stock prices",
    params: ["ticker", "start_date", "end_date", "interval"],
  },
  {
    method: "GET",
    path: "/v1/prices/snapshot",
    description: "Current price snapshot with change metrics",
    params: ["ticker"],
  },
  {
    method: "GET",
    path: "/v1/financials/income-statements",
    description: "Income statements (annual, quarterly, TTM)",
    params: ["ticker", "period", "limit"],
  },
  {
    method: "GET",
    path: "/v1/financials/balance-sheets",
    description: "Balance sheet data with all line items",
    params: ["ticker", "period", "limit"],
  },
  {
    method: "GET",
    path: "/v1/financials/cash-flow-statements",
    description: "Cash flow statements and metrics",
    params: ["ticker", "period", "limit"],
  },
  {
    method: "GET",
    path: "/v1/financial-metrics",
    description: "Key ratios: P/E, P/B, ROE, margins",
    params: ["ticker"],
  },
  {
    method: "GET",
    path: "/v1/insider-trades",
    description: "SEC Form 4 insider transactions",
    params: ["ticker", "limit"],
  },
  {
    method: "GET",
    path: "/v1/institutional-ownership",
    description: "13F institutional holdings data",
    params: ["ticker", "investor_name"],
  },
  {
    method: "GET",
    path: "/v1/analyst-ratings",
    description: "Analyst recommendations and targets",
    params: ["ticker"],
  },
  {
    method: "GET",
    path: "/v1/analyst-estimates",
    description: "EPS and revenue estimates",
    params: ["ticker", "period"],
  },
  {
    method: "GET",
    path: "/v1/filings",
    description: "SEC EDGAR filings (10-K, 10-Q, 8-K)",
    params: ["ticker", "form_type", "limit"],
  },
  {
    method: "GET",
    path: "/v1/company/facts",
    description: "Company profile and fundamentals",
    params: ["ticker"],
  },
]

// Pricing tiers
const PRICING_TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for testing and small projects",
    requests: "100",
    requestPeriod: "day",
    features: [
      "100 requests per day",
      "All 12 endpoints",
      "US market data",
      "Community support",
    ],
    cta: "Get Started",
    ctaLink: "/developers/signup",
    highlighted: false,
  },
  {
    name: "Basic",
    price: "$29",
    period: "month",
    description: "For indie developers and small apps",
    requests: "10,000",
    requestPeriod: "day",
    features: [
      "10,000 requests per day",
      "All 12 endpoints",
      "US + EU market data",
      "Email support",
      "MCP integration",
    ],
    cta: "Subscribe",
    ctaLink: "/api/stripe/api-checkout?plan=basic",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$99",
    period: "month",
    description: "For production applications",
    requests: "100,000",
    requestPeriod: "day",
    features: [
      "100,000 requests per day",
      "All 12 endpoints",
      "Global market data",
      "Priority support",
      "MCP + Agent integration",
      "Webhook notifications",
    ],
    cta: "Subscribe",
    ctaLink: "/api/stripe/api-checkout?plan=pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For high-volume applications",
    requests: "Unlimited",
    requestPeriod: "",
    features: [
      "Unlimited requests",
      "Dedicated infrastructure",
      "Custom data feeds",
      "SLA guarantee",
      "White-glove onboarding",
      "Direct Slack support",
    ],
    cta: "Contact Sales",
    ctaLink: "mailto:api@lician.com",
    highlighted: false,
  },
]

// Agent discovery files
const DISCOVERY_FILES = [
  {
    name: "openapi.json",
    path: "/.well-known/openapi.json",
    description: "OpenAPI 3.1 specification",
    icon: FileJson,
  },
  {
    name: "server-card.json",
    path: "/.well-known/server-card.json",
    description: "MCP server metadata",
    icon: Cpu,
  },
  {
    name: "agent.json",
    path: "/.well-known/agent.json",
    description: "Agent capabilities manifest",
    icon: Bot,
  },
  {
    name: "ai-plugin.json",
    path: "/.well-known/ai-plugin.json",
    description: "OpenAI plugin manifest",
    icon: Sparkles,
  },
]

// Code examples for integration tabs
const CODE_EXAMPLES = {
  claude: `{
  "mcpServers": {
    "lician": {
      "url": "https://lician.com/mcp",
      "transport": "http",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}`,
  mcp: `# Using MCP HTTP transport
curl -X POST https://lician.com/mcp \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "method": "tools/call",
    "params": {
      "name": "get_stock_price",
      "arguments": { "ticker": "AAPL" }
    }
  }'`,
  npm: `import { LicianClient } from '@lician/sdk';

const client = new LicianClient({
  apiKey: process.env.LICIAN_API_KEY
});

// Get stock price
const price = await client.prices.get('AAPL');
console.log(price);

// Get financials
const financials = await client.financials.incomeStatements({
  ticker: 'AAPL',
  period: 'annual',
  limit: 4
});`,
}

const CURL_EXAMPLE = `curl -X GET "https://lician.com/api/v1/prices?ticker=AAPL" \\
  -H "Authorization: Bearer YOUR_API_KEY"`

const RESPONSE_EXAMPLE = `{
  "prices": [
    {
      "ticker": "AAPL",
      "date": "2026-01-17",
      "open": 229.45,
      "high": 232.10,
      "low": 228.90,
      "close": 231.85,
      "volume": 58432100,
      "adjusted_close": 231.85
    }
  ],
  "_meta": {
    "source": "lician",
    "count": 1,
    "fetched_at": "2026-01-17T14:30:00Z"
  }
}`

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "p-2 rounded-lg transition-all hover:bg-white/10",
        className
      )}
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-4 h-4 text-emerald-400" />
      ) : (
        <Copy className="w-4 h-4 text-zinc-400" />
      )}
    </button>
  )
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative group">
      <pre className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 overflow-x-auto text-sm">
        <code className="text-zinc-300 font-mono">{code}</code>
      </pre>
      <CopyButton
        text={code}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
      />
    </div>
  )
}

export default function DevelopersPage() {
  const [activeTab, setActiveTab] = useState<"claude" | "mcp" | "npm">("claude")
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-black to-blue-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '64px 64px'
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          {/* Navigation */}
          <nav className="flex items-center justify-between mb-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
                <span className="text-black font-bold text-lg">L</span>
              </div>
              <span className="font-semibold text-xl">Lician</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/developers/signup"
                className="px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors"
              >
                Get API Key
              </Link>
            </div>
          </nav>

          {/* Hero content */}
          <div className="text-center max-w-4xl mx-auto">
            {/* Badges */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                <Bot className="w-4 h-4" />
                MCP Enabled
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
                <Building2 className="w-4 h-4" />
                141K+ Companies
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Financial Data API
            </h1>
            <p className="text-xl sm:text-2xl text-zinc-400 mb-8 max-w-2xl mx-auto">
              Comprehensive stock data for AI agents, trading bots, and financial applications.
              Built for the agentic web.
            </p>

            {/* CTA buttons */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <Link
                href="#quickstart"
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#endpoints"
                className="px-6 py-3 bg-zinc-900 border border-zinc-800 text-white font-semibold rounded-xl hover:bg-zinc-800 transition-colors"
              >
                View Endpoints
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-zinc-800 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {STATS.map((stat, index) => (
              <div
                key={stat.label}
                className={cn(
                  "py-8 px-6 text-center",
                  index !== STATS.length - 1 && "md:border-r border-zinc-800"
                )}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <stat.icon className="w-5 h-5 text-emerald-400" />
                  <span className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                    {stat.value}
                  </span>
                </div>
                <p className="text-zinc-500 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Agent Integration Section */}
      <section className="py-24 relative" id="agent-integration">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              AI-Native
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              AI Agent Integration
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Connect your AI agents directly to financial data. Native MCP support for Claude,
              GPT, and custom agents.
            </p>
          </div>

          {/* Integration tabs */}
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-6 p-1 bg-zinc-900 rounded-xl w-fit mx-auto">
              {[
                { id: "claude", label: "Claude Desktop", icon: Bot },
                { id: "mcp", label: "MCP HTTP", icon: Terminal },
                { id: "npm", label: "NPM Package", icon: Package },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "claude" | "mcp" | "npm")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    activeTab === tab.id
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <CodeBlock code={CODE_EXAMPLES[activeTab]} />

            {activeTab === "claude" && (
              <p className="text-zinc-500 text-sm mt-4 text-center">
                Add this to your <code className="text-emerald-400">claude_desktop_config.json</code> to enable Lician tools in Claude Desktop.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Quickstart Section */}
      <section className="py-24 bg-zinc-950/50" id="quickstart">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
              <Terminal className="w-4 h-4" />
              Quickstart
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Start in Seconds
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Make your first API call in under a minute. Simple REST endpoints with JSON responses.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Request */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-mono rounded">
                  GET
                </span>
                <span className="text-zinc-400 text-sm">Request</span>
              </div>
              <CodeBlock code={CURL_EXAMPLE} />
            </div>

            {/* Response */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-mono rounded">
                  200
                </span>
                <span className="text-zinc-400 text-sm">Response</span>
              </div>
              <CodeBlock code={RESPONSE_EXAMPLE} />
            </div>
          </div>
        </div>
      </section>

      {/* API Endpoints Section */}
      <section className="py-24" id="endpoints">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4">
              <Code2 className="w-4 h-4" />
              Endpoints
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              12 Powerful Endpoints
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Everything you need for comprehensive financial analysis. Prices, fundamentals,
              insider activity, and more.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {ENDPOINTS.map((endpoint) => (
              <div
                key={endpoint.path}
                className="group p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all cursor-pointer"
                onClick={() =>
                  setExpandedEndpoint(
                    expandedEndpoint === endpoint.path ? null : endpoint.path
                  )
                }
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-mono rounded">
                    {endpoint.method}
                  </span>
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 text-zinc-500 transition-transform",
                      expandedEndpoint === endpoint.path && "rotate-90"
                    )}
                  />
                </div>
                <code className="text-white font-mono text-sm block mb-2">
                  {endpoint.path}
                </code>
                <p className="text-zinc-500 text-sm">{endpoint.description}</p>

                {expandedEndpoint === endpoint.path && (
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                      Parameters
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {endpoint.params.map((param) => (
                        <span
                          key={param}
                          className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs font-mono rounded"
                        >
                          {param}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/developers/docs"
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              View Full Documentation
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-zinc-950/50" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-4">
              <DollarSign className="w-4 h-4" />
              Pricing
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Start free, scale as you grow. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  "relative p-6 rounded-2xl border transition-all",
                  tier.highlighted
                    ? "bg-gradient-to-b from-emerald-500/10 to-blue-500/10 border-emerald-500/30"
                    : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                )}
              >
                {tier.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-xs font-medium rounded-full">
                    Most Popular
                  </span>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    {tier.period && (
                      <span className="text-zinc-500">/{tier.period}</span>
                    )}
                  </div>
                  <p className="text-zinc-500 text-sm mt-2">{tier.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 text-lg">
                    <Zap className="w-5 h-5 text-emerald-400" />
                    <span className="font-semibold">{tier.requests}</span>
                    {tier.requestPeriod && (
                      <span className="text-zinc-500">requests/{tier.requestPeriod}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.ctaLink}
                  className={cn(
                    "block w-full py-3 rounded-xl font-medium transition-all text-center",
                    tier.highlighted
                      ? "bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:opacity-90"
                      : "bg-zinc-800 text-white hover:bg-zinc-700"
                  )}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Discovery Section */}
      <section className="py-24" id="discovery">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4">
              <Globe className="w-4 h-4" />
              Agent Discovery
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Built for the Agentic Web
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Standard discovery files for AI agents and tools. Let agents find and
              understand your API automatically.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {DISCOVERY_FILES.map((file) => (
              <Link
                key={file.name}
                href={file.path}
                target="_blank"
                className="group p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <file.icon className="w-5 h-5 text-cyan-400" />
                  <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-cyan-400 transition-colors" />
                </div>
                <code className="text-white font-mono text-sm block mb-2">
                  {file.name}
                </code>
                <p className="text-zinc-500 text-sm">{file.description}</p>
              </Link>
            ))}
          </div>

          <div className="mt-12 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl max-w-4xl mx-auto">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              Security First
            </h3>
            <p className="text-zinc-400 mb-4">
              All API requests require authentication via API key. Keys are scoped to your account
              and can be rotated at any time. We never store or log your queries.
            </p>
            <div className="flex flex-wrap gap-4">
              <span className="inline-flex items-center gap-2 text-sm text-zinc-500">
                <Check className="w-4 h-4 text-emerald-400" />
                TLS 1.3 encryption
              </span>
              <span className="inline-flex items-center gap-2 text-sm text-zinc-500">
                <Check className="w-4 h-4 text-emerald-400" />
                SOC 2 compliant
              </span>
              <span className="inline-flex items-center gap-2 text-sm text-zinc-500">
                <Check className="w-4 h-4 text-emerald-400" />
                GDPR compliant
              </span>
              <span className="inline-flex items-center gap-2 text-sm text-zinc-500">
                <Check className="w-4 h-4 text-emerald-400" />
                99.9% uptime SLA
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Build?
          </h2>
          <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
            Join thousands of developers building the next generation of financial applications.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/developers/signup"
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              Get Your Free API Key
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-zinc-500 text-sm mt-4">
            No credit card required. 100 free requests per day.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
                <span className="text-black font-bold text-lg">L</span>
              </div>
              <span className="font-semibold">Lician</span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-500 text-sm">Financial Data API</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <Link href="/developers/docs" className="hover:text-white transition-colors">
                Documentation
              </Link>
              <Link href="#pricing" className="hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/status" className="hover:text-white transition-colors">
                Status
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
            </div>
          </div>
          <p className="text-center text-zinc-600 text-sm mt-8">
            2026 Lician. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
