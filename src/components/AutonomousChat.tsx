"use client"

import { useState, useRef, useEffect, useCallback, memo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  ArrowUp,
  ChevronDown,
  Loader2,
  CheckCircle2,
  Search,
  Lightbulb,
  ListTodo,
  Zap,
  FileText,
  RotateCcw,
  Square,
  Copy,
  Check,
  Wallet,
  Calculator,
  BarChart3,
  LineChart,
  MoreHorizontal,
  Paperclip,
  Upload,
  X,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Financial tool actions (matching ManusStyleHome)
const FINANCIAL_TOOLS = [
  { id: "portfolio", label: "Connect Portfolio", icon: Wallet, href: "/dashboard/portfolios" },
  { id: "screener", label: "Stock Screener", icon: BarChart3, href: "/screener" },
  { id: "compare", label: "Compare Stocks", icon: LineChart, href: "/compare" },
  { id: "taxes", label: "Calculate Taxes", icon: Calculator, href: "/tools/tax-calculator" },
]

type Phase = 'idle' | 'understand' | 'plan' | 'execute' | 'reflect' | 'answer' | 'complete' | 'error'

// Available models
interface ModelOption {
  key: string
  name: string
  tier: 'premium' | 'standard' | 'fast'
}

const MODELS: ModelOption[] = [
  { key: 'gpt-4o-mini', name: 'GPT-4o Mini', tier: 'standard' },
  { key: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', tier: 'standard' },
  { key: 'gpt-4o', name: 'GPT-4o', tier: 'premium' },
  { key: 'claude-sonnet-4', name: 'Claude Sonnet 4', tier: 'premium' },
  { key: 'llama-3.3-70b', name: 'Llama 3.3 70B', tier: 'standard' },
  { key: 'gemini-flash', name: 'Gemini Flash', tier: 'fast' },
]

interface AgentEvent {
  type: string
  data: unknown
}

interface Task {
  id: string
  description: string
  taskType: string
  status?: string
}

interface ToolResult {
  tool: string
  result: unknown
}

const PHASE_CONFIG: Record<Phase, { label: string; icon: typeof Search; activeLabel: string }> = {
  idle: { label: 'Ready', icon: Search, activeLabel: 'Ready' },
  understand: { label: 'Understanding', icon: Lightbulb, activeLabel: 'Understanding your question...' },
  plan: { label: 'Planning', icon: ListTodo, activeLabel: 'Planning research tasks...' },
  execute: { label: 'Researching', icon: Zap, activeLabel: 'Gathering data...' },
  reflect: { label: 'Analyzing', icon: RotateCcw, activeLabel: 'Analyzing results...' },
  answer: { label: 'Writing', icon: FileText, activeLabel: 'Writing response...' },
  complete: { label: 'Complete', icon: CheckCircle2, activeLabel: 'Complete' },
  error: { label: 'Error', icon: Square, activeLabel: 'Error occurred' },
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  phases?: Phase[]
  tasks?: Task[]
  toolResults?: ToolResult[]
  thinkingTime?: number
}

// Collapsible section component like Morphic
function ResearchSection({
  title,
  badge,
  isOpen,
  onOpenChange,
  children,
  isLoading = false,
}: {
  title: string
  badge?: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  isLoading?: boolean
}) {
  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="group flex items-center gap-2 w-full text-left py-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#868f97]" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#4ebe96]" />
          )}
          <span className="text-sm font-medium truncate">{title}</span>
          {badge && (
            <span className="text-xs text-[#868f97] bg-white/[0.05] px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-[#868f97] transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down">
        <div className="pt-2 pb-3 text-sm text-[#868f97]">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

// Message component
function ChatMessage({
  message,
  isStreaming = false
}: {
  message: Message
  isStreaming?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const [sectionsOpen, setSectionsOpen] = useState<Record<string, boolean>>({})

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [message.content])

  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-6">
        <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-3 max-w-[80%]">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 animate-fade-in">
      {/* Research phases section */}
      {message.tasks && message.tasks.length > 0 && (
        <div className="mb-4 border border-white/[0.08] rounded-xl p-3 bg-[#1a1a1a]">
          <ResearchSection
            title="Research Plan"
            badge={`${message.tasks.filter(t => t.status === 'completed').length}/${message.tasks.length} tasks`}
            isOpen={sectionsOpen['plan'] ?? false}
            onOpenChange={(open) => setSectionsOpen(prev => ({ ...prev, plan: open }))}
          >
            <div className="space-y-2">
              {message.tasks.map(task => (
                <div key={task.id} className="flex items-start gap-2">
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#4ebe96] mt-0.5 flex-shrink-0" />
                  ) : task.status === 'running' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#479ffa] mt-0.5 flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-muted-foreground/30 mt-0.5 flex-shrink-0" />
                  )}
                  <span className={cn(
                    "text-sm",
                    task.status === 'completed' && "text-[#868f97]"
                  )}>
                    {task.description}
                  </span>
                </div>
              ))}
            </div>
          </ResearchSection>
        </div>
      )}

      {/* Tool results section */}
      {message.toolResults && message.toolResults.length > 0 && (
        <div className="mb-4 border border-white/[0.08] rounded-xl p-3 bg-[#1a1a1a]">
          <ResearchSection
            title="Data Sources"
            badge={`${message.toolResults.length} sources`}
            isOpen={sectionsOpen['sources'] ?? false}
            onOpenChange={(open) => setSectionsOpen(prev => ({ ...prev, sources: open }))}
          >
            <div className="flex flex-wrap gap-2">
              {message.toolResults.map((result, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-white/[0.05] px-2 py-1 rounded-md"
                >
                  {result.tool}
                </span>
              ))}
            </div>
          </ResearchSection>
        </div>
      )}

      {/* Answer content */}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
          {isStreaming && (
            <span className="inline-flex gap-1 ml-1">
              <span className="w-1.5 h-1.5 bg-foreground/60 rounded-full typing-dot" />
              <span className="w-1.5 h-1.5 bg-foreground/60 rounded-full typing-dot" />
              <span className="w-1.5 h-1.5 bg-foreground/60 rounded-full typing-dot" />
            </span>
          )}
        </p>
      </div>

      {/* Actions */}
      {!isStreaming && message.content && (
        <div className="flex items-center gap-2 mt-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-[#868f97] hover:text-white"
            onClick={copyToClipboard}
            aria-label={copied ? "Copied to clipboard" : "Copy message"}
          >
            {copied ? (
              <Check className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Copy className="w-4 h-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

// Loading skeleton
function ResearchSkeleton({ phase }: { phase: Phase }) {
  const config = PHASE_CONFIG[phase]
  const Icon = config.icon

  return (
    <div className="mb-6 animate-fade-in">
      <div className="border border-white/[0.08] rounded-xl p-4 bg-[#1a1a1a]">
        <div className="flex items-center gap-3 mb-3">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm font-medium">{config.activeLabel}</span>
            </div>
          </div>
        </div>
        <Separator className="my-3" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  )
}

// Empty state - Manus-style welcome UI
function EmptyState({
  onPromptClick,
  inputValue,
  onInputChange,
  onSubmit,
  isLoading,
  attachedFile,
  onFileAttach,
  onFileRemove,
}: {
  onPromptClick: (prompt: string) => void
  inputValue: string
  onInputChange: (value: string) => void
  onSubmit: () => void
  isLoading: boolean
  attachedFile: File | null
  onFileAttach: (file: File) => void
  onFileRemove: () => void
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const suggestions = [
    "Analyze Apple vs Microsoft",
    "Tesla insider trading trends",
    "NVIDIA revenue breakdown",
    "Amazon vs Walmart margins",
  ]

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Accept PDFs and common document types
      if (file.type === 'application/pdf' || file.type.startsWith('text/') || file.type.includes('document')) {
        onFileAttach(file)
      }
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px'
    }
  }, [inputValue])

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] px-6 py-12">
      {/* Heading */}
      <h1 className="text-4xl md:text-5xl font-semibold text-center mb-10">
        What can I do for you?
      </h1>

      {/* Chat input */}
      <div className="w-full max-w-2xl">
        <div className="relative bg-[#1a1a1a] border border-white/[0.08] rounded-2xl shadow-lg focus-within:border-[#4ebe96]/50 transition-all">
          {/* Attached file preview */}
          {attachedFile && (
            <div className="px-4 pt-3 pb-0">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/[0.05]/50 rounded-lg text-sm">
                <FileText className="w-4 h-4 text-[#868f97]" />
                <span className="truncate max-w-[200px]">{attachedFile.name}</span>
                <button
                  onClick={onFileRemove}
                  className="p-0.5 hover:bg-white/[0.08] rounded transition-colors duration-100"
                  aria-label="Remove attached file"
                >
                  <X className="w-3.5 h-3.5 text-[#868f97] hover:text-white" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about any stock, market trends, or financial analysis..."
            className="w-full min-h-[60px] max-h-[150px] py-4 px-5 pr-14 text-lg bg-transparent border-none resize-none focus:outline-none placeholder:text-[#868f97]"
            disabled={isLoading}
            rows={1}
          />

          {/* Input actions */}
          <div className="flex items-center justify-between px-4 pb-3">
            <div className="flex items-center gap-1">
              {/* File attachment button */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.csv,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-[#868f97] hover:text-white rounded-lg hover:bg-white/[0.08] transition-colors duration-100"
                aria-label="Attach PDF or document"
              >
                <Paperclip className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <button
              onClick={onSubmit}
              disabled={isLoading || (!inputValue.trim() && !attachedFile)}
              aria-label={isLoading ? "Sending message..." : "Send message"}
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-100",
                inputValue.trim() || attachedFile
                  ? "bg-[#4ebe96] hover:bg-[#4ebe96]/90 text-black"
                  : "bg-white/[0.05] text-[#868f97]"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Quick suggestion chips */}
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {suggestions.map((prompt) => (
            <button
              key={prompt}
              onClick={() => onPromptClick(prompt)}
              className="text-sm px-3 py-2 rounded-full border border-white/[0.08] bg-[#1a1a1a] hover:bg-white/[0.08]/50 transition-colors duration-100"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Financial tool buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {FINANCIAL_TOOLS.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-full",
                "border border-white/[0.08] bg-[#1a1a1a] hover:bg-white/[0.08]",
                "text-sm font-medium transition-colors duration-100"
              )}
            >
              <tool.icon className="w-4 h-4" />
              {tool.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function AutonomousChatComponent() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<Phase>('idle')
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedModel, setSelectedModel] = useState(MODELS[0])
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, currentPhase])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [inputValue])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if ((!inputValue.trim() && !attachedFile) || isLoading) return

    // Build query with file info if attached
    let queryContent = inputValue.trim()
    if (attachedFile) {
      // For now, indicate file was attached - in future, parse and include content
      queryContent = queryContent
        ? `${queryContent}\n\n[Attached file: ${attachedFile.name}]`
        : `Please analyze the attached file: ${attachedFile.name}`
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: queryContent,
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setAttachedFile(null) // Clear attached file after sending
    setIsLoading(true)
    setCurrentPhase('understand')
    setTasks([])

    const assistantId = (Date.now() + 1).toString()
    setStreamingMessageId(assistantId)
    let answerContent = ""
    const collectedPhases: Phase[] = []
    const collectedTasks: Task[] = []
    const collectedToolResults: ToolResult[] = []

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

      if (!response.ok) {
        throw new Error('Request failed')
      }

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
              const event: AgentEvent = JSON.parse(data)

              switch (event.type) {
                case 'phase':
                  const phase = event.data as Phase
                  setCurrentPhase(phase)
                  if (!collectedPhases.includes(phase)) {
                    collectedPhases.push(phase)
                  }
                  break

                case 'plan':
                  const plan = event.data as { tasks: Task[] }
                  if (plan?.tasks) {
                    setTasks(plan.tasks)
                    collectedTasks.push(...plan.tasks)
                  }
                  break

                case 'task-start':
                  const startTask = event.data as Task
                  setTasks(prev =>
                    prev.map(t =>
                      t.id === startTask.id ? { ...t, status: 'running' } : t
                    )
                  )
                  break

                case 'task-complete':
                  const { task: completedTask, result } = event.data as {
                    task: Task
                    result: { toolResults?: ToolResult[] }
                  }
                  setTasks(prev =>
                    prev.map(t =>
                      t.id === completedTask.id ? { ...t, status: 'completed' } : t
                    )
                  )
                  if (result?.toolResults) {
                    collectedToolResults.push(...result.toolResults)
                  }
                  break

                case 'answer-chunk':
                  answerContent += event.data as string
                  setMessages(prev => {
                    const existing = prev.find(m => m.id === assistantId)
                    if (existing) {
                      return prev.map(m =>
                        m.id === assistantId
                          ? { ...m, content: answerContent }
                          : m
                      )
                    }
                    return [
                      ...prev,
                      {
                        id: assistantId,
                        role: 'assistant',
                        content: answerContent,
                        phases: collectedPhases,
                        tasks: collectedTasks,
                        toolResults: collectedToolResults,
                      },
                    ]
                  })
                  break

                case 'complete':
                  setCurrentPhase('complete')
                  break

                case 'error':
                  setCurrentPhase('error')
                  setMessages(prev => [
                    ...prev,
                    {
                      id: assistantId,
                      role: 'assistant',
                      content: `Something went wrong. Please try again.`,
                    },
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
      setCurrentPhase('error')
      setMessages(prev => [
        ...prev,
        {
          id: assistantId,
          role: 'assistant',
          content: 'Sorry, the research failed. Please try again.',
        },
      ])
    } finally {
      setIsLoading(false)
      setStreamingMessageId(null)
      setTimeout(() => setCurrentPhase('idle'), 2000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex flex-col min-h-[500px] max-w-3xl mx-auto">
      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6"
      >
        {messages.length === 0 ? (
          <EmptyState
            onPromptClick={(prompt) => {
              setInputValue(prompt)
              // Auto-submit after small delay for UX
              setTimeout(() => {
                const fakeEvent = { preventDefault: () => {} } as React.FormEvent
                handleSubmit(fakeEvent)
              }, 100)
            }}
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSubmit={() => handleSubmit()}
            isLoading={isLoading}
            attachedFile={attachedFile}
            onFileAttach={setAttachedFile}
            onFileRemove={() => setAttachedFile(null)}
          />
        ) : (
          <>
            {messages.map(message => (
              <ChatMessage
                key={message.id}
                message={message}
                isStreaming={message.id === streamingMessageId}
              />
            ))}

            {/* Loading state */}
            {isLoading && !messages.find(m => m.id === streamingMessageId) && (
              <ResearchSkeleton phase={currentPhase} />
            )}

            {/* Live task progress */}
            {isLoading && tasks.length > 0 && currentPhase === 'execute' && (
              <div className="mb-6 border border-white/[0.08] rounded-xl p-4 bg-[#1a1a1a] animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm font-medium">Researching...</span>
                  <span className="text-xs text-[#868f97]">
                    {tasks.filter(t => t.status === 'completed').length}/{tasks.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {tasks.map(task => (
                    <div key={task.id} className="flex items-start gap-2">
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#4ebe96] mt-0.5 flex-shrink-0" />
                      ) : task.status === 'running' ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#479ffa] mt-0.5 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-muted-foreground/30 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={cn(
                        "text-sm",
                        task.status === 'completed' && "text-[#868f97]"
                      )}>
                        {task.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input area - only show when there are messages */}
      {messages.length > 0 && (
        <div className="border-t border-white/[0.08] bg-background p-4">
          <div className="max-w-3xl mx-auto">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.csv,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file && (file.type === 'application/pdf' || file.type.startsWith('text/') || file.type.includes('document'))) {
                  setAttachedFile(file)
                }
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="hidden"
            />

            {/* Attached file preview */}
            {attachedFile && (
              <div className="mb-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/[0.05]/50 rounded-lg text-sm">
                  <FileText className="w-4 h-4 text-[#868f97]" />
                  <span className="truncate max-w-[200px]">{attachedFile.name}</span>
                  <button
                    onClick={() => setAttachedFile(null)}
                    className="p-0.5 hover:bg-white/[0.08] rounded transition-colors duration-100"
                    aria-label="Remove attached file"
                  >
                    <X className="w-3.5 h-3.5 text-[#868f97] hover:text-white" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a follow-up question..."
                className="min-h-[52px] max-h-[200px] pl-12 pr-14 resize-none rounded-xl border-white/[0.08] bg-white/[0.05]/30 focus-visible:ring-1 focus-visible:ring-ring"
                disabled={isLoading}
                rows={1}
              />
              {/* File attachment button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute left-3 bottom-3 p-1.5 text-[#868f97] hover:text-white rounded-lg hover:bg-white/[0.08] transition-colors duration-100"
                aria-label="Attach PDF or document"
              >
                <Paperclip className="w-5 h-5" aria-hidden="true" />
              </button>
              <Button
                type="button"
                size="icon"
                disabled={isLoading || (!inputValue.trim() && !attachedFile)}
                onClick={() => handleSubmit()}
                aria-label={isLoading ? "Sending message..." : "Send message"}
                className="absolute right-2 bottom-2 h-9 w-9 rounded-lg bg-[#4ebe96] hover:bg-[#4ebe96]/90 text-black"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 gap-2 text-[#868f97] hover:text-white">
                    <span className="text-xs">{selectedModel.name}</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {MODELS.map((model) => (
                    <DropdownMenuItem
                      key={model.key}
                      onClick={() => {
                        if (model.tier === 'premium') {
                          // Redirect to Stripe checkout for premium models
                          router.push('/api/stripe/quick-checkout?plan=monthly')
                        } else {
                          setSelectedModel(model)
                        }
                      }}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{model.name}</span>
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded",
                        model.tier === 'premium' && "bg-amber-500/20 text-amber-600",
                        model.tier === 'standard' && "bg-[#479ffa]/20 text-[#479ffa]",
                        model.tier === 'fast' && "bg-[#4ebe96]/20 text-[#4ebe96]"
                      )}>
                        {model.tier}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <p className="text-xs text-[#868f97]">
                Enter to send
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(AutonomousChatComponent)
