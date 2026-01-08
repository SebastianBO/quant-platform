"use client"

import { useState, useRef, useEffect, FormEvent, useMemo } from "react"
import { useChat, UIMessage } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, Loader2, Sparkles, TrendingUp, BarChart3, PieChart } from "lucide-react"
import Link from "next/link"

const EXAMPLE_PROMPTS = [
  "What's your outlook on NVIDIA stock?",
  "Compare Apple vs Microsoft for long-term investment",
  "Which sectors are performing best right now?",
  "Explain DCF valuation in simple terms",
  "What are the top dividend stocks to consider?",
]

export default function HeroAIChat() {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const initialMessages: UIMessage[] = [
    {
      id: "welcome",
      role: "assistant",
      parts: [{ type: "text" as const, text: "Hi! I'm your AI financial assistant. Ask me anything about stocks, markets, valuations, or investment strategies. How can I help you today?" }],
    },
  ]

  const transport = useMemo(() => new DefaultChatTransport({
    api: "/api/chat/public", // Public endpoint with rate limiting (no auth required)
  }), [])

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

  const handleExampleClick = (prompt: string) => {
    sendMessage({
      parts: [{ type: "text" as const, text: prompt }],
      role: "user"
    })
  }

  const getMessageText = (message: UIMessage): string => {
    return message.parts
      .filter((part): part is { type: "text"; text: string } => part.type === "text")
      .map((part) => part.text)
      .join("")
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
            <span className="text-sm font-medium text-green-500">AI-Powered Financial Assistant</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Ask AI About Any Stock
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get instant insights on stocks, market trends, valuations, and investment strategies.
            Powered by Claude AI.
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
                  <p className="text-sm text-white/80">Your personal financial advisor</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="h-[300px] md:h-[350px] overflow-y-auto p-4 md:p-6 space-y-4"
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
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{getMessageText(message)}</p>
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
                      <span className="text-sm text-muted-foreground">Thinking...</span>
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
                  <Link href="/premium" className="inline-flex items-center gap-2 text-sm text-green-500 hover:underline font-medium">
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
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about any stock, market trend, or investment strategy..."
                  className="flex-1 bg-background border-border h-12 text-base"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
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
