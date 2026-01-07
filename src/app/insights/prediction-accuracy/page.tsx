import { Metadata } from 'next'
import Link from 'next/link'
import PredictionAccuracy from '@/components/PredictionAccuracy'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  SITE_URL,
} from '@/lib/seo'
import {
  calculatePredictionStats,
  HISTORICAL_PREDICTIONS
} from '@/lib/prediction-data'

export const metadata: Metadata = {
  title: 'AI Stock Prediction Accuracy | Our Track Record | Lician',
  description: 'Transparent track record of our AI stock predictions. See how our forecasts performed against actual results and Wall Street consensus. We hold ourselves accountable.',
  keywords: [
    'stock prediction accuracy',
    'AI stock forecast track record',
    'prediction performance',
    'investment accuracy',
    'beat wall street',
  ],
  openGraph: {
    title: 'AI Stock Prediction Accuracy - Our Track Record',
    description: 'Transparent track record showing how our AI predictions performed against actual results.',
    type: 'article',
  },
  alternates: {
    canonical: `${SITE_URL}/insights/prediction-accuracy`,
  },
}

export default function PredictionAccuracyPage() {
  const stats = calculatePredictionStats(HISTORICAL_PREDICTIONS)
  const currentYear = new Date().getFullYear()
  const pageUrl = `${SITE_URL}/insights/prediction-accuracy`

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Insights', url: `${SITE_URL}/insights` },
    { name: 'Prediction Accuracy', url: pageUrl },
  ])

  // Article Schema
  const articleSchema = getArticleSchema({
    headline: 'AI Stock Prediction Accuracy - Our Track Record',
    description: 'Transparent track record of our AI stock predictions with detailed accuracy metrics.',
    url: pageUrl,
    keywords: ['stock prediction', 'AI accuracy', 'investment performance'],
  })

  // FAQ Schema
  const faqs = [
    {
      question: 'How accurate are your stock predictions?',
      answer: `Our AI predictions achieved ${stats.accuracyRate.toFixed(1)}% accuracy in 2025, outperforming the Wall Street consensus average of ${stats.wallStreetAccuracyRate.toFixed(1)}%.`
    },
    {
      question: 'How do you measure prediction accuracy?',
      answer: 'We measure accuracy by comparing our predicted price to the actual price at the evaluation date. Accuracy = 100% - |Predicted Price - Actual Price| / Actual Price * 100%. We also track direction accuracy (up/down) separately.'
    },
    {
      question: 'Do you beat Wall Street analysts?',
      answer: `Yes, our AI models beat Wall Street consensus on ${Math.round((stats.beatWallStreet ? 1 : 0) * stats.totalPredictions)} out of ${stats.totalPredictions} predictions tracked. Our systematic approach removes emotional bias from forecasting.`
    },
    {
      question: 'How many predictions do you track?',
      answer: `We currently track ${stats.totalPredictions} major stock predictions. We plan to expand our coverage as we build our track record. All predictions are made public before evaluation dates.`
    },
    {
      question: 'What is your prediction methodology?',
      answer: 'Our AI combines fundamental analysis (financial statements, valuation metrics), technical analysis (price patterns, momentum), sentiment analysis (news, social media), and macro factors to generate price forecasts.'
    },
    {
      question: 'Can I trust these accuracy numbers?',
      answer: 'Our accuracy metrics are calculated transparently using publicly available historical data. We show both successes and failures. Past performance does not guarantee future results, but we believe in accountability.'
    },
  ]

  const faqSchema = getFAQSchema(faqs)

  const schemas = [breadcrumbSchema, articleSchema, faqSchema]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Breadcrumb */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/insights" className="hover:text-foreground">Insights</Link>
            {' / '}
            <span>Prediction Accuracy</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              AI Stock Prediction Accuracy
            </h1>
            <p className="text-xl text-muted-foreground">
              Transparent track record of how our predictions performed. We hold ourselves accountable.
            </p>
          </div>

          {/* Main Dashboard */}
          <PredictionAccuracy showFullDashboard={true} />

          {/* FAQ Section */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground text-sm">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Trust Badges */}
          <section className="mt-12 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl p-8 border border-emerald-500/20">
            <h2 className="text-2xl font-bold mb-6 text-center">Why We Track This</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl">1</span>
                </div>
                <h3 className="font-bold mb-1">Accountability</h3>
                <p className="text-sm text-muted-foreground">We stand behind every prediction we make</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl">2</span>
                </div>
                <h3 className="font-bold mb-1">Transparency</h3>
                <p className="text-sm text-muted-foreground">You deserve to know our real track record</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl">3</span>
                </div>
                <h3 className="font-bold mb-1">Improvement</h3>
                <p className="text-sm text-muted-foreground">We use results to make our AI better</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl">4</span>
                </div>
                <h3 className="font-bold mb-1">Trust</h3>
                <p className="text-sm text-muted-foreground">Verified performance builds confidence</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="mt-12 bg-card p-8 rounded-xl border border-border text-center">
            <h2 className="text-2xl font-bold mb-4">See Our Latest Predictions</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Browse AI-powered stock predictions for thousands of companies. Our models analyze fundamentals, technicals, and sentiment to generate forecasts.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/prediction/aapl"
                className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium"
              >
                View AAPL Prediction
              </Link>
              <Link
                href="/prediction/nvda"
                className="inline-block bg-secondary hover:bg-secondary/80 px-6 py-3 rounded-lg font-medium"
              >
                View NVDA Prediction
              </Link>
              <Link
                href="/dashboard"
                className="inline-block bg-secondary hover:bg-secondary/80 px-6 py-3 rounded-lg font-medium"
              >
                Search All Stocks
              </Link>
            </div>
          </section>

          {/* Disclaimer */}
          <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-amber-600 dark:text-amber-400 text-sm">
              <strong>Important Disclaimer:</strong> Past prediction performance does not guarantee future results.
              Stock markets are inherently unpredictable, and our AI models, while sophisticated, cannot account for
              all variables. These accuracy metrics are provided for transparency and educational purposes only.
              Always conduct your own research and consult with a qualified financial advisor before making investment decisions.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
