'use client'

import { memo, ReactNode } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { formatLargeNumber, formatCompactNumber } from '@/lib/formatNumber'
import { PriceBadge, LiveBadge } from '../base/Badge'
import { CompanyLogo } from '../base/CompanyLogo'
import { Card } from '../base/Card'
import { Text } from '../base/Text'
import { transitions } from '../animations'
import {
  TrendUpIcon,
  ChartBarIcon,
  FileTextIcon,
  UserIcon,
  SearchIcon,
  RocketIcon,
  ClipboardIcon,
  BoltIcon,
  BalanceIcon,
  FireIcon,
  TrendDownIcon,
  AlertTriangleIcon,
} from '../base/Icons'

// =============================================================================
// TYPES
// =============================================================================

export interface ToolResult {
  toolName: string
  args: Record<string, unknown>
  result: unknown
  status: 'pending' | 'success' | 'error'
  error?: string
}

// =============================================================================
// TOOL LOADING INDICATOR
// =============================================================================

const TOOL_LABELS: Record<string, { icon: ReactNode; label: string; color: string }> = {
  getStockQuote: { icon: <TrendUpIcon size="sm" className="text-[#4ebe96]" />, label: 'Fetching quote', color: 'text-[#4ebe96]' },
  getCompanyFundamentals: { icon: <ChartBarIcon size="sm" className="text-[#479ffa]" />, label: 'Analyzing', color: 'text-[#479ffa]' },
  getFinancialStatements: { icon: <FileTextIcon size="sm" className="text-[#f4a623]" />, label: 'Loading financials', color: 'text-[#f4a623]' },
  compareStocks: { icon: <BalanceIcon size="sm" className="text-[#9b59b6]" />, label: 'Comparing', color: 'text-[#9b59b6]' },
  getMarketMovers: { icon: <RocketIcon size="sm" className="text-[#4ebe96]" />, label: 'Market movers', color: 'text-[#4ebe96]' },
  searchStocks: { icon: <SearchIcon size="sm" className="text-[#479ffa]" />, label: 'Searching', color: 'text-[#479ffa]' },
  getInsiderTrades: { icon: <UserIcon size="sm" className="text-[#9b59b6]" />, label: 'Insider activity', color: 'text-[#9b59b6]' },
  getSECFilings: { icon: <ClipboardIcon size="sm" className="text-[#f4a623]" />, label: 'SEC filings', color: 'text-[#f4a623]' },
  default: { icon: <BoltIcon size="sm" className="text-[#479ffa]" />, label: 'Processing', color: 'text-[#479ffa]' },
}

export const FeyToolLoading = memo(function FeyToolLoading({ toolName }: { toolName: string }) {
  const config = TOOL_LABELS[toolName] || TOOL_LABELS.default

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
      <span className={cn('font-medium', config.color)}>{config.label}</span>
      <motion.span
        className="size-1.5 rounded-full bg-[#4ebe96]"
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
    </motion.div>
  )
})

// =============================================================================
// STOCK QUOTE CARD
// =============================================================================

interface FeyStockQuoteProps {
  symbol: string
  name?: string
  price: number
  change: number
  changePercent: number
  marketCap?: number
  volume?: number
}

