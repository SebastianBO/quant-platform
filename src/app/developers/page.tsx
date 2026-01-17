"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

// Scroll animation hook
function useScrollAnimation(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

// Copy button component
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] transition-colors opacity-0 group-hover:opacity-100"
    >
      {copied ? (
        <svg className="size-4 text-[#4ebe96]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg className="size-4 text-[#868f97]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      )}
    </button>
  )
}

// API Endpoints
const ENDPOINTS = [
  { path: "/v1/prices/snapshot", desc: "Current stock price, change, volume, market cap" },
  { path: "/v1/financials/income-statements", desc: "Revenue, profit, EPS by period" },
  { path: "/v1/financials/balance-sheets", desc: "Assets, liabilities, equity, debt" },
  { path: "/v1/financials/cash-flow-statements", desc: "Operating, investing, financing flows" },
  { path: "/v1/financial-metrics", desc: "P/E, ROE, margins, dividend yield" },
  { path: "/v1/insider-trades", desc: "SEC Form 4 insider transactions" },
  { path: "/v1/institutional-ownership", desc: "13F institutional holdings" },
  { path: "/v1/analyst-ratings", desc: "Buy/hold/sell ratings, price targets" },
  { path: "/v1/analyst-estimates", desc: "EPS and revenue estimates" },
  { path: "/v1/company/facts", desc: "Company profile and fundamentals" },
  { path: "/v1/filings", desc: "SEC EDGAR filings (10-K, 10-Q, 8-K)" },
  { path: "/v1/news", desc: "Market and company news" },
]

// Pricing tiers
const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "",
    requests: "100/day",
    features: ["All 12 endpoints", "US market data", "Community support"],
  },
  {
    name: "Basic",
    price: "$29",
    period: "/mo",
    requests: "10K/day",
    features: ["All 12 endpoints", "US + EU data", "Email support", "MCP integration"],
    highlighted: true,
  },
  {
    name: "Pro",
    price: "$99",
    period: "/mo",
    requests: "100K/day",
    features: ["All 12 endpoints", "Global data", "Priority support", "Webhooks"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    requests: "Unlimited",
    features: ["Dedicated infra", "SLA guarantee", "Custom feeds", "Slack support"],
  },
]

