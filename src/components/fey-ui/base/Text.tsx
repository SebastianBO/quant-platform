'use client'

import { forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { textRevealVariants, wordRevealContainerVariants, wordRevealVariants } from '../animations'

// =============================================================================
// TEXT VARIANTS
// =============================================================================

const textVariants = {
  // Display - Large hero text (Fey h1: 48px)
  display: cn(
    'text-[36px] md:text-[48px] font-semibold leading-[1.1] tracking-[-0.02em]'
  ),

  // Headline - Section titles (Fey h2: 54px)
  headline: cn(
    'text-[40px] md:text-[54px] font-semibold leading-[1.1] tracking-[-0.02em]'
  ),

  // Title - Card/section titles (Fey h3: 26px)
  title: cn(
    'text-[22px] md:text-[26px] font-semibold leading-[1.1]'
  ),

  // Subtitle - Secondary titles (Fey: 18px)
  subtitle: cn(
    'text-[16px] md:text-[18px] font-semibold leading-[1.3]'
  ),

  // Body - Default paragraph
  body: cn(
    'text-[14px] font-normal leading-[1.5] text-[#868f97]'
  ),

  // BodyLarge - Larger body text
  bodyLarge: cn(
    'text-[16px] md:text-[18px] font-normal leading-[1.6] text-[#a0a0a0]'
  ),

  // Caption - Small text (Fey: #868F97)
  caption: cn(
    'text-[12px] font-normal leading-[1.4] text-[#868f97]'
  ),

  // Label - Form labels, tags
  label: cn(
    'text-[13px] font-medium uppercase tracking-wider text-[#ff9966]'
  ),

  // Stat - Large numbers
  stat: cn(
    'text-[36px] md:text-[48px] font-bold tabular-nums leading-[1]'
  ),

  // Code - Monospace
  code: cn(
    "text-[13px] font-mono bg-white/[0.05] px-1.5 py-0.5 rounded"
  ),
}

// =============================================================================
// BASE TEXT COMPONENT
// =============================================================================

type TextElement = 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'label'

export interface TextProps extends Omit<HTMLMotionProps<'p'>, 'ref'> {
  variant?: keyof typeof textVariants
  as?: TextElement
  gradient?: boolean
  gradientColors?: string
  balance?: boolean
  animate?: boolean
}

export const Text = forwardRef<HTMLElement, TextProps>(
  function Text(
    {
      children,
      className,
      variant = 'body',
      as: Component = 'p',
      gradient = false,
      gradientColors = 'from-white to-white/60',
      balance = false,
      animate = false,
      ...props
    },
    ref
  ) {
    const MotionComponent = motion[Component] as typeof motion.p

    return (
      <MotionComponent
        ref={ref as React.Ref<HTMLParagraphElement>}
        className={cn(
          textVariants[variant],
          gradient && `bg-gradient-to-r ${gradientColors} bg-clip-text text-transparent`,
          balance && 'text-balance',
          className
        )}
        {...(animate ? {
          variants: textRevealVariants,
          initial: 'hidden',
          animate: 'visible',
        } : {})}
        {...props}
      >
        {children}
      </MotionComponent>
    )
  }
)

// =============================================================================
// GRADIENT TEXT - Animated gradient
// =============================================================================

export interface GradientTextProps extends Omit<TextProps, 'gradient' | 'gradientColors'> {
  colors?: string
}

export const GradientText = forwardRef<HTMLElement, GradientTextProps>(
  function GradientText(
    { colors = 'from-[#ff9966] to-[#cc6633]', className, ...props },
    ref
  ) {
    return (
      <Text
        ref={ref}
        gradient
        gradientColors={colors}
        className={className}
        {...props}
      />
    )
  }
)

// =============================================================================
// ANIMATED HEADLINE - Word-by-word reveal
// =============================================================================

export interface AnimatedHeadlineProps extends Omit<TextProps, 'animate'> {
  text: string
  delay?: number
}

export function AnimatedHeadline({
  text,
  delay = 0,
  variant = 'headline',
  className,
  ...props
}: AnimatedHeadlineProps) {
  const words = text.split(' ')

  return (
    <motion.div
      className={cn(textVariants[variant], className)}
      variants={wordRevealContainerVariants}
      initial="hidden"
      animate="visible"
      style={{ perspective: 1000 }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.25em]"
          variants={wordRevealVariants}
          style={{ display: 'inline-block' }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  )
}

// =============================================================================
// TYPEWRITER TEXT - Character-by-character reveal
// =============================================================================

export interface TypewriterTextProps extends Omit<TextProps, 'children'> {
  text: string
  speed?: number // ms per character
  delay?: number
  cursor?: boolean
}

export function TypewriterText({
  text,
  speed = 50,
  delay = 0,
  cursor = true,
  variant = 'body',
  className,
  ...props
}: TypewriterTextProps) {
  return (
    <motion.span className={cn(textVariants[variant], className)} {...props}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.01,
            delay: delay + i * (speed / 1000),
          }}
        >
          {char}
        </motion.span>
      ))}
      {cursor && (
        <motion.span
          className="inline-block w-[2px] h-[1em] bg-current ml-0.5"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </motion.span>
  )
}

// =============================================================================
// COUNTER TEXT - Animated number counter
// =============================================================================

export interface CounterTextProps extends Omit<TextProps, 'children'> {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
}

export function CounterText({
  value,
  prefix = '',
  suffix = '',
  duration = 2000,
  variant = 'stat',
  className,
  ...props
}: CounterTextProps) {
  return (
    <motion.span
      className={cn(textVariants[variant], className)}
      {...props}
    >
      {prefix}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {value.toLocaleString()}
      </motion.span>
      {suffix}
    </motion.span>
  )
}

// =============================================================================
// HIGHLIGHT TEXT - Text with highlighted portion
// =============================================================================

export interface HighlightTextProps extends Omit<TextProps, 'children'> {
  children: string
  highlight: string
  highlightClassName?: string
}

export function HighlightText({
  children,
  highlight,
  highlightClassName = 'text-[#4ebe96]',
  className,
  ...props
}: HighlightTextProps) {
  const parts = children.split(new RegExp(`(${highlight})`, 'gi'))

  return (
    <Text className={className} {...props}>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className={highlightClassName}>
            {part}
          </span>
        ) : (
          part
        )
      )}
    </Text>
  )
}

// =============================================================================
// LINK TEXT - Styled anchor
// =============================================================================

export interface LinkTextProps extends Omit<HTMLMotionProps<'a'>, 'ref' | 'children'> {
  children?: React.ReactNode
  variant?: 'default' | 'muted' | 'accent'
}

const linkVariants = {
  default: 'text-white hover:text-white/80',
  muted: 'text-[#868f97] hover:text-white',
  accent: 'text-[#479ffa] hover:text-[#479ffa]/80',
}

export const LinkText = forwardRef<HTMLAnchorElement, LinkTextProps>(
  function LinkText(
    { children, className, variant = 'muted', ...props },
    ref
  ) {
    return (
      <motion.a
        ref={ref}
        className={cn(
          'text-[14px] transition-colors duration-100 inline-flex items-center gap-1', // Fey: 0.1s
          linkVariants[variant],
          className
        )}
        whileHover={{ x: 2 }}
        {...props}
      >
        {children}
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M9 5l7 7-7 7" />
        </svg>
      </motion.a>
    )
  }
)
