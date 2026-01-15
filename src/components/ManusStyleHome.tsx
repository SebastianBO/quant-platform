"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAnalytics } from "@/hooks/useAnalytics"
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
import { ScrollIndicator } from "@/components/ScrollIndicator"
import { ClaudeChatInput } from "@/components/ui/claude-style-chat-input"
import { StockSearchCommand } from "@/components/StockSearchCommand"

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
  { id: 'gemini-flash', key: 'gemini-flash', name: 'Gemini Flash', description: 'Fastest responses', tier: 'fast' as const },
  // Standard
  { id: 'gpt-4o-mini', key: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Great for everyday tasks', tier: 'standard' as const },
  { id: 'claude-3-5-sonnet', key: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Balanced performance', tier: 'standard' as const },
  { id: 'llama-3.3-70b', key: 'llama-3.3-70b', name: 'Llama 3.3 70B', description: 'Open source power', tier: 'standard' as const },
  // Premium (requires subscription)
  { id: 'gpt-4o', key: 'gpt-4o', name: 'GPT-4o', description: 'Most capable', tier: 'premium' as const },
  { id: 'claude-sonnet-4', key: 'claude-sonnet-4', name: 'Claude Sonnet 4', description: 'Latest & greatest', tier: 'premium' as const },
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
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)
  const [credits, setCredits] = useState(300)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false)
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
  const queryStartTime = useRef<number>(0)

  // Analytics tracking
  const {
    trackAIQueryStart,
    trackAIQueryComplete,
    trackUpgradePrompt,
    trackCTAClick,
    trackBeginCheckout,
    initializeUserAnalytics,
    trackEvent,
  } = useAnalytics()

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

        // Check premium status
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_premium')
          .eq('id', user.id)
          .single()

        setIsPremium(profile?.is_premium || false)

        // Initialize analytics for authenticated user
        initializeUserAnalytics(
          user.id,
          profile?.is_premium || false,
          profile?.is_premium ? 'annual' : 'free'
        )
      } else {
        const savedCredits = localStorage.getItem("credits_anonymous")
        setCredits(savedCredits ? parseInt(savedCredits, 10) : 300)
        setIsPremium(false)
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
      trackCTAClick(tool.id, 'tool_buttons')
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

    // Check if user is authenticated
    if (!user) {
      setShowAuthPrompt(true)
      trackUpgradePrompt('auth_required')
      return
    }

    // Check if user has premium (allow 3 free queries for non-premium)
    const freeQueries = parseInt(localStorage.getItem(`free_queries_${user.id}`) || '0', 10)
    if (!isPremium && freeQueries >= 3) {
      trackUpgradePrompt('free_queries_exhausted')
      // Direct to Stripe checkout
      router.push('/api/stripe/quick-checkout?plan=annual')
      return
    }

    // Track free query usage for non-premium users
    if (!isPremium) {
      localStorage.setItem(`free_queries_${user.id}`, String(freeQueries + 1))
    }

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

    // Track AI query start
    queryStartTime.current = Date.now()
    trackAIQueryStart({
      query: queryContent,
      model: selectedModel.key,
      model_tier: selectedModel.tier as 'fast' | 'standard' | 'premium',
    })

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
      // Track failed query
      trackAIQueryComplete({
        query: queryContent,
        model: selectedModel.key,
        model_tier: selectedModel.tier as 'fast' | 'standard' | 'premium',
        response_time_ms: Date.now() - queryStartTime.current,
        success: false,
      })
    } finally {
      setIsLoading(false)
      // Track successful query completion
      if (answerContent) {
        trackAIQueryComplete({
          query: queryContent,
          model: selectedModel.key,
          model_tier: selectedModel.tier as 'fast' | 'standard' | 'premium',
          response_time_ms: Date.now() - queryStartTime.current,
          success: true,
        })
      }
      setTimeout(() => setTasks([]), 1000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Handler for ClaudeChatInput component
  const handleChatInputSubmit = async (data: {
    message: string;
    files: Array<{ id: string; file: File; type: string; preview: string | null; uploadStatus: string; content?: string }>;
    pastedContent: Array<{ id: string; content: string; timestamp: Date }>;
    model: string;
  }) => {
    if ((!data.message.trim() && data.files.length === 0 && data.pastedContent.length === 0) || isLoading) return

    // Check if user is authenticated
    if (!user) {
      setShowAuthPrompt(true)
      trackUpgradePrompt('auth_required')
      return
    }

    // Check if user has premium (allow 3 free queries for non-premium)
    const freeQueries = parseInt(localStorage.getItem(`free_queries_${user.id}`) || '0', 10)
    if (!isPremium && freeQueries >= 3) {
      trackUpgradePrompt('free_queries_exhausted')
      router.push('/api/stripe/quick-checkout?plan=annual')
      return
    }

    // Track free query usage for non-premium users
    if (!isPremium) {
      localStorage.setItem(`free_queries_${user.id}`, String(freeQueries + 1))
    }

    // Update selected model from the input
    const newModel = MODELS.find(m => m.id === data.model) || MODELS[0]
    setSelectedModel(newModel)

    let queryContent = data.message.trim()
    let fileContent = ""

    // Add pasted content
    if (data.pastedContent.length > 0) {
      const pastedTexts = data.pastedContent.map(p => p.content).join('\n\n')
      queryContent = queryContent
        ? `${queryContent}\n\n--- Pasted Content ---\n${pastedTexts}\n--- End Pasted Content ---`
        : `Please analyze the following:\n\n${pastedTexts}`
    }

    // Process file uploads
    if (data.files.length > 0) {
      setIsLoading(true)
      setTasks([{ id: "upload", description: "Parsing uploaded documents...", status: "running" }])

      try {
        for (const fileItem of data.files) {
          const formData = new FormData()
          formData.append("file", fileItem.file)

          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })

          if (uploadRes.ok) {
            const parsed = await uploadRes.json()
            fileContent += `\n\n--- Document: ${parsed.filename} ---\n${parsed.content}\n--- End Document ---`
          }
        }
        setTasks([{ id: "upload", description: "Documents parsed successfully", status: "completed" }])
      } catch {
        setTasks([{ id: "upload", description: "Failed to parse some documents", status: "completed" }])
      }

      queryContent = queryContent
        ? `${queryContent}${fileContent}`
        : `Please analyze the following documents:${fileContent}`
    }

    const displayContent = data.message.trim() ||
      (data.files.length > 0 ? `Analyzing: ${data.files.map(f => f.file.name).join(', ')}` : 'Analyzing content...')

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: displayContent,
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setAttachedFile(null)
    setIsLoading(true)

    // Track AI query start
    queryStartTime.current = Date.now()
    trackAIQueryStart({
      query: queryContent,
      model: newModel.key,
      model_tier: newModel.tier as 'fast' | 'standard' | 'premium',
    })

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
          model: newModel.key,
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
            const lineData = line.slice(6)
            if (lineData === '[DONE]') continue

            try {
              const event = JSON.parse(lineData)

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
                    } else {
                      return [...prev, { id: assistantId, role: 'assistant' as const, content: answerContent }]
                    }
                  })
                  break
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      // Track completion
      trackAIQueryComplete({
        query: queryContent,
        model: newModel.key,
        model_tier: newModel.tier as 'fast' | 'standard' | 'premium',
        response_time_ms: Date.now() - queryStartTime.current,
        success: true,
      })
    } catch {
      trackAIQueryComplete({
        query: queryContent,
        model: newModel.key,
        model_tier: newModel.tier as 'fast' | 'standard' | 'premium',
        response_time_ms: Date.now() - queryStartTime.current,
        success: false,
      })
      setMessages(prev => [
        ...prev,
        {
          id: assistantId,
          role: 'assistant' as const,
          content: "I apologize, but I encountered an error processing your request. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
      setTasks([])
    }
  }

  const hasMessages = messages.length > 0

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Hidden on mobile */}
      <aside
        className={cn(
          "hidden md:flex flex-col py-4 border-r border-border bg-card/50 transition-all duration-200",
          sidebarExpanded ? "w-52" : "w-14"
        )}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        {/* Logo - Lician brand */}
        <Link href="/" className="mb-6 flex items-center gap-3 px-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">L</span>
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
        <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border flex-shrink-0 safe-area-top">
          <div className="flex items-center gap-2">
            {/* Mobile: Show logo + brand, Desktop: Just brand name */}
            <div className="md:hidden w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">L</span>
            </div>
            <span className="font-semibold">Lician AI</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Stock Search - Cmd+K */}
            <StockSearchCommand />

            {/* Free plan / Start trial - hidden on mobile */}
            {!loading && !user && (
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Free plan</span>
                <span className="text-muted-foreground">|</span>
                <Link href="/api/stripe/quick-checkout?plan=annual" prefetch={false} className="text-green-500 hover:text-green-400 font-medium">
                  Start free trial
                </Link>
              </div>
            )}

            {/* Credits */}
            <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 bg-secondary/50 rounded-full">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">{credits}</span>
            </div>

            {/* Share credits - hidden on mobile */}
            <button
              className="hidden md:block p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
              title="Invite friends for free credits"
            >
              <Gift className="w-5 h-5" />
            </button>

            {/* Notifications - hidden on mobile */}
            <button className="hidden md:block p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors">
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
        <div className={cn(
          "flex-1 flex flex-col",
          hasMessages ? "overflow-hidden" : "overflow-y-auto"
        )}>
          {/* Messages area - scrollable */}
          {hasMessages && (
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 pb-32 md:pb-6">
              <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
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
            "flex flex-col items-center px-4 md:px-6 py-4 md:py-8",
            hasMessages
              ? "fixed bottom-0 left-0 right-0 md:relative md:bottom-auto bg-background border-t border-border safe-area-bottom z-40"
              : "min-h-0"
          )}>
            {/* Heading - only show when no messages */}
            {!hasMessages && (
              <h1 className="text-3xl md:text-5xl font-semibold text-center mb-6 md:mb-10 px-4">
                What can I do for you?
              </h1>
            )}

            {/* Chat input - Claude-style premium input */}
            <div className="w-full max-w-2xl">
              <ClaudeChatInput
                onSendMessage={handleChatInputSubmit}
                models={MODELS}
                selectedModel={selectedModel.id}
                onModelChange={(modelId) => {
                  const model = MODELS.find(m => m.id === modelId)
                  if (model) setSelectedModel(model)
                }}
                isPremium={isPremium}
                onUpgradeClick={() => router.push('/api/stripe/quick-checkout?plan=monthly')}
                placeholder={hasMessages ? "Ask a follow-up..." : "Ask about any stock, market trends, or financial analysis..."}
                disabled={isLoading}
                value={inputValue}
                onValueChange={setInputValue}
              />

              {/* Tool buttons - only show when no messages */}
              {!hasMessages && (
                <>
                  {/* Financial tool buttons - scrollable on mobile */}
                  <div className="flex items-center gap-2 md:gap-3 mt-4 overflow-x-auto pb-2 md:overflow-visible md:flex-wrap md:justify-center scrollbar-hide">
                    {FINANCIAL_TOOLS.map((tool) => (
                      <div key={tool.id} className="relative flex-shrink-0">
                        <button
                          onClick={() => handleToolClick(tool)}
                          className={cn(
                            "flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-full",
                            "border border-border bg-card hover:bg-secondary",
                            "text-sm font-medium transition-colors whitespace-nowrap"
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
                      <Wallet className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Connect your portfolio for personalized insights</span>
                      <span className="sm:hidden">Connect portfolio</span>
                    </div>
                    <div className="flex items-center gap-1 w-[104px] flex-shrink-0">
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
                  <div className="w-full max-w-2xl mx-auto mt-6 md:mt-8 min-h-[160px] md:min-h-[180px]">
                    {!carouselDismissed && (
                      <div className="relative">
                        <div
                          onClick={() => handleCarouselClick(CAROUSEL_SLIDES[carouselIndex])}
                          className="bg-card/80 border border-border rounded-2xl p-4 md:p-5 cursor-pointer hover:bg-card transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-4 md:gap-6">
                            {/* Left content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h2 className="font-semibold text-base md:text-lg truncate">{CAROUSEL_SLIDES[carouselIndex].title}</h2>
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

                  {/* Scroll indicator - animated arrow to features */}
                  <div className="flex justify-center mt-6 md:mt-8">
                    <ScrollIndicator targetId="features" label="Discover more" />
                  </div>

                  {/* Popular Analysis - SEO Internal Links */}
                  <div id="features" className="w-full max-w-3xl mx-auto mt-8 md:mt-12 space-y-6 md:space-y-8">
                    {/* Popular Stock Analysis */}
                    <div>
                      <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-center">Popular Stock Analysis</h2>
                      <div className="flex overflow-x-auto md:overflow-visible md:flex-wrap md:justify-center gap-2 pb-2 scrollbar-hide">
                        {['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'META', 'AMZN', 'AMD'].map((ticker) => (
                          <Link
                            key={ticker}
                            href={`/stock/${ticker.toLowerCase()}`}
                            className="px-3 md:px-4 py-2 bg-card border border-border rounded-lg hover:border-green-500/50 hover:bg-secondary transition-all text-sm font-medium flex-shrink-0"
                          >
                            {ticker}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Price Predictions */}
                    <div>
                      <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-center">Stock Price Predictions 2026</h2>
                      <div className="flex overflow-x-auto md:overflow-visible md:flex-wrap md:justify-center gap-2 pb-2 scrollbar-hide">
                        {['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'META', 'AMZN', 'AMD'].map((ticker) => (
                          <Link
                            key={ticker}
                            href={`/prediction/${ticker.toLowerCase()}`}
                            className="px-3 md:px-4 py-2 bg-card border border-border rounded-lg hover:border-green-500/50 hover:bg-secondary transition-all text-sm whitespace-nowrap flex-shrink-0"
                          >
                            {ticker} Prediction
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Popular Comparisons */}
                    <div>
                      <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-center">Compare Stocks</h2>
                      <div className="flex overflow-x-auto md:overflow-visible md:flex-wrap md:justify-center gap-2 pb-2 scrollbar-hide">
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
                            className="px-3 md:px-4 py-2 bg-card border border-border rounded-lg hover:border-green-500/50 hover:bg-secondary transition-all text-sm whitespace-nowrap flex-shrink-0"
                          >
                            {pair.label}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Should I Buy */}
                    <div>
                      <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-center">Investment Decisions</h2>
                      <div className="flex overflow-x-auto md:overflow-visible md:flex-wrap md:justify-center gap-2 pb-2 scrollbar-hide">
                        {['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'META'].map((ticker) => (
                          <Link
                            key={ticker}
                            href={`/should-i-buy/${ticker.toLowerCase()}`}
                            className="px-3 md:px-4 py-2 bg-card border border-border rounded-lg hover:border-green-500/50 hover:bg-secondary transition-all text-sm whitespace-nowrap flex-shrink-0"
                          >
                            Should I Buy {ticker}?
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Sectors */}
                    <div>
                      <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-center">Browse by Sector</h2>
                      <div className="flex overflow-x-auto md:overflow-visible md:flex-wrap md:justify-center gap-2 pb-2 scrollbar-hide">
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
                            className="px-3 md:px-4 py-2 bg-green-600/20 text-green-500 border border-green-500/30 rounded-lg hover:bg-green-600/30 transition-all text-sm whitespace-nowrap flex-shrink-0"
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

      {/* Auth Prompt Modal */}
      {showAuthPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Sign in to continue</h2>
              <p className="text-muted-foreground">
                Create a free account to use AI-powered stock analysis
              </p>
            </div>
            <div className="space-y-3">
              <Link
                href="/auth/login"
                onClick={() => trackCTAClick('sign_in', 'auth_modal')}
                className="w-full block text-center py-3 px-4 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => trackCTAClick('create_account', 'auth_modal')}
                className="w-full block text-center py-3 px-4 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg font-medium transition-colors"
              >
                Create free account
              </Link>
            </div>
            <button
              onClick={() => setShowAuthPrompt(false)}
              className="w-full mt-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}

      {/* Payment Prompt Modal */}
      {showPaymentPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Upgrade to Premium</h2>
              <p className="text-muted-foreground">
                You have used your 3 free queries. Upgrade for unlimited AI analysis.
              </p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Lician Pro</span>
                <span className="text-green-500 font-bold">$109/mo</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Unlimited AI queries</li>
                <li>Premium models (GPT-4o, Claude Sonnet 4)</li>
                <li>Advanced financial analysis</li>
                <li>Priority support</li>
              </ul>
            </div>
            <Link
              href="/api/stripe/quick-checkout?plan=annual"
              prefetch={false}
              onClick={() => {
                trackCTAClick('start_trial', 'payment_modal')
                trackBeginCheckout('annual', 109)
              }}
              className="w-full block text-center py-3 px-4 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
            >
              Start 3-day free trial
            </Link>
            <button
              onClick={() => setShowPaymentPrompt(false)}
              className="w-full mt-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
// Deployed at 1767871585
