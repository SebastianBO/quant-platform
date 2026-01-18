'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Check, Key, ArrowRight, Loader2 } from 'lucide-react'

export function SubscriptionSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    if (sessionId) {
      // Verify the session and get customer details
      fetch(`/api/stripe/verify-session?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setStatus('success')
            setEmail(data.email)
          } else {
            setStatus('error')
          }
        })
        .catch(() => setStatus('error'))
    } else {
      // No session ID but user landed here - assume success
      setStatus('success')
    }
  }, [sessionId])

  if (status === 'loading') {
    return (
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-[#4ebe96] mx-auto mb-4 motion-safe:animate-spin" />
        <h1 className="text-2xl font-bold mb-2 text-balance">Processing...</h1>
        <p className="text-[#868f97]">Confirming your subscription</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-[#ffa16c]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">?</span>
        </div>
        <h1 className="text-2xl font-bold mb-2 text-balance">Something went wrong</h1>
        <p className="text-[#868f97] mb-6">
          We couldn&apos;t confirm your subscription. If you were charged, please contact support.
        </p>
        <Link
          href="/developers"
          className="inline-flex items-center gap-2 text-[#4ebe96] hover:underline motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
        >
          Return to Developers page
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#4ebe96]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-[#4ebe96]" />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-balance">Welcome to Lician API!</h1>
        <p className="text-[#868f97]">
          Your subscription is now active. {email && `A confirmation has been sent to ${email}.`}
        </p>
      </div>

      <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 mb-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
        <h2 className="font-semibold mb-4 flex items-center gap-2 text-balance">
          <Key className="w-5 h-5" />
          Your API Key
        </h2>
        <p className="text-sm text-[#868f97] mb-4">
          Your API key will be sent to your email shortly. You can also generate additional keys from your dashboard.
        </p>
        <div className="bg-[#4ebe96]/10 border border-[#4ebe96]/20 rounded-2xl p-4">
          <p className="text-sm">
            <strong>What&apos;s included in your plan:</strong>
          </p>
          <ul className="text-sm text-[#868f97] mt-2 space-y-1">
            <li>- Increased API rate limits</li>
            <li>- Access to premium endpoints</li>
            <li>- Real-time data access</li>
            <li>- Priority email support</li>
            <li>- 7-day free trial (cancel anytime)</li>
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-bold text-balance">Next Steps</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 text-sm">
            <div className="w-6 h-6 bg-[#4ebe96]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-[#4ebe96]">1</span>
            </div>
            <p>Check your email for your API key and subscription details</p>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <div className="w-6 h-6 bg-[#4ebe96]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-[#4ebe96]">2</span>
            </div>
            <p>Add your API key to your application headers</p>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <div className="w-6 h-6 bg-[#4ebe96]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-[#4ebe96]">3</span>
            </div>
            <p>
              Read our <Link href="/developers" className="text-[#4ebe96] hover:underline motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]">API documentation</Link> to get started
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-white/[0.08] flex items-center justify-between">
        <Link
          href="/developers"
          className="inline-flex items-center gap-2 text-[#4ebe96] hover:underline motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
        >
          <ArrowRight className="w-4 h-4" />
          View API Documentation
        </Link>
        <Link
          href="/api/stripe/portal"
          className="text-sm text-[#868f97] hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
        >
          Manage subscription
        </Link>
      </div>
    </>
  )
}

export function LoadingFallback() {
  return (
    <div className="text-center">
      <Loader2 className="w-12 h-12 text-[#4ebe96] mx-auto mb-4 motion-safe:animate-spin" />
      <h1 className="text-2xl font-bold mb-2 text-balance">Loading...</h1>
      <p className="text-[#868f97]">Please wait</p>
    </div>
  )
}
