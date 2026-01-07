"use client"

import { useChat, UIMessage } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useState, useRef, useEffect, useMemo, FormEvent } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Send,
  Bot,
  User,
  Sparkles,
  TrendingUp,
  FileText,
  Search,
  Calculator,
  BarChart3,
  Loader2,
  Terminal,
  Zap
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

const EXAMPLE_PROMPTS = [
  { icon: TrendingUp, text: "Analyze NVDA's fundamentals and recent insider activity" },
  { icon: FileText, text: "Summarize the key points from AAPL's latest 10-K filing" },
  { icon: Search, text: "Find biotech stocks with Phase 3 trials completing this quarter" },
  { icon: Calculator, text: "Calculate the intrinsic value of MSFT using DCF analysis" },
  { icon: BarChart3, text: "Compare the options flow for SPY vs QQQ" },
  { icon: Sparkles, text: "What's the short squeeze potential for GME right now?" },
]

export default function TerminalPage() {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [showExamples, setShowExamples] = useState(true)

  const transport = useMemo(() => new DefaultChatTransport({
    api: '/api/terminal',
  }), [])

  const { messages, sendMessage, status, error } = useChat({
    transport,
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  // Helper to get text content from message parts
  const getMessageText = (message: UIMessage): string => {
    return message.parts
      .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
      .map((part) => part.text)
      .join('')
  }

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Hide examples after first message
  useEffect(() => {
    if (messages.length > 0) {
      setShowExamples(false)
    }
  }, [messages])

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
  }

  // Handle form submit
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({
      parts: [{ type: 'text' as const, text: input }],
      role: 'user'
    })
    setInput('')
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const handleExampleClick = (text: string) => {
    setInput(text)
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Terminal className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold flex items-center gap-2">
                AI Terminal
                <Badge variant="secondary" className="text-xs">Beta</Badge>
              </h1>
              <p className="text-xs text-muted-foreground">Quant-grade research assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs gap-1">
              <Zap className="h-3 w-3" />
              AI Chat
            </Badge>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {messages.length === 0 && showExamples && (
            <div className="space-y-8">
              {/* Welcome */}
              <div className="text-center py-12">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-4">
                  <Bot className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">AI Quant Terminal</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your personal AI analyst with access to live market data, SEC filings,
                  options chains, and web research.
                </p>
              </div>

              {/* Example Prompts */}
              <div>
                <p className="text-sm text-muted-foreground mb-3 text-center">Try asking:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {EXAMPLE_PROMPTS.map((example, i) => (
                    <button
                      key={i}
                      onClick={() => handleExampleClick(example.text)}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-lg border bg-card text-left",
                        "hover:bg-muted/50 hover:border-primary/30 transition-colors"
                      )}
                    >
                      <example.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">{example.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 mb-6",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="p-2 rounded-lg bg-primary/10 h-fit">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3",
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-4">
                            <table className="min-w-full border-collapse text-sm">
                              {children}
                            </table>
                          </div>
                        ),
                        th: ({ children }) => (
                          <th className="border border-border px-3 py-2 bg-muted font-medium text-left">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="border border-border px-3 py-2">{children}</td>
                        ),
                        code: ({ className, children }) => {
                          const isInline = !className
                          return isInline ? (
                            <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                              {children}
                            </code>
                          ) : (
                            <code className={className}>{children}</code>
                          )
                        },
                        h2: ({ children }) => (
                          <h2 className="text-lg font-semibold mt-6 mb-2 flex items-center gap-2">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-base font-medium mt-4 mb-2">{children}</h3>
                        ),
                      }}
                    >
                      {getMessageText(message)}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{getMessageText(message)}</p>
                )}
              </div>
              {message.role === 'user' && (
                <div className="p-2 rounded-lg bg-primary h-fit">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10 h-fit">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Analyzing...</span>
                </div>
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="text-center text-sm text-red-500 py-4 mb-6">
              Error: {error.message}. Please try again.
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="border-t bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about any stock, analyze financials, screen for opportunities..."
                  className={cn(
                    "w-full resize-none rounded-xl border bg-background px-4 py-3 pr-12",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                    "min-h-[52px] max-h-[200px]"
                  )}
                  rows={1}
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="h-[52px] w-[52px] rounded-xl shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              AI research tool - not financial advice. Always do your own due diligence.
            </p>
          </form>
        </div>
      </footer>
    </div>
  )
}
