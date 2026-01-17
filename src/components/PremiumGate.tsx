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
      <div className="animate-pulse bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 h-48" />
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
        <div className="bg-white/[0.03] backdrop-blur-[10px] border-white/[0.08] border rounded-2xl p-6 max-w-md text-center shadow-lg">
          <div className="w-12 h-12 rounded-full bg-[#4ebe96]/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-[#4ebe96]" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
          <p className="text-[#868f97] mb-4">
            Upgrade to Lician Premium to unlock {feature} and get full access to all features.
          </p>
          <Link
            href="/premium"
            className="inline-flex items-center justify-center gap-2 bg-[#4ebe96] text-black px-6 py-2.5 rounded-full font-medium hover:bg-[#3ea67d] motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
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
    <div className="bg-gradient-to-r from-[#4ebe96]/10 to-[#4ebe96]/5 border border-[#4ebe96]/20 rounded-2xl p-4 my-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#4ebe96]/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-[#4ebe96]" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-sm">Unlock {feature}</h4>
          <p className="text-sm text-[#868f97] mt-1">
            Get access to AI analysis, institutional data, and more with Lician Premium.
          </p>
          <Link
            href="/premium"
            className="inline-flex items-center text-sm text-[#4ebe96] font-medium mt-2 hover:underline motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] rounded"
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
          className="bg-white text-indigo-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-white/90 motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
        >
          Try Premium Free →
        </Link>
      </div>
    </div>
  )
}
