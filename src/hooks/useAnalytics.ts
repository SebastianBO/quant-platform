'use client'

import { useCallback, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import * as analytics from '@/lib/analytics'

/**
 * React hook for Google Analytics tracking
 *
 * Provides easy access to analytics functions with automatic page view tracking
 */
export function useAnalytics() {
  const pathname = usePathname()
  const scrollDepthRef = useRef<Set<number>>(new Set())
  const pageStartTime = useRef<number>(Date.now())

  // Track page views on route change
  useEffect(() => {
    analytics.trackPageView(pathname)
    scrollDepthRef.current = new Set()
    pageStartTime.current = Date.now()
  }, [pathname])

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      if (scrollHeight <= 0) return

      const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100)

      const depths: (25 | 50 | 75 | 100)[] = [25, 50, 75, 100]
      for (const depth of depths) {
        if (scrollPercent >= depth && !scrollDepthRef.current.has(depth)) {
          scrollDepthRef.current.add(depth)
          analytics.trackScrollDepth(depth)
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname])

  // Track time on page when leaving
  useEffect(() => {
    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - pageStartTime.current) / 1000)
      if (timeSpent > 5) {
        analytics.trackTimeOnPage(timeSpent)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [pathname])

  // Memoized tracking functions
  const trackStockView = useCallback(analytics.trackStockView, [])
  const trackStockSearch = useCallback(analytics.trackStockSearch, [])
  const trackStockCompare = useCallback(analytics.trackStockCompare, [])
  const trackAIQueryStart = useCallback(analytics.trackAIQueryStart, [])
  const trackAIQueryComplete = useCallback(analytics.trackAIQueryComplete, [])
  const trackAIToolUsage = useCallback(analytics.trackAIToolUsage, [])
  const trackDCFCalculation = useCallback(analytics.trackDCFCalculation, [])
  const trackScreenerUsage = useCallback(analytics.trackScreenerUsage, [])
  const trackPortfolioConnect = useCallback(analytics.trackPortfolioConnect, [])
  const trackSignup = useCallback(analytics.trackSignup, [])
  const trackLogin = useCallback(analytics.trackLogin, [])
  const trackLogout = useCallback(analytics.trackLogout, [])
  const trackBeginCheckout = useCallback(analytics.trackBeginCheckout, [])
  const trackPurchase = useCallback(analytics.trackPurchase, [])
  const trackUpgradePrompt = useCallback(analytics.trackUpgradePrompt, [])
  const trackCTAClick = useCallback(analytics.trackCTAClick, [])
  const trackShare = useCallback(analytics.trackShare, [])
  const trackOutboundLink = useCallback(analytics.trackOutboundLink, [])
  const trackError = useCallback(analytics.trackError, [])
  const initializeUserAnalytics = useCallback(analytics.initializeUserAnalytics, [])
  const clearUserAnalytics = useCallback(analytics.clearUserAnalytics, [])
  const setUserProperties = useCallback(analytics.setUserProperties, [])
  const trackEvent = useCallback(analytics.trackEvent, [])

  return {
    // Stock events
    trackStockView,
    trackStockSearch,
    trackStockCompare,

    // AI events
    trackAIQueryStart,
    trackAIQueryComplete,
    trackAIToolUsage,

    // Tool events
    trackDCFCalculation,
    trackScreenerUsage,
    trackPortfolioConnect,

    // Auth events
    trackSignup,
    trackLogin,
    trackLogout,

    // Conversion events
    trackBeginCheckout,
    trackPurchase,
    trackUpgradePrompt,
    trackCTAClick,

    // Engagement events
    trackShare,
    trackOutboundLink,
    trackError,

    // User management
    initializeUserAnalytics,
    clearUserAnalytics,
    setUserProperties,

    // Generic event
    trackEvent,
  }
}

export default useAnalytics
