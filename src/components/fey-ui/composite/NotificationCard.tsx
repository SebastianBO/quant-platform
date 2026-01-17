'use client'

import { forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { AvatarBadge, LiveBadge, PriceBadge } from '../base/Badge'
import { transitions } from '../animations'

// =============================================================================
// NOTIFICATION CARD - For stacked notification style like Fey
// =============================================================================

export interface NotificationCardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  index?: number
  total?: number
}

export const NotificationCard = forwardRef<HTMLDivElement, NotificationCardProps>(
  function NotificationCard(
    { children, className, index = 0, total = 1, ...props },
    ref
  ) {
    const zIndex = total - index

    return (
      <motion.div
        ref={ref}
        className={cn(
          'bg-[#1a1a1a] rounded-xl border border-white/[0.1] p-3.5',
          index > 0 && '-mt-12 ml-1',
          className
        )}
        style={{
          zIndex,
          marginLeft: index * 4,
          boxShadow: `0 ${4 + index * 4}px ${20 + index * 10}px rgba(0,0,0,${0.5 + index * 0.1})`,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          ...transitions.slow,
          delay: (total - index - 1) * 0.1,
        }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

// =============================================================================
// BRIEFING CARD - News/Market briefing notification
// =============================================================================

export interface BriefingCardProps extends NotificationCardProps {
  title?: string
  timestamp?: string
  content: string
  readMoreHref?: string
}

export const BriefingCard = forwardRef<HTMLDivElement, BriefingCardProps>(
  function BriefingCard(
    {
      title = 'Briefing',
      timestamp = 'Just now',
      content,
      readMoreHref,
      className,
      ...props
    },
    ref
  ) {
    return (
      <NotificationCard ref={ref} className={className} {...props}>
        <div className="flex items-center gap-2 mb-2">
          <AvatarBadge
            name="Briefing"
            size="sm"
            color="bg-[#479ffa]"
          />
          <span className="text-[13px] font-medium text-white">{title}</span>
          <span className="text-[11px] text-[#555] ml-auto">{timestamp}</span>
        </div>
        <p className="text-[12px] text-[#777] leading-relaxed line-clamp-3">
          {content}
          {readMoreHref && (
            <>
              {' '}
              <a href={readMoreHref} className="text-[#479ffa] hover:underline">
                Read more
              </a>
            </>
          )}
        </p>
      </NotificationCard>
    )
  }
)

// =============================================================================
// STOCK CARD - Stock alert notification
// =============================================================================

export interface StockCardProps extends NotificationCardProps {
  ticker: string
  tickerColor?: string
  price: number
  change: number
  content: string
}

export const StockCard = forwardRef<HTMLDivElement, StockCardProps>(
  function StockCard(
    {
      ticker,
      tickerColor = 'bg-[#76b900]',
      price,
      change,
      content,
      className,
      ...props
    },
    ref
  ) {
    return (
      <NotificationCard ref={ref} className={className} {...props}>
        <div className="flex items-center gap-2 mb-2">
          <AvatarBadge
            name={ticker}
            size="sm"
            color={tickerColor}
          />
          <span className="text-[13px] font-medium text-white">{ticker}</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] text-[#868f97]">
              ${price.toFixed(2)}
            </span>
            <PriceBadge value={change} size="xs" />
          </div>
        </div>
        <p className="text-[12px] text-[#777] leading-relaxed line-clamp-2">
          {content}
        </p>
      </NotificationCard>
    )
  }
)

// =============================================================================
// AI CHAT CARD - AI conversation notification
// =============================================================================

export interface AIChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AIChatCardProps extends NotificationCardProps {
  messages: AIChatMessage[]
  inputPlaceholder?: string
  onSend?: (message: string) => void
}

export const AIChatCard = forwardRef<HTMLDivElement, AIChatCardProps>(
  function AIChatCard(
    {
      messages,
      inputPlaceholder = 'Ask anything...',
      onSend,
      className,
      ...props
    },
    ref
  ) {
    return (
      <NotificationCard ref={ref} className={cn('p-0', className)} {...props}>
        {/* Header */}
        <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-white/[0.08]">
          <LiveBadge color="green" size="xs">
            AI
          </LiveBadge>
        </div>

        {/* Messages */}
        <div className="p-3.5 space-y-2.5">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                msg.role === 'user' && 'flex justify-end'
              )}
            >
              {msg.role === 'user' ? (
                <div className="bg-white/[0.08] rounded-lg px-3 py-2 max-w-[85%]">
                  <p className="text-[12px] text-white">{msg.content}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {msg.content.split('\n').map((line, j) => (
                    <p key={j} className="text-[12px] text-[#ccc] leading-relaxed">
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-2.5 border-t border-white/[0.08]">
          <div className="flex items-center gap-2 bg-white/[0.05] rounded-lg px-3 py-2">
            <input
              type="text"
              placeholder={inputPlaceholder}
              className="flex-1 bg-transparent text-[12px] text-white placeholder:text-[#555] outline-none"
            />
            <button
              type="button"
              className="text-[#479ffa] hover:text-[#479ffa]/80 transition-colors"
              onClick={() => onSend?.('')}
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      </NotificationCard>
    )
  }
)

// =============================================================================
// NOTIFICATION STACK - Container for stacked notifications
// =============================================================================

export interface NotificationStackProps {
  children: React.ReactNode
  className?: string
}

export function NotificationStack({ children, className }: NotificationStackProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
    </div>
  )
}

// =============================================================================
// EARNINGS NOTIFICATION - Earnings call alert
// =============================================================================

export interface EarningsNotificationProps {
  company: string
  logo: React.ReactNode
  logoColor?: string
  status?: 'upcoming' | 'live' | 'ended'
  onJoin?: () => void
  onPressRelease?: () => void
  className?: string
}

export function EarningsNotification({
  company,
  logo,
  logoColor = 'bg-[#f48120]',
  status = 'live',
  onJoin,
  onPressRelease,
  className,
}: EarningsNotificationProps) {
  return (
    <motion.div
      className={cn(
        'inline-flex items-center gap-3 px-4 py-3',
        'bg-[#1a1a1a]/90 backdrop-blur-lg rounded-full',
        'border border-white/[0.08]',
        className
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitions.smooth}
    >
      <div className={cn('size-8 rounded-lg flex items-center justify-center', logoColor)}>
        {logo}
      </div>
      <span className="text-[13px]">
        <span className="font-medium text-white">{company}</span>
        <span className="text-[#868f97]">
          {status === 'live' && ' earnings call just started.'}
          {status === 'upcoming' && ' earnings call starting soon.'}
          {status === 'ended' && ' earnings call has ended.'}
        </span>
        {status === 'live' && <span className="ml-1">🔥</span>}
      </span>

      <div className="flex items-center gap-2 ml-2">
        {onPressRelease && (
          <button
            onClick={onPressRelease}
            className={cn(
              'px-3 py-1.5 text-[11px] font-medium',
              'bg-white/[0.05] text-[#868f97] rounded-md',
              'hover:bg-white/[0.1] hover:text-white transition-colors'
            )}
          >
            Press release
          </button>
        )}
        {onJoin && status === 'live' && (
          <button
            onClick={onJoin}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium',
              'bg-white/[0.08] text-[#868f97] rounded-full',
              'hover:bg-white/[0.12] hover:text-white transition-colors'
            )}
          >
            <svg className="size-3" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16" fill="black" />
            </svg>
            Join live call
          </button>
        )}
      </div>
    </motion.div>
  )
}

// =============================================================================
// INSIDER TRANSACTION ROW
// =============================================================================

export interface InsiderTransactionProps {
  name: string
  company: string
  action: 'Buy' | 'Sell'
  className?: string
}

export function InsiderTransaction({
  name,
  company,
  action,
  className,
}: InsiderTransactionProps) {
  return (
    <motion.div
      className={cn('flex items-center gap-3', className)}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      transition={transitions.quick}
    >
      <AvatarBadge name={name} size="lg" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-white truncate">{name}</p>
        <p className="text-[11px] text-[#868f97] truncate">{company}</p>
      </div>
      <span
        className={cn(
          'px-2.5 py-1 text-[10px] font-semibold rounded-full',
          action === 'Buy'
            ? 'bg-emerald-500 text-black'
            : 'bg-red-500/80 text-white'
        )}
      >
        {action}
      </span>
    </motion.div>
  )
}
