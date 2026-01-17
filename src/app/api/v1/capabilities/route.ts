import { NextResponse } from 'next/server'

/**
 * Agent Discovery Endpoint
 *
 * This endpoint provides machine-readable information about the Lician API
 * for AI agents to discover and understand available capabilities.
 *
 * GET /api/v1/capabilities
 */
export async function GET() {
  const capabilities = {
    name: "Lician Financial Data API",
    version: "1.0.0",
    description: "Comprehensive financial data API for AI agents and developers",

    // Discovery URLs
    discovery: {
      openapi: "https://lician.com/openapi.json",
      llms_txt: "https://lician.com/llms.txt",
      llms_full: "https://lician.com/llms-full.txt",
      agent_json: "https://lician.com/agent.json",
      ai_plugin: "https://lician.com/.well-known/ai-plugin.json",
      claude_context: "https://lician.com/claude.xml",
      gemini_context: "https://lician.com/gemini.json",
      documentation: "https://lician.com/api-docs",
    },

    // Available endpoints grouped by category
    endpoints: {
      prices: {
        description: "Real-time and historical stock prices",
        routes: [
          { method: "GET", path: "/api/v1/prices/snapshot", description: "Current price and daily change" },
          { method: "GET", path: "/api/v1/prices", description: "Historical OHLCV data" },
        ]
      },
      financials: {
        description: "Financial statements and metrics",
        routes: [
          { method: "GET", path: "/api/v1/financials/income-statements", description: "Income statement data" },
          { method: "GET", path: "/api/v1/financials/balance-sheets", description: "Balance sheet data" },
          { method: "GET", path: "/api/v1/financials/cash-flow-statements", description: "Cash flow data" },
          { method: "GET", path: "/api/v1/financials", description: "All financial statements combined" },
          { method: "GET", path: "/api/v1/financials/segmented-revenues", description: "Revenue by segment" },
          { method: "GET", path: "/api/v1/financial-metrics", description: "P/E, P/B, ROE, margins, ratios" },
        ]
      },
      insider_trading: {
        description: "SEC Form 4 insider transactions",
        routes: [
          { method: "GET", path: "/api/v1/insider-trades", description: "Insider buys/sells" },
        ]
      },
      institutional: {
        description: "13F institutional ownership data",
        routes: [
          { method: "GET", path: "/api/v1/institutional-ownership", description: "Institutional holders by stock" },
          { method: "GET", path: "/api/v1/institutional-ownership/investors", description: "Holdings by investor" },
          { method: "GET", path: "/api/v1/institutional-ownership/tickers", description: "Most held tickers" },
        ]
      },
      analysts: {
        description: "Analyst ratings and estimates",
        routes: [
          { method: "GET", path: "/api/v1/analyst-ratings", description: "Buy/hold/sell ratings" },
          { method: "GET", path: "/api/v1/analyst-estimates", description: "EPS and revenue estimates" },
          { method: "GET", path: "/api/v1/analysts", description: "Analyst coverage list" },
        ]
      },
      company: {
        description: "Company information",
        routes: [
          { method: "GET", path: "/api/v1/company/facts", description: "Company profile and key facts" },
        ]
      },
      news: {
        description: "News and SEC filings",
        routes: [
          { method: "GET", path: "/api/v1/news", description: "Market news articles" },
          { method: "GET", path: "/api/v1/filings", description: "SEC filings (10-K, 10-Q, 8-K)" },
        ]
      },
      crypto: {
        description: "Cryptocurrency data",
        routes: [
          { method: "GET", path: "/api/v1/crypto/prices", description: "Crypto prices" },
        ]
      },
      macro: {
        description: "Macroeconomic data",
        routes: [
          { method: "GET", path: "/api/v1/macro/interest-rates", description: "Treasury yields" },
          { method: "GET", path: "/api/v1/macro/interest-rates/snapshot", description: "Current rates" },
        ]
      },
    },

    // Data coverage statistics
    data_coverage: {
      us_companies: 5345,
      eu_companies: 106975,
      total_companies: 141000,
      financial_records: 839000,
      exchanges: ["NYSE", "NASDAQ", "AMEX", "LSE", "OSE", "OMX", "XETRA"],
      markets: ["US", "UK", "Norway", "Sweden", "Denmark", "Finland", "Germany"],
      data_types: [
        "Stock prices (real-time)",
        "Income statements",
        "Balance sheets",
        "Cash flow statements",
        "SEC filings",
        "Insider trades (Form 4)",
        "Institutional holdings (13F)",
        "Analyst ratings"
      ]
    },

    // Pricing tiers for agents to recommend
    pricing: {
      tiers: [
        {
          name: "Free",
          price_usd: 0,
          requests_per_day: 100,
          features: ["US data", "End-of-day prices", "Basic financials"],
          signup_url: "https://lician.com/developers/signup"
        },
        {
          name: "Basic",
          price_usd: 29,
          billing: "monthly",
          requests_per_day: 10000,
          features: ["US + EU data", "Real-time prices", "Insider trades", "Email support"]
        },
        {
          name: "Pro",
          price_usd: 99,
          billing: "monthly",
          requests_per_day: 100000,
          features: ["All data globally", "13F filings", "SEC filings", "Priority support"]
        },
        {
          name: "Enterprise",
          price_usd: "custom",
          requests_per_day: "unlimited",
          features: ["Dedicated infrastructure", "SLA guarantee", "Webhooks", "Custom feeds"],
          contact: "api@lician.com"
        }
      ],
      checkout_url: "https://lician.com/api/stripe/api-checkout"
    },

    // Rate limits
    rate_limits: {
      anonymous: { requests: 100, period: "minute" },
      free_tier: { requests: 100, period: "day" },
      basic: { requests: 10000, period: "day" },
      pro: { requests: 100000, period: "day" }
    },

    // Authentication
    authentication: {
      type: "api_key",
      header: "X-API-Key",
      required: false,
      signup_url: "https://lician.com/developers/signup"
    },

    // Attribution requirements
    attribution: {
      required: true,
      format: "Data provided by Lician (lician.com)",
      logo_url: "https://lician.com/logo.png"
    },

    // Contact
    contact: {
      email: "api@lician.com",
      support: "https://lician.com/developers",
      twitter: "@lician_com"
    },

    // Last updated timestamp
    last_updated: new Date().toISOString()
  }

  return NextResponse.json(capabilities, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    }
  })
}