export const FeyStockQuoteCard = memo(function FeyStockQuoteCard({
  symbol,
  name,
  price,
  change,
  changePercent,
  marketCap,
}: FeyStockQuoteProps) {
  const isPositive = changePercent >= 0

  return (
    <Link href={`/stock/${symbol}`}>
      <motion.div
        className={cn(
          'flex items-center gap-3 p-3',
          'bg-[#1a1a1a] hover:bg-[#222] rounded-xl',
          'border border-white/[0.08] hover:border-white/[0.12]',
          'transition-colors my-2 group'
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transitions.smooth}
        whileHover={{ x: 4 }}
      >
        {/* Company Logo (real logos via Clearbit/EODHD) */}
        <CompanyLogo
          ticker={symbol}
          name={name}
          size="lg"
          bordered
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Text variant="subtitle" className="font-bold">
              {symbol}
            </Text>
            {name && (
              <Text variant="caption" className="truncate">
                {name}
              </Text>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <Text variant="body" className="font-semibold text-white">
              ${price.toFixed(2)}
            </Text>
            <PriceBadge value={changePercent} size="sm" />
          </div>
        </div>

        {/* Market Cap */}
        <div className="text-right">
          {marketCap && (
            <Text variant="caption" className="text-[10px]">
              MCap: {formatLargeNumber(marketCap)}
            </Text>
          )}
          <motion.div
            className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="size-4 text-[#479ffa] ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </motion.div>
        </div>
      </motion.div>
    </Link>
  )
})

// =============================================================================
// FINANCIALS SUMMARY CARD
// =============================================================================

interface FeyFinancialsProps {
  symbol: string
  revenue?: number
  netIncome?: number
  eps?: number
  pe?: number
  debtToEquity?: number
  profitMargin?: number
}

export const FeyFinancialsCard = memo(function FeyFinancialsCard({
  symbol,
  revenue,
  netIncome,
  eps,
  pe,
  debtToEquity,
  profitMargin,
}: FeyFinancialsProps) {
  return (
    <motion.div
      className={cn(
        'p-4 rounded-xl my-3',
        'bg-[#1a1a1a] border border-white/[0.08]'
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitions.smooth}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ChartBarIcon size="sm" className="text-[#479ffa]" />
          <Text variant="subtitle" className="font-semibold">
            {symbol} Financials
          </Text>
        </div>
        <Link
          href={`/stock/${symbol}/financials`}
          className={cn(
            'flex items-center gap-1 px-2.5 py-1',
            'text-[11px] font-medium text-[#479ffa]',
            'bg-[#479ffa]/10 rounded-md',
            'hover:bg-[#479ffa]/20 transition-colors'
          )}
        >
          Full Report
          <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3">
        <MetricItem label="Revenue" value={formatLargeNumber(revenue)} />
        <MetricItem label="Net Income" value={formatLargeNumber(netIncome)} />
        <MetricItem label="EPS" value={eps ? `$${eps.toFixed(2)}` : 'N/A'} />
        <MetricItem label="P/E Ratio" value={pe?.toFixed(2) || 'N/A'} />
        <MetricItem label="D/E Ratio" value={debtToEquity?.toFixed(2) || 'N/A'} />
        <MetricItem
          label="Profit Margin"
          value={profitMargin ? `${(profitMargin * 100).toFixed(1)}%` : 'N/A'}
          highlight={profitMargin !== undefined && profitMargin > 0.15}
        />
      </div>
    </motion.div>
  )
})

function MetricItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="space-y-1">
      <Text variant="caption" className="text-[10px] text-[#555]">
        {label}
      </Text>
      <Text
        variant="body"
        className={cn(
          'font-semibold text-[13px]',
          highlight && 'text-[#4ebe96]'
        )}
      >
        {value}
      </Text>
    </div>
  )
}

// =============================================================================
// MARKET MOVERS CARD
// =============================================================================

interface FeyMarketMoversProps {
  type: 'gainers' | 'losers' | 'active'
  stocks: Array<{
    symbol: string
    name?: string
    price: number
    changePercent: number
  }>
}

const MOVER_CONFIG: Record<string, { icon: ReactNode; label: string; color: string }> = {
  gainers: { icon: <FireIcon size="sm" className="text-[#4ebe96]" />, label: 'Top Gainers', color: '#4ebe96' },
  losers: { icon: <TrendDownIcon size="sm" className="text-[#e15241]" />, label: 'Top Losers', color: '#e15241' },
  active: { icon: <BoltIcon size="sm" className="text-[#479ffa]" />, label: 'Most Active', color: '#479ffa' },
}

export const FeyMarketMoversCard = memo(function FeyMarketMoversCard({
  type,
  stocks,
}: FeyMarketMoversProps) {
  const config = MOVER_CONFIG[type]

  return (
    <motion.div
      className={cn(
        'p-3 rounded-xl my-3',
        'bg-[#1a1a1a] border border-white/[0.08]'
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitions.smooth}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/[0.06]">
        {config.icon}
        <Text variant="subtitle" className="font-semibold">
          {config.label}
        </Text>
        <LiveBadge color={type === 'gainers' ? 'green' : type === 'losers' ? 'red' : 'blue'} size="xs">
          Live
        </LiveBadge>
      </div>

      {/* Stock List */}
      <div className="space-y-1">
        {stocks.slice(0, 5).map((stock, i) => (
          <Link key={stock.symbol} href={`/stock/${stock.symbol}`}>
            <motion.div
              className={cn(
                'flex items-center justify-between p-2 rounded-lg',
                'hover:bg-white/[0.05] transition-colors'
              )}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ x: 4 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#555] w-4">{i + 1}</span>
                <CompanyLogo ticker={stock.symbol} size="sm" />
                <Text variant="body" className="font-medium text-[13px]">
                  {stock.symbol}
                </Text>
              </div>
              <div className="flex items-center gap-3">
                <Text variant="caption" className="font-mono text-[12px]">
                  ${stock.price.toFixed(2)}
                </Text>
                <PriceBadge value={stock.changePercent} size="xs" />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  )
})

// =============================================================================
// STOCK COMPARISON TABLE
// =============================================================================

interface FeyComparisonProps {
  stocks: Array<{
    symbol: string
    name?: string
    price: number
    changePercent: number
    pe?: number
    marketCap?: number
  }>
}

export const FeyComparisonCard = memo(function FeyComparisonCard({
  stocks,
}: FeyComparisonProps) {
  return (
    <motion.div
      className={cn(
        'overflow-hidden rounded-xl my-3',
        'bg-[#1a1a1a] border border-white/[0.08]'
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitions.smooth}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.08]">
        <BalanceIcon size="sm" className="text-[#9b59b6]" />
        <Text variant="subtitle" className="font-semibold">
          Stock Comparison
        </Text>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left p-3 font-medium text-[#868f97]">Stock</th>
              <th className="text-right p-3 font-medium text-[#868f97]">Price</th>
              <th className="text-right p-3 font-medium text-[#868f97]">Change</th>
              <th className="text-right p-3 font-medium text-[#868f97]">P/E</th>
              <th className="text-right p-3 font-medium text-[#868f97]">MCap</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock, i) => (
              <motion.tr
                key={stock.symbol}
                className={cn(
                  'border-b border-white/[0.04] last:border-0',
                  'hover:bg-white/[0.03] transition-colors'
                )}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <td className="p-3">
                  <Link
                    href={`/stock/${stock.symbol}`}
                    className="flex items-center gap-2 hover:text-[#479ffa] transition-colors"
                  >
                    <CompanyLogo ticker={stock.symbol} size="sm" />
                    <span className="font-medium">{stock.symbol}</span>
                  </Link>
                </td>
                <td className="text-right p-3 font-mono text-white">
                  ${stock.price.toFixed(2)}
                </td>
                <td className="text-right p-3">
                  <PriceBadge value={stock.changePercent} size="xs" />
                </td>
                <td className="text-right p-3 text-[#868f97]">
                  {stock.pe?.toFixed(1) || 'N/A'}
                </td>
                <td className="text-right p-3 text-[#868f97]">
                  {formatCompactNumber(stock.marketCap)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
})

// =============================================================================
// SECTOR INFO BADGE
// =============================================================================

interface FeySectorInfoProps {
  symbol: string
  sector?: string
  industry?: string
  employees?: number
}

export const FeySectorInfo = memo(function FeySectorInfo({
  symbol,
  sector,
  industry,
  employees,
}: FeySectorInfoProps) {
  return (
    <motion.div
      className={cn(
        'flex flex-wrap items-center gap-2 p-3 rounded-xl my-2',
        'bg-[#1a1a1a] border border-white/[0.08]'
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitions.smooth}
    >
      {sector && (
        <span className={cn(
          'flex items-center gap-1.5 px-2.5 py-1',
          'bg-[#479ffa]/10 text-[#479ffa] rounded-full text-[11px]'
        )}>
          <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 21h18M9 8h10M9 12h10M9 16h10M5 8h.01M5 12h.01M5 16h.01" />
          </svg>
          {sector}
        </span>
      )}
      {industry && (
        <span className="px-2.5 py-1 bg-white/[0.05] rounded-full text-[11px] text-[#868f97]">
          {industry}
        </span>
      )}
      {employees && (
        <span className="px-2.5 py-1 bg-white/[0.05] rounded-full text-[11px] text-[#868f97]">
          {employees.toLocaleString()} employees
        </span>
      )}
      <Link
        href={`/stock/${symbol}`}
        className={cn(
          'flex items-center gap-1 px-2.5 py-1',
          'bg-[#4ebe96]/10 text-[#4ebe96] rounded-full text-[11px]',
          'hover:bg-[#4ebe96]/20 transition-colors ml-auto'
        )}
      >
        View Profile
        <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
    </motion.div>
  )
})

// =============================================================================
// ERROR STATE
// =============================================================================

export const FeyToolError = memo(function FeyToolError({ message }: { message?: string }) {
  return (
    <motion.div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg my-1',
        'bg-[#e15241]/10 border border-[#e15241]/20'
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <AlertTriangleIcon size="xs" className="text-[#e15241]" />
      <Text variant="caption" className="text-[#e15241] text-[11px]">
        {message || 'Failed to load data'}
      </Text>
    </motion.div>
  )
})

// =============================================================================
// HELPER FUNCTION
// =============================================================================

function extractToolData<T>(result: unknown): T | null {
  if (!result) return null

  const toolResult = result as { success?: boolean; data?: T; error?: string }

  if (toolResult.success === false || toolResult.error) {
    return null
  }

  if (toolResult.data !== undefined) {
    return toolResult.data as T
  }

  return result as T
}

// =============================================================================
// MAIN RENDERER
// =============================================================================

export function renderFeyToolResult(toolResult: ToolResult): React.ReactNode {
  const { toolName, result, status } = toolResult

  if (status === 'pending') {
    return <FeyToolLoading toolName={toolName} />
  }

  if (status === 'error') {
    return <FeyToolError />
  }

  switch (toolName) {
    case 'getStockQuote': {
      const data = extractToolData<{
        symbol: string
        name?: string
        price: number
        change: number
        changePercent: number
        marketCap?: number
        volume?: number
      }>(result)
      if (data?.symbol && data?.price) {
        return <FeyStockQuoteCard {...data} />
      }
      break
    }

    case 'compareStocks': {
      const data = extractToolData<{
        comparison: Array<{
          symbol: string
          name?: string
          price: number
          changePercent: number
          pe?: number
          marketCap?: number
        }>
      }>(result)
      if (data?.comparison?.length) {
        return <FeyComparisonCard stocks={data.comparison} />
      }
      break
    }

    case 'getCompanyFundamentals': {
      const data = extractToolData<{
        symbol: string
        revenue?: number
        netIncome?: number
        eps?: number
        pe?: number
        debtToEquity?: number
        profitMargin?: number
      }>(result)
      if (data?.symbol) {
        return <FeyFinancialsCard {...data} />
      }
      break
    }

    case 'getMarketMovers': {
      const data = extractToolData<{
        type: 'gainers' | 'losers' | 'active'
        movers: Array<{
          symbol: string
          name?: string
          price: number
          changePercent: number
        }>
      }>(result)
      if (data?.movers?.length) {
        return <FeyMarketMoversCard type={data.type || 'gainers'} stocks={data.movers} />
      }
      break
    }

    default:
      return null
  }

  return null
}

// =============================================================================
// EXPORTS
// =============================================================================

export type {
  FeyStockQuoteProps,
  FeyFinancialsProps,
  FeyMarketMoversProps,
  FeyComparisonProps,
  FeySectorInfoProps,
}
