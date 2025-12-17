'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

interface PremiumStatus {
  isPremium: boolean
  isLoading: boolean
  userId: string | null
  premiumSince: string | null
}

/**
 * Hook to check if the current user has a premium subscription
 * Use this to gate premium features in the UI
 */
export function usePremium(): PremiumStatus {
  const [status, setStatus] = useState<PremiumStatus>({
    isPremium: false,
    isLoading: true,
    userId: null,
    premiumSince: null,
  })

  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        const supabase = createClient()

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          setStatus({
            isPremium: false,
            isLoading: false,
            userId: null,
            premiumSince: null,
          })
          return
        }

        // Get premium status from profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_premium, premium_since')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Error fetching premium status:', profileError)
          setStatus({
            isPremium: false,
            isLoading: false,
            userId: user.id,
            premiumSince: null,
          })
          return
        }

        setStatus({
          isPremium: profile?.is_premium || false,
          isLoading: false,
          userId: user.id,
          premiumSince: profile?.premium_since || null,
        })
      } catch (error) {
        console.error('Error checking premium status:', error)
        setStatus({
          isPremium: false,
          isLoading: false,
          userId: null,
          premiumSince: null,
        })
      }
    }

    checkPremiumStatus()
  }, [])

  return status
}

/**
 * Higher-order component to require premium access
 * Redirects to /premium if user is not premium
 */
export function withPremium<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function WithPremiumComponent(props: P) {
    const { isPremium, isLoading } = usePremium()

    if (isLoading) {
      return fallback || <div className="animate-pulse">Loading...</div>
    }

    if (!isPremium) {
      // Redirect to premium page or show upgrade prompt
      if (typeof window !== 'undefined') {
        window.location.href = '/premium'
      }
      return null
    }

    return <WrappedComponent {...props} />
  }
}
