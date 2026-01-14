"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Wallet,
  Calculator,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Search,
  Calendar,
  FileText,
  Bell,
  Settings,
  Sparkles,
  MoreHorizontal,
  Flame,
  Building2,
  LineChart,
  Briefcase,
  Zap,
  ChevronDown,
  ChevronRight,
  Newspaper,
  Shield,
  Globe,
  PenSquare,
  History,
  Star,
  Gift,
  Paperclip,
  X,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  ArrowUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase-browser"
import StockLogo from "@/components/StockLogo"
import { parseTickerSymbolsWithMarkdown } from "@/lib/parseTickerSymbols"

// Sidebar navigation - main tools
const SIDEBAR_TOP = [
  { id: "new", icon: PenSquare, label: "New chat", href: null, action: "new" },
  { id: "search", icon: Search, label: "Search", href: "/screener" },
  { id: "markets", icon: TrendingUp, label: "Markets", href: "/markets" },
  { id: "history", icon: History, label: "History", href: "/dashboard" },
]

// Sidebar - account & settings
const SIDEBAR_BOTTOM = [
  { id: "portfolio", icon: Briefcase, label: "Portfolio", href: "/dashboard/portfolios" },
  { id: "watchlist", icon: Star, label: "Watchlist", href: "/portfolio" },
  { id: "screener", icon: BarChart3, label: "Screener", href: "/screener" },
  { id: "alerts", icon: Bell, label: "Alerts", href: "/dashboard" },
  { id: "settings", icon: Settings, label: "Settings", href: "/settings" },
]

// Financial tool actions (shown as pill buttons)
const FINANCIAL_TOOLS = [
  { id: "portfolio", label: "Connect Portfolio", icon: Wallet, href: "/dashboard/portfolios" },
  { id: "screener", label: "Stock Screener", icon: BarChart3, href: "/screener" },
  { id: "compare", label: "Compare Stocks", icon: LineChart, href: "/compare/AAPL-vs-MSFT" },
  { id: "valuation", label: "DCF Valuation", icon: Calculator, href: "/learn/dcf-valuation" },
  { id: "more", label: "More", icon: MoreHorizontal, href: null },
]

// More tools dropdown
const MORE_TOOLS = [
  { label: "Earnings Calendar", icon: Calendar, href: "/earnings" },
  { label: "Learn Investing", icon: FileText, href: "/learn" },
  { label: "Insider Trading", icon: Building2, href: "/insider-trading" },
  { label: "Top Gainers", icon: Flame, href: "/markets/top-gainers" },
  { label: "Short Interest", icon: TrendingDown, href: "/short-interest" },
  { label: "FDA Calendar", icon: Shield, href: "/biotech/fda-calendar" },
  { label: "Market News", icon: Newspaper, href: "/news" },
  { label: "Economic Calendar", icon: Globe, href: "/economic-calendar" },
]

// Manus-style bottom carousel slides with clickable tags
const CAROUSEL_SLIDES = [
  {
    id: "data",
    title: "Powerful Financial Data",
    subtitle: "Access comprehensive market intelligence",
    tags: [
      { label: "SEC EDGAR", query: "Show me the latest SEC filings" },
      { label: "Norway Data", query: "Find top Norwegian companies by revenue" },
      { label: "UK Companies", query: "Analyze UK companies with highest growth" },
      { label: "EU Markets", query: "Compare European market performance" },
      { label: "Insider Trading", query: "Show recent insider trading activity" },
      { label: "Real-time Prices", query: "What are today's top market movers?" },
    ],
    icon: "chart",
    link: "/data-sources",
  },
  {
    id: "share",
    title: "Share your research and get credits",
    subtitle: "Share on LinkedIn and tag @Lician. Then DM us to get credits.",
    tags: [],
    icon: "social",
    link: null,
  },
  {
    id: "coverage",
    title: "100,000+ Companies Analyzed",
    subtitle: "US, Norway, UK, Finland, Denmark and growing",
    tags: [
      { label: "🇺🇸 US", query: "Show me top US tech companies" },
      { label: "🇳🇴 Norway", query: "Analyze Norwegian oil and energy stocks" },
      { label: "🇬🇧 UK", query: "Find UK FTSE 100 companies" },
      { label: "🇫🇮 Finland", query: "Show Finnish companies like Nokia" },
      { label: "🇩🇰 Denmark", query: "Analyze Danish companies like Novo Nordisk" },
    ],
    icon: "globe",
    link: "/markets",
  },
]

