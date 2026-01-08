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
  ChevronLeft,
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
  { id: "watchlist", icon: Star, label: "Watchlist", href: "/dashboard/watchlist" },
  { id: "screener", icon: BarChart3, label: "Screener", href: "/screener" },
  { id: "alerts", icon: Bell, label: "Alerts", href: "/dashboard/alerts" },
  { id: "settings", icon: Settings, label: "Settings", href: "/dashboard/settings" },
]

// Financial tool actions (shown as pill buttons)
const FINANCIAL_TOOLS = [
  { id: "portfolio", label: "Connect Portfolio", icon: Wallet, href: "/dashboard/portfolios" },
  { id: "screener", label: "Stock Screener", icon: BarChart3, href: "/screener" },
  { id: "compare", label: "Compare Stocks", icon: LineChart, href: "/compare" },
  { id: "taxes", label: "Calculate Taxes", icon: Calculator, href: "/tools/tax-calculator" },
  { id: "more", label: "More", icon: MoreHorizontal, href: null },
]

// More tools dropdown
const MORE_TOOLS = [
  { label: "Earnings Calendar", icon: Calendar, href: "/earnings" },
  { label: "DCF Valuation", icon: FileText, href: "/tools/dcf" },
  { label: "Insider Trading", icon: Building2, href: "/insider-trading" },
  { label: "Top Gainers", icon: Flame, href: "/markets/top-gainers" },
  { label: "Short Interest", icon: TrendingDown, href: "/short-interest" },
  { label: "FDA Calendar", icon: Shield, href: "/biotech/fda-calendar" },
  { label: "Market News", icon: Newspaper, href: "/news" },
  { label: "Economic Calendar", icon: Globe, href: "/economic-calendar" },
]

// Carousel slides for bottom card
const CAROUSEL_SLIDES = [
  { id: "movers", title: "Today's Market Movers", type: "movers" },
  { id: "earnings", title: "Upcoming Earnings", type: "earnings" },
  { id: "trending", title: "Trending Research", type: "trending" },
]

// AI Models
const MODELS = [
  { key: 'gpt-4o-mini', name: 'GPT-4o Mini', tier: 'standard' },
  { key: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', tier: 'standard' },
  { key: 'gpt-4o', name: 'GPT-4o', tier: 'premium' },
  { key: 'claude-sonnet-4', name: 'Claude Sonnet 4', tier: 'premium' },
]

// Quick suggestions
const SUGGESTIONS = [
  "Analyze Apple vs Microsoft",
  "Tesla insider trading",
  "NVIDIA revenue breakdown",
  "Best dividend stocks",
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

    // Fetch trending stocks
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
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
                      className="p-0.5 hover:bg-secondary rounded transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
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
                  className="w-full min-h-[60px] max-h-[150px] py-4 px-5 pl-14 pr-14 text-lg bg-transparent border-none resize-none focus:outline-none placeholder:text-muted-foreground"
                  disabled={isLoading}
                  rows={1}
                />

                {/* File attachment button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute left-4 bottom-4 p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
                  title="Attach PDF or document"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

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

              {/* Suggestions - only show when no messages */}
              {!hasMessages && (
                <>
                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    {SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setInputValue(suggestion)
                          setTimeout(() => handleSubmit(), 100)
                        }}
                        className="text-sm px-3 py-2 rounded-full border border-border bg-card hover:bg-secondary/50 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>

                  {/* Financial tool buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
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

                  {/* Tool integration hint with stock logos */}
                  <div className="flex items-center justify-between px-2 py-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      <span>Connect your portfolio for personalized insights</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {movers.slice(0, 4).map((mover) => (
                        <Link
                          key={mover.symbol}
                          href={`/stock/${mover.symbol}`}
                          className="hover:scale-110 transition-transform"
                          title={`${mover.symbol} - ${mover.changePercent > 0 ? '+' : ''}${mover.changePercent?.toFixed(2)}%`}
                        >
                          <StockLogo symbol={mover.symbol} size="sm" />
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Bottom carousel card */}
                  {movers.length > 0 && (
                    <div className="w-full max-w-lg mx-auto mt-4">
                      <div className="relative">
                        {/* Carousel navigation */}
                        <button
                          onClick={() => setCarouselIndex((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length)}
                          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-1.5 rounded-full bg-card border border-border shadow-lg hover:bg-secondary transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCarouselIndex((prev) => (prev + 1) % CAROUSEL_SLIDES.length)}
                          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-1.5 rounded-full bg-card border border-border shadow-lg hover:bg-secondary transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        <Link href="/markets" className="block">
                          <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 shadow-lg hover:border-green-500/50 transition-colors">
                            <div className="flex-1">
                              <p className="font-medium mb-1">{CAROUSEL_SLIDES[carouselIndex].title}</p>
                              <p className="text-sm text-muted-foreground">
                                {movers[0]?.symbol} {movers[0]?.changePercent > 0 ? "+" : ""}{movers[0]?.changePercent?.toFixed(2)}%
                                {movers[1] && ` · ${movers[1].symbol} ${movers[1].changePercent > 0 ? "+" : ""}${movers[1].changePercent?.toFixed(2)}%`}
                              </p>
                            </div>
                            <div className="flex -space-x-2">
                              {movers.slice(0, 3).map((mover) => (
                                <div
                                  key={mover.symbol}
                                  className="w-10 h-10 rounded-full border-2 border-background overflow-hidden"
                                >
                                  <StockLogo symbol={mover.symbol} size="md" />
                                </div>
                              ))}
                            </div>
                          </div>
                        </Link>

                        {/* Pagination dots */}
                        <div className="flex items-center justify-center gap-2 mt-3">
                          {CAROUSEL_SLIDES.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCarouselIndex(index)}
                              className={cn(
                                "w-2 h-2 rounded-full transition-colors",
                                index === carouselIndex ? "bg-foreground" : "bg-muted-foreground/30"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
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
    </div>
  )
}
// Deployed at 1767871585
