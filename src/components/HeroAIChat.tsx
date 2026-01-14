"use client"

import { useRef, useEffect, useState, useMemo } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, Loader2, Sparkles, TrendingUp, BarChart3, PieChart, Database, Search, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"

const EXAMPLE_PROMPTS = [
  "What's NVIDIA's PE ratio and growth rate?",
  "Show me insider trading for Apple",
  "Compare Tesla vs Rivian fundamentals",
  "Who are the top institutional holders of MSFT?",
  "What are the most shorted stocks right now?",
]

// Tool icons mapping
const TOOL_ICONS: Record<string, typeof Database> = {
  getStockQuote: TrendingUp,
  getCompanyFundamentals: BarChart3,
  getFinancialStatements: Database,
  getInsiderTrades: User,
  getInstitutionalOwnership: PieChart,
  getAnalystRatings: TrendingUp,
  getShortInterest: BarChart3,
  getBiotechCatalysts: Sparkles,
  searchStocks: Search,
  getMarketMovers: TrendingUp,
  compareStocks: BarChart3,
  scrapeWebContent: Search,
  searchFinancialNews: Search,
  // New tools
  getSECFilings: Database,
  getPriceHistory: TrendingUp,
  getFinancialNews: Search,
  getSegmentedRevenue: PieChart,
  getAnalystEstimates: BarChart3,
}

// Tool display names
const TOOL_NAMES: Record<string, string> = {
  getStockQuote: "Fetching Quote",
  getCompanyFundamentals: "Analyzing Fundamentals",
  getFinancialStatements: "Loading Financials",
  getInsiderTrades: "Checking Insider Activity",
  getInstitutionalOwnership: "Analyzing Institutions",
  getAnalystRatings: "Getting Analyst Data",
  getShortInterest: "Checking Short Interest",
  getBiotechCatalysts: "Finding Biotech Events",
  searchStocks: "Searching Stocks",
  getMarketMovers: "Finding Market Movers",
  compareStocks: "Comparing Stocks",
  scrapeWebContent: "Reading Article",
  searchFinancialNews: "Searching News",
  // New tools
  getSECFilings: "Loading SEC Filings",
  getPriceHistory: "Fetching Price History",
  getFinancialNews: "Getting News",
  getSegmentedRevenue: "Analyzing Segments",
  getAnalystEstimates: "Loading Estimates",
}

interface ToolInvocationProps {
  toolName: string
  args: Record<string, unknown>
  state: string
  result?: unknown
}

function ToolArgsDisplay({ args }: { args: Record<string, unknown> }) {
  if (!args) return null

  const ticker = args.ticker as string | undefined
  const query = args.query as string | undefined
  const ticker1 = args.ticker1 as string | undefined
  const ticker2 = args.ticker2 as string | undefined
  const type = args.type as string | undefined

  return (
    <div className="text-xs text-muted-foreground mt-1">
      {ticker && <span>Looking up {ticker.toUpperCase()}</span>}
      {query && <span>Searching: {query}</span>}
      {ticker1 && ticker2 && (
        <span>Comparing {ticker1.toUpperCase()} vs {ticker2.toUpperCase()}</span>
      )}
      {type && !ticker && !query && <span>Getting {type}</span>}
    </div>
  )
}

function ToolInvocationCard({ toolName, args, state, result }: ToolInvocationProps) {
  const [expanded, setExpanded] = useState(false)
  const Icon = TOOL_ICONS[toolName] || Database
  const displayName = TOOL_NAMES[toolName] || toolName

  return (
    <div className="bg-secondary/50 rounded-lg p-3 my-2 text-sm">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-green-500" />
          <span className="font-medium">{displayName}</span>
          {state === 'call' && (
            <Loader2 className="w-3 h-3 animate-spin text-yellow-500" />
          )}
          {state === 'result' && (
            <span className="text-xs text-green-500">Done</span>
          )}
        </div>
        {result !== undefined && (
          expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
        )}
      </div>

      {/* Show ticker/query being looked up */}
      <ToolArgsDisplay args={args} />

      {/* Expandable result */}
      {expanded && result !== undefined && (
        <div className="mt-2 p-2 bg-background rounded text-xs max-h-32 overflow-y-auto">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(result, null, 2).substring(0, 500)}
            {JSON.stringify(result).length > 500 ? '...' : ''}
          </pre>
        </div>
      )}
    </div>
  )
}

