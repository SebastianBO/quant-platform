'use client'

import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { cn } from '@/lib/utils'
import { Text } from '../base/Text'
import { PriceBadge } from '../base/Badge'
import { transitions } from '../animations'

// =============================================================================
// TYPES
// =============================================================================

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

interface BaseChartProps {
  data: ChartDataPoint[]
  className?: string
  height?: number
  showGrid?: boolean
  showAxis?: boolean
  animate?: boolean
}

// =============================================================================
// DESIGN TOKENS
// =============================================================================

const CHART_COLORS = {
  positive: '#4ebe96',
  negative: '#e15241',
  neutral: '#479ffa',
  grid: 'rgba(255, 255, 255, 0.04)',
  axis: '#555',
  tooltip: {
    bg: '#1a1a1a',
    border: 'rgba(255, 255, 255, 0.08)',
  },
}

// =============================================================================
// CUSTOM TOOLTIP
// =============================================================================

interface FeyTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; payload: ChartDataPoint }>
  label?: string
  valuePrefix?: string
  valueSuffix?: string
}

function FeyTooltip({ active, payload, valuePrefix = '$', valueSuffix = '' }: FeyTooltipProps) {
  if (!active || !payload?.length) return null

  const data = payload[0]
  const value = data.value
  const point = data.payload

  return (
    <motion.div
      className={cn(
        'px-3 py-2 rounded-lg',
        'bg-[#1a1a1a] border border-white/[0.08]',
        'shadow-xl'
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.1 }}
    >
      <Text variant="caption" className="text-[10px] text-[#555] mb-1">
        {point.label || point.date}
      </Text>
      <Text variant="body" className="font-semibold text-white">
        {valuePrefix}{typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value}{valueSuffix}
      </Text>
    </motion.div>
  )
}

// =============================================================================
// SPARKLINE - Minimal inline chart
// =============================================================================

interface FeySparklineProps {
  data: number[]
  width?: number
  height?: number
  className?: string
  positive?: boolean
}

export const FeySparkline = memo(function FeySparkline({
  data,
  width = 80,
  height = 24,
  className,
  positive,
}: FeySparklineProps) {
  const chartData = useMemo(() =>
    data.map((value, i) => ({ date: String(i), value })),
    [data]
  )

  const isPositive = positive ?? (data.length > 1 ? data[data.length - 1] >= data[0] : true)
  const color = isPositive ? CHART_COLORS.positive : CHART_COLORS.negative

  return (
    <div className={cn('inline-flex', className)} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
})

// =============================================================================
// MINI AREA CHART - Small chart for cards
// =============================================================================

interface FeyMiniChartProps extends Omit<BaseChartProps, 'showGrid' | 'showAxis'> {
  positive?: boolean
}

export const FeyMiniChart = memo(function FeyMiniChart({
  data,
  className,
  height = 60,
  positive,
  animate = true,
}: FeyMiniChartProps) {
  const isPositive = positive ?? (data.length > 1 ? data[data.length - 1].value >= data[0].value : true)
  const color = isPositive ? CHART_COLORS.positive : CHART_COLORS.negative

  return (
    <motion.div
      className={cn('w-full', className)}
      style={{ height }}
      initial={animate ? { opacity: 0 } : undefined}
      animate={animate ? { opacity: 1 } : undefined}
      transition={transitions.smooth}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`miniGradient-${isPositive}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#miniGradient-${isPositive})`}
            isAnimationActive={animate}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
})

// =============================================================================
// LINE CHART - Full featured
// =============================================================================

interface FeyLineChartProps extends BaseChartProps {
  color?: string
  valuePrefix?: string
  valueSuffix?: string
  referenceLine?: number
}

export const FeyLineChart = memo(function FeyLineChart({
  data,
  className,
  height = 200,
  showGrid = true,
  showAxis = true,
  animate = true,
  color = CHART_COLORS.neutral,
  valuePrefix = '$',
  valueSuffix = '',
  referenceLine,
}: FeyLineChartProps) {
  return (
    <motion.div
      className={cn('w-full', className)}
      style={{ height }}
      initial={animate ? { opacity: 0, y: 10 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={transitions.smooth}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: showAxis ? 40 : 10 }}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={CHART_COLORS.grid}
              vertical={false}
            />
          )}
          {showAxis && (
            <>
              <XAxis
                dataKey="date"
                stroke={CHART_COLORS.axis}
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={CHART_COLORS.axis}
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${valuePrefix}${value}`}
              />
            </>
          )}
          <Tooltip
            content={<FeyTooltip valuePrefix={valuePrefix} valueSuffix={valueSuffix} />}
            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
          />
          {referenceLine !== undefined && (
            <ReferenceLine
              y={referenceLine}
              stroke="rgba(255,255,255,0.2)"
              strokeDasharray="3 3"
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: color, stroke: '#1a1a1a', strokeWidth: 2 }}
            isAnimationActive={animate}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
})

// =============================================================================
// AREA CHART - With gradient fill
// =============================================================================

interface FeyAreaChartProps extends BaseChartProps {
  positive?: boolean
  valuePrefix?: string
  valueSuffix?: string
}

export const FeyAreaChart = memo(function FeyAreaChart({
  data,
  className,
  height = 200,
  showGrid = true,
  showAxis = true,
  animate = true,
  positive,
  valuePrefix = '$',
  valueSuffix = '',
}: FeyAreaChartProps) {
  const isPositive = positive ?? (data.length > 1 ? data[data.length - 1].value >= data[0].value : true)
  const color = isPositive ? CHART_COLORS.positive : CHART_COLORS.negative
  const gradientId = `areaGradient-${isPositive ? 'pos' : 'neg'}`

  return (
    <motion.div
      className={cn('w-full', className)}
      style={{ height }}
      initial={animate ? { opacity: 0, y: 10 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={transitions.smooth}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: showAxis ? 40 : 10 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="50%" stopColor={color} stopOpacity={0.1} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={CHART_COLORS.grid}
              vertical={false}
            />
          )}
          {showAxis && (
            <>
              <XAxis
                dataKey="date"
                stroke={CHART_COLORS.axis}
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={CHART_COLORS.axis}
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${valuePrefix}${value}`}
              />
            </>
          )}
          <Tooltip
            content={<FeyTooltip valuePrefix={valuePrefix} valueSuffix={valueSuffix} />}
            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={animate}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
})