export default function DevelopersPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState<"claude" | "mcp" | "npm">("claude")
  const agentAnim = useScrollAnimation(0.1)
  const endpointsAnim = useScrollAnimation(0.1)
  const pricingAnim = useScrollAnimation(0.1)
  const ctaAnim = useScrollAnimation(0.1)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="min-h-dvh bg-black text-white font-['Inter',system-ui,sans-serif]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Lician Logo - Acme style */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-gradient-to-br from-[#d4ff00] to-[#9acd32] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="size-5 text-black" fill="currentColor">
                  <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" />
                </svg>
              </div>
              <span className="text-[17px] font-semibold tracking-tight">Lician</span>
            </Link>
            <div className="hidden md:flex items-center gap-1 text-[14px] text-[#868f97]">
              {["Features", "Endpoints", "Pricing", "Docs"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="px-3 py-2 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden lg:flex items-center gap-2 text-[13px] text-[#868f97]">
              <span className="size-2 rounded-full bg-[#4ebe96] animate-pulse" />
              MCP Registry Live
            </span>
            <Link
              href="/"
              className="px-5 py-2.5 bg-[#e6e6e6] text-black text-[14px] font-medium rounded-full hover:bg-white transition-colors"
            >
              Try AI Chat
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16">
        <div className="max-w-[1400px] mx-auto px-6">
          <div
            className={cn(
              "transition-all duration-1000",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            {/* Badges */}
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#d4ff00]/10 border border-[#d4ff00]/20 text-[#d4ff00] text-[12px] font-medium">
                <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10" />
                </svg>
                MCP Enabled
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#479ffa]/10 border border-[#479ffa]/20 text-[#479ffa] text-[12px] font-medium">
                141K+ Companies
              </span>
            </div>

            <span className="text-[#868f97] text-[14px]">Financial Data API</span>
            <h1 className="text-[48px] md:text-[64px] font-semibold leading-[1.05] tracking-[-0.02em] mt-2 mb-6">
              Stock data for
              <br />
              <span className="italic bg-gradient-to-r from-[#d4ff00] to-[#9acd32] bg-clip-text text-transparent">
                the agentic web.
              </span>
            </h1>
            <p className="text-[#a0a0a0] text-[18px] leading-[1.6] max-w-[560px] mb-8">
              Comprehensive financial data for AI agents, trading bots, and applications.
              Native MCP support. 839K+ records across 141K+ companies.
            </p>

            <div className="flex items-center gap-4">
              <a
                href="#quickstart"
                className="px-6 py-3 bg-[#d4ff00] text-black text-[14px] font-semibold rounded-full hover:bg-[#e5ff40] transition-colors"
              >
                Get Started Free
              </a>
              <a
                href="/openapi.json"
                target="_blank"
                className="px-6 py-3 border border-white/[0.15] text-[14px] font-medium rounded-full hover:border-white/30 hover:bg-white/[0.03] transition-colors"
              >
                OpenAPI Spec
              </a>
            </div>
          </div>

          {/* Stats */}
          <div
            className={cn(
              "grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-10 border-t border-white/[0.06]",
              "transition-all duration-700 delay-300",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            {[
              { value: "141K+", label: "Companies" },
              { value: "839K+", label: "Financial Records" },
              { value: "12", label: "Endpoints" },
              { value: "30+", label: "Years of Data" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-[28px] font-semibold text-white">{stat.value}</div>
                <div className="text-[13px] text-[#868f97]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Agent Integration */}
      <section ref={agentAnim.ref} className="py-20" id="features">
        <div className="max-w-[1400px] mx-auto px-6">
          <div
            className={cn(
              "mb-12 transition-all duration-700",
              agentAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <span className="text-[#ff9966] text-[13px] font-medium tracking-wider uppercase">
              AI-Native
            </span>
            <h2 className="text-[42px] font-semibold italic leading-[1.1] tracking-[-0.02em] mt-3 mb-4">
              Built for AI agents.
            </h2>
            <p className="text-[#a0a0a0] text-[17px] leading-[1.6] max-w-[560px]">
              Connect Claude, GPT, or any MCP-compatible agent directly to financial data.
              No middleware required.
            </p>
          </div>

          {/* Integration tabs */}
          <div className="flex items-center gap-2 mb-6">
            {[
              { id: "claude", label: "Claude Desktop" },
              { id: "mcp", label: "MCP HTTP" },
              { id: "npm", label: "NPM Package" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "claude" | "mcp" | "npm")}
                className={cn(
                  "px-4 py-2 rounded-lg text-[13px] font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-white/[0.1] text-white"
                    : "text-[#868f97] hover:text-white"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Code blocks */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="relative group">
              <div className="bg-[#0a0a0a] rounded-2xl border border-white/[0.08] p-5 overflow-x-auto">
                <pre className="text-[13px] font-mono leading-relaxed">
                  {activeTab === "claude" && (
                    <code className="text-[#a0a0a0]">
                      {`// claude_desktop_config.json
{
  `}
                      <span className="text-[#479ffa]">&quot;mcpServers&quot;</span>
                      {`: {
    `}
                      <span className="text-[#d4ff00]">&quot;lician&quot;</span>
                      {`: {
      `}
                      <span className="text-[#479ffa]">&quot;command&quot;</span>
                      {`: `}
                      <span className="text-[#4ebe96]">&quot;npx&quot;</span>
                      {`,
      `}
                      <span className="text-[#479ffa]">&quot;args&quot;</span>
                      {`: [`}
                      <span className="text-[#4ebe96]">&quot;-y&quot;</span>
                      {`, `}
                      <span className="text-[#4ebe96]">&quot;@lician/mcp-server&quot;</span>
                      {`]
    }
  }
}`}
                    </code>
                  )}
                  {activeTab === "mcp" && (
                    <code className="text-[#a0a0a0]">
                      {`curl -X POST https://lician.com/api/mcp \\
  -H "Content-Type: application/json" \\
  -d '{
    `}
                      <span className="text-[#479ffa]">&quot;method&quot;</span>
                      {`: `}
                      <span className="text-[#4ebe96]">&quot;tools/call&quot;</span>
                      {`,
    `}
                      <span className="text-[#479ffa]">&quot;params&quot;</span>
                      {`: {
      `}
                      <span className="text-[#479ffa]">&quot;name&quot;</span>
                      {`: `}
                      <span className="text-[#4ebe96]">&quot;get_stock_price&quot;</span>
                      {`,
      `}
                      <span className="text-[#479ffa]">&quot;arguments&quot;</span>
                      {`: { `}
                      <span className="text-[#479ffa]">&quot;ticker&quot;</span>
                      {`: `}
                      <span className="text-[#4ebe96]">&quot;AAPL&quot;</span>
                      {` }
    },
    `}
                      <span className="text-[#479ffa]">&quot;id&quot;</span>
                      {`: `}
                      <span className="text-[#ff9966]">1</span>
                      {`
  }'`}
                    </code>
                  )}
                  {activeTab === "npm" && (
                    <code className="text-[#a0a0a0]">
                      {`npx -y @lician/mcp-server

`}
                      <span className="text-[#868f97]">// Or install globally</span>
                      {`
npm install -g @lician/mcp-server
lician-mcp`}
                    </code>
                  )}
                </pre>
              </div>
              <CopyButton
                text={
                  activeTab === "claude"
                    ? '{\n  "mcpServers": {\n    "lician": {\n      "command": "npx",\n      "args": ["-y", "@lician/mcp-server"]\n    }\n  }\n}'
                    : activeTab === "mcp"
                    ? 'curl -X POST https://lician.com/api/mcp -H "Content-Type: application/json" -d \'{"method":"tools/call","params":{"name":"get_stock_price","arguments":{"ticker":"AAPL"}},"id":1}\''
                    : "npx -y @lician/mcp-server"
                }
              />
            </div>

            {/* Registry cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  name: "MCP Registry",
                  id: "io.github.SebastianBO/financial-data",
                  url: "https://registry.modelcontextprotocol.io",
                },
                {
                  name: "Smithery",
                  id: "@lician/financial-data",
                  url: "https://smithery.ai/server/@lician/financial-data",
                },
                {
                  name: "NPM",
                  id: "@lician/mcp-server",
                  url: "https://www.npmjs.com/package/@lician/mcp-server",
                },
                {
                  name: "HTTP Endpoint",
                  id: "lician.com/api/mcp",
                  url: "https://lician.com/api/mcp",
                },
              ].map((registry) => (
                <a
                  key={registry.name}
                  href={registry.url}
                  target="_blank"
                  rel="noopener"
                  className="p-4 bg-[#0a0a0a] rounded-xl border border-white/[0.08] hover:border-white/[0.15] transition-colors"
                >
                  <div className="text-[13px] font-medium text-white mb-1">{registry.name}</div>
                  <div className="text-[11px] text-[#868f97] font-mono truncate">{registry.id}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quickstart */}
      <section className="py-20 bg-[#050505]" id="quickstart">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-12">
            <span className="text-[#479ffa] text-[13px] font-medium tracking-wider uppercase">
              Quickstart
            </span>
            <h2 className="text-[42px] font-semibold italic leading-[1.1] tracking-[-0.02em] mt-3 mb-4">
              Start in seconds.
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Request */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-[#4ebe96]/20 text-[#4ebe96] text-[11px] font-mono font-medium rounded">
                  GET
                </span>
                <span className="text-[13px] text-[#868f97]">Request</span>
              </div>
              <div className="relative group bg-[#0a0a0a] rounded-2xl border border-white/[0.08] p-5">
                <pre className="text-[13px] font-mono text-[#a0a0a0] overflow-x-auto">
                  {`curl "https://lician.com/api/v1/prices/snapshot?ticker=AAPL"`}
                </pre>
                <CopyButton text='curl "https://lician.com/api/v1/prices/snapshot?ticker=AAPL"' />
              </div>
            </div>

            {/* Response */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-[#479ffa]/20 text-[#479ffa] text-[11px] font-mono font-medium rounded">
                  200
                </span>
                <span className="text-[13px] text-[#868f97]">Response</span>
              </div>
              <div className="relative group bg-[#0a0a0a] rounded-2xl border border-white/[0.08] p-5">
                <pre className="text-[13px] font-mono leading-relaxed overflow-x-auto">
                  <code className="text-[#a0a0a0]">
                    {`{
  `}
                    <span className="text-[#479ffa]">&quot;ticker&quot;</span>
                    {`: `}
                    <span className="text-[#4ebe96]">&quot;AAPL&quot;</span>
                    {`,
  `}
                    <span className="text-[#479ffa]">&quot;price&quot;</span>
                    {`: `}
                    <span className="text-[#ff9966]">231.85</span>
                    {`,
  `}
                    <span className="text-[#479ffa]">&quot;change&quot;</span>
                    {`: `}
                    <span className="text-[#4ebe96]">+2.34</span>
                    {`,
  `}
                    <span className="text-[#479ffa]">&quot;changePercent&quot;</span>
                    {`: `}
                    <span className="text-[#4ebe96]">+1.02%</span>
                    {`,
  `}
                    <span className="text-[#479ffa]">&quot;volume&quot;</span>
                    {`: `}
                    <span className="text-[#ff9966]">58432100</span>
                    {`,
  `}
                    <span className="text-[#479ffa]">&quot;marketCap&quot;</span>
                    {`: `}
                    <span className="text-[#ff9966]">3.58T</span>
                    {`
}`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section ref={endpointsAnim.ref} className="py-20" id="endpoints">
        <div className="max-w-[1400px] mx-auto px-6">
          <div
            className={cn(
              "mb-12 transition-all duration-700",
              endpointsAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <span className="text-[#d4ff00] text-[13px] font-medium tracking-wider uppercase">
              Endpoints
            </span>
            <h2 className="text-[42px] font-semibold italic leading-[1.1] tracking-[-0.02em] mt-3 mb-4">
              12 powerful endpoints.
            </h2>
            <p className="text-[#a0a0a0] text-[17px] leading-[1.6] max-w-[560px]">
              Everything you need for comprehensive financial analysis.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ENDPOINTS.map((ep, i) => (
              <div
                key={ep.path}
                className={cn(
                  "p-4 bg-[#0a0a0a] rounded-xl border border-white/[0.08] hover:border-white/[0.15] transition-all",
                  endpointsAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}
                style={{ transitionDelay: `${i * 50}ms`, transitionDuration: "500ms" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-1.5 py-0.5 bg-[#4ebe96]/20 text-[#4ebe96] text-[10px] font-mono font-medium rounded">
                    GET
                  </span>
                  <code className="text-[13px] font-mono text-white truncate">{ep.path}</code>
                </div>
                <p className="text-[12px] text-[#868f97]">{ep.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <a
              href="/openapi.json"
              target="_blank"
              className="text-[#d4ff00] text-[14px] hover:underline"
            >
              View full OpenAPI specification →
            </a>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section ref={pricingAnim.ref} className="py-20 bg-[#050505]" id="pricing">
        <div className="max-w-[1400px] mx-auto px-6">
          <div
            className={cn(
              "mb-12 text-center transition-all duration-700",
              pricingAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <span className="text-[#ff9966] text-[13px] font-medium tracking-wider uppercase">
              Pricing
            </span>
            <h2 className="text-[42px] font-semibold italic leading-[1.1] tracking-[-0.02em] mt-3 mb-4">
              Simple, transparent pricing.
            </h2>
            <p className="text-[#a0a0a0] text-[17px]">Start free. Scale as you grow.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-[1100px] mx-auto">
            {PRICING.map((tier, i) => (
              <div
                key={tier.name}
                className={cn(
                  "p-6 rounded-2xl border transition-all",
                  tier.highlighted
                    ? "bg-[#d4ff00]/5 border-[#d4ff00]/30"
                    : "bg-[#0a0a0a] border-white/[0.08]",
                  pricingAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}
                style={{ transitionDelay: `${i * 100}ms`, transitionDuration: "500ms" }}
              >
                {tier.highlighted && (
                  <span className="inline-block px-2 py-0.5 bg-[#d4ff00] text-black text-[10px] font-semibold rounded mb-3">
                    POPULAR
                  </span>
                )}
                <h3 className="text-[18px] font-semibold mb-1">{tier.name}</h3>
                <div className="flex items-baseline gap-0.5 mb-1">
                  <span className="text-[32px] font-semibold">{tier.price}</span>
                  <span className="text-[14px] text-[#868f97]">{tier.period}</span>
                </div>
                <div className="text-[13px] text-[#4ebe96] mb-5">{tier.requests}</div>

                <ul className="space-y-2.5 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[13px] text-[#a0a0a0]">
                      <svg
                        className="size-4 text-[#4ebe96] flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href={tier.name === "Enterprise" ? "mailto:api@lician.com" : "/developers/signup"}
                  className={cn(
                    "block w-full py-2.5 rounded-full text-[13px] font-medium text-center transition-colors",
                    tier.highlighted
                      ? "bg-[#d4ff00] text-black hover:bg-[#e5ff40]"
                      : "border border-white/[0.15] text-white hover:border-white/30 hover:bg-white/[0.03]"
                  )}
                >
                  {tier.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Discovery Files */}
      <section className="py-20">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-12">
            <span className="text-[#479ffa] text-[13px] font-medium tracking-wider uppercase">
              Agent Discovery
            </span>
            <h2 className="text-[42px] font-semibold italic leading-[1.1] tracking-[-0.02em] mt-3 mb-4">
              Machine-readable files.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "OpenAPI", path: "/openapi.json", desc: "API specification" },
              { name: "MCP Card", path: "/.well-known/mcp/server-card.json", desc: "Server metadata" },
              { name: "Agent JSON", path: "/agent.json", desc: "Capabilities" },
              { name: "llms.txt", path: "/llms.txt", desc: "LLM context" },
            ].map((file) => (
              <a
                key={file.name}
                href={file.path}
                target="_blank"
                rel="noopener"
                className="p-4 bg-[#0a0a0a] rounded-xl border border-white/[0.08] hover:border-[#479ffa]/30 hover:bg-[#479ffa]/5 transition-all group"
              >
                <div className="text-[14px] font-medium text-white group-hover:text-[#479ffa] transition-colors mb-1">
                  {file.name}
                </div>
                <div className="text-[12px] text-[#868f97] mb-2">{file.desc}</div>
                <code className="text-[11px] text-[#555] font-mono">{file.path}</code>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaAnim.ref} className="py-24 text-center">
        <div className="max-w-[1400px] mx-auto px-6">
          <p
            className={cn(
              "text-[#ff9966] text-[14px] font-medium mb-4",
              ctaAnim.isVisible ? "opacity-100" : "opacity-0"
            )}
          >
            No credit card required
          </p>
          <h2
            className={cn(
              "text-[48px] md:text-[64px] font-semibold italic leading-[1.05] tracking-[-0.02em] mb-4",
              "transition-all duration-700",
              ctaAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            Ready to build?
          </h2>
          <p
            className={cn(
              "text-[#868f97] text-[17px] max-w-md mx-auto mb-8",
              "transition-all duration-700 delay-100",
              ctaAnim.isVisible ? "opacity-100" : "opacity-0"
            )}
          >
            Join thousands of developers building with Lician.
          </p>
          <a
            href="/developers/signup"
            className={cn(
              "inline-block px-8 py-3.5 bg-[#d4ff00] text-black text-[14px] font-semibold rounded-full hover:bg-[#e5ff40] transition-colors",
              ctaAnim.isVisible ? "opacity-100" : "opacity-0"
            )}
          >
            Get your free API key
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="size-6 rounded-md bg-gradient-to-br from-[#d4ff00] to-[#9acd32] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="size-3.5 text-black" fill="currentColor">
                <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" />
              </svg>
            </div>
            <span className="text-[14px] font-medium">Lician</span>
            <span className="text-[#868f97] text-[13px]">Financial Data API</span>
          </div>
          <div className="flex items-center gap-6 text-[#868f97] text-[13px]">
            {["Docs", "Pricing", "Status", "Privacy", "Terms"].map((item) => (
              <a key={item} href={`/${item.toLowerCase()}`} className="hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
