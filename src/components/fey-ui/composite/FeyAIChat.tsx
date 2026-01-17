'use client'

import { useState, useRef, useEffect, useMemo, FormEvent, ReactNode } from 'react'
import { motion, AnimatePresence, Easing } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useChat, UIMessage } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Text } from '../base/Text'
import { LiveBadge } from '../base/Badge'
import { renderFeyToolResult, ToolResult } from './FeyGenerativeUI'
import {
  TrendUpIcon,
  ChartBarIcon,
  FileTextIcon,
  UserIcon,
  BuildingIcon,
  SearchIcon,
  RocketIcon,
  ClipboardIcon,
  BoltIcon,
  SparklesIcon,
} from '../base/Icons'

// =============================================================================
// TYPES
// =============================================================================

interface FeyAIChatProps {
  className?: string
  placeholder?: string
  welcomeMessage?: string
  endpoint?: string
}

interface ToolInvocation {
  toolName: string
  state: 'pending' | 'result' | 'error'
  args?: Record<string, unknown>
  result?: unknown
}

// =============================================================================
// TOOL DISPLAY CONFIG
// =============================================================================

const TOOL_CONFIG: Record<string, { icon: ReactNode; label: string; color: string }> = {
  getStockQuote: { icon: <TrendUpIcon size="sm" className="text-[#4ebe96]" />, label: 'Fetching Quote', color: 'text-[#4ebe96]' },
  getCompanyFundamentals: { icon: <ChartBarIcon size="sm" className="text-[#479ffa]" />, label: 'Analyzing', color: 'text-[#479ffa]' },
  getFinancialStatements: { icon: <FileTextIcon size="sm" className="text-[#f4a623]" />, label: 'Loading Financials', color: 'text-[#f4a623]' },
  getInsiderTrades: { icon: <UserIcon size="sm" className="text-[#9b59b6]" />, label: 'Insider Activity', color: 'text-[#9b59b6]' },
  getInstitutionalOwnership: { icon: <BuildingIcon size="sm" className="text-[#e15241]" />, label: 'Institutions', color: 'text-[#e15241]' },
  searchStocks: { icon: <SearchIcon size="sm" className="text-[#479ffa]" />, label: 'Searching', color: 'text-[#479ffa]' },
  getMarketMovers: { icon: <RocketIcon size="sm" className="text-[#4ebe96]" />, label: 'Market Movers', color: 'text-[#4ebe96]' },
  getSECFilings: { icon: <ClipboardIcon size="sm" className="text-[#f4a623]" />, label: 'SEC Filings', color: 'text-[#f4a623]' },
  default: { icon: <BoltIcon size="sm" className="text-[#479ffa]" />, label: 'Processing', color: 'text-[#479ffa]' },
}

// =============================================================================
// ANIMATIONS
// =============================================================================

const messageVariants = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.98 },
}

const typingVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const dotVariants = {
  initial: { y: 0 },
  animate: {
    y: [-2, 2, -2],
    transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' as Easing },
  },
}

// =============================================================================
// TYPING INDICATOR
// =============================================================================

