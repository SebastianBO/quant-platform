'use client'

import { forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Text, GradientText, LinkText, AnimatedHeadline } from '../base/Text'
import { useScrollReveal, staggerContainerVariants, staggerItemVariants } from '../animations'

// =============================================================================
// SECTION - Base section wrapper
// =============================================================================

export interface SectionProps extends Omit<HTMLMotionProps<'section'>, 'ref' | 'children'> {
  children?: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'sm' | 'md' | 'lg' | 'xl'
  animate?: boolean
}

const maxWidths = {
  sm: 'max-w-[640px]',
  md: 'max-w-[768px]',
  lg: 'max-w-[1024px]',
  xl: 'max-w-[1280px]',
  '2xl': 'max-w-[1400px]',
  full: 'max-w-full',
}

const paddings = {
  sm: 'py-12',
  md: 'py-16',
  lg: 'py-20',
  xl: 'py-24',
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  function Section(
    {
      children,
      className,
      maxWidth = '2xl',
      padding = 'lg',
      animate = false,
      ...props
    },
    ref
  ) {
    const { ref: animRef, isInView } = useScrollReveal()

    return (
      <motion.section
        ref={ref}
        className={cn(paddings[padding], className)}
        {...props}
      >
        <div
          ref={animate ? animRef : undefined}
          className={cn(maxWidths[maxWidth], 'mx-auto px-6')}
        >
          {animate ? (
            <motion.div
              variants={staggerContainerVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            >
              {children}
            </motion.div>
          ) : (
            children
          )}
        </div>
      </motion.section>
    )
  }
)

// =============================================================================
// SECTION HEADER - Title, subtitle, and optional action
// =============================================================================

export interface SectionHeaderProps {
  label?: string
  title: string
  titleHighlight?: string
  subtitle?: string
  action?: React.ReactNode
  align?: 'left' | 'center'
  animate?: boolean
  className?: string
}

export function SectionHeader({
  label,
  title,
  titleHighlight,
  subtitle,
  action,
  align = 'left',
  animate = false,
  className,
}: SectionHeaderProps) {
  const { ref, isInView } = useScrollReveal()

  const content = (
    <>
      {label && (
        <Text variant="label" className="mb-4">
          {label}
        </Text>
      )}

      <h2 className={cn(
        'text-[48px] md:text-[56px] font-semibold leading-[1.1] tracking-[-0.02em]',
        align === 'center' && 'text-center'
      )}>
        {titleHighlight ? (
          <>
            {title.split(titleHighlight)[0]}
            <GradientText as="span" variant="headline">
              {titleHighlight}
            </GradientText>
            {title.split(titleHighlight)[1]}
          </>
        ) : (
          title
        )}
      </h2>

      {subtitle && (
        <Text
          variant="bodyLarge"
          className={cn(
            'mt-4 max-w-[640px]',
            align === 'center' && 'mx-auto text-center'
          )}
        >
          {subtitle}
        </Text>
      )}

      {action && (
        <div className={cn('mt-6', align === 'center' && 'flex justify-center')}>
          {action}
        </div>
      )}
    </>
  )

  if (!animate) {
    return <div className={className}>{content}</div>
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {content}
    </motion.div>
  )
}

// =============================================================================
// FEATURE GRID - Grid of feature cards
// =============================================================================

export interface FeatureGridProps {
  children: React.ReactNode
  columns?: 2 | 3 | 4
  className?: string
}

export function FeatureGrid({ children, columns = 3, className }: FeatureGridProps) {
  const cols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={cn('grid gap-4', cols[columns], className)}>
      {children}
    </div>
  )
}

// =============================================================================
// FEATURE CARD - Card for feature showcase
// =============================================================================

export interface FeatureCardProps {
  image?: string
  imageAlt?: string
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
  aspectRatio?: string
  index?: number
}

export function FeatureCard({
  image,
  imageAlt,
  title,
  description,
  children,
  className,
  aspectRatio = 'aspect-[4/3]',
  index = 0,
}: FeatureCardProps) {
  const { ref, isInView } = useScrollReveal()

  return (
    <motion.div
      ref={ref}
      className={cn(
        'bg-[#0a0a0a] rounded-2xl border border-white/[0.08] overflow-hidden',
        'hover:border-white/[0.15] transition-colors',
        className
      )}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {image && (
        <div className={cn('relative', aspectRatio)}>
          <img
            src={image}
            alt={imageAlt || title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      )}
      {children}
      <div className="p-4 border-t border-white/[0.06]">
        <h3 className="text-[14px] font-medium text-white">{title}</h3>
        {description && (
          <p className="text-[12px] text-[#868f97] mt-1">{description}</p>
        )}
      </div>
    </motion.div>
  )
}

// =============================================================================
// CTA SECTION - Call to action section
// =============================================================================

export interface CTASectionProps {
  eyebrow?: string
  title: string
  titleItalic?: boolean
  subtitle?: string
  primaryAction?: React.ReactNode
  secondaryAction?: React.ReactNode
  image?: string
  imageAlt?: string
  className?: string
}

export function CTASection({
  eyebrow,
  title,
  titleItalic = true,
  subtitle,
  primaryAction,
  secondaryAction,
  image,
  imageAlt,
  className,
}: CTASectionProps) {
  const { ref, isInView } = useScrollReveal()

  return (
    <Section padding="xl" className={cn('text-center', className)}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {eyebrow && (
          <Text variant="label" className="mb-4">
            {eyebrow}
          </Text>
        )}

        <h2 className={cn(
          'text-[48px] md:text-[64px] font-semibold leading-[1.1] tracking-[-0.02em]',
          titleItalic && 'italic'
        )}>
          {title}
        </h2>

        {subtitle && (
          <Text variant="body" className="mt-4 max-w-md mx-auto">
            {subtitle}
          </Text>
        )}

        {(primaryAction || secondaryAction) && (
          <div className="flex items-center justify-center gap-4 mt-8">
            {primaryAction}
            {secondaryAction}
          </div>
        )}

        {image && (
          <motion.div
            className="mt-16 relative max-w-[800px] mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={image}
              alt={imageAlt || title}
              className="w-full"
            />
          </motion.div>
        )}
      </motion.div>
    </Section>
  )
}

// =============================================================================
// TWO COLUMN SECTION
// =============================================================================

export interface TwoColumnSectionProps {
  left: React.ReactNode
  right: React.ReactNode
  reverse?: boolean
  className?: string
}

export function TwoColumnSection({
  left,
  right,
  reverse = false,
  className,
}: TwoColumnSectionProps) {
  return (
    <div className={cn(
      'grid md:grid-cols-2 gap-8 md:gap-12 items-center',
      reverse && 'md:[&>*:first-child]:order-2',
      className
    )}>
      <div>{left}</div>
      <div>{right}</div>
    </div>
  )
}
