"use client"

import { useState } from 'react'
import { Mail, Check, Loader2, Zap } from 'lucide-react'

interface NewsletterSignupProps {
  source?: string
  variant?: 'inline' | 'card' | 'hero'
  interests?: string[]
}

export default function NewsletterSignup({
  source = 'website',
  variant = 'inline',
  interests = [],
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || status === 'loading') return

    setStatus('loading')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source, interests }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus('success')
        setMessage(data.message || 'Thanks for subscribing!')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong')
      }
    } catch {
      setStatus('error')
      setMessage('Failed to subscribe. Please try again.')
    }
  }

  if (variant === 'hero') {
    return (
      <div className="bg-gradient-to-br from-green-600/20 via-green-600/10 to-blue-600/10 p-8 md:p-12 rounded-2xl border border-green-500/20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-6 h-6 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-500">FREE DAILY NEWSLETTER</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Lician Daily
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            The smartest 5-minute read in finance. Market movers, AI insights,
            and stock picks delivered free every morning.
          </p>

          {status === 'success' ? (
            <div className="flex items-center justify-center gap-2 text-green-500 py-4">
              <Check className="w-6 h-6" />
              <span className="text-lg font-medium">{message}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl focus:border-green-500 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-green-600/50 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Subscribe Free'
                )}
              </button>
            </form>
          )}

          {status === 'error' && (
            <p className="text-red-500 text-sm mt-3">{message}</p>
          )}

          <p className="text-xs text-muted-foreground mt-4">
            Join 10,000+ investors. Unsubscribe anytime.
          </p>
        </div>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className="bg-card p-6 rounded-xl border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-5 h-5 text-green-500" />
          <h3 className="font-bold">Lician Daily Newsletter</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Get market insights, stock picks, and AI analysis delivered to your inbox every morning.
        </p>

        {status === 'success' ? (
          <div className="flex items-center gap-2 text-green-500 py-2">
            <Check className="w-5 h-5" />
            <span className="text-sm font-medium">{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:border-green-500 focus:outline-none text-sm"
              required
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-2 bg-green-600 hover:bg-green-500 disabled:bg-green-600/50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {status === 'loading' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Subscribe Free'
              )}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="text-red-500 text-xs mt-2">{message}</p>
        )}
      </div>
    )
  }

  // Inline variant (default)
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {status === 'success' ? (
        <div className="flex items-center gap-2 text-green-500">
          <Check className="w-5 h-5" />
          <span className="text-sm font-medium">{message}</span>
        </div>
      ) : (
        <>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg focus:border-green-500 focus:outline-none text-sm"
          />
          <button
            onClick={handleSubmit}
            disabled={status === 'loading' || !email}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-green-600/50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm whitespace-nowrap"
          >
            {status === 'loading' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Subscribe
              </>
            )}
          </button>
        </>
      )}
      {status === 'error' && (
        <p className="text-red-500 text-xs">{message}</p>
      )}
    </div>
  )
}
