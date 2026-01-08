"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Send,
  Bot,
  User,
  Loader2,
  Brain,
  ListChecks,
  Play,
  RefreshCw,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react"

type Phase = 'idle' | 'understand' | 'plan' | 'execute' | 'reflect' | 'answer' | 'complete' | 'error'

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

const PHASE_INFO: Record<Phase, { label: string; icon: typeof Brain; color: string }> = {
  idle: { label: 'Ready', icon: Bot, color: 'text-gray-400' },
  understand: { label: 'Understanding Query', icon: Brain, color: 'text-blue-500' },
  plan: { label: 'Planning Research', icon: ListChecks, color: 'text-purple-500' },
  execute: { label: 'Executing Tasks', icon: Play, color: 'text-yellow-500' },
  reflect: { label: 'Evaluating Results', icon: RefreshCw, color: 'text-orange-500' },
  answer: { label: 'Generating Answer', icon: MessageSquare, color: 'text-green-500' },
  complete: { label: 'Complete', icon: CheckCircle2, color: 'text-green-600' },
  error: { label: 'Error', icon: AlertCircle, color: 'text-red-500' },
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  phases?: Phase[]
  tasks?: Task[]
  toolResults?: ToolResult[]
}

export default function AutonomousChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<Phase>('idle')
  const [tasks, setTasks] = useState<Task[]>([])
  const [expandedPhases, setExpandedPhases] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, currentPhase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)
    setCurrentPhase('understand')
    setTasks([])

    const assistantId = (Date.now() + 1).toString()
    let answerContent = ""
    const collectedPhases: Phase[] = []
    const collectedTasks: Task[] = []
    const collectedToolResults: ToolResult[] = []

    try {
      const response = await fetch('/api/chat/autonomous', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: inputValue,
          conversationHistory: messages.slice(-6).map(m => ({
            role: m.role,
            content: m.content,
          })),
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
                      content: `Error: ${event.data}`,
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
    } catch (error) {
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
      setTimeout(() => setCurrentPhase('idle'), 2000)
    }
  }

  const PhaseIndicator = ({ phase }: { phase: Phase }) => {
    const info = PHASE_INFO[phase]
    const Icon = info.icon
    return (
      <div className={`flex items-center gap-2 ${info.color}`}>
        {phase !== 'idle' && phase !== 'complete' && phase !== 'error' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Icon className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">{info.label}</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Autonomous Research Agent</h2>
                <p className="text-sm text-white/80">Multi-phase financial analysis</p>
              </div>
            </div>
            {currentPhase !== 'idle' && (
              <PhaseIndicator phase={currentPhase} />
            )}
          </div>
        </div>

        {/* Task Progress */}
        {tasks.length > 0 && (
          <div className="px-4 py-3 bg-secondary/30 border-b border-border">
            <button
              onClick={() => setExpandedPhases(!expandedPhases)}
              className="flex items-center justify-between w-full text-sm"
            >
              <span className="font-medium">
                Research Plan ({tasks.filter(t => t.status === 'completed').length}/{tasks.length} tasks)
              </span>
              {expandedPhases ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {expandedPhases && (
              <div className="mt-2 space-y-1">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 text-xs py-1"
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                    ) : task.status === 'running' ? (
                      <Loader2 className="w-3 h-3 animate-spin text-yellow-500" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-gray-400" />
                    )}
                    <span className={task.status === 'completed' ? 'text-muted-foreground' : ''}>
                      {task.description}
                    </span>
                    <span className="text-muted-foreground">
                      ({task.taskType === 'use_tools' ? 'data' : 'analysis'})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        <div
          ref={scrollRef}
          className="h-[400px] overflow-y-auto p-4 space-y-4"
        >
          {messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Autonomous Financial Research</p>
              <p className="text-sm max-w-md mx-auto">
                Ask complex financial questions. I&apos;ll plan research tasks,
                gather data from multiple sources, and synthesize a comprehensive answer.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {[
                  "Analyze Apple's financial health and compare to Microsoft",
                  "What are the insider trading trends for Tesla?",
                  "Research NVIDIA's revenue segments and growth",
                ].map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => setInputValue(prompt)}
                    className="text-xs px-3 py-1.5 bg-secondary rounded-full hover:bg-secondary/80"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(message => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary'
                }`}
              >
                {message.phases && message.phases.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {message.phases.map(phase => (
                      <span
                        key={phase}
                        className="text-[10px] px-2 py-0.5 bg-background rounded-full"
                      >
                        {PHASE_INFO[phase]?.label}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
                {message.toolResults && message.toolResults.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      Data from: {message.toolResults.map(t => t.tool).join(', ')}
                    </p>
                  </div>
                )}
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-secondary rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    {PHASE_INFO[currentPhase]?.label || 'Researching...'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border p-4 bg-secondary/30">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a complex financial question..."
              className="flex-1 bg-background border-border h-12 text-base"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 h-12 px-6"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            <Sparkles className="w-3 h-3 inline mr-1" />
            Powered by autonomous multi-phase reasoning
          </p>
        </div>
      </div>
    </div>
  )
}
