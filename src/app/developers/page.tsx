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

// API Status types
type ApiStatus = "checking" | "online" | "offline"

interface ApiEndpointStatus {
  name: string
  endpoint: string
  status: ApiStatus
  latency?: number
  lastChecked?: Date
}

// Status indicator with animations
function StatusIndicator({ status }: { status: ApiStatus }) {
  return (
    <div className="relative flex items-center gap-2">
      {/* Animated pulse ring for online status */}
      {status === "online" && (
        <span className="absolute size-3 rounded-full bg-[#4ebe96]/30 motion-safe:animate-ping" />
      )}
      {status === "checking" && (
        <span className="absolute size-3 rounded-full bg-[#479ffa]/30 motion-safe:animate-ping" />
      )}
      {/* Core dot */}
      <span
        className={cn(
          "relative size-3 rounded-full motion-safe:transition-colors duration-300",
          status === "online" && "bg-[#4ebe96]",
          status === "offline" && "bg-[#ff5c5c]",
          status === "checking" && "bg-[#479ffa]"
        )}
      />
      <span
        className={cn(
          "text-[13px] font-medium motion-safe:transition-colors duration-300",
          status === "online" && "text-[#4ebe96]",
          status === "offline" && "text-[#ff5c5c]",
          status === "checking" && "text-[#479ffa]"
        )}
      >
        {status === "online" && "Online"}
        {status === "offline" && "Offline"}
        {status === "checking" && "Checking..."}
      </span>
    </div>
  )
}