// Sample prompts for modal
const SAMPLE_PROMPTS = [
  { text: "Analyze Tesla's insider trading patterns", icon: Building2 },
  { text: "Compare NVIDIA vs AMD financials", icon: LineChart },
  { text: "Find undervalued Norwegian stocks", icon: Globe },
  { text: "UK companies with highest revenue growth", icon: TrendingUp },
]

// AI Models - Must match /api/chat/autonomous AVAILABLE_MODELS
const MODELS = [
  // Fast (default)
  { key: 'gemini-flash', name: 'Gemini Flash', tier: 'fast' },
  // Standard
  { key: 'gpt-4o-mini', name: 'GPT-4o Mini', tier: 'standard' },
  { key: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', tier: 'standard' },
  { key: 'llama-3.3-70b', name: 'Llama 3.3 70B', tier: 'standard' },
  // Premium (requires subscription)
  { key: 'gpt-4o', name: 'GPT-4o', tier: 'premium' },
  { key: 'claude-sonnet-4', name: 'Claude Sonnet 4', tier: 'premium' },
]


interface Mover {
  symbol: string
  name: string
  price: number
  changePercent: number
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface Task {
  id: string
  description: string
  status?: string
}

export default function ManusStyleHome() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [credits, setCredits] = useState(300)
  const [movers, setMovers] = useState<Mover[]>([])
  const [showMoreTools, setShowMoreTools] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Chat state - integrated directly
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [selectedModel, setSelectedModel] = useState(MODELS[0])
  const [tasks, setTasks] = useState<Task[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [carouselDismissed, setCarouselDismissed] = useState(false)
  const [showDismissTooltip, setShowDismissTooltip] = useState(false)
  const [showModelSelector, setShowModelSelector] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Check for query param to auto-start chat
  useEffect(() => {
    const query = searchParams.get("q")
    if (query) {
      setInputValue(query)
    }
  }, [searchParams])

  // Check if carousel was dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem("carousel_dismissed")
    if (dismissed === "true") {
      setCarouselDismissed(true)
    }
  }, [])

  const handleDismissCarousel = () => {
    setCarouselDismissed(true)
    localStorage.setItem("carousel_dismissed", "true")
  }

  const handleCarouselClick = (slide: typeof CAROUSEL_SLIDES[0]) => {
    if (slide.link) {
      router.push(slide.link)
    } else if (slide.id === "share") {
      // Open LinkedIn share
      window.open("https://www.linkedin.com/sharing/share-offsite/?url=https://lician.com", "_blank")
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const savedCredits = localStorage.getItem(`credits_${user.id}`)
        setCredits(savedCredits ? parseInt(savedCredits, 10) : 1000)
      } else {
        const savedCredits = localStorage.getItem("credits_anonymous")
        setCredits(savedCredits ? parseInt(savedCredits, 10) : 300)
      }

      setLoading(false)
    }
    checkAuth()

    // Fetch trending stocks for stock logos
    fetch("/api/trending")
      .then(res => res.json())
      .then(data => {
        const all = [...(data.gainers || []), ...(data.losers || [])].slice(0, 6)
        setMovers(all)
      })
      .catch(() => {})
  }, [supabase.auth])

  // Auto-rotate carousel
  useEffect(() => {
    if (messages.length > 0) return // Don't rotate when chatting
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % CAROUSEL_SLIDES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [messages.length])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px'
    }
  }, [inputValue])

  // Scroll to bottom when new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleToolClick = (tool: typeof FINANCIAL_TOOLS[0]) => {
    if (tool.id === "more") {
      setShowMoreTools(!showMoreTools)
    } else if (tool.href) {
      router.push(tool.href)
    }
  }

  const handleSidebarAction = (item: typeof SIDEBAR_TOP[0]) => {
    if (item.action === "new") {
      // Clear chat and start fresh
      setMessages([])
      setInputValue("")
      setTasks([])
    } else if (item.href) {
      router.push(item.href)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && (file.type === 'application/pdf' || file.type.startsWith('text/') || file.type.includes('document'))) {
      setAttachedFile(file)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const copyToClipboard = (content: string, id: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSubmit = async () => {
    if ((!inputValue.trim() && !attachedFile) || isLoading) return

    let queryContent = inputValue.trim()
    let fileContent = ""

    // If file attached, upload and parse it first
    if (attachedFile) {
      setIsLoading(true)
      setTasks([{ id: "upload", description: "Parsing uploaded document...", status: "running" }])

      try {
        const formData = new FormData()
        formData.append("file", attachedFile)

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (uploadRes.ok) {
          const parsed = await uploadRes.json()
          fileContent = `\n\n--- Uploaded Document: ${parsed.filename} ---\n${parsed.content}\n--- End Document ---`
          setTasks([{ id: "upload", description: "Document parsed successfully", status: "completed" }])
        } else {
          setTasks([{ id: "upload", description: "Failed to parse document", status: "completed" }])
        }
      } catch {
        setTasks([{ id: "upload", description: "Failed to parse document", status: "completed" }])
      }

      queryContent = queryContent
        ? `${queryContent}${fileContent}`
        : `Please analyze the following document:${fileContent}`
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim() || `Analyzing: ${attachedFile?.name}`,
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setAttachedFile(null)
    setIsLoading(true)

    const assistantId = (Date.now() + 1).toString()
    let answerContent = ""

    try {
      const response = await fetch('/api/chat/autonomous', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryContent,
          conversationHistory: messages.slice(-6).map(m => ({
            role: m.role,
            content: m.content,
          })),
          model: selectedModel.key,
          stream: true,
        }),
      })

      if (!response.ok) throw new Error('Request failed')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader')

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        const lines = text.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const event = JSON.parse(data)

              switch (event.type) {
                case 'plan':
                  if (event.data?.tasks) {
                    setTasks(event.data.tasks)
                  }
                  break

                case 'task-start':
                  setTasks(prev =>
                    prev.map(t =>
                      t.id === event.data.id ? { ...t, status: 'running' } : t
                    )
                  )
                  break

                case 'task-complete':
                  setTasks(prev =>
                    prev.map(t =>
                      t.id === event.data.task?.id ? { ...t, status: 'completed' } : t
                    )
                  )
                  break

                case 'answer-chunk':
                  answerContent += event.data as string
                  setMessages(prev => {
                    const existing = prev.find(m => m.id === assistantId)
                    if (existing) {
                      return prev.map(m =>
                        m.id === assistantId ? { ...m, content: answerContent } : m
                      )
                    }
                    return [...prev, { id: assistantId, role: 'assistant', content: answerContent }]
                  })
                  break

                case 'error':
                  setMessages(prev => [
                    ...prev,
                    { id: assistantId, role: 'assistant', content: 'Something went wrong. Please try again.' },
                  ])
                  break
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { id: assistantId, role: 'assistant', content: 'Sorry, the request failed. Please try again.' },
      ])
    } finally {
      setIsLoading(false)
      setTimeout(() => setTasks([]), 1000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const hasMessages = messages.length > 0

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left Sidebar */}
      <aside
        className={cn(
          "flex flex-col py-4 border-r border-border bg-card/50 transition-all duration-200",
          sidebarExpanded ? "w-52" : "w-14"
        )}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        {/* Logo - Lician brand */}
        <Link href="/" className="mb-6 flex items-center gap-3 px-3">
          <div className="w-9 h-9 bg-foreground rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-background font-bold text-lg">L</span>
          </div>
          {sidebarExpanded && (
            <span className="font-semibold text-lg whitespace-nowrap">Lician</span>
          )}
        </Link>

        {/* Top nav items */}
        <nav className="flex flex-col gap-1 w-full px-2">
          {SIDEBAR_TOP.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSidebarAction(item)}
              className={cn(
                "w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-colors",
                "text-muted-foreground hover:text-foreground hover:bg-secondary",
                item.action === "new" && "bg-green-500/10 text-green-500 hover:bg-green-500/20"
              )}
              title={item.label}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarExpanded && (
                <span className="text-sm whitespace-nowrap">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom nav items */}
        <nav className="flex flex-col gap-1 w-full px-2">
          {SIDEBAR_BOTTOM.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-colors",
                "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
              title={item.label}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarExpanded && (
                <span className="text-sm whitespace-nowrap">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Lician AI</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="flex items-center gap-4">
            {/* Free plan / Start trial */}
            {!loading && !user && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Free plan</span>
                <span className="text-muted-foreground">|</span>
                <Link href="/api/stripe/quick-checkout?plan=annual" className="text-green-500 hover:text-green-400 font-medium">
                  Start free trial
                </Link>
              </div>
            )}

            {/* Credits */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">{credits}</span>
            </div>

            {/* Share credits */}
            <button
              className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
              title="Invite friends for free credits"
            >
              <Gift className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors">
              <Bell className="w-5 h-5" />
            </button>

            {/* User/Auth */}
            {loading ? (
              <div className="w-9 h-9 bg-secondary animate-pulse rounded-full" />
            ) : user ? (
              <Link href="/dashboard">
                <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white font-medium">
                  {user.email?.charAt(0).toUpperCase() || "U"}
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/login">
                  <Button size="sm" className="bg-green-600 hover:bg-green-500">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Main chat area - always centered */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages area - scrollable */}
          {hasMessages && (
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="max-w-2xl mx-auto space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3",
                        message.role === 'user'
                          ? "bg-green-600 text-white"
                          : "bg-card border border-border"
                      )}
                    >
                      <div className="text-sm whitespace-pre-wrap">
                        {message.role === 'assistant'
                          ? parseTickerSymbolsWithMarkdown(message.content)
                          : message.content
                        }
                      </div>
                      {message.role === 'assistant' && message.content && (
                        <button
                          onClick={() => copyToClipboard(message.content, message.id)}
                          className="mt-2 p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                        >
                          {copiedId === message.id ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Research tasks indicator */}
                {isLoading && tasks.length > 0 && (
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Loader2 className="w-4 h-4 animate-spin text-green-500" />
                      <span className="text-sm font-medium">Researching...</span>
                    </div>
                    <div className="space-y-2">
                      {tasks.map(task => (
                        <div key={task.id} className="flex items-center gap-2 text-sm">
                          {task.status === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : task.status === 'running' ? (
                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />
                          )}
                          <span className={task.status === 'completed' ? 'text-muted-foreground' : ''}>
                            {task.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Centered input area */}
          <div className={cn(
            "flex flex-col items-center px-6 py-8",
            hasMessages ? "border-t border-border" : "flex-1 justify-center"
          )}>
            {/* Heading - only show when no messages */}
            {!hasMessages && (
              <h1 className="text-4xl md:text-5xl font-semibold text-center mb-10">
                What can I do for you?
              </h1>
            )}

            {/* Chat input */}
            <div className="w-full max-w-2xl">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.csv,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Attached file preview */}
              {attachedFile && (
                <div className="mb-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-lg text-sm">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate max-w-[200px]">{attachedFile.name}</span>
                    <button
                      onClick={() => setAttachedFile(null)}
                      className="p-1.5 hover:bg-secondary rounded transition-colors min-w-[28px] min-h-[28px] flex items-center justify-center"
                      aria-label="Remove attached file"
                    >
                      <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>
                </div>
              )}

              <div className="relative bg-card border border-border rounded-2xl shadow-lg focus-within:border-green-500/50 transition-all">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about any stock, market trends, or financial analysis..."
                  className="w-full min-h-[80px] max-h-[150px] py-4 px-5 pb-14 pr-14 text-lg bg-transparent border-none resize-none focus:outline-none placeholder:text-muted-foreground"
                  disabled={isLoading}
                  rows={1}
                />

                {/* Bottom toolbar */}
                <div className="absolute left-3 bottom-3 flex items-center gap-1">
                  {/* File attachment button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
                    title="Attach PDF or document"
                    aria-label="Attach PDF or document"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  {/* Model selector */}
                  <div className="relative">
                    <button
                      onClick={() => setShowModelSelector(!showModelSelector)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors text-sm"
                      title="Select AI model"
                      aria-label="Select AI model"
                      aria-expanded={showModelSelector}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span className="hidden sm:inline">{selectedModel.name}</span>
                      <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showModelSelector && "rotate-180")} />
                    </button>

                    {showModelSelector && (
                      <div className="absolute bottom-full left-0 mb-2 w-56 bg-card border border-border rounded-xl shadow-xl py-2 z-50">
                        {/* Fast */}
                        <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase">Fast</div>
                        {MODELS.filter(m => m.tier === 'fast').map((model) => (
                          <button
                            key={model.key}
                            onClick={() => {
                              setSelectedModel(model)
                              setShowModelSelector(false)
                            }}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                              selectedModel.key === model.key
                                ? "bg-green-500/10 text-green-500"
                                : "text-foreground hover:bg-secondary"
                            )}
                          >
                            <Zap className="w-4 h-4 text-blue-500" />
                            {model.name}
                            {selectedModel.key === model.key && <Check className="w-4 h-4 ml-auto" />}
                          </button>
                        ))}
                        {/* Standard */}
                        <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase mt-2 border-t border-border pt-2">Standard</div>
                        {MODELS.filter(m => m.tier === 'standard').map((model) => (
                          <button
                            key={model.key}
                            onClick={() => {
                              setSelectedModel(model)
                              setShowModelSelector(false)
                            }}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                              selectedModel.key === model.key
                                ? "bg-green-500/10 text-green-500"
                                : "text-foreground hover:bg-secondary"
                            )}
                          >
                            <Sparkles className="w-4 h-4" />
                            {model.name}
                            {selectedModel.key === model.key && <Check className="w-4 h-4 ml-auto" />}
                          </button>
                        ))}
                        {/* Premium */}
                        <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase mt-2 border-t border-border pt-2">Premium</div>
                        {MODELS.filter(m => m.tier === 'premium').map((model) => (
                          <button
                            key={model.key}
                            onClick={() => {
                              setShowModelSelector(false)
                              // Redirect to Stripe checkout for premium
                              router.push('/api/stripe/quick-checkout?plan=monthly')
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-foreground hover:bg-secondary"
                          >
                            <Zap className="w-4 h-4 text-yellow-500" />
                            {model.name}
                            <span className="ml-auto text-xs text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">PRO</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || (!inputValue.trim() && !attachedFile)}
                  className={cn(
                    "absolute right-4 bottom-4 w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
                    (inputValue.trim() || attachedFile) && !isLoading
                      ? "bg-green-600 hover:bg-green-500 text-white"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ArrowUp className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Tool buttons - only show when no messages */}
              {!hasMessages && (
                <>
                  {/* Financial tool buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                    {FINANCIAL_TOOLS.map((tool) => (
                      <div key={tool.id} className="relative">
                        <button
                          onClick={() => handleToolClick(tool)}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-full",
                            "border border-border bg-card hover:bg-secondary",
                            "text-sm font-medium transition-colors"
                          )}
                        >
                          <tool.icon className="w-4 h-4" />
                          {tool.label}
                        </button>

                        {/* More tools dropdown */}
                        {tool.id === "more" && showMoreTools && (
                          <div className="absolute top-full right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl py-2 z-50">
                            {MORE_TOOLS.map((moreTool) => (
                              <Link
                                key={moreTool.label}
                                href={moreTool.href}
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary transition-colors"
                                onClick={() => setShowMoreTools(false)}
                              >
                                <moreTool.icon className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{moreTool.label}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Tool integration hint with stock logos - fixed height to prevent CLS */}
                  <div className="flex items-center justify-between px-2 py-4 text-sm text-muted-foreground h-14">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      <span>Connect your portfolio for personalized insights</span>
                    </div>
                    <div className="flex items-center gap-1 w-[104px]">
                      {movers.length > 0 ? (
                        movers.slice(0, 4).map((mover) => (
                          <Link
                            key={mover.symbol}
                            href={`/stock/${mover.symbol}`}
                            className="hover:scale-110 transition-transform"
                            title={`${mover.symbol} - ${mover.changePercent > 0 ? '+' : ''}${mover.changePercent?.toFixed(2)}%`}
                          >
                            <StockLogo symbol={mover.symbol} size="sm" />
                          </Link>
                        ))
                      ) : (
                        /* Skeleton placeholders to prevent CLS */
                        Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="w-6 h-6 rounded-lg bg-muted animate-pulse" />
                        ))
                      )}
                    </div>
                  </div>

                  {/* Manus-style bottom carousel - fixed height container to prevent CLS */}
                  <div className="w-full max-w-2xl mx-auto mt-8 min-h-[180px]">
                    {!carouselDismissed && (
                      <div className="relative">
                        <div
                          onClick={() => handleCarouselClick(CAROUSEL_SLIDES[carouselIndex])}
                          className="bg-card/80 border border-border rounded-2xl p-5 cursor-pointer hover:bg-card transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-6">
                            {/* Left content */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h2 className="font-semibold text-lg">{CAROUSEL_SLIDES[carouselIndex].title}</h2>
                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                              </div>
                              <p className="text-sm text-muted-foreground mb-4">
                                {CAROUSEL_SLIDES[carouselIndex].subtitle}
                              </p>

                              {/* Clickable Tags */}
                              {CAROUSEL_SLIDES[carouselIndex].tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {CAROUSEL_SLIDES[carouselIndex].tags.map((tag) => (
                                    <button
                                      key={tag.label}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setInputValue(tag.query)
                                        // Focus the input
                                        textareaRef.current?.focus()
                                      }}
                                      className="px-3 py-1.5 text-xs rounded-full border border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-green-500/50 transition-all cursor-pointer"
                                    >
                                      {tag.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Right visual */}
                            <div className="hidden sm:flex flex-shrink-0 w-32 h-24 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-xl items-center justify-center">
                              {CAROUSEL_SLIDES[carouselIndex].icon === "chart" && (
                                <div className="relative">
                                  <BarChart3 className="w-10 h-10 text-green-500" />
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <TrendingUp className="w-2.5 h-2.5 text-white" />
                                  </div>
                                </div>
                              )}
                              {CAROUSEL_SLIDES[carouselIndex].icon === "social" && (
                                <div className="w-16 h-16 bg-card rounded-lg border border-border shadow-lg p-2">
                                  <div className="w-full h-2 bg-muted-foreground/20 rounded mb-1" />
                                  <div className="w-3/4 h-2 bg-muted-foreground/20 rounded mb-1" />
                                  <div className="w-1/2 h-2 bg-muted-foreground/20 rounded" />
                                  <div className="flex items-center gap-1 mt-2">
                                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                  </div>
                                </div>
                              )}
                              {CAROUSEL_SLIDES[carouselIndex].icon === "globe" && (
                                <Globe className="w-12 h-12 text-blue-500" />
                              )}
                            </div>
                          </div>

                          {/* Dismiss button */}
                          <div className="absolute top-3 right-3">
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setShowDismissTooltip(true)
                                }}
                                className="p-1.5 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                                aria-label="Dismiss carousel"
                              >
                                <X className="w-4 h-4" />
                              </button>

                              {showDismissTooltip && (
                                <div className="absolute top-full right-0 mt-1 z-50">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDismissCarousel()
                                      setShowDismissTooltip(false)
                                    }}
                                    className="whitespace-nowrap px-3 py-2 bg-foreground text-background text-sm rounded-lg shadow-xl"
                                  >
                                    Don't show again
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Pagination dots */}
                        <div className="flex items-center justify-center gap-2 mt-4" role="tablist" aria-label="Carousel navigation">
                          {CAROUSEL_SLIDES.map((slide, index) => (
                            <button
                              key={index}
                              onClick={() => setCarouselIndex(index)}
                              className={cn(
                                "w-2 h-2 rounded-full transition-colors",
                                index === carouselIndex ? "bg-foreground" : "bg-muted-foreground/30"
                              )}
                              aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                              aria-selected={index === carouselIndex}
                              role="tab"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Popular Analysis - SEO Internal Links */}
                  <div className="w-full max-w-3xl mx-auto mt-12 space-y-8">
                    {/* Popular Stock Analysis */}
                    <div>
                      <h2 className="text-lg font-semibold mb-4 text-center">Popular Stock Analysis</h2>
                      <div className="flex flex-wrap justify-center gap-2">
                        {['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'META', 'AMZN', 'AMD'].map((ticker) => (
                          <Link
                            key={ticker}
                            href={`/stock/${ticker.toLowerCase()}`}
                            className="px-4 py-2 bg-card border border-border rounded-lg hover:border-green-500/50 hover:bg-secondary transition-all text-sm font-medium"
                          >
                            {ticker}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Price Predictions */}
                    <div>
                      <h2 className="text-lg font-semibold mb-4 text-center">Stock Price Predictions 2026</h2>
                      <div className="flex flex-wrap justify-center gap-2">
                        {['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'META', 'AMZN', 'AMD'].map((ticker) => (
                          <Link
                            key={ticker}
                            href={`/prediction/${ticker.toLowerCase()}`}
                            className="px-4 py-2 bg-card border border-border rounded-lg hover:border-green-500/50 hover:bg-secondary transition-all text-sm"
                          >
                            {ticker} Prediction
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Popular Comparisons */}
                    <div>
                      <h2 className="text-lg font-semibold mb-4 text-center">Compare Stocks</h2>
                      <div className="flex flex-wrap justify-center gap-2">
                        {[
                          { slug: 'aapl-vs-msft', label: 'AAPL vs MSFT' },
                          { slug: 'nvda-vs-amd', label: 'NVDA vs AMD' },
                          { slug: 'googl-vs-meta', label: 'GOOGL vs META' },
                          { slug: 'tsla-vs-rivn', label: 'TSLA vs RIVN' },
                          { slug: 'amzn-vs-wmt', label: 'AMZN vs WMT' },
                          { slug: 'jpm-vs-bac', label: 'JPM vs BAC' },
                        ].map((pair) => (
                          <Link
                            key={pair.slug}
                            href={`/compare/${pair.slug}`}
                            className="px-4 py-2 bg-card border border-border rounded-lg hover:border-green-500/50 hover:bg-secondary transition-all text-sm"
                          >
                            {pair.label}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Should I Buy */}
                    <div>
                      <h2 className="text-lg font-semibold mb-4 text-center">Investment Decisions</h2>
                      <div className="flex flex-wrap justify-center gap-2">
                        {['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'META'].map((ticker) => (
                          <Link
                            key={ticker}
                            href={`/should-i-buy/${ticker.toLowerCase()}`}
                            className="px-4 py-2 bg-card border border-border rounded-lg hover:border-green-500/50 hover:bg-secondary transition-all text-sm"
                          >
                            Should I Buy {ticker}?
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Sectors */}
                    <div>
                      <h2 className="text-lg font-semibold mb-4 text-center">Browse by Sector</h2>
                      <div className="flex flex-wrap justify-center gap-2">
                        {[
                          { slug: 'technology', label: 'Technology' },
                          { slug: 'healthcare', label: 'Healthcare' },
                          { slug: 'financials', label: 'Financials' },
                          { slug: 'energy', label: 'Energy' },
                          { slug: 'consumer-discretionary', label: 'Consumer' },
                          { slug: 'industrials', label: 'Industrials' },
                        ].map((sector) => (
                          <Link
                            key={sector.slug}
                            href={`/sectors/${sector.slug}`}
                            className="px-4 py-2 bg-green-600/20 text-green-500 border border-green-500/30 rounded-lg hover:bg-green-600/30 transition-all text-sm"
                          >
                            {sector.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Click outside to close more tools */}
      {showMoreTools && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMoreTools(false)}
        />
      )}

      {/* Click outside to close dismiss tooltip */}
      {showDismissTooltip && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDismissTooltip(false)}
        />
      )}

      {/* Click outside to close model selector */}
      {showModelSelector && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowModelSelector(false)}
        />
      )}
    </div>
  )
}
// Deployed at 1767871585
