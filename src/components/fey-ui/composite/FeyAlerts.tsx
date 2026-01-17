'use client'

import { memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Text } from '../base/Text'
import { Badge, PriceBadge, AvatarBadge, LiveBadge } from '../base/Badge'
import { Button } from '../base/Button'
import { Card, CardHeader, CardContent } from '../base/Card'
import { transitions } from '../animations'
import { formatLargeNumber } from '@/lib/formatNumber'
import { CheckIcon, XIcon } from '../base/Icons'

// =============================================================================
// PRICE ALERT NOTIFICATION
// =============================================================================

export interface PriceAlertProps {
  symbol: string
  name?: string
  currentPrice: number
  targetPrice: number
  type: 'above' | 'below'
  triggered?: boolean
  triggeredAt?: string
  className?: string
  onDismiss?: () => void
  onViewStock?: () => void
}

export const FeyPriceAlert = memo(function FeyPriceAlert({
  symbol,
  name,
  currentPrice,
  targetPrice,
  type,
  triggered = false,
  triggeredAt,
  className,
  onDismiss,
  onViewStock,
}: PriceAlertProps) {
  const isTriggered = triggered || (type === 'above' ? currentPrice >= targetPrice : currentPrice <= targetPrice)
  const percentFromTarget = ((currentPrice - targetPrice) / targetPrice) * 100

  return (
    <motion.div
      className={cn(
        'flex items-center gap-3 p-4 rounded-xl',
        'border',
        isTriggered
          ? 'bg-[#4ebe96]/10 border-[#4ebe96]/30'
          : 'bg-[#1a1a1a] border-white/[0.08]',
        className
      )}
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={transitions.smooth}
    >
      {/* Icon */}
      <div className={cn(
        'size-10 rounded-xl flex items-center justify-center',
        isTriggered ? 'bg-[#4ebe96]/20' : 'bg-white/[0.05]'
      )}>
        <svg
          className={cn('size-5', isTriggered ? 'text-[#4ebe96]' : 'text-[#555]')}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          {isTriggered && <circle cx="18" cy="5" r="3" fill="#4ebe96" stroke="none" />}
        </svg>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Text variant="subtitle" className="font-semibold">{symbol}</Text>
          {isTriggered && <LiveBadge color="green" size="xs">Triggered</LiveBadge>}
        </div>
        <Text variant="caption" className="text-[11px] mt-0.5">
          {isTriggered ? (
            <>Price {type === 'above' ? 'reached' : 'dropped to'} ${targetPrice.toFixed(2)}</>
          ) : (
            <>Alert when price goes {type} ${targetPrice.toFixed(2)}</>
          )}
        </Text>
        {triggeredAt && (
          <Text variant="caption" className="text-[10px] text-[#555] mt-0.5">{triggeredAt}</Text>
        )}
      </div>

      {/* Current Price */}
      <div className="text-right">
        <Text variant="body" className="font-semibold font-mono">
          ${currentPrice.toFixed(2)}
        </Text>
        <Text variant="caption" className={cn(
          'text-[11px]',
          percentFromTarget >= 0 ? 'text-[#4ebe96]' : 'text-[#e15241]'
        )}>
          {percentFromTarget >= 0 ? '+' : ''}{percentFromTarget.toFixed(2)}% from target
        </Text>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-2">
        {onViewStock && (
          <button
            onClick={onViewStock}
            className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors"
          >
            <svg className="size-4 text-[#479ffa]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors"
          >
            <svg className="size-4 text-[#555] hover:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  )
})

// =============================================================================
// EARNINGS REPORT CARD
// =============================================================================

export interface EarningsReportProps {
  symbol: string
  name?: string
  quarter: string
  date: string
  estimatedEPS: number
  actualEPS?: number
  estimatedRevenue?: number
  actualRevenue?: number
  guidance?: 'raised' | 'maintained' | 'lowered'
  className?: string
  onViewDetails?: () => void
}

export const FeyEarningsCard = memo(function FeyEarningsCard({
  symbol,
  name,
  quarter,
  date,
  estimatedEPS,
  actualEPS,
  estimatedRevenue,
  actualRevenue,
  guidance,
  className,
  onViewDetails,
}: EarningsReportProps) {
  const hasResults = actualEPS !== undefined
  const epsBeat = hasResults && actualEPS > estimatedEPS
  const epsSurprise = hasResults ? ((actualEPS - estimatedEPS) / Math.abs(estimatedEPS)) * 100 : 0
  const revenueBeat = actualRevenue && estimatedRevenue && actualRevenue > estimatedRevenue

  return (
    <motion.div
      className={cn(
        'rounded-xl overflow-hidden',
        'bg-[#1a1a1a] border border-white/[0.08]',
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitions.smooth}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <AvatarBadge name={symbol} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <Text variant="subtitle" className="font-bold">{symbol}</Text>
              {hasResults ? (
                <Badge variant={epsBeat ? 'success' : 'error'}>
                  {epsBeat ? 'Beat' : 'Missed'}
                </Badge>
              ) : (
                <Badge variant="info">Upcoming</Badge>
              )}
            </div>
            <Text variant="caption" className="text-[11px]">
              {quarter} Earnings • {date}
            </Text>
          </div>
        </div>

        {guidance && (
          <Badge variant={guidance === 'raised' ? 'success' : guidance === 'lowered' ? 'error' : 'default'}>
            Guidance {guidance.charAt(0).toUpperCase() + guidance.slice(1)}
          </Badge>
        )}
      </div>

      {/* Metrics */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {/* EPS */}
        <div className="space-y-3">
          <Text variant="caption" className="text-[10px] text-[#555]">EARNINGS PER SHARE</Text>
          <div className="flex items-end justify-between">
            <div>
              <Text variant="caption" className="text-[10px] text-[#555]">Estimated</Text>
              <Text variant="body" className="font-mono text-[14px]">${estimatedEPS.toFixed(2)}</Text>
            </div>
            <div className="text-right">
              <Text variant="caption" className="text-[10px] text-[#555]">Actual</Text>
              {hasResults ? (
                <div className="flex items-center gap-2">
                  <Text variant="body" className="font-mono font-semibold text-[14px]">
                    ${actualEPS.toFixed(2)}
                  </Text>
                  <PriceBadge value={epsSurprise} size="xs" />
                </div>
              ) : (
                <Text variant="body" className="text-[#555] text-[14px]">--</Text>
              )}
            </div>
          </div>
          {/* Progress Bar */}
          {hasResults && (
            <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  'h-full rounded-full',
                  epsBeat ? 'bg-[#4ebe96]' : 'bg-[#e15241]'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (actualEPS / estimatedEPS) * 100)}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
          )}
        </div>

        {/* Revenue */}
        <div className="space-y-3">
          <Text variant="caption" className="text-[10px] text-[#555]">REVENUE</Text>
          <div className="flex items-end justify-between">
            <div>
              <Text variant="caption" className="text-[10px] text-[#555]">Estimated</Text>
              <Text variant="body" className="text-[14px]">
                {estimatedRevenue ? formatLargeNumber(estimatedRevenue) : '--'}
              </Text>
            </div>
            <div className="text-right">
              <Text variant="caption" className="text-[10px] text-[#555]">Actual</Text>
              {actualRevenue ? (
                <div className="flex items-center gap-2">
                  <Text variant="body" className="font-semibold text-[14px]">
                    {formatLargeNumber(actualRevenue)}
                  </Text>
                  {revenueBeat !== undefined && (
                    revenueBeat
                      ? <CheckIcon size="xs" className="text-[#4ebe96]" />
                      : <XIcon size="xs" className="text-[#e15241]" />
                  )}
                </div>
              ) : (
                <Text variant="body" className="text-[#555] text-[14px]">--</Text>
              )}
            </div>
          </div>
          {/* Progress Bar */}
          {actualRevenue && estimatedRevenue && (
            <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  'h-full rounded-full',
                  revenueBeat ? 'bg-[#4ebe96]' : 'bg-[#e15241]'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (actualRevenue / estimatedRevenue) * 100)}%` }}
                transition={{ duration: 0.5, delay: 0.3 }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {onViewDetails && (
        <div className="px-4 pb-4">
          <button
            onClick={onViewDetails}
            className={cn(
              'w-full py-2.5 rounded-lg',
              'bg-white/[0.03] border border-white/[0.08]',
              'text-[12px] text-[#868f97] font-medium',
              'hover:bg-white/[0.05] hover:text-white transition-colors'
            )}
          >
            View Full Report →
          </button>
        </div>
      )}
    </motion.div>
  )
})

// =============================================================================
// ALERT LIST
// =============================================================================

interface AlertItem {
  id: string
  symbol: string
  name?: string
  currentPrice: number
  targetPrice: number
  type: 'above' | 'below'
  triggered?: boolean
  triggeredAt?: string
}

interface FeyAlertListProps {
  alerts: AlertItem[]
  className?: string
  onDismiss?: (id: string) => void
  onViewStock?: (symbol: string) => void
}

export const FeyAlertList = memo(function FeyAlertList({
  alerts,
  className,
  onDismiss,
  onViewStock,
}: FeyAlertListProps) {
  const triggeredAlerts = alerts.filter(a => a.triggered)
  const pendingAlerts = alerts.filter(a => !a.triggered)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Triggered Alerts */}
      {triggeredAlerts.length > 0 && (
        <div className="space-y-2">
          <Text variant="label" className="text-[10px] text-[#4ebe96]">
            TRIGGERED ({triggeredAlerts.length})
          </Text>
          <AnimatePresence>
            {triggeredAlerts.map((alert) => (
              <FeyPriceAlert
                key={alert.id}
                {...alert}
                onDismiss={() => onDismiss?.(alert.id)}
                onViewStock={() => onViewStock?.(alert.symbol)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pending Alerts */}
      {pendingAlerts.length > 0 && (
        <div className="space-y-2">
          <Text variant="label" className="text-[10px] text-[#555]">
            WATCHING ({pendingAlerts.length})
          </Text>
          <AnimatePresence>
            {pendingAlerts.map((alert) => (
              <FeyPriceAlert
                key={alert.id}
                {...alert}
                onDismiss={() => onDismiss?.(alert.id)}
                onViewStock={() => onViewStock?.(alert.symbol)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {alerts.length === 0 && (
        <div className="p-8 text-center bg-[#1a1a1a] rounded-xl border border-white/[0.08]">
          <div className="size-12 mx-auto mb-3 rounded-xl bg-white/[0.05] flex items-center justify-center">
            <svg className="size-6 text-[#555]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <Text variant="body" className="font-medium mb-1">No alerts set</Text>
          <Text variant="caption" className="text-[#555]">
            Add price alerts to get notified when stocks hit your targets
          </Text>
        </div>
      )}
    </div>
  )
})

// =============================================================================
// EXPORTS
// =============================================================================

export type {
  AlertItem,
  FeyAlertListProps,
}
