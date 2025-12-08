"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, X, Bot, User, Loader2, Minimize2, Maximize2 } from "lucide-react"

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
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
    body: {
      portfolioContext,
    },
    initialMessages: portfolioContext
      ? [
          {
            id: "welcome",
            role: "assistant",
            content: `Hi! I'm your AI assistant for the "${portfolioContext.name}" portfolio. I can help you analyze your ${portfolioContext.positionCount} positions worth ${new Intl.NumberFormat('en-US', { style: 'currency', currency: portfolioContext.currency }).format(portfolioContext.totalValue)}. What would you like to know?`,
          },
        ]
      : [
          {
            id: "welcome",
            role: "assistant",
            content: "Hi! I'm your AI financial assistant. How can I help you today?",
          },
        ],
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-green-600 hover:bg-green-500 shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className={`fixed z-50 shadow-2xl border-green-500/30 bg-card transition-all duration-300 ${
      isMinimized
        ? "bottom-6 right-6 w-80 h-14"
        : "bottom-6 right-6 w-96 h-[500px] max-h-[80vh]"
    }`}>
      {/* Header */}
      <CardHeader className="py-3 px-4 border-b border-border flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <CardTitle className="text-sm font-medium">AI Assistant</CardTitle>
            {!isMinimized && (
              <p className="text-xs text-muted-foreground">
                {portfolioContext ? portfolioContext.name : "Financial Advisor"}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsMinimized(!isMinimized)}
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
            className="h-8 w-8"
            onClick={() => setIsOpen(false)}
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
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`rounded-lg px-3 py-2 max-w-[80%] ${
                      message.role === "user"
                        ? "bg-green-600 text-white"
                        : "bg-secondary"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
                  <div className="bg-secondary rounded-lg px-3 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
              {error && (
                <div className="text-center text-sm text-red-500 py-2">
                  Error: {error.message}. Please try again.
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <CardContent className="p-3 border-t border-border">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about your portfolio..."
                className="flex-1 bg-secondary border-border"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="bg-green-600 hover:bg-green-500"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              AI responses are not financial advice
            </p>
          </CardContent>
        </>
      )}
    </Card>
  )
}
