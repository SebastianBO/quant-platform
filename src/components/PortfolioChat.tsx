"use client"

import { useState, useRef, useEffect, FormEvent, useMemo } from "react"
import { useChat, UIMessage } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, X, Bot, User, Loader2, Minimize2, Maximize2, Lock, Sparkles } from "lucide-react"
import { usePremium } from "@/hooks/usePremium"
import Link from "next/link"

interface PortfolioContext {
  name: string
  currency: string
  totalValue: number
  positionCount: number
  holdings: {
    ticker: string
    shares: number
    avgCost: number | null
    marketValue: number | null
  }[]
}

interface PortfolioChatProps {
  portfolioContext?: PortfolioContext
}

export default function PortfolioChat({ portfolioContext }: PortfolioChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const { isPremium, isLoading: isPremiumLoading } = usePremium()

  const welcomeText = portfolioContext
    ? `Hi! I'm your AI assistant for the "${portfolioContext.name}" portfolio. I can help you analyze your ${portfolioContext.positionCount} positions worth ${new Intl.NumberFormat('en-US', { style: 'currency', currency: portfolioContext.currency }).format(portfolioContext.totalValue)}. What would you like to know?`
    : "Hi! I'm your AI financial assistant. How can I help you today?"

  const initialMessages: UIMessage[] = [
    {
      id: "welcome",
      role: "assistant",
      parts: [{ type: "text" as const, text: welcomeText }],
    },
  ]

  const transport = useMemo(() => new DefaultChatTransport({
    api: "/api/chat",
    body: {
      portfolioContext,
    },
  }), [portfolioContext])

  const { messages, sendMessage, status, error } = useChat({
    transport,
    messages: initialMessages,
  })

  const isLoading = status === "streaming" || status === "submitted"

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({
      parts: [{ type: "text" as const, text: input }],
      role: "user"
    })
    setInput("")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  // Helper to get text content from message parts
  const getMessageText = (message: UIMessage): string => {
    return message.parts
      .filter((part): part is { type: "text"; text: string } => part.type === "text")
      .map((part) => part.text)
      .join("")
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Closed state - FAB button with Fey green background
  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#4ebe96] hover:bg-[#4ebe96]/90 shadow-[0px_30px_16px_rgba(0,0,0,0.12),0px_16px_8px_rgba(0,0,0,0.07),0px_6px_4px_rgba(0,0,0,0.04)] z-50 hidden md:flex motion-safe:transition-opacity motion-safe:duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        size="icon"
        aria-label="Open AI chat assistant"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    )
  }

  // Show upgrade prompt for non-premium users with Fey glassmorphism
  if (!isPremiumLoading && !isPremium) {
    return (
      <Card className="fixed z-50 shadow-[0px_30px_16px_rgba(0,0,0,0.12),0px_16px_8px_rgba(0,0,0,0.07),0px_6px_4px_rgba(0,0,0,0.04)] border-white/[0.08] bg-black/90 backdrop-blur-[10px] rounded-2xl bottom-6 right-6 w-96 h-auto hidden md:block">
        <CardHeader className="py-3 px-4 border-b border-white/[0.08] flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center">
              <Lock className="w-4 h-4 text-[#868f97]" />
            </div>
            <CardTitle className="text-sm font-medium text-white">AI Assistant</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#868f97] hover:text-white hover:bg-white/[0.05] motion-safe:transition-colors motion-safe:duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/[0.24]"
            onClick={() => setIsOpen(false)}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[#4ebe96]/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-[#4ebe96]" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-white">Premium Feature</h3>
          <p className="text-[#868f97] text-sm mb-4">
            Get instant AI-powered analysis of your portfolio, market insights, and personalized investment advice.
          </p>
          <Link
            href="/premium"
            className="inline-flex items-center justify-center gap-2 bg-white text-black px-6 py-3.5 rounded-full font-semibold hover:opacity-90 motion-safe:transition-opacity motion-safe:duration-150 w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <Sparkles className="w-4 h-4" />
            Upgrade to Premium
          </Link>
          <p className="text-xs text-[#868f97] mt-3">
            Starting at $109/month
          </p>
        </CardContent>
      </Card>
    )
  }

  // Main chat panel with Fey glassmorphism
  return (
    <Card className={`fixed z-50 shadow-[0px_30px_16px_rgba(0,0,0,0.12),0px_16px_8px_rgba(0,0,0,0.07),0px_6px_4px_rgba(0,0,0,0.04)] border-white/[0.08] bg-black/90 backdrop-blur-[10px] rounded-2xl motion-safe:transition-all motion-safe:duration-300 hidden md:block ${
      isMinimized
        ? "bottom-6 right-6 w-80 h-14"
        : "bottom-6 right-6 w-96 h-[500px] max-h-[80vh]"
    }`}>
      {/* Header */}
      <CardHeader className="py-3 px-4 border-b border-white/[0.08] flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#4ebe96] flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <CardTitle className="text-sm font-medium text-white">AI Assistant</CardTitle>
            {!isMinimized && (
              <p className="text-xs text-[#868f97]">
                {portfolioContext ? portfolioContext.name : "Financial Advisor"}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#868f97] hover:text-white hover:bg-white/[0.05] motion-safe:transition-colors motion-safe:duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/[0.24]"
            onClick={() => setIsMinimized(!isMinimized)}
            aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#868f97] hover:text-white hover:bg-white/[0.05] motion-safe:transition-colors motion-safe:duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/[0.24]"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 h-[360px] p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-[#4ebe96] flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`rounded-lg px-3 py-2 max-w-[80%] ${
                      message.role === "user"
                        ? "bg-[#4ebe96] text-white"
                        : "bg-white/[0.03] border border-white/[0.08] text-white"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{getMessageText(message)}</p>
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-[#4ebe96] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2">
                    <Loader2 className="w-4 h-4 text-[#868f97] motion-safe:animate-spin" />
                  </div>
                </div>
              )}
              {error && (
                <div className="text-center text-sm text-[#ff5c5c] py-2">
                  Error: {error.message}. Please try again.
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <CardContent className="p-3 border-t border-white/[0.08]">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about your portfolio..."
                className="flex-1 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-[#868f97] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:border-white/[0.24] motion-safe:transition-colors motion-safe:duration-150"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="bg-[#4ebe96] hover:bg-[#4ebe96]/90 text-white rounded-lg motion-safe:transition-opacity motion-safe:duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-[#868f97] mt-2 text-center">
              AI responses are not financial advice
            </p>
          </CardContent>
        </>
      )}
    </Card>
  )
}
