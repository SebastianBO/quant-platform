'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Key, Check, Copy, ArrowRight } from 'lucide-react'

export default function APISignupPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [useCase, setUseCase] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/developers/create-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, company, useCase }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create API key')
      }

      setApiKey(data.apiKey)

      // Track conversion
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'api_key_created', {
          tier: 'free',
          use_case: useCase,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (apiKey) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background text-foreground pt-20">
          <div className="max-w-xl mx-auto px-6 py-16">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Your API Key is Ready!</h1>
              <p className="text-muted-foreground">
                Copy your API key below. You won't be able to see it again.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">API Key</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-3 bg-muted rounded font-mono text-sm break-all">
                  {apiKey}
                </code>
                <button
                  onClick={copyToClipboard}
                  className="p-3 bg-muted hover:bg-muted/80 rounded transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-8">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                <strong>Important:</strong> Store this key securely. For security reasons,
                we cannot show it again. If you lose it, you'll need to generate a new one.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-bold">Next Steps</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <p>Add the API key to your request headers: <code className="bg-muted px-1 rounded">Authorization: Bearer YOUR_KEY</code></p>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <p>Make your first API call to <code className="bg-muted px-1 rounded">/api/v1/financials/income-statements?ticker=AAPL</code></p>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <p>Check out the <Link href="/developers/docs" className="text-primary hover:underline">full documentation</Link> for all available endpoints</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border">
              <Link
                href="/developers"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <ArrowRight className="w-4 h-4" />
                Back to Developer Portal
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background text-foreground pt-20">
        <div className="max-w-xl mx-auto px-6 py-16">
          <div className="text-center mb-8">
            <Key className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Get Your Free API Key</h1>
            <p className="text-muted-foreground">
              100 requests per day, no credit card required
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium mb-2">
                Company (optional)
              </label>
              <input
                type="text"
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Acme Inc."
              />
            </div>

            <div>
              <label htmlFor="useCase" className="block text-sm font-medium mb-2">
                What are you building? *
              </label>
              <select
                id="useCase"
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                required
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select an option</option>
                <option value="trading_app">Trading Application</option>
                <option value="research_tool">Research Tool</option>
                <option value="portfolio_tracker">Portfolio Tracker</option>
                <option value="data_analysis">Data Analysis</option>
                <option value="academic">Academic Research</option>
                <option value="personal">Personal Project</option>
                <option value="other">Other</option>
              </select>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating API Key...' : 'Get API Key'}
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>

          <div className="mt-8 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Need more requests?
            </p>
            <Link
              href="/developers#pricing"
              className="text-primary hover:underline"
            >
              View paid plans starting at $29/month
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
