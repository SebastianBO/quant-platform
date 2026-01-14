'use client'

import { useState } from 'react'
import { ExternalLink, X, TrendingUp, Shield, Zap } from 'lucide-react'

// Affiliate links - Replace with your actual affiliate URLs
const BROKERS = [
  {
    name: 'Interactive Brokers',
    logo: '/brokers/ibkr.svg',
    tagline: 'Low-cost trading for active investors',
    features: ['$0 commission stocks', 'Global markets', 'Margin rates from 5.83%'],
    cta: 'Open Account',
    affiliateUrl: 'https://www.interactivebrokers.com/referral/lician', // Replace with real affiliate link
    highlight: true,
    icon: TrendingUp,
  },
  {
    name: 'Robinhood',
    logo: '/brokers/robinhood.svg',
    tagline: 'Commission-free trading',
    features: ['No account minimums', 'Fractional shares', 'Easy mobile app'],
    cta: 'Get Started',
    affiliateUrl: 'https://join.robinhood.com/lician', // Replace with real affiliate link
    highlight: false,
    icon: Zap,
  },
  {
    name: 'Webull',
    logo: '/brokers/webull.svg',
    tagline: 'Free stocks when you sign up',
    features: ['Extended hours trading', 'Advanced charts', 'Paper trading'],
    cta: 'Claim Free Stock',
    affiliateUrl: 'https://www.webull.com/activity?invite_code=lician', // Replace with real affiliate link
    highlight: false,
    icon: Shield,
  },
]

interface BrokerAffiliateProps {
  ticker: string
  variant?: 'inline' | 'card' | 'minimal'
  className?: string
}

export function BrokerAffiliate({ ticker, variant = 'inline', className = '' }: BrokerAffiliateProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  // Track clicks for analytics
  const handleClick = (brokerName: string, url: string) => {
    // GA4 event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'affiliate_click', {
        broker: brokerName,
        ticker: ticker,
        placement: variant,
      })
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <span>Trade {ticker}:</span>
        {BROKERS.slice(0, 2).map((broker) => (
          <button
            key={broker.name}
            onClick={() => handleClick(broker.name, broker.affiliateUrl)}
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            {broker.name}
            <ExternalLink className="w-3 h-3" />
          </button>
        ))}
      </div>
    )
  }

  if (variant === 'card') {
    const featured = BROKERS[0]
    return (
      <div className={`bg-card border border-border rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Trade {ticker}</h3>
          <button
            onClick={() => setDismissed(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {BROKERS.map((broker) => (
            <button
              key={broker.name}
              onClick={() => handleClick(broker.name, broker.affiliateUrl)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                broker.highlight
                  ? 'border-primary/50 bg-primary/5 hover:bg-primary/10'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <broker.icon className={`w-5 h-5 ${broker.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="flex-1 text-left">
                <div className="font-medium text-sm">{broker.name}</div>
                <div className="text-xs text-muted-foreground">{broker.tagline}</div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Affiliate links. We may earn a commission.
        </p>
      </div>
    )
  }

  // Default: inline variant
  return (
    <div className={`bg-gradient-to-r from-primary/5 to-transparent border border-border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Ready to invest in {ticker}?</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground p-1"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {BROKERS.map((broker) => (
          <button
            key={broker.name}
            onClick={() => handleClick(broker.name, broker.affiliateUrl)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
              broker.highlight
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted hover:bg-muted/80 text-foreground'
            }`}
          >
            {broker.name}
            <ExternalLink className="w-3 h-3" />
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Commission-free trading available. Affiliate links.
      </p>
    </div>
  )
}

// Compact version for mobile or tight spaces
export function BrokerAffiliateCompact({ ticker }: { ticker: string }) {
  const handleClick = (brokerName: string, url: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'affiliate_click', {
        broker: brokerName,
        ticker: ticker,
        placement: 'compact',
      })
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-muted-foreground">Trade:</span>
      <div className="flex gap-2">
        {BROKERS.slice(0, 2).map((broker) => (
          <button
            key={broker.name}
            onClick={() => handleClick(broker.name, broker.affiliateUrl)}
            className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs hover:bg-muted/80 transition-colors"
          >
            {broker.name.split(' ')[0]}
            <ExternalLink className="w-3 h-3" />
          </button>
        ))}
      </div>
    </div>
  )
}

export default BrokerAffiliate
