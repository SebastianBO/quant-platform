'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'

// PostHog is initialized in instrumentation-client.ts
// This provider just wraps the app with the React context

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>
  }

  return <PHProvider client={posthog}>{children}</PHProvider>
}

// No longer needed - instrumentation-client.ts handles pageviews
export function PostHogPageView() {
  return null
}

// Helper to identify users
export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (typeof window !== 'undefined') {
    posthog.identify(userId, properties)
  }
}

// Helper to track events
export function trackPostHogEvent(event: string, properties?: Record<string, unknown>) {
  if (typeof window !== 'undefined') {
    posthog.capture(event, properties)
  }
}

// Helper to reset on logout
export function resetPostHog() {
  if (typeof window !== 'undefined') {
    posthog.reset()
  }
}
