'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Check, Key, ArrowRight, Loader2 } from 'lucide-react'

export default function SubscriptionSuccessPage() {
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

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background text-foreground pt-20">
        <div className="max-w-xl mx-auto px-6 py-16">
          {status === 'loading' ? (
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-bold mb-2">Processing...</h1>
              <p className="text-muted-foreground">Confirming your subscription</p>
            </div>
          ) : status === 'success' ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Welcome to Lician API!</h1>
                <p className="text-muted-foreground">
                  Your subscription is now active. {email && `A confirmation has been sent to ${email}.`}
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 mb-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Your API Key
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Your API key will be sent to your email shortly. You can also generate additional keys from your dashboard.
                </p>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm">
                    <strong>What&apos;s included in your plan:</strong>
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>- Increased API rate limits</li>
                    <li>- Access to premium endpoints</li>
                    <li>- Real-time data access</li>
                    <li>- Priority email support</li>
                    <li>- 7-day free trial (cancel anytime)</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="font-bold">Next Steps</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">1</span>
                    </div>
                    <p>Check your email for your API key and subscription details</p>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">2</span>
                    </div>
                    <p>Add your API key to your application headers</p>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">3</span>
                    </div>
                    <p>
                      Read our <Link href="/developers" className="text-primary hover:underline">API documentation</Link> to get started
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-border flex items-center justify-between">
                <Link
                  href="/developers"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <ArrowRight className="w-4 h-4" />
                  View API Documentation
                </Link>
                <Link
                  href="/api/stripe/portal"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Manage subscription
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">?</span>
              </div>
              <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
              <p className="text-muted-foreground mb-6">
                We couldn&apos;t confirm your subscription. If you were charged, please contact support.
              </p>
              <Link
                href="/developers"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                Return to Developers page
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