// =============================================================================
// BAR CHART - For comparisons
// =============================================================================

interface BarDataPoint {
  label: string
  value: number
  color?: string
}

interface FeyBarChartProps {
  data: BarDataPoint[]
  className?: string
  height?: number
  showAxis?: boolean
  animate?: boolean
  valuePrefix?: string
  valueSuffix?: string
  horizontal?: boolean
}

export const FeyBarChart = memo(function FeyBarChart({
  data,
  className,
  height = 200,
  showAxis = true,
  animate = true,
  valuePrefix = '',
  valueSuffix = '',
  horizontal = false,
}: FeyBarChartProps) {
  const chartData = useMemo(() =>
    data.map((d) => ({
      ...d,
      fill: d.color || (d.value >= 0 ? CHART_COLORS.positive : CHART_COLORS.negative),
    })),
    [data]
  )

  const Layout = horizontal ? BarChart : BarChart

  return (
    <motion.div
      className={cn('w-full', className)}
      style={{ height }}
      initial={animate ? { opacity: 0, y: 10 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={transitions.smooth}
    >
      <ResponsiveContainer width="100%" height="100%">
        <Layout
          data={chartData}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 10, right: 10, bottom: 10, left: showAxis ? 60 : 10 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={CHART_COLORS.grid}
            horizontal={!horizontal}
            vertical={horizontal}
          />
          {showAxis && (
            horizontal ? (
              <>
                <XAxis type="number" stroke={CHART_COLORS.axis} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="label" stroke={CHART_COLORS.axis} fontSize={10} tickLine={false} axisLine={false} />
              </>
            ) : (
              <>
                <XAxis dataKey="label" stroke={CHART_COLORS.axis} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={CHART_COLORS.axis} fontSize={10} tickLine={false} axisLine={false} />
              </>
            )
          )}
          <Tooltip
            content={<FeyTooltip valuePrefix={valuePrefix} valueSuffix={valueSuffix} />}
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          />
          <Bar
            dataKey="value"
            radius={[4, 4, 0, 0]}
            isAnimationActive={animate}
            animationDuration={800}
          />
        </Layout>
      </ResponsiveContainer>
    </motion.div>
  )
})

// =============================================================================
// STOCK PRICE CHART - Complete chart with header
// =============================================================================

interface FeyStockChartProps {
  symbol: string
  name?: string
  price: number
  change: number
  changePercent: number
  data: ChartDataPoint[]
  className?: string
  timeRange?: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'
  onTimeRangeChange?: (range: string) => void
}

const TIME_RANGES = ['1D', '1W', '1M', '3M', '1Y', 'ALL'] as const

export const FeyStockChart = memo(function FeyStockChart({
  symbol,
  name,
  price,
  change,
  changePercent,
  data,
  className,
  timeRange = '1M',
  onTimeRangeChange,
}: FeyStockChartProps) {
  const isPositive = changePercent >= 0

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
      <div className="p-4 border-b border-white/[0.06]">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Text variant="title" className="font-bold">{symbol}</Text>
              {name && <Text variant="caption" className="text-[#555]">{name}</Text>}
            </div>
            <div className="flex items-center gap-3">
              <Text variant="body" className="text-2xl font-semibold text-white">
                ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <PriceBadge value={changePercent} size="md" />
              <Text variant="caption" className={cn(
                'text-[12px]',
                isPositive ? 'text-[#4ebe96]' : 'text-[#e15241]'
              )}>
                {isPositive ? '+' : ''}{change.toFixed(2)}
              </Text>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-1 bg-white/[0.03] rounded-lg p-1">
            {TIME_RANGES.map((range) => (
              <button
                key={range}
                onClick={() => onTimeRangeChange?.(range)}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors',
                  timeRange === range
                    ? 'bg-white/[0.1] text-white'
                    : 'text-[#555] hover:text-white'
                )}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4">
        <FeyAreaChart
          data={data}
          height={240}
          positive={isPositive}
          showGrid
          showAxis
        />
      </div>
    </motion.div>
  )
})

// Types are exported at their declaration points above
