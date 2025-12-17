'use client'

import { usePremium } from '@/hooks/usePremium'
import Link from 'next/link'
import { Lock, Sparkles, TrendingUp, Brain, BarChart3 } from 'lucide-react'

interface PremiumGateProps {
  children: React.ReactNode
  feature?: string
  showPreview?: boolean
}

/**
 * Gate premium features with an upgrade prompt
 * Shows a blurred preview and upgrade CTA for non-premium users
 */
export function PremiumGate({ children, feature = 'this feature', showPreview = true }: PremiumGateProps) {
  const { isPremium, isLoading } = usePremium()

  if (isLoading) {
    return (
      <div className="animate-pulse bg-muted rounded-lg p-6 h-48" />
    )
  }

  if (isPremium) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      {showPreview && (
        <div className="blur-sm pointer-events-none select-none opacity-50">
          {children}
        </div>
      )}
      <div className={`${showPreview ? 'absolute inset-0' : ''} flex items-center justify-center`}>
        <div className="bg-background/95 backdrop-blur-sm border rounded-xl p-6 max-w-md text-center shadow-lg">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
          <p className="text-muted-foreground mb-4">
            Upgrade to Lician Premium to unlock {feature} and get full access to all features.
          </p>
          <Link
            href="/premium"
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Upgrade to Premium
          </Link>
        </div>
      </div>
    </div>
  )
}

/**
 * Inline upgrade prompt for use within content
 */
export function UpgradePrompt({ feature }: { feature: string }) {
  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 my-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-sm">Unlock {feature}</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Get access to AI analysis, institutional data, and more with Lician Premium.
          </p>
          <Link
            href="/premium"
            className="inline-flex items-center text-sm text-primary font-medium mt-2 hover:underline"
          >
            Learn more →
          </Link>
        </div>
      </div>
    </div>
  )
}

/**
 * Premium features comparison banner
 */
export function PremiumBanner() {
  const { isPremium, isLoading } = usePremium()

  if (isLoading || isPremium) return null

  return (
    <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-6 text-sm">
          <span className="flex items-center gap-1.5">
            <Brain className="w-4 h-4" /> AI Analysis
          </span>
          <span className="flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4" /> DCF Valuations
          </span>
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" /> Institutional Data
          </span>
        </div>
        <Link
          href="/premium"
          className="bg-white text-indigo-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
        >
          Try Premium Free →
        </Link>
      </div>
    </div>
  )
}
