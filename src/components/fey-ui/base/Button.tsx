'use client'

import { forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { buttonVariants as motionVariants } from '../animations'

// =============================================================================
// BUTTON VARIANTS
// =============================================================================

const variants = {
  // Primary - Light button with glow
  primary: cn(
    'bg-[#e6e6e6] text-black font-semibold',
    'shadow-[rgba(255,255,255,0.25)_0px_0px_14px_0px]',
    'hover:bg-white hover:shadow-[rgba(255,255,255,0.35)_0px_0px_20px_0px]'
  ),

  // Secondary - Outline/ghost
  secondary: cn(
    'bg-transparent text-white font-medium',
    'border border-white/20',
    'hover:border-white/40 hover:bg-white/[0.05]'
  ),

  // Ghost - Subtle background
  ghost: cn(
    'bg-white/[0.05] text-[#868f97] font-medium',
    'shadow-[rgba(0,0,0,0.85)_0px_1px_0px_0px]',
    'hover:bg-white/[0.1] hover:text-white'
  ),

  // Icon - Circular button
  icon: cn(
    'bg-white/[0.08] text-[#868f97]',
    'hover:bg-white/[0.15] hover:text-white'
  ),

  // Accent - Colored variants
  accent: cn(
    'bg-gradient-to-r from-[#479ffa] to-[#479ffa]/80 text-white font-semibold',
    'shadow-[0_0_20px_rgba(71,159,250,0.3)]',
    'hover:shadow-[0_0_30px_rgba(71,159,250,0.5)]'
  ),
}

const sizes = {
  sm: 'px-3 py-1.5 text-[12px] rounded-md',
  md: 'px-5 py-2.5 text-[14px] rounded-full',
  // Fey: 14px 46px 15px (pt-[14px] pb-[15px] px-[46px]), 18px font, 99px radius
  lg: 'px-[46px] pt-[14px] pb-[15px] text-[18px] rounded-[99px]',
  icon: 'p-2.5 rounded-full',
  iconLg: 'p-3 rounded-full',
}

// =============================================================================
// BUTTON COMPONENT
// =============================================================================

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      icon,
      iconPosition = 'left',
      ...props
    },
    ref
  ) {
    const isIconOnly = variant === 'icon' && !children

    return (
      <motion.button
        ref={ref}
        className={cn(
          // Base styles
          'relative inline-flex items-center justify-center gap-2',
          'transition-colors duration-100', // Fey: 0.1s for quick interactions
          'outline-none focus-visible:ring-2 focus-visible:ring-[#479ffa] focus-visible:ring-offset-2 focus-visible:ring-offset-black',
          'disabled:opacity-50 disabled:pointer-events-none',
          // Variant styles
          variants[variant],
          // Size styles
          isIconOnly ? (size === 'lg' ? sizes.iconLg : sizes.icon) : sizes[size],
          className
        )}
        disabled={disabled || loading}
        variants={motionVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        {...props}
      >
        {loading ? (
          <motion.div
            className="size-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <span className="flex-shrink-0">{icon}</span>
            )}
            {children}
            {icon && iconPosition === 'right' && (
              <span className="flex-shrink-0">{icon}</span>
            )}
          </>
        )}
      </motion.button>
    )
  }
)

// =============================================================================
// ICON BUTTON - Specialized for icon-only buttons
// =============================================================================

export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'icon'> {
  icon: React.ReactNode
  'aria-label': string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ icon, size = 'icon', ...props }, ref) {
    return (
      <Button ref={ref} variant="icon" size={size} {...props}>
        {icon}
      </Button>
    )
  }
)

// =============================================================================
// LINK BUTTON - Styled as button but uses anchor tag
// =============================================================================

export interface LinkButtonProps extends Omit<HTMLMotionProps<'a'>, 'ref'> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
}

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  function LinkButton(
    { children, className, variant = 'secondary', size = 'md', ...props },
    ref
  ) {
    return (
      <motion.a
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center gap-2',
          'transition-colors duration-100 cursor-pointer', // Fey: 0.1s
          'outline-none focus-visible:ring-2 focus-visible:ring-[#479ffa] focus-visible:ring-offset-2 focus-visible:ring-offset-black',
          variants[variant],
          sizes[size],
          className
        )}
        variants={motionVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        {...props}
      >
        {children}
      </motion.a>
    )
  }
)
