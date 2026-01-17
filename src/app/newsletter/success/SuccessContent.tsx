'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Check, Mail, ArrowRight, Loader2, Bell, TrendingUp, Shield } from 'lucide-react'

export function NewsletterSuccessContent() {
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
      <>
        <Header />
        <main className="min-h-screen bg-[#0a0a0a] text-white pt-20">
          <div className="max-w-xl mx-auto px-6 py-16 text-center">
            <Loader2 className="w-12 h-12 text-[#f4a623] mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold mb-2">Processing...</h1>
            <p className="text-[#868f97]">Confirming your subscription</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (status === 'error') {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#0a0a0a] text-white pt-20">
          <div className="max-w-xl mx-auto px-6 py-16 text-center">
            <div className="w-16 h-16 bg-[#f4a623]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">?</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-[#868f97] mb-6">
              We couldn&apos;t confirm your subscription. If you were charged, please contact support.
            </p>
            <Link
              href="/newsletter"
              className="inline-flex items-center gap-2 text-[#f4a623] hover:underline"
            >
              Return to Newsletter page
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0a0a0a] text-white pt-20">
        <div className="max-w-xl mx-auto px-6 py-16">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#f4a623]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-[#f4a623]" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Welcome to Insider Trade Alerts!</h1>
            <p className="text-[#868f97]">
              Your subscription is now active. {email && `Alerts will be sent to ${email}.`}
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-white/[0.08] rounded-lg p-6 mb-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#f4a623]" />
              What to Expect
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-[#4ebe96] mt-0.5" />
                <div>
                  <p className="font-medium">Real-time Alerts</p>
                  <p className="text-sm text-[#868f97]">Get notified within minutes of significant insider trades</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-[#4ebe96] mt-0.5" />
                <div>
                  <p className="font-medium">Weekly Digest</p>
                  <p className="text-sm text-[#868f97]">Summary of the most impactful insider activity</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#4ebe96] mt-0.5" />
                <div>
                  <p className="font-medium">Exclusive Analysis</p>
                  <p className="text-sm text-[#868f97]">Deep dives into notable insider trading patterns</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#f4a623]/10 border border-[#f4a623]/20 rounded-lg p-4 mb-6">
            <p className="text-sm">
              <strong>First alert coming soon!</strong> We&apos;ll notify you as soon as the next significant insider trade is filed with the SEC.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-bold">While You Wait</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <div className="w-6 h-6 bg-[#f4a623]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-[#f4a623]">1</span>
                </div>
                <p>Check your inbox for a welcome email with tips on maximizing your subscription</p>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="w-6 h-6 bg-[#f4a623]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-[#f4a623]">2</span>
                </div>
                <p>Add alerts@lician.com to your contacts to ensure delivery</p>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="w-6 h-6 bg-[#f4a623]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-[#f4a623]">3</span>
                </div>
                <p>
                  Browse recent <Link href="/insider-trading" className="text-[#f4a623] hover:underline">insider trades</Link> to see what you&apos;ll be tracking
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/[0.08] flex items-center justify-between">
            <Link
              href="/insider-trading"
              className="inline-flex items-center gap-2 text-[#f4a623] hover:underline"
            >
              <ArrowRight className="w-4 h-4" />
              View Insider Trades
            </Link>
            <Link
              href="/api/stripe/portal"
              className="text-sm text-[#868f97] hover:text-white transition-colors duration-100"
            >
              Manage subscription
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export function LoadingFallback() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0a0a0a] text-white pt-20">
        <div className="max-w-xl mx-auto px-6 py-16 text-center">
          <Loader2 className="w-12 h-12 text-[#f4a623] mx-auto mb-4 animate-spin" />
          <h1 className="text-2xl font-bold mb-2">Loading...</h1>
          <p className="text-[#868f97]">Please wait</p>
        </div>
      </main>
      <Footer />
    </>
  )
}
