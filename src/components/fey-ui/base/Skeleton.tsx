'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// =============================================================================
// BASE SKELETON
// =============================================================================

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  animate?: boolean
}

export const Skeleton = memo(function Skeleton({
  className,
  width,
  height,
  rounded = 'md',
  animate = true,
}: SkeletonProps) {
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  }

  return (
    <div
      className={cn(
        'bg-white/[0.05]',
        roundedClasses[rounded],
        animate && 'animate-pulse',
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  )
})

// =============================================================================
// SKELETON TEXT
// =============================================================================

interface SkeletonTextProps {
  lines?: number
  className?: string
  lastLineWidth?: string
}

export const SkeletonText = memo(function SkeletonText({
  lines = 3,
  className,
  lastLineWidth = '60%',
}: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={12}
          width={i === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </div>
  )
})

// =============================================================================
// SKELETON CARD
// =============================================================================

interface SkeletonCardProps {
  className?: string
  showHeader?: boolean
  showImage?: boolean
  imageHeight?: number
  lines?: number
}

export const SkeletonCard = memo(function SkeletonCard({
  className,
  showHeader = true,
  showImage = false,
  imageHeight = 120,
  lines = 3,
}: SkeletonCardProps) {
  return (
    <div className={cn(
      'rounded-xl bg-[#1a1a1a] border border-white/[0.08] overflow-hidden',
      className
    )}>
      {showImage && (
        <Skeleton height={imageHeight} rounded="none" className="w-full" />
      )}
      <div className="p-4 space-y-3">
        {showHeader && (
          <div className="flex items-center gap-3">
            <Skeleton width={40} height={40} rounded="full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton height={14} className="w-32" />
              <Skeleton height={10} className="w-20" />
            </div>
          </div>
        )}
        <SkeletonText lines={lines} />
      </div>
    </div>
  )
})

// =============================================================================
// SKELETON STOCK ROW
// =============================================================================

export const SkeletonStockRow = memo(function SkeletonStockRow({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 p-3', className)}>
      <Skeleton width={40} height={40} rounded="lg" />
      <div className="flex-1 space-y-1.5">
        <Skeleton height={14} className="w-16" />
        <Skeleton height={10} className="w-24" />
      </div>
      <div className="text-right space-y-1.5">
        <Skeleton height={14} className="w-16 ml-auto" />
        <Skeleton height={12} className="w-12 ml-auto" />
      </div>
    </div>
  )
})

// =============================================================================
// SKELETON CHART
// =============================================================================

interface SkeletonChartProps {
  className?: string
  height?: number
  showHeader?: boolean
}

export const SkeletonChart = memo(function SkeletonChart({
  className,
  height = 200,
  showHeader = true,
}: SkeletonChartProps) {
  return (
    <div className={cn(
      'rounded-xl bg-[#1a1a1a] border border-white/[0.08] overflow-hidden',
      className
    )}>
      {showHeader && (
        <div className="p-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton height={18} className="w-20" />
              <Skeleton height={12} className="w-32" />
            </div>
            <Skeleton height={24} className="w-20" rounded="lg" />
          </div>
        </div>
      )}
      <div className="p-4" style={{ height }}>
        <div className="h-full flex items-end gap-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-white/[0.05] rounded-t"
              initial={{ height: '20%' }}
              animate={{ height: `${20 + Math.random() * 60}%` }}
              transition={{ duration: 0.5, delay: i * 0.02, repeat: Infinity, repeatType: 'reverse' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
})

// =============================================================================
// SKELETON TABLE
// =============================================================================

interface SkeletonTableProps {
  className?: string
  rows?: number
  columns?: number
  showHeader?: boolean
}

export const SkeletonTable = memo(function SkeletonTable({
  className,
  rows = 5,
  columns = 5,
  showHeader = true,
}: SkeletonTableProps) {
  return (
    <div className={cn(
      'rounded-xl bg-[#1a1a1a] border border-white/[0.08] overflow-hidden',
      className
    )}>
      {showHeader && (
        <div className="p-4 border-b border-white/[0.06]">
          <Skeleton height={16} className="w-32" />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0f0f0f]">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="p-3">
                  <Skeleton height={10} className="w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-white/[0.04]">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="p-3">
                    <Skeleton height={14} className={colIndex === 0 ? 'w-24' : 'w-16'} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
})

// =============================================================================
// SKELETON PORTFOLIO
// =============================================================================

export const SkeletonPortfolioSummary = memo(function SkeletonPortfolioSummary({ className }: { className?: string }) {
  return (
    <div className={cn(
      'p-5 rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/[0.08]',
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton height={10} className="w-24" />
        <Skeleton height={16} className="w-12" rounded="full" />
      </div>
      <Skeleton height={32} className="w-48 mb-3" />
      <div className="flex items-center gap-4">
        <div className="space-y-1">
          <Skeleton height={10} className="w-20" />
          <Skeleton height={16} className="w-24" />
        </div>
        <div className="w-px h-8 bg-white/[0.08]" />
        <div className="space-y-1">
          <Skeleton height={10} className="w-16" />
          <Skeleton height={16} className="w-20" />
        </div>
      </div>
    </div>
  )
})

// =============================================================================
// SKELETON NOTIFICATION
// =============================================================================

export const SkeletonNotification = memo(function SkeletonNotification({ className }: { className?: string }) {
  return (
    <div className={cn(
      'flex items-center gap-3 p-4 rounded-xl bg-[#1a1a1a] border border-white/[0.08]',
      className
    )}>
      <Skeleton width={40} height={40} rounded="xl" />
      <div className="flex-1 space-y-1.5">
        <Skeleton height={14} className="w-32" />
        <Skeleton height={10} className="w-48" />
      </div>
      <Skeleton height={24} className="w-16" rounded="lg" />
    </div>
  )
})

// =============================================================================
// SHIMMER EFFECT (alternative animation)
// =============================================================================

interface ShimmerProps {
  className?: string
  width?: string | number
  height?: string | number
}

export const Shimmer = memo(function Shimmer({ className, width, height }: ShimmerProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-white/[0.05]',
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.1] to-transparent"
        animate={{ translateX: ['−100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
})

// =============================================================================
// EXPORTS
// =============================================================================

export type {
  SkeletonProps,
  SkeletonTextProps,
  SkeletonCardProps,
  SkeletonChartProps,
  SkeletonTableProps,
  ShimmerProps,
}
