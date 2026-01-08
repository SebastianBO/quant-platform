"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { MessageCircle, Send, X, Sparkles, History, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase-browser"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface AskAIPopupProps {
  ticker: string
  companyName: string
}

export function AskAIPopup({ ticker, companyName }: AskAIPopupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [queryCount, setQueryCount] = useState(0)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [user, setUser] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkAuth()

    // Load query count from localStorage
    const storedCount = localStorage.getItem(`ai_query_count_${ticker}`)
    if (storedCount) {
      setQueryCount(parseInt(storedCount, 10))
    }

    // Load chat history from localStorage
    const storedHistory = localStorage.getItem(`ai_chat_history_${ticker}`)
    if (storedHistory) {
      try {
        const history = JSON.parse(storedHistory)
        setMessages(history.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        })))
      } catch {
        // Invalid history, ignore
      }
    }
  }, [ticker, supabase.auth])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Save chat history
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`ai_chat_history_${ticker}`, JSON.stringify(messages))
    }
  }, [messages, ticker])

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return

    // Check if user needs to register (after 1 query for non-logged in users)
    if (!user && queryCount >= 1) {
      setShowAuthPrompt(true)
      return
    }

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Update query count
    const newCount = queryCount + 1
    setQueryCount(newCount)
    localStorage.setItem(`ai_query_count_${ticker}`, newCount.toString())

    try {
      // Prepend context about the stock
      const contextualQuery = `About ${companyName} (${ticker}): ${userMessage.content}`

      const response = await fetch("/api/chat/autonomous", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: contextualQuery,
          model: "gpt-4o-mini",
          stream: false,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer || data.response || "I couldn't find an answer to that question.",
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearHistory = () => {
    setMessages([])
    localStorage.removeItem(`ai_chat_history_${ticker}`)
  }

  // Floating trigger button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "flex items-center gap-2 px-4 py-3",
          "bg-green-600 hover:bg-green-500 text-white",
          "rounded-full shadow-lg hover:shadow-xl",
          "transition-all duration-200 hover:scale-105",
          "animate-in slide-in-from-bottom-5"
        )}
      >
        <Sparkles className="w-5 h-5" />
        <span className="font-medium">Ask AI about {ticker}</span>
      </button>
    )
  }

  // Auth prompt dialog
  if (showAuthPrompt) {
    return (
      <Dialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a free account to continue</DialogTitle>
            <DialogDescription>
              Sign up to get unlimited AI research queries and save your chat history.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button
              onClick={() => router.push("/login")}
              className="bg-green-600 hover:bg-green-500"
            >
              Sign up free
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowAuthPrompt(false)
                setIsOpen(false)
              }}
            >
              Maybe later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Chat popup
  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "w-[400px] max-w-[calc(100vw-3rem)]",
        "bg-card border border-border rounded-2xl shadow-2xl",
        "flex flex-col overflow-hidden",
        "animate-in slide-in-from-bottom-5",
        isMinimized ? "h-14" : "h-[500px] max-h-[70vh]"
      )}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30 cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-green-500" />
          <span className="font-semibold">Ask AI about {ticker}</span>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && !isMinimized && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                clearHistory()
              }}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
              title="Clear history"
            >
              <History className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(false)
            }}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium mb-2">Ask anything about {companyName}</p>
                <p className="text-sm">
                  Get AI-powered insights about financials, news, and more.
                </p>
                {!user && (
                  <p className="text-xs mt-4 text-yellow-500">
                    1 free query available. Sign up for unlimited access.
                  </p>
                )}
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2",
                      message.role === "user"
                        ? "bg-green-600 text-white"
                        : "bg-secondary"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-[10px] opacity-60 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-2xl px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-green-500" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-secondary/20">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                placeholder={`Ask about ${ticker}...`}
                className="min-h-[44px] max-h-[120px] resize-none"
                disabled={isLoading}
              />
              <Button
                size="icon"
                onClick={handleSubmit}
                disabled={!input.trim() || isLoading}
                className="bg-green-600 hover:bg-green-500 h-11 w-11 shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