// API Health Check component - checks REAL production endpoints
function ApiHealthCheck() {
  const [endpoints, setEndpoints] = useState<ApiEndpointStatus[]>([
    { name: "Earnings Calendar", endpoint: "/api/earnings", status: "checking" },
    { name: "Stock Prices", endpoint: "/api/v1/prices/snapshot", status: "checking" },
    { name: "Financial Statements", endpoint: "/api/v1/financials/income-statements", status: "checking" },
    { name: "Analyst Ratings", endpoint: "/api/v1/analyst-ratings", status: "checking" },
    { name: "Institutional Ownership", endpoint: "/api/v1/institutional-ownership", status: "checking" },
    { name: "Market News", endpoint: "/api/v1/news", status: "checking" },
  ])

  useEffect(() => {
    const checkEndpoints = async () => {
      const updatedEndpoints = await Promise.all(
        endpoints.map(async (ep) => {
          const start = Date.now()
          try {
            // Use a simple ticker for testing
            const url = ep.endpoint.includes("?")
              ? `${ep.endpoint}&ticker=AAPL`
              : `${ep.endpoint}?ticker=AAPL`
            const res = await fetch(url, {
              method: "GET",
              cache: "no-store",
              signal: AbortSignal.timeout(5000),
            })
            const latency = Date.now() - start
            return {
              ...ep,
              status: res.ok ? "online" : "offline",
              latency,
              lastChecked: new Date(),
            } as ApiEndpointStatus
          } catch {
            return {
              ...ep,
              status: "offline",
              lastChecked: new Date(),
            } as ApiEndpointStatus
          }
        })
      )
      setEndpoints(updatedEndpoints)
    }

    checkEndpoints()
    // Re-check every 30 seconds
    const interval = setInterval(checkEndpoints, 30000)
    return () => clearInterval(interval)
  }, [])

  const onlineCount = endpoints.filter((e) => e.status === "online").length
  const overallStatus: ApiStatus =
    endpoints.some((e) => e.status === "checking")
      ? "checking"
      : onlineCount === endpoints.length
      ? "online"
      : onlineCount > 0
      ? "online"
      : "offline"

  return (
    <div className="bg-[#111] rounded-2xl border border-white/[0.08] overflow-hidden">
      {/* Header with overall status */}
      <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
        <div>
          <h3 className="text-[18px] font-semibold">API Status</h3>
          <p className="text-[13px] text-[#868f97] mt-1">Real-time endpoint health monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          <StatusIndicator status={overallStatus} />
          <span className="text-[13px] text-[#868f97]">
            {onlineCount}/{endpoints.length} endpoints
          </span>
        </div>
      </div>

      {/* Endpoint list */}
      <div className="divide-y divide-white/[0.06]">
        {endpoints.map((ep, i) => (
          <div
            key={ep.endpoint}
            className={cn(
              "flex items-center justify-between p-4 motion-safe:transition-all duration-500",
              "hover:bg-white/[0.02]"
            )}
            style={{ transitionDelay: `${i * 50}ms` }}
          >
            <div className="flex items-center gap-4">
              <StatusIndicator status={ep.status} />
              <div>
                <div className="text-[14px] font-medium text-white">{ep.name}</div>
                <code className="text-[12px] text-[#868f97] font-mono">{ep.endpoint}</code>
              </div>
            </div>
            <div className="text-right">
              {ep.latency !== undefined && (
                <div
                  className={cn(
                    "text-[14px] font-mono tabular-nums",
                    ep.latency < 100 && "text-[#4ebe96]",
                    ep.latency >= 100 && ep.latency < 300 && "text-[#f4a623]",
                    ep.latency >= 300 && "text-[#ff5c5c]"
                  )}
                >
                  {ep.latency}ms
                </div>
              )}
              {ep.lastChecked && (
                <div className="text-[11px] text-[#555]">
                  Last checked: {ep.lastChecked.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer with refresh hint */}
      <div className="p-4 bg-white/[0.02] border-t border-white/[0.08]">
        <div className="flex items-center justify-between text-[12px] text-[#868f97]">
          <span>Auto-refreshes every 30 seconds</span>
          <a href="https://status.lician.com" className="text-[#479ffa] hover:underline">
            View full status page →
          </a>
        </div>
      </div>
    </div>
  )
}

// Animated border button with dual glowing orbs
function AnimatedBorderButton({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) {
  return (
    <a href={href} className={cn("relative group inline-flex", className)}>
      {/* Cyan orb - top left */}
      <div className="absolute -top-8 -left-8 w-32 h-32 bg-[#00d4ff] rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity" />
      {/* Lime orb - bottom right */}
      <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[#d4ff00] rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity" />
      {/* Button background with rounded pill shape */}
      <span className="relative px-8 py-4 bg-black rounded-full text-white text-[15px] font-medium inline-flex items-center gap-2 border border-white/[0.1]">
        {children}
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </span>
    </a>
  )
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
    period: "/month",
    desc: "Get started with basic access",
    requests: "100 requests/day",
    features: ["100 API requests per day", "US company data only", "End-of-day prices", "Basic financials (annual)", "Community support"],
    href: "/developers/signup",
    cta: "Get Free API Key",
  },
  {
    name: "Basic",
    price: "$29",
    period: "/month",
    desc: "For individual developers",
    requests: "10,000 requests/day",
    features: ["10,000 API requests per day", "US + EU company data", "Real-time prices", "Quarterly financials", "Insider trades", "Email support"],
    highlighted: true,
    href: "/api/stripe/api-checkout?plan=basic",
    cta: "Start 7-Day Free Trial",
  },
  {
    name: "Pro",
    price: "$99",
    period: "/month",
    desc: "For growing applications",
    requests: "100,000 requests/day",
    features: ["100,000 API requests per day", "All company data globally", "Real-time + historical prices", "All financial statements", "Institutional ownership", "13F filings", "SEC filings", "Priority support"],
    href: "/api/stripe/api-checkout?plan=pro",
    cta: "Start 7-Day Free Trial",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For large-scale applications",
    requests: "Unlimited",
    features: ["Unlimited API requests", "Dedicated infrastructure", "Custom data feeds", "SLA guarantee", "Bulk data exports", "Webhook integrations", "Dedicated support", "Custom integrations"],
    href: "mailto:api@lician.com",
    cta: "Contact Sales",
  },
]

export default function DevelopersPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState<"claude" | "mcp" | "npm">("claude")
  const impactAnim = useScrollAnimation(0.1)
  const featuresAnim = useScrollAnimation(0.1)
  const endpointsAnim = useScrollAnimation(0.1)
  const pricingAnim = useScrollAnimation(0.1)
  const ctaAnim = useScrollAnimation(0.1)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="min-h-dvh bg-black text-white">
      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
          background-size: 200% 200%;
        }
      `}</style>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-white flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="size-5 text-black" fill="currentColor">
                  <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" />
                </svg>
              </div>
              <span className="text-[17px] font-semibold tracking-tight">Lician</span>
            </Link>
            <div className="hidden md:flex items-center gap-1 text-[14px] text-[#868f97]">
              {["Features", "Pricing", "Docs"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="px-3 py-2 hover:text-white transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="#quickstart" className="hidden sm:block px-4 py-2 text-[14px] text-[#868f97] hover:text-white transition-colors">
              Documentation
            </a>
            <Link
              href="/"
              className="px-5 py-2.5 bg-white text-black text-[14px] font-medium rounded-full hover:bg-white/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          {/* Announcement pill */}
          <div
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.1] mb-8 transition-all duration-700",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <svg className="size-4 text-[#d4ff00]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            <span className="text-[14px] text-[#a0a0a0]">Introducing MCP Support — Now AI-native</span>
          </div>

          {/* Main headline - Bold, heavy, two-tone */}
          <h1
            className={cn(
              "transition-all duration-1000 delay-100",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <span className="block text-[56px] md:text-[72px] lg:text-[84px] font-bold leading-[0.95] tracking-[-0.03em]">
              Build faster.
            </span>
            <span className="block text-[56px] md:text-[72px] lg:text-[84px] font-bold leading-[0.95] tracking-[-0.03em] text-[#555]">
              Ship smarter.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className={cn(
              "text-[18px] md:text-[20px] text-[#868f97] leading-[1.5] max-w-[600px] mx-auto mt-8 mb-10 transition-all duration-700 delay-200",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            The all-in-one financial data API that helps teams build, deploy, and
            scale their products 10x faster. No complexity, just results.
          </p>

          {/* CTAs */}
          <div
            className={cn(
              "flex items-center justify-center gap-4 mb-12 transition-all duration-700 delay-300",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <AnimatedBorderButton href="#quickstart">
              Start Free Trial
            </AnimatedBorderButton>
            <a
              href="#features"
              className="inline-flex items-center gap-2 text-[15px] text-[#868f97] hover:text-white transition-colors"
            >
              See how it works
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Social proof */}
          <div
            className={cn(
              "flex items-center justify-center gap-6 transition-all duration-700 delay-400",
              isLoaded ? "opacity-100" : "opacity-0"
            )}
          >
            {/* Avatar stack with AI-generated headshots */}
            <div className="flex -space-x-3">
              {[
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="size-10 rounded-full border-2 border-[#0a0a0a] object-cover"
                />
              ))}
            </div>
            <div className="h-8 w-px bg-white/[0.1]" />
            {/* Stars */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="size-5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="text-[14px] text-[#868f97]">5.0</span>
            </div>
            <span className="text-[14px] text-[#868f97]">
              Trusted by <span className="text-white font-medium">10,000+</span> developers
            </span>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section ref={impactAnim.ref} className="py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div
            className={cn(
              "text-center mb-16 transition-all duration-700",
              impactAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <span className="text-[13px] text-[#868f97] tracking-widest uppercase">Our Impact</span>
            <h2 className="text-[40px] md:text-[56px] font-bold leading-[1.05] tracking-[-0.02em] mt-4">
              Trusted by teams worldwide
            </h2>
            <p className="text-[18px] text-[#868f97] mt-4 max-w-[500px] mx-auto">
              Numbers that speak for themselves. See why thousands choose us.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { value: "99.99%", label: "Uptime SLA", desc: "Enterprise reliability" },
              { value: "10M+", label: "API Requests/Day", desc: "Proven at scale" },
              { value: "<50ms", label: "Avg Response", desc: "Blazing fast" },
              { value: "150+", label: "Countries", desc: "Global reach" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={cn(
                  "p-8 rounded-2xl border border-white/[0.08] bg-[#111] transition-all duration-500",
                  impactAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="text-[40px] md:text-[48px] font-bold italic tracking-tight">{stat.value}</div>
                <div className="text-[16px] font-medium text-white mt-2">{stat.label}</div>
                <div className="text-[14px] text-[#868f97]">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Bento Grid */}
      <section ref={featuresAnim.ref} className="py-24" id="features">
        <div className="max-w-[1200px] mx-auto px-6">
          <div
            className={cn(
              "text-center mb-16 transition-all duration-700",
              featuresAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <span className="text-[13px] text-[#868f97] tracking-widest uppercase">Features</span>
            <h2 className="text-[40px] md:text-[56px] font-bold leading-[1.05] tracking-[-0.02em] mt-4">
              Everything you need to succeed
            </h2>
            <p className="text-[18px] text-[#868f97] mt-4">
              Powerful features designed to help you ship better products, faster.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Feature 1 - Large */}
            <div
              className={cn(
                "p-8 rounded-2xl border border-white/[0.08] bg-[#111] transition-all duration-500",
                featuresAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-xl bg-white/[0.05] flex items-center justify-center">
                  <svg className="size-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M3 3v18h18" />
                    <path d="M7 16l4-8 4 4 6-9" />
                  </svg>
                </div>
                <h3 className="text-[18px] font-semibold">Real-time Dashboard</h3>
              </div>
              <p className="text-[#868f97] text-[15px] mb-6">
                Track every metric that matters with customizable dashboards.
              </p>
              {/* Mock dashboard */}
              <div className="bg-black rounded-xl border border-white/[0.08] p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="size-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="size-2.5 rounded-full bg-[#febc2e]" />
                  <div className="size-2.5 rounded-full bg-[#28c840]" />
                  <span className="ml-auto text-[11px] text-[#555]">Users</span>
                  <span className="text-[11px] text-[#555]">Revenue</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Total Users", value: "12.4K", change: "+12%" },
                    { label: "Revenue", value: "$48.2K", change: "+8%" },
                    { label: "Conversion", value: "3.2%", change: "+2%" },
                  ].map((m) => (
                    <div key={m.label} className="bg-white/[0.03] rounded-lg p-3">
                      <div className="text-[11px] text-[#868f97]">{m.label}</div>
                      <div className="text-[18px] font-semibold mt-1">
                        {m.value} <span className="text-[12px] text-[#4ebe96]">{m.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div
              className={cn(
                "p-8 rounded-2xl border border-white/[0.08] bg-[#111] transition-all duration-500",
                featuresAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: "100ms" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-xl bg-white/[0.05] flex items-center justify-center">
                  <svg className="size-5 text-[#d4ff00]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" />
                  </svg>
                </div>
                <h3 className="text-[18px] font-semibold">Blazing Fast</h3>
              </div>
              <p className="text-[#868f97] text-[15px] mb-6">
                Optimized for speed at any scale.
              </p>
              {/* Uptime visual */}
              <div className="mt-auto">
                <div className="text-[56px] font-bold">99.9%</div>
                <div className="text-[14px] text-[#868f97]">uptime</div>
                <div className="mt-4 h-2 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full w-[99.9%] bg-gradient-to-r from-[#4ebe96] to-[#4ebe96]/50 rounded-full" />
                </div>
              </div>
            </div>

            {/* Feature 3 - MCP Integration */}
            <div
              className={cn(
                "p-8 rounded-2xl border border-white/[0.08] bg-[#111] transition-all duration-500",
                featuresAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: "200ms" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-xl bg-white/[0.05] flex items-center justify-center">
                  <svg className="size-5 text-[#479ffa]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v4m0 14v4M4.22 4.22l2.83 2.83m9.9 9.9l2.83 2.83M1 12h4m14 0h4M4.22 19.78l2.83-2.83m9.9-9.9l2.83-2.83" />
                  </svg>
                </div>
                <h3 className="text-[18px] font-semibold">MCP Native</h3>
              </div>
              <p className="text-[#868f97] text-[15px] mb-6">
                Connect Claude, GPT, or any MCP-compatible agent directly.
              </p>
              {/* Code preview */}
              <div className="bg-black rounded-xl border border-white/[0.08] p-4 font-mono text-[12px]">
                <div className="text-[#868f97]">// claude_desktop_config.json</div>
                <div className="text-[#479ffa]">{`"mcpServers"`}: {'{'}</div>
                <div className="pl-4 text-[#d4ff00]">{`"lician"`}: {'{'}</div>
                <div className="pl-8"><span className="text-[#479ffa]">{`"command"`}</span>: <span className="text-[#4ebe96]">{`"npx"`}</span></div>
                <div className="pl-4">{'}'}</div>
                <div>{'}'}</div>
              </div>
            </div>

            {/* Feature 4 */}
            <div
              className={cn(
                "p-8 rounded-2xl border border-white/[0.08] bg-[#111] transition-all duration-500",
                featuresAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: "300ms" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-xl bg-white/[0.05] flex items-center justify-center">
                  <svg className="size-5 text-[#ff9966]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-[18px] font-semibold">Enterprise Security</h3>
              </div>
              <p className="text-[#868f97] text-[15px] mb-6">
                SOC 2 compliant with end-to-end encryption.
              </p>
              {/* Security badges */}
              <div className="grid grid-cols-2 gap-3">
                {["SOC 2 Type II", "GDPR", "HIPAA Ready", "256-bit SSL"].map((badge) => (
                  <div key={badge} className="bg-white/[0.03] rounded-lg px-3 py-2 text-[12px] text-center">
                    {badge}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API Status - Live Health Check Demo */}
      <section className="py-24 bg-black" id="status">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[13px] text-[#4ebe96] tracking-widest uppercase">Live Demo</span>
            <h2 className="text-[40px] md:text-[48px] font-bold leading-[1.05] tracking-[-0.02em] mt-4 text-balance">
              Earnings & Financial Data API
            </h2>
            <p className="text-[18px] text-[#868f97] mt-4 max-w-[600px] mx-auto text-pretty">
              Watch our endpoints in real-time. Green means online and fast. This is the same infrastructure your app will use.
            </p>
          </div>
          <div className="max-w-[800px] mx-auto">
            <ApiHealthCheck />
          </div>
        </div>
      </section>

      {/* Quickstart */}
      <section className="py-24 bg-black" id="quickstart">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[13px] text-[#479ffa] tracking-widest uppercase">Quick Start</span>
            <h2 className="text-[40px] md:text-[48px] font-bold leading-[1.05] tracking-[-0.02em] mt-4">
              Start in seconds
            </h2>
          </div>

          {/* Integration tabs */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[
              { id: "claude", label: "Claude Desktop" },
              { id: "mcp", label: "HTTP API" },
              { id: "npm", label: "NPM" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "claude" | "mcp" | "npm")}
                className={cn(
                  "px-5 py-2.5 rounded-full text-[14px] font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-white text-black"
                    : "bg-white/[0.05] text-[#868f97] hover:text-white hover:bg-white/[0.1]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Code block */}
          <div className="max-w-[800px] mx-auto">
            <div className="relative group bg-[#111] rounded-2xl border border-white/[0.08] p-6 overflow-x-auto">
              <pre className="text-[14px] font-mono leading-relaxed">
                {activeTab === "claude" && (
                  <code className="text-[#a0a0a0]">
                    {`// Add to ~/Library/Application Support/Claude/claude_desktop_config.json
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
                    {`curl https://lician.com/api/v1/prices/snapshot?ticker=AAPL

`}
                    <span className="text-[#868f97]"># Response:</span>
                    {`
{
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
                    <span className="text-[#479ffa]">&quot;volume&quot;</span>
                    {`: `}
                    <span className="text-[#ff9966]">58432100</span>
                    {`
}`}
                  </code>
                )}
                {activeTab === "npm" && (
                  <code className="text-[#a0a0a0]">
                    {`npm install @lician/mcp-server

`}
                    <span className="text-[#868f97]"># Or run directly with npx:</span>
                    {`
npx -y @lician/mcp-server`}
                  </code>
                )}
              </pre>
              <CopyButton
                text={
                  activeTab === "claude"
                    ? '{\n  "mcpServers": {\n    "lician": {\n      "command": "npx",\n      "args": ["-y", "@lician/mcp-server"]\n    }\n  }\n}'
                    : activeTab === "mcp"
                    ? 'curl https://lician.com/api/v1/prices/snapshot?ticker=AAPL'
                    : "npm install @lician/mcp-server"
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section ref={endpointsAnim.ref} className="py-24" id="endpoints">
        <div className="max-w-[1200px] mx-auto px-6">
          <div
            className={cn(
              "text-center mb-16 transition-all duration-700",
              endpointsAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <span className="text-[13px] text-[#868f97] tracking-widest uppercase">API Endpoints</span>
            <h2 className="text-[40px] md:text-[48px] font-bold leading-[1.05] tracking-[-0.02em] mt-4">
              RESTful JSON API with consistent, predictable responses
            </h2>
          </div>

          <div className="space-y-3">
            {ENDPOINTS.map((ep, i) => (
              <div
                key={ep.path}
                className={cn(
                  "flex items-center gap-4 p-4 bg-[#111] rounded-xl border border-white/[0.08] hover:border-white/[0.15] transition-all",
                  endpointsAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
                style={{ transitionDelay: `${i * 30}ms`, transitionDuration: "400ms" }}
              >
                <span className="px-2.5 py-1 bg-[#4ebe96]/20 text-[#4ebe96] text-[11px] font-mono font-semibold rounded">
                  GET
                </span>
                <code className="text-[14px] font-mono text-white">{ep.path}</code>
                <span className="text-[14px] text-[#868f97] ml-auto hidden md:block">{ep.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section ref={pricingAnim.ref} className="py-24 bg-black" id="pricing">
        <div className="max-w-[1200px] mx-auto px-6">
          <div
            className={cn(
              "text-center mb-16 transition-all duration-700",
              pricingAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <span className="text-[13px] text-[#868f97] tracking-widest uppercase">Pricing</span>
            <h2 className="text-[40px] md:text-[48px] font-bold leading-[1.05] tracking-[-0.02em] mt-4">
              Simple, transparent pricing
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRICING.map((tier, i) => (
              <div
                key={tier.name}
                className={cn(
                  "relative p-6 rounded-2xl border transition-all duration-500",
                  tier.highlighted
                    ? "bg-white/[0.03] border-white/[0.15]"
                    : "bg-[#111] border-white/[0.08]",
                  pricingAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {tier.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-black text-[11px] font-semibold rounded-full">
                    POPULAR
                  </span>
                )}
                <h3 className="text-[18px] font-semibold">{tier.name}</h3>
                <p className="text-[13px] text-[#868f97] mt-1">{tier.desc}</p>
                <div className="flex items-baseline gap-1 mt-4 mb-2">
                  <span className="text-[36px] font-bold">{tier.price}</span>
                  <span className="text-[14px] text-[#868f97]">{tier.period}</span>
                </div>
                <div className="text-[13px] text-[#4ebe96] mb-6">{tier.requests}</div>

                <ul className="space-y-3 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13px] text-[#a0a0a0]">
                      <svg
                        className="size-4 text-[#4ebe96] flex-shrink-0 mt-0.5"
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
                  href={tier.href}
                  className={cn(
                    "block w-full py-3 rounded-full text-[14px] font-medium text-center transition-colors",
                    tier.highlighted
                      ? "bg-white text-black hover:bg-white/90"
                      : "border border-white/[0.15] text-white hover:border-white/30 hover:bg-white/[0.03]"
                  )}
                >
                  {tier.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaAnim.ref} className="py-32 text-center">
        <div className="max-w-[1200px] mx-auto px-6">
          <div
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.1] mb-8 transition-all duration-700",
              ctaAnim.isVisible ? "opacity-100" : "opacity-0"
            )}
          >
            <svg className="size-4 text-[#4ebe96]" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span className="text-[14px] text-[#a0a0a0]">No credit card required</span>
          </div>

          <h2
            className={cn(
              "text-[48px] md:text-[64px] lg:text-[72px] font-bold leading-[0.95] tracking-[-0.03em] mb-6 transition-all duration-700",
              ctaAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            Ready to build?
          </h2>

          <p
            className={cn(
              "text-[18px] text-[#868f97] max-w-[500px] mx-auto mb-10 transition-all duration-700 delay-100",
              ctaAnim.isVisible ? "opacity-100" : "opacity-0"
            )}
          >
            Join thousands of developers building the future of finance with Lician.
          </p>

          <AnimatedBorderButton href="/developers/signup">
            Get Free API Key
          </AnimatedBorderButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/[0.08]">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-md bg-white flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="size-4 text-black" fill="currentColor">
                  <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" />
                </svg>
              </div>
              <span className="text-[15px] font-medium">Lician</span>
            </div>
            <div className="flex items-center gap-8 text-[14px] text-[#868f97]">
              {["Documentation", "Pricing", "Status", "Privacy", "Terms"].map((item) => (
                <a key={item} href={`/${item.toLowerCase()}`} className="hover:text-white transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
