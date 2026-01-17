"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  ArrowUp,
  Paperclip,
  X,
  Loader2,
  Sparkles,
  ChevronDown,
  Check,
  Zap,
  FileText,
  Copy,
  CheckCircle2,
} from "lucide-react"
import { parseTickerSymbolsWithMarkdown } from "@/lib/parseTickerSymbols"

// AI Models - Must match /api/chat/autonomous AVAILABLE_MODELS
const MODELS = [
  { key: 'gemini-flash', name: 'Gemini Flash', tier: 'fast', icon: Zap },
  { key: 'gpt-4o-mini', name: 'GPT-4o Mini', tier: 'standard', icon: Sparkles },
  { key: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', tier: 'standard', icon: Sparkles },
  { key: 'llama-3.3-70b', name: 'Llama 3.3 70B', tier: 'standard', icon: Sparkles },
  { key: 'gpt-4o', name: 'GPT-4o', tier: 'premium', icon: Zap },
  { key: 'claude-sonnet-4', name: 'Claude Sonnet 4', tier: 'premium', icon: Zap },
]

type Model = typeof MODELS[number]
type ModelKey = Model['key']

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface Task {
  id: string
  description: string
  status?: 'pending' | 'running' | 'completed'
}

interface PremiumAIChatProps {
  onAuthRequired?: () => void
  onUpgradeRequired?: () => void
  user?: { id: string; email?: string } | null
  isPremium?: boolean
  initialQuery?: string
  onQueryStart?: (data: { query: string; model: string; model_tier: string }) => void
  onQueryComplete?: (data: { query: string; model: string; model_tier: string; response_time_ms: number; success: boolean }) => void
  className?: string
}

// Typing dots animation
function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 bg-[#4ebe96] rounded-full"
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.85, 1.1, 0.85],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

export function PremiumAIChat({
  onAuthRequired,
  onUpgradeRequired,
  user,
  isPremium = false,
  initialQuery = "",
  onQueryStart,
  onQueryComplete,
  className,
}: PremiumAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState(initialQuery)
  const [isLoading, setIsLoading] = useState(false)
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [selectedModel, setSelectedModel] = useState<Model>(MODELS[0])
  const [tasks, setTasks] = useState<Task[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const queryStartTime = useRef<number>(0)

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

  // Set initial query
  useEffect(() => {
    if (initialQuery) {
      setInputValue(initialQuery)
    }
  }, [initialQuery])

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

    // Check authentication
    if (!user) {
      onAuthRequired?.()
      return
    }

    // Check premium status for free query limit
    const freeQueries = parseInt(localStorage.getItem(`free_queries_${user.id}`) || '0', 10)
    if (!isPremium && freeQueries >= 3) {
      onUpgradeRequired?.()
      return
    }

    // Track free query usage
    if (!isPremium) {
      localStorage.setItem(`free_queries_${user.id}`, String(freeQueries + 1))
    }

    let queryContent = inputValue.trim()
    let fileContent = ""

    // Handle file upload
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

    // Track query start
    queryStartTime.current = Date.now()
    onQueryStart?.({
      query: queryContent,
      model: selectedModel.key,
      model_tier: selectedModel.tier,
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
      onQueryComplete?.({
        query: queryContent,
        model: selectedModel.key,
        model_tier: selectedModel.tier,
        response_time_ms: Date.now() - queryStartTime.current,
        success: false,
      })
    } finally {
      setIsLoading(false)
      if (answerContent) {
        onQueryComplete?.({
          query: queryContent,
          model: selectedModel.key,
          model_tier: selectedModel.tier,
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

  const hasMessages = messages.length > 0
  const hasContent = inputValue.trim() || attachedFile

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Messages area */}
      <AnimatePresence mode="popLayout">
        {hasMessages && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex-1 overflow-y-auto px-4 py-6"
          >
            <div className="max-w-2xl mx-auto space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={cn(
                    "flex",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm",
                      message.role === 'user'
                        ? "bg-[#4ebe96] text-black"
                        : "bg-[#1a1a1a] border border-white/[0.08]"
                    )}
                  >
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.role === 'assistant'
                        ? parseTickerSymbolsWithMarkdown(message.content)
                        : message.content
                      }
                    </div>
                    {message.role === 'assistant' && message.content && (
                      <motion.button
                        onClick={() => copyToClipboard(message.content, message.id)}
                        className="mt-2 p-1.5 text-[#868f97] hover:text-white rounded-lg hover:bg-white/[0.04] transition-colors duration-100"
                        whileTap={{ scale: 0.9 }}
                      >
                        {copiedId === message.id ? (
                          <Check className="w-4 h-4 text-[#4ebe96]" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Research tasks indicator */}
              <AnimatePresence>
                {isLoading && tasks.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-[#1a1a1a] border border-white/[0.08] rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="w-4 h-4 text-[#4ebe96]" />
                      </motion.div>
                      <span className="text-sm font-medium">Researching</span>
                      <TypingDots />
                    </div>
                    <div className="space-y-2">
                      {tasks.map((task, i) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-2 text-sm"
                        >
                          {task.status === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-[#4ebe96]" />
                          ) : task.status === 'running' ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Loader2 className="w-4 h-4 text-[#479ffa]" />
                            </motion.div>
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-[#868f97]/30" />
                          )}
                          <span className={task.status === 'completed' ? 'text-[#868f97]' : ''}>
                            {task.description}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat input */}
      <div className="px-4 pb-4">
        <div className="w-full max-w-2xl mx-auto">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.csv,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Attached file preview */}
          <AnimatePresence>
            {attachedFile && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="mb-3"
              >
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-white/[0.025] rounded-xl text-sm border border-white/[0.08]">
                  <FileText className="w-4 h-4 text-[#4ebe96]" />
                  <span className="truncate max-w-[200px] font-medium">{attachedFile.name}</span>
                  <button
                    onClick={() => setAttachedFile(null)}
                    className="p-1 hover:bg-white/[0.08] rounded-lg transition-colors duration-100"
                  >
                    <X className="w-4 h-4 text-[#868f97] hover:text-white" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input container with glow effect */}
          <motion.div
            className={cn(
              "relative rounded-2xl transition-all duration-300",
              isFocused && "shadow-[0_0_30px_rgba(34,197,94,0.15)]"
            )}
          >
            {/* Focus ring animation */}
            <AnimatePresence>
              {isFocused && (
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-[#4ebe96]/30 pointer-events-none"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </AnimatePresence>

            <div className="relative bg-[#1a1a1a] border border-white/[0.08] rounded-2xl shadow-lg overflow-hidden">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={hasMessages ? "Ask a follow-up..." : "Ask about any stock, market trends, or financial analysis..."}
                className={cn(
                  "w-full py-4 px-5 pr-14 bg-transparent border-none resize-none focus:outline-none placeholder:text-[#868f97] text-base",
                  hasMessages ? "min-h-[56px] max-h-[100px]" : "min-h-[80px] max-h-[150px] pb-14"
                )}
                disabled={isLoading}
                rows={1}
              />

              {/* Bottom toolbar */}
              <div className={cn(
                "flex items-center gap-2",
                hasMessages
                  ? "absolute right-14 bottom-3"
                  : "absolute left-4 bottom-4"
              )}>
                {/* File attachment */}
                <motion.button
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "p-2 text-[#868f97] hover:text-white rounded-xl hover:bg-white/[0.08] transition-colors duration-100",
                    hasMessages && "hidden md:flex"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Paperclip className="w-5 h-5" />
                </motion.button>

                {/* Model selector */}
                <div className={cn("relative", hasMessages && "hidden md:block")}>
                  <motion.button
                    onClick={() => setShowModelSelector(!showModelSelector)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[#868f97] hover:text-white rounded-xl hover:bg-white/[0.08] transition-colors duration-100 text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden sm:inline font-medium">{selectedModel.name}</span>
                    <motion.div
                      animate={{ rotate: showModelSelector ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {showModelSelector && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-0 mb-2 w-64 bg-[#1a1a1a] border border-white/[0.08] rounded-xl shadow-2xl py-2 z-50 overflow-hidden"
                      >
                        {/* Fast tier */}
                        <div className="px-3 py-1.5 text-xs font-semibold text-[#868f97] uppercase tracking-wider">Fast</div>
                        {MODELS.filter(m => m.tier === 'fast').map((model) => (
                          <motion.button
                            key={model.key}
                            onClick={() => {
                              setSelectedModel(model)
                              setShowModelSelector(false)
                            }}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors duration-100",
                              selectedModel.key === model.key
                                ? "bg-[#4ebe96]/10 text-[#4ebe96]"
                                : "text-white hover:bg-white/[0.08]"
                            )}
                            whileHover={{ x: 4 }}
                          >
                            <Zap className="w-4 h-4 text-[#479ffa]" />
                            <span className="font-medium">{model.name}</span>
                            {selectedModel.key === model.key && <Check className="w-4 h-4 ml-auto" />}
                          </motion.button>
                        ))}

                        {/* Standard tier */}
                        <div className="px-3 py-1.5 text-xs font-semibold text-[#868f97] uppercase tracking-wider mt-2 border-t border-white/[0.08] pt-2">Standard</div>
                        {MODELS.filter(m => m.tier === 'standard').map((model) => (
                          <motion.button
                            key={model.key}
                            onClick={() => {
                              setSelectedModel(model)
                              setShowModelSelector(false)
                            }}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors duration-100",
                              selectedModel.key === model.key
                                ? "bg-[#4ebe96]/10 text-[#4ebe96]"
                                : "text-white hover:bg-white/[0.08]"
                            )}
                            whileHover={{ x: 4 }}
                          >
                            <Sparkles className="w-4 h-4" />
                            <span className="font-medium">{model.name}</span>
                            {selectedModel.key === model.key && <Check className="w-4 h-4 ml-auto" />}
                          </motion.button>
                        ))}

                        {/* Premium tier */}
                        <div className="px-3 py-1.5 text-xs font-semibold text-[#868f97] uppercase tracking-wider mt-2 border-t border-white/[0.08] pt-2">Premium</div>
                        {MODELS.filter(m => m.tier === 'premium').map((model) => (
                          <motion.button
                            key={model.key}
                            onClick={() => {
                              if (isPremium) {
                                setSelectedModel(model)
                                setShowModelSelector(false)
                              } else {
                                setShowModelSelector(false)
                                onUpgradeRequired?.()
                              }
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors duration-100 text-white hover:bg-white/[0.08]"
                            whileHover={{ x: 4 }}
                          >
                            <Zap className="w-4 h-4 text-[#f4a623]" />
                            <span className="font-medium">{model.name}</span>
                            {!isPremium && (
                              <span className="ml-auto text-xs text-[#f4a623] bg-[#f4a623]/10 px-2 py-0.5 rounded-full font-semibold">
                                PRO
                              </span>
                            )}
                            {isPremium && selectedModel.key === model.key && (
                              <Check className="w-4 h-4 ml-auto text-[#4ebe96]" />
                            )}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Submit button */}
              <motion.button
                onClick={handleSubmit}
                disabled={isLoading || !hasContent}
                className={cn(
                  "absolute w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  hasMessages ? "right-3 bottom-2" : "right-4 bottom-4",
                  hasContent && !isLoading
                    ? "bg-[#4ebe96] hover:bg-[#4ebe96] text-black shadow-lg shadow-[#4ebe96]/25"
                    : "bg-white/[0.05] text-[#868f97]"
                )}
                whileHover={hasContent && !isLoading ? { scale: 1.05 } : {}}
                whileTap={hasContent && !isLoading ? { scale: 0.95 } : {}}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <ArrowUp className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

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

export default PremiumAIChat
