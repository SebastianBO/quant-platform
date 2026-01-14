'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
        person_profiles: 'identified_only',
        capture_pageview: false, // We capture manually for SPA navigation
        capture_pageleave: true,
        autocapture: true,
        session_recording: {
          maskAllInputs: false,
          maskInputOptions: { password: true }
        },
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            posthog.debug()
          }
        }
      })
    }
  }, [])

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>
  }

  return <PHProvider client={posthog}>{children}</PHProvider>
}

// Separate component for page view tracking
export function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname && typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      let url = window.origin + pathname
      if (searchParams?.toString()) {
        url = url + '?' + searchParams.toString()
      }
      posthog.capture('$pageview', { $current_url: url })
    }
  }, [pathname, searchParams])

  return null
}

// Helper to identify users
export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.identify(userId, properties)
  }
}

// Helper to track events
export function trackPostHogEvent(event: string, properties?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.capture(event, properties)
  }
}

// Helper to reset on logout
export function resetPostHog() {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.reset()
  }
}
