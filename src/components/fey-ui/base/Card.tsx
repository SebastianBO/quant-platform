'use client'

import { forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { hoverLiftVariants, scaleVariants } from '../animations'

// =============================================================================
// CARD VARIANTS
// =============================================================================

const variants = {
  // Default - Simple elevated card
  default: cn(
    'bg-[#0a0a0a] border border-white/[0.08]',
    'hover:border-white/[0.15]'
  ),

  // Elevated - More prominent card
  elevated: cn(
    'bg-[#141414] border border-white/[0.1]',
    'shadow-[0_8px_30px_rgba(0,0,0,0.6)]',
    'hover:border-white/[0.16]'
  ),

  // Glass - Glassmorphism effect
  glass: cn(
    'bg-[rgba(26,27,32,0.6)] border border-white/[0.08]',
    'backdrop-blur-lg',
    'hover:border-white/[0.12]'
  ),

  // Surface - Subtle gradient surface
  surface: cn(
    'bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent',
    'border border-white/[0.08]',
    'hover:border-white/[0.12]'
  ),

  // Notification - For notification/alert cards
  notification: cn(
    'bg-[#1a1a1a] border border-white/[0.1]',
    'shadow-[0_12px_40px_rgba(0,0,0,0.7)]'
  ),

  // Interactive - Cards that are clickable
  interactive: cn(
    'bg-[#0a0a0a] border border-white/[0.08]',
    'cursor-pointer',
    'hover:border-white/[0.15] hover:bg-[#0d0d0d]'
  ),
}

const sizes = {
  sm: 'p-3 rounded-lg',
  md: 'p-4 rounded-xl',
  lg: 'p-6 rounded-2xl',
  xl: 'p-8 rounded-3xl',
}

// =============================================================================
// CARD COMPONENT
// =============================================================================

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  hover?: boolean
  animate?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  function Card(
    {
      children,
      className,
      variant = 'default',
      size = 'md',
      hover = false,
      animate = false,
      ...props
    },
    ref
  ) {
    const motionProps = hover
      ? {
          variants: hoverLiftVariants,
          initial: 'initial',
          whileHover: 'hover',
          whileTap: 'tap',
        }
      : animate
        ? {
            variants: scaleVariants,
            initial: 'hidden',
            animate: 'visible',
          }
        : {}

    return (
      <motion.div
        ref={ref}
        className={cn(
          'transition-colors duration-[250ms]', // Fey: 0.25s
          variants[variant],
          sizes[size],
          className
        )}
        {...motionProps}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

// =============================================================================
// CARD HEADER
// =============================================================================

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  action?: React.ReactNode
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  function CardHeader(
    { children, className, title, subtitle, action, ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cn('flex items-start justify-between gap-4', className)}
        {...props}
      >
        {(title || subtitle || children) && (
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-[14px] font-medium text-white truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[12px] text-[#868f97] mt-0.5">{subtitle}</p>
            )}
            {children}
          </div>
        )}
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    )
  }
)

// =============================================================================
// CARD CONTENT
// =============================================================================

export const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function CardContent({ children, className, ...props }, ref) {
  return (
    <div ref={ref} className={cn('mt-3', className)} {...props}>
      {children}
    </div>
  )
})

// =============================================================================
// CARD FOOTER
// =============================================================================

export const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function CardFooter({ children, className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        'mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

// =============================================================================
// STACKED CARD GROUP - For Fey-style overlapping cards
// =============================================================================

export interface StackedCardGroupProps {
  children: React.ReactNode
  className?: string
}

export function StackedCardGroup({ children, className }: StackedCardGroupProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
    </div>
  )
}

export interface StackedCardProps extends CardProps {
  index: number
  total: number
  offset?: number
  horizontal?: number
}

export const StackedCard = forwardRef<HTMLDivElement, StackedCardProps>(
  function StackedCard(
    {
      children,
      className,
      index,
      total,
      offset = 50, // Vertical offset between cards
      horizontal = 4, // Horizontal offset per card
      ...props
    },
    ref
  ) {
    const zIndex = total - index
    const top = index * offset
    const marginLeft = index * horizontal

    return (
      <motion.div
        ref={ref}
        className={cn(
          'transition-colors duration-[250ms]', // Fey: 0.25s
          variants.notification,
          sizes.md,
          index > 0 && '-mt-12',
          className
        )}
        style={{
          zIndex,
          marginLeft,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: (total - index) * 0.1,
          ease: [0.22, 1, 0.36, 1],
        }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
