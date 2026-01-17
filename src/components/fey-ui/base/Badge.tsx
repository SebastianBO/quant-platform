'use client'

import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { livePulseVariants } from '../animations'

// =============================================================================
// BADGE VARIANTS
// =============================================================================

const variants = {
  // Default - Neutral
  default: 'bg-white/[0.08] text-[#868f97]',

  // Success - Green
  success: 'bg-[rgba(78,190,150,0.16)] text-[#4ebe96]',

  // Error - Red
  error: 'bg-[rgba(255,92,92,0.16)] text-[#ff5c5c]',

  // Warning - Orange
  warning: 'bg-[rgba(255,161,108,0.16)] text-[#ffa16c]',

  // Info - Blue
  info: 'bg-[rgba(71,159,250,0.16)] text-[#479ffa]',

  // Solid variants
  solidSuccess: 'bg-emerald-500 text-black font-semibold',
  solidError: 'bg-red-500/80 text-white font-semibold',
  solidInfo: 'bg-[#479ffa] text-white font-semibold',

  // Premium - Gradient
  premium: 'bg-gradient-to-r from-[#ffa16c] to-[#ffa16c]/60 text-black font-semibold',

  // Outline
  outline: 'bg-transparent border border-white/[0.2] text-white/80',
}

const sizes = {
  xs: 'px-1.5 py-0.5 text-[9px] rounded',
  sm: 'px-2 py-0.5 text-[10px] rounded',
  md: 'px-2.5 py-1 text-[11px] rounded-md',
  lg: 'px-3 py-1.5 text-[12px] rounded-lg',
}

// =============================================================================
// BADGE COMPONENT
// =============================================================================

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  function Badge(
    { children, className, variant = 'default', size = 'md', ...props },
    ref
  ) {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

// =============================================================================
// PRICE BADGE - For stock prices with color based on change
// =============================================================================

export interface PriceBadgeProps extends Omit<BadgeProps, 'variant'> {
  value: number
  prefix?: string
  showSign?: boolean
  isPercent?: boolean
}

export const PriceBadge = forwardRef<HTMLSpanElement, PriceBadgeProps>(
  function PriceBadge(
    { value, prefix = '', showSign = true, isPercent = true, className, ...props },
    ref
  ) {
    const isPositive = value >= 0
    const displayValue = `${showSign && isPositive ? '+' : ''}${value.toFixed(2)}${isPercent ? '%' : ''}`

    return (
      <Badge
        ref={ref}
        variant={isPositive ? 'success' : 'error'}
        className={className}
        {...props}
      >
        {prefix}
        {displayValue}
      </Badge>
    )
  }
)

// =============================================================================
// LIVE BADGE - With pulsing indicator
// =============================================================================

export interface LiveBadgeProps extends Omit<BadgeProps, 'variant'> {
  live?: boolean
  color?: 'green' | 'red' | 'blue' | 'orange'
}

const liveColors = {
  green: 'bg-[#4ebe96]',
  red: 'bg-[#ff5c5c]',
  blue: 'bg-[#479ffa]',
  orange: 'bg-[#ffa16c]',
}

export const LiveBadge = forwardRef<HTMLSpanElement, LiveBadgeProps>(
  function LiveBadge(
    { children, live = true, color = 'green', className, size = 'md', ...props },
    ref
  ) {
    return (
      <Badge
        ref={ref}
        variant="default"
        size={size}
        className={cn('gap-1.5', className)}
        {...props}
      >
        <span className="relative flex size-2">
          <span className={cn('absolute size-2 rounded-full', liveColors[color])} />
          {live && (
            <motion.span
              className={cn(
                'absolute size-2 rounded-full',
                liveColors[color],
                'opacity-75'
              )}
              variants={livePulseVariants}
              initial="initial"
              animate="animate"
            />
          )}
        </span>
        {children}
      </Badge>
    )
  }
)

// =============================================================================
// AVATAR BADGE - Circular avatar with initials or image
// =============================================================================

export interface AvatarBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string
  src?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  color?: string
}

const avatarSizes = {
  xs: 'size-4 text-[8px]',
  sm: 'size-5 text-[10px]',
  md: 'size-6 text-[11px]',
  lg: 'size-10 text-[14px]',
}

export const AvatarBadge = forwardRef<HTMLDivElement, AvatarBadgeProps>(
  function AvatarBadge(
    {
      name,
      src,
      size = 'md',
      color,
      className,
      ...props
    },
    ref
  ) {
    const initials = name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

    const bgColor = color || 'bg-gradient-to-br from-gray-600 to-gray-800'

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-full flex items-center justify-center font-bold',
          avatarSizes[size],
          !src && bgColor,
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={name || 'Avatar'}
            className="size-full rounded-full object-cover"
          />
        ) : (
          <span className="text-white">{initials}</span>
        )}
      </div>
    )
  }
)

// =============================================================================
// TICKER BADGE - Stock/crypto ticker
// =============================================================================

export interface TickerBadgeProps extends Omit<BadgeProps, 'variant'> {
  ticker: string
  logo?: React.ReactNode
  logoColor?: string
}

export const TickerBadge = forwardRef<HTMLSpanElement, TickerBadgeProps>(
  function TickerBadge(
    { ticker, logo, logoColor, className, ...props },
    ref
  ) {
    return (
      <Badge
        ref={ref}
        variant="default"
        className={cn('gap-1.5', className)}
        {...props}
      >
        {logo && (
          <span
            className={cn(
              'size-4 rounded-full flex items-center justify-center text-[8px] font-bold',
              logoColor || 'bg-white/20'
            )}
          >
            {logo}
          </span>
        )}
        <span className="font-semibold">{ticker}</span>
      </Badge>
    )
  }
)