function TypingIndicator() {
  return (
    <motion.div
      className="flex items-center gap-1 px-4 py-2"
      variants={typingVariants}
      initial="initial"
      animate="animate"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-[#479ffa]"
          variants={dotVariants}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </motion.div>
  )
}

// =============================================================================
// TOOL CARD
// =============================================================================

function ToolCard({ toolName, state, args }: ToolInvocation) {
  const config = TOOL_CONFIG[toolName] || TOOL_CONFIG.default
  const ticker = (args?.ticker as string)?.toUpperCase()

  return (
    <motion.div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
        'bg-white/[0.05] border border-white/[0.08]',
        'text-[12px]'
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {config.icon}
      <span className={cn('font-medium', config.color)}>
        {config.label}
        {ticker && <span className="text-white ml-1">{ticker}</span>}
      </span>
      {state === 'pending' && (
        <motion.span
          className="size-1.5 rounded-full bg-[#4ebe96]"
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </motion.div>
  )
}

// =============================================================================
// MESSAGE BUBBLE
// =============================================================================

interface MessageBubbleProps {
  message: UIMessage | { id: string; role: 'user' | 'assistant'; content: string }
  isLast: boolean
}

function MessageBubble({ message, isLast }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  // Parse tool invocations from message
  const toolInvocations: ToolInvocation[] = []
  if ('toolInvocations' in message && Array.isArray(message.toolInvocations)) {
    for (const inv of message.toolInvocations as { toolName: string; state: string; args?: Record<string, unknown>; result?: unknown }[]) {
      toolInvocations.push({
        toolName: inv.toolName,
        state: inv.state as 'pending' | 'result' | 'error',
        args: inv.args,
        result: inv.result,
      })
    }
  }

  return (
    <motion.div
      className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
      variants={messageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className={cn('max-w-[85%]', isUser ? 'order-2' : 'order-1')}>
        {/* Tool invocations - show loading pill for pending, rich UI for completed */}
        {toolInvocations.length > 0 && (
          <div className="space-y-2 mb-2">
            {toolInvocations.map((tool, i) => {
              // For pending tools, show the loading pill
              if (tool.state === 'pending') {
                return <ToolCard key={i} {...tool} />
              }
              // For completed tools, try to render rich UI
              const richUI = renderFeyToolResult({
                toolName: tool.toolName,
                args: tool.args || {},
                result: tool.result,
                status: tool.state === 'result' ? 'success' : 'error',
              })
              // If we got a rich UI, render it; otherwise show the completed pill
              return richUI ? (
                <div key={i}>{richUI}</div>
              ) : (
                <ToolCard key={i} {...tool} />
              )
            })}
          </div>
        )}

        {/* Message content */}
        {'content' in message && message.content && (
          <div
            className={cn(
              'rounded-2xl px-4 py-3',
              isUser
                ? 'bg-[#479ffa] text-white rounded-tr-sm'
                : 'bg-white/[0.05] border border-white/[0.08] rounded-tl-sm'
            )}
          >
            <div className="text-[13px] leading-relaxed whitespace-pre-wrap">
              {String(message.content)}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// =============================================================================
// SUGGESTED PROMPTS
// =============================================================================

const SUGGESTIONS = [
  { icon: <TrendUpIcon size="sm" className="text-[#4ebe96]" />, text: "What's NVIDIA's PE ratio?" },
  { icon: <UserIcon size="sm" className="text-[#9b59b6]" />, text: 'Show Apple insider trades' },
  { icon: <BuildingIcon size="sm" className="text-[#e15241]" />, text: 'Top MSFT institutions' },
  { icon: <ChartBarIcon size="sm" className="text-[#479ffa]" />, text: 'Compare TSLA vs RIVN' },
]

function SuggestedPrompts({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {SUGGESTIONS.map((s, i) => (
        <motion.button
          key={i}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl',
            'bg-white/[0.03] border border-white/[0.08]',
            'text-[12px] text-[#868f97]',
            'hover:bg-white/[0.06] hover:text-white hover:border-white/[0.12]',
            'transition-colors'
          )}
          onClick={() => onSelect(s.text)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {s.icon}
          <span>{s.text}</span>
        </motion.button>
      ))}
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function FeyAIChat({
  className,
  placeholder = 'Ask anything about stocks...',
  welcomeMessage = "I'm your AI financial analyst. Ask me about stocks, fundamentals, or market trends.",
  endpoint = '/api/chat/autonomous',
}: FeyAIChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState('')

  // Create transport for chat API
  const transport = useMemo(() => new DefaultChatTransport({
    api: endpoint,
  }), [endpoint])

  const { messages: chatMessages, sendMessage, status } = useChat({
    transport,
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    sendMessage({ text: inputValue.trim() })
    setInputValue('')
  }

  const handleSuggestionSelect = (text: string) => {
    sendMessage({ text })
  }

  return (
    <div
      className={cn(
        'flex flex-col h-[500px]',
        'bg-[#0a0a0a] rounded-2xl border border-white/[0.08]',
        'overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-br from-[#479ffa] to-[#4ebe96] flex items-center justify-center">
            <SparklesIcon size="sm" className="text-white" />
          </div>
          <div>
            <Text variant="subtitle">Lician AI</Text>
            <Text variant="caption" className="text-[10px]">
              Financial Analyst
            </Text>
          </div>
        </div>
        <LiveBadge color="green" size="sm">
          Online
        </LiveBadge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Welcome message */}
        {chatMessages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <div className="size-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#479ffa]/20 to-[#4ebe96]/20 flex items-center justify-center">
              <SparklesIcon size="xl" className="text-[#479ffa]" />
            </div>
            <Text variant="title" className="mb-2">
              Welcome to Lician AI
            </Text>
            <Text variant="caption" className="max-w-sm mx-auto mb-6">
              {welcomeMessage}
            </Text>
            <SuggestedPrompts onSelect={handleSuggestionSelect} />
          </motion.div>
        )}

        {/* Messages list */}
        <AnimatePresence mode="popLayout">
          {chatMessages.map((message, i) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLast={i === chatMessages.length - 1}
            />
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-white/[0.08]">
        <div
          className={cn(
            'flex items-center gap-2',
            'bg-white/[0.03] border border-white/[0.08] rounded-xl',
            'focus-within:border-[#479ffa]/50 focus-within:bg-white/[0.05]',
            'transition-colors'
          )}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className={cn(
              'flex-1 px-4 py-3 bg-transparent',
              'text-[13px] text-white placeholder:text-[#555]',
              'outline-none'
            )}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className={cn(
              'mr-2 p-2 rounded-lg',
              'bg-[#479ffa] text-white',
              'hover:bg-[#479ffa]/80',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors'
            )}
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}

// =============================================================================
// MINI CHAT WIDGET (for embedding in cards)
// =============================================================================

export interface MiniChatWidgetProps {
  className?: string
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>
}

export function MiniChatWidget({ className, messages = [] }: MiniChatWidgetProps) {
  return (
    <div
      className={cn(
        'bg-[#0a0a0a] rounded-xl border border-white/[0.08] overflow-hidden',
        className
      )}
    >
      {/* Mini header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.08]">
        <LiveBadge color="green" size="xs">
          AI
        </LiveBadge>
        <Text variant="caption" className="text-[10px]">
          Lician AI
        </Text>
      </div>

      {/* Messages */}
      <div className="p-3 space-y-2 max-h-[200px] overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(msg.role === 'user' && 'flex justify-end')}
          >
            {msg.role === 'user' ? (
              <div className="bg-[#479ffa]/20 rounded-lg px-3 py-1.5 max-w-[85%]">
                <p className="text-[11px] text-[#479ffa]">{msg.content}</p>
              </div>
            ) : (
              <div className="space-y-1">
                {msg.content.split('\n').map((line, j) => (
                  <p key={j} className="text-[11px] text-[#ccc] leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mini input */}
      <div className="p-2 border-t border-white/[0.08]">
        <div className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-3 py-1.5">
          <input
            type="text"
            placeholder="Ask anything..."
            className="flex-1 bg-transparent text-[11px] text-white placeholder:text-[#555] outline-none"
          />
          <button className="text-[#479ffa] hover:text-[#479ffa]/80 transition-colors">
            <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