export default function HeroAIChat() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [inputValue, setInputValue] = useState("")

  const transport = useMemo(() => new DefaultChatTransport({
    api: "/api/chat/public",
  }), [])

  const { messages: chatMessages, sendMessage, status, error } = useChat({
    transport,
  })

  // Add welcome message at the start
  const welcomeMessage = {
    id: "welcome",
    role: "assistant" as const,
    content: "Hi! I'm Lician AI, your financial analyst assistant. I can look up real stock data, analyze fundamentals, check insider trading, and more. Ask me anything about stocks!",
  }

  const messages = chatMessages.length === 0
    ? [welcomeMessage]
    : [welcomeMessage, ...chatMessages]

  const isLoading = status === 'streaming' || status === 'submitted'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    sendMessage({ text: inputValue })
    setInputValue("")
  }

  const handleExampleClick = (prompt: string) => {
    setInputValue(prompt)
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-secondary/20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        {/* Hero Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-500">AI-Powered Financial Analysis</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Ask AI About Any Stock
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get instant insights with real data from our database. Analyze fundamentals, track insiders, compare stocks, and more.
          </p>
        </div>

        {/* Chat Interface */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Lician AI Assistant</h2>
                  <p className="text-sm text-white/80">Real-time data • 18 financial tools</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="h-[350px] md:h-[400px] overflow-y-auto p-4 md:p-6 space-y-4"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                      message.role === "user"
                        ? "bg-green-600 text-white"
                        : "bg-secondary"
                    }`}
                  >
                    {/* Show tool invocations */}
                    {'toolInvocations' in message && Array.isArray((message as { toolInvocations?: unknown[] }).toolInvocations) && ((message as { toolInvocations?: unknown[] }).toolInvocations?.length ?? 0) > 0 && (
                      <div className="mb-2">
                        {((message as { toolInvocations: { toolCallId: string; toolName: string; args: unknown; state: string; result?: unknown }[] }).toolInvocations).map((invocation) => (
                          <ToolInvocationCard
                            key={invocation.toolCallId}
                            toolName={invocation.toolName}
                            args={invocation.args as Record<string, unknown>}
                            state={invocation.state}
                            result={'result' in invocation ? invocation.result : undefined}
                          />
                        ))}
                      </div>
                    )}

                    {/* Message content */}
                    {'content' in message && message.content && (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content as string}</p>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-secondary rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Analyzing...</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-center py-4 px-4 bg-secondary/50 rounded-xl mx-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    {error.message?.includes('429') || error.message?.includes('Rate limit')
                      ? "You've used your free questions for this hour!"
                      : "Something went wrong. Please try again."}
                  </p>
                  <Link href="/api/stripe/quick-checkout?plan=annual" prefetch={false} className="inline-flex items-center gap-2 text-sm text-green-500 hover:underline font-medium">
                    <Sparkles className="w-4 h-4" />
                    Upgrade to Premium for unlimited AI access
                  </Link>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border p-4 md:p-6 bg-secondary/30">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about any stock, insider trading, fundamentals..."
                  className="flex-1 bg-background border-border h-12 text-base"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-green-600 hover:bg-green-500 h-12 px-6"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>

          {/* Example Prompts */}
          <div className="mt-6">
            <p className="text-sm text-muted-foreground text-center mb-3">Try asking:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {EXAMPLE_PROMPTS.slice(0, 3).map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleExampleClick(prompt)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-full text-sm transition-colors disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <Link href="/screener" className="group flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-green-500/50 transition-colors">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
              <BarChart3 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="font-medium">Stock Screener</p>
              <p className="text-sm text-muted-foreground">Filter by metrics</p>
            </div>
          </Link>
          <Link href="/markets" className="group flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-green-500/50 transition-colors">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="font-medium">Market Pulse</p>
              <p className="text-sm text-muted-foreground">Real-time data</p>
            </div>
          </Link>
          <Link href="/portfolio" className="group flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-green-500/50 transition-colors">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
              <PieChart className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="font-medium">Portfolio Tracker</p>
              <p className="text-sm text-muted-foreground">Track investments</p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
