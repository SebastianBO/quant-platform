'use client'

import { memo, useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Text } from '../base/Text'
import { Badge, PriceBadge, AvatarBadge, LiveBadge } from '../base/Badge'
import { transitions } from '../animations'
import { formatLargeNumber } from '@/lib/formatNumber'

// =============================================================================
// TYPES
// =============================================================================

export interface Column<T> {
  key: keyof T | string
  label: string
  width?: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  render?: (value: unknown, row: T, index: number) => React.ReactNode
}

interface FeyDataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  className?: string
  title?: string
  subtitle?: string
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (row: T, index: number) => void
  stickyHeader?: boolean
  maxHeight?: number
}

// =============================================================================
// DATA TABLE
// =============================================================================

export const FeyDataTable = memo(function FeyDataTable<T extends object>({
  columns,
  data,
  className,
  title,
  subtitle,
  loading,
  emptyMessage = 'No data available',
  onRowClick,
  stickyHeader = false,
  maxHeight,
}: FeyDataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const sortedData = useMemo(() => {
    if (!sortKey) return data

    return [...data].sort((a, b) => {
      const aVal = a[sortKey as keyof T]
      const bVal = b[sortKey as keyof T]

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }

      const aStr = String(aVal)
      const bStr = String(bVal)
      return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
    })
  }, [data, sortKey, sortDirection])

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const getValue = (row: T, key: string): unknown => {
    if (key.includes('.')) {
      const parts = key.split('.')
      let value: unknown = row
      for (const part of parts) {
        value = (value as Record<string, unknown>)?.[part]
      }
      return value
    }
    return row[key as keyof T]
  }

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
      {(title || subtitle) && (
        <div className="p-4 border-b border-white/[0.06]">
          {title && <Text variant="subtitle" className="font-semibold">{title}</Text>}
          {subtitle && <Text variant="caption" className="text-[#555] mt-0.5">{subtitle}</Text>}
        </div>
      )}

      {/* Table */}
      <div
        className={cn('overflow-x-auto', stickyHeader && 'overflow-y-auto')}
        style={maxHeight ? { maxHeight } : undefined}
      >
        <table className="w-full">
          <thead className={cn(stickyHeader && 'sticky top-0 z-10')}>
            <tr className="bg-[#0f0f0f]">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn(
                    'p-3 text-[10px] font-medium text-[#555] uppercase tracking-wider',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.sortable && 'cursor-pointer hover:text-white transition-colors'
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      <svg
                        className={cn('size-3 transition-transform', sortDirection === 'desc' && 'rotate-180')}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 15l-6-6-6 6" />
                      </svg>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Skeleton rows
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-white/[0.04]">
                  {columns.map((col) => (
                    <td key={String(col.key)} className="p-3">
                      <div className="h-4 bg-white/[0.05] rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center">
                  <Text variant="caption" className="text-[#555]">{emptyMessage}</Text>
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIndex) => (
                <motion.tr
                  key={rowIndex}
                  className={cn(
                    'border-b border-white/[0.04] last:border-0',
                    'hover:bg-white/[0.02] transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: rowIndex * 0.02 }}
                  onClick={() => onRowClick?.(row, rowIndex)}
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={cn(
                        'p-3 text-[12px]',
                        col.align === 'right' && 'text-right',
                        col.align === 'center' && 'text-center'
                      )}
                    >
                      {col.render
                        ? col.render(getValue(row, String(col.key)), row, rowIndex)
                        : String(getValue(row, String(col.key)) ?? '-')}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}) as <T extends object>(props: FeyDataTableProps<T>) => React.ReactElement

// =============================================================================
// EARNINGS TABLE
// =============================================================================

export interface EarningsRow {
  symbol: string
  name: string
  date: string
  time: 'BMO' | 'AMC' | 'TBD'
  estimatedEPS?: number
  actualEPS?: number
  surprise?: number
  surprisePercent?: number
}

interface FeyEarningsTableProps {
  earnings: EarningsRow[]
  className?: string
  title?: string
  loading?: boolean
}

export const FeyEarningsTable = memo(function FeyEarningsTable({
  earnings,
  className,
  title = 'Upcoming Earnings',
  loading,
}: FeyEarningsTableProps) {
  const columns: Column<EarningsRow>[] = [
    {
      key: 'symbol',
      label: 'Company',
      render: (_, row) => (
        <Link href={`/stock/${row.symbol}`} className="flex items-center gap-2 hover:text-[#479ffa]">
          <AvatarBadge name={row.symbol} size="sm" />
          <div>
            <Text variant="body" className="font-semibold text-[12px]">{row.symbol}</Text>
            <Text variant="caption" className="text-[10px]">{row.name}</Text>
          </div>
        </Link>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (value) => (
        <Text variant="body" className="text-[12px]">{String(value)}</Text>
      ),
    },
    {
      key: 'time',
      label: 'Time',
      align: 'center',
      render: (value) => (
        <Badge variant={value === 'BMO' ? 'info' : value === 'AMC' ? 'warning' : 'default'}>
          {String(value)}
        </Badge>
      ),
    },
    {
      key: 'estimatedEPS',
      label: 'Est. EPS',
      align: 'right',
      render: (value) => (
        <Text variant="body" className="font-mono text-[12px]">
          {value ? `$${Number(value).toFixed(2)}` : '-'}
        </Text>
      ),
    },
    {
      key: 'actualEPS',
      label: 'Actual EPS',
      align: 'right',
      render: (value) => (
        <Text variant="body" className="font-mono text-[12px]">
          {value ? `$${Number(value).toFixed(2)}` : '-'}
        </Text>
      ),
    },
    {
      key: 'surprisePercent',
      label: 'Surprise',
      align: 'right',
      render: (value) => {
        if (value === undefined) return '-'
        const num = Number(value)
        return <PriceBadge value={num} size="xs" />
      },
    },
  ]

  return (
    <FeyDataTable
      columns={columns}
      data={earnings}
      className={className}
      title={title}
      loading={loading}
      emptyMessage="No upcoming earnings"
    />
  )
})

// =============================================================================
// SEC FILINGS TABLE
// =============================================================================

export interface FilingRow {
  symbol: string
  type: string
  title: string
  date: string
  url?: string
}

interface FeyFilingsTableProps {
  filings: FilingRow[]
  className?: string
  title?: string
  loading?: boolean
}

export const FeyFilingsTable = memo(function FeyFilingsTable({
  filings,
  className,
  title = 'Recent SEC Filings',
  loading,
}: FeyFilingsTableProps) {
  const columns: Column<FilingRow>[] = [
    {
      key: 'symbol',
      label: 'Symbol',
      width: '80px',
      render: (value) => (
        <Link href={`/stock/${value}`} className="text-[#479ffa] hover:underline font-semibold text-[12px]">
          {String(value)}
        </Link>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      width: '80px',
      render: (value) => {
        const type = String(value)
        const variant = type.includes('10-K') ? 'success' : type.includes('10-Q') ? 'info' : type.includes('8-K') ? 'warning' : 'default'
        return <Badge variant={variant}>{type}</Badge>
      },
    },
    {
      key: 'title',
      label: 'Description',
      render: (value, row) => (
        row.url ? (
          <a
            href={row.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] hover:text-[#479ffa] transition-colors"
          >
            {String(value)}
          </a>
        ) : (
          <Text variant="body" className="text-[12px]">{String(value)}</Text>
        )
      ),
    },
    {
      key: 'date',
      label: 'Filed',
      width: '100px',
      align: 'right',
      render: (value) => (
        <Text variant="caption" className="text-[11px] text-[#555]">{String(value)}</Text>
      ),
    },
  ]

  return (
    <FeyDataTable
      columns={columns}
      data={filings}
      className={className}
      title={title}
      loading={loading}
      emptyMessage="No filings found"
    />
  )
})

// =============================================================================
// INSIDER TRADES TABLE
// =============================================================================

export interface InsiderTradeRow {
  name: string
  title: string
  symbol: string
  date: string
  type: 'Buy' | 'Sell'
  shares: number
  price: number
  value: number
}

interface FeyInsiderTradesTableProps {
  trades: InsiderTradeRow[]
  className?: string
  title?: string
  loading?: boolean
}

export const FeyInsiderTradesTable = memo(function FeyInsiderTradesTable({
  trades,
  className,
  title = 'Insider Transactions',
  loading,
}: FeyInsiderTradesTableProps) {
  const columns: Column<InsiderTradeRow>[] = [
    {
      key: 'name',
      label: 'Insider',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <AvatarBadge name={row.name} size="sm" />
          <div>
            <Text variant="body" className="font-medium text-[12px]">{row.name}</Text>
            <Text variant="caption" className="text-[10px]">{row.title}</Text>
          </div>
        </div>
      ),
    },
    {
      key: 'symbol',
      label: 'Symbol',
      width: '80px',
      render: (value) => (
        <Link href={`/stock/${value}`} className="text-[#479ffa] hover:underline font-semibold text-[12px]">
          {String(value)}
        </Link>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      width: '60px',
      align: 'center',
      render: (value) => (
        <Badge variant={value === 'Buy' ? 'solidSuccess' : 'solidError'}>
          {String(value)}
        </Badge>
      ),
    },
    {
      key: 'shares',
      label: 'Shares',
      align: 'right',
      render: (value) => (
        <Text variant="body" className="font-mono text-[12px]">
          {Number(value).toLocaleString()}
        </Text>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      align: 'right',
      render: (value) => (
        <Text variant="body" className="font-mono text-[12px]">
          ${Number(value).toFixed(2)}
        </Text>
      ),
    },
    {
      key: 'value',
      label: 'Value',
      align: 'right',
      render: (value) => (
        <Text variant="body" className="font-semibold text-[12px]">
          {formatLargeNumber(Number(value))}
        </Text>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      width: '90px',
      align: 'right',
      render: (value) => (
        <Text variant="caption" className="text-[11px] text-[#555]">{String(value)}</Text>
      ),
    },
  ]

  return (
    <FeyDataTable
      columns={columns}
      data={trades}
      className={className}
      title={title}
      loading={loading}
      emptyMessage="No insider trades found"
    />
  )
})

// Types are exported at their declaration points above
