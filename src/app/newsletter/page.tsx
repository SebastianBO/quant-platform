import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { getBreadcrumbSchema, getFAQSchema, SITE_URL } from '@/lib/seo'
import NewsletterSignup from '@/components/NewsletterSignup'
import { Mail, TrendingUp, Brain, Zap, Clock, Users, Star, Check, Bell, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Lician Daily - Free Stock Market Newsletter | AI-Powered Insights',
  description: 'Subscribe to Lician Daily, the smartest 5-minute read in finance. Get AI-powered stock picks, market analysis, and investing insights delivered free every morning.',
  keywords: [
    'stock newsletter',
    'investing newsletter',
    'market newsletter',
    'stock picks',
    'AI investing',
    'daily market update',
    'free stock newsletter',
    'finance newsletter',
    'morning brew finance',
    'stock market email'
  ],
  openGraph: {
    title: 'Lician Daily - Free Stock Market Newsletter',
    description: 'The smartest 5-minute read in finance. AI-powered stock picks and market insights.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://lician.com/newsletter',
  },
}

const features = [
  {
    icon: TrendingUp,
    title: 'Market Movers',
    description: 'Top gainers, losers, and volume leaders before the market opens',
  },
  {
    icon: Brain,
    title: 'AI Stock Picks',
    description: 'Machine learning-driven stock recommendations with clear reasoning',
  },
  {
    icon: Zap,
    title: 'Catalyst Alerts',
    description: 'Earnings, FDA dates, and events that could move stocks today',
  },
  {
    icon: Clock,
    title: '5-Minute Read',
    description: 'Everything you need to know, delivered concisely each morning',
  },
]

const testimonials = [
  {
    quote: "Finally a newsletter that respects my time. Quality insights without the fluff.",
    author: "Sarah K.",
    role: "Portfolio Manager",
  },
  {
    quote: "The AI stock picks have outperformed my own research. Genuinely useful.",
    author: "Michael R.",
    role: "Day Trader",
  },
  {
    quote: "I start every trading day with Lician Daily. It's become essential.",
    author: "Jennifer L.",
    role: "Retail Investor",
  },
]

const sampleContent = [
  {
    category: 'MARKET PULSE',
    title: 'Futures +0.8% as Fed Signals Pause',
    preview: 'S&P futures rally after dovish Fed comments...',
  },
  {
    category: 'AI PICK OF THE DAY',
    title: 'NVDA: Momentum Building into Earnings',
    preview: 'Our AI model shows 78% probability of beat...',
  },
  {
    category: 'CATALYST WATCH',
    title: '3 Biotech Stocks with PDUFA Dates This Week',
    preview: 'FDA decisions that could move these names 50%+...',
  },
]

const faqs = [
  {
    question: 'Is Lician Daily really free?',
    answer: 'Yes, 100% free! We believe everyone deserves access to quality market insights. We may offer premium features in the future, but the daily newsletter will always be free.',
  },
  {
    question: 'When do I receive the newsletter?',
    answer: 'Lician Daily is delivered to your inbox every weekday morning at 6:30 AM ET, giving you time to review before the market opens at 9:30 AM ET.',
  },
  {
    question: 'What makes Lician Daily different?',
    answer: 'We use AI and machine learning to analyze millions of data points and deliver actionable insights - not just news summaries. Our stock picks come with clear reasoning and historical accuracy tracking.',
  },
  {
    question: 'Can I unsubscribe anytime?',
    answer: 'Absolutely. Every email includes a one-click unsubscribe link. No questions asked, no hoops to jump through. We respect your inbox.',
  },
]

export default function NewsletterPage() {
  const pageUrl = `${SITE_URL}/newsletter`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Newsletter', url: pageUrl },
  ])

  const faqSchema = getFAQSchema(faqs)

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, faqSchema]) }}
      />
      <main className="min-h-screen bg-background text-foreground pt-20">
        {/* Hero */}
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Mail className="w-8 h-8 text-green-500" />
              <span className="text-sm font-medium text-green-500 uppercase tracking-wide">Free Newsletter</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Lician Daily
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The smartest 5-minute read in finance. Market movers, AI-powered stock picks,
              and catalyst alerts delivered free every morning.
            </p>
            <div className="max-w-md mx-auto">
              <NewsletterSignup source="newsletter-hero" variant="hero" />
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>10,000+ subscribers</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>6:30 AM ET daily</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-card/50">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              What You Get Every Morning
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, i) => (
                <div key={i} className="bg-card p-6 rounded-xl border border-border text-center">
                  <feature.icon className="w-10 h-10 text-green-500 mx-auto mb-4" />
                  <h3 className="font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Premium Tier */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              Want Real-Time Alerts?
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Upgrade to Premium for instant notifications on insider trades, institutional flows, and market-moving events.
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Summary */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-2">Free</h3>
                <p className="text-muted-foreground text-sm mb-4">Weekly digest</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Weekly market summary
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Top gainers & losers
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    AI stock picks
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Catalyst previews
                  </li>
                </ul>
              </div>

              {/* Premium */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary rounded-2xl p-6 relative">
                <div className="absolute -top-3 right-4">
                  <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    Popular
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-xl font-bold">Premium</h3>
                </div>
                <div className="mb-4">
                  <span className="text-2xl font-bold">$9.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Everything in Free
                  </li>
                  <li className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-orange-500" />
                    <strong>Real-time insider trade alerts</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-500" />
                    Institutional flow signals
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    SEC 8-K filing alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Custom watchlist alerts
                  </li>
                </ul>
                <div className="flex gap-2">
                  <Link
                    href="/api/stripe/newsletter-checkout?plan=monthly"
                    prefetch={false}
                    className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors text-center text-sm"
                  >
                    Monthly
                  </Link>
                  <Link
                    href="/api/stripe/newsletter-checkout?plan=annual"
                    prefetch={false}
                    className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors text-center text-sm"
                  >
                    Annual (Save 33%)
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sample Content */}
        <section className="py-16 bg-card/50">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              A Taste of What&apos;s Inside
            </h2>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 bg-secondary/50 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">L</span>
                  </div>
                  <div>
                    <p className="font-bold">Lician Daily</p>
                    <p className="text-xs text-muted-foreground">Tuesday, January 7, 2026 • 6:30 AM ET</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {sampleContent.map((item, i) => (
                  <div key={i} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                    <p className="text-xs font-medium text-green-500 mb-1">{item.category}</p>
                    <h4 className="font-bold mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.preview}</p>
                  </div>
                ))}
                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground italic">
                    ...and much more in every issue
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-card/50">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              What Readers Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, i) => (
                <div key={i} className="bg-card p-6 rounded-xl border border-border">
                  <p className="text-muted-foreground mb-4 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div>
                    <p className="font-bold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details key={i} className="bg-card p-6 rounded-xl border border-border group">
                  <summary className="font-bold cursor-pointer list-none flex items-center justify-between">
                    <span>{faq.question}</span>
                    <span className="text-green-500 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-muted-foreground mt-4">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <NewsletterSignup source="newsletter-bottom" variant="hero" />
          </div>
        </section>

        {/* Related */}
        <section className="py-8 border-t border-border">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/markets" className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors text-sm">
                Live Markets
              </Link>
              <Link href="/screener" className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors text-sm">
                Stock Screener
              </Link>
              <Link href="/battle" className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors text-sm">
                Stock Battle
              </Link>
              <Link href="/earnings" className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors text-sm">
                Earnings Calendar
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
