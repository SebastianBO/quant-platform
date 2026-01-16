import { Metadata } from 'next'
import { getBreadcrumbSchema, getFAQSchema, SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Portfolio Diversification Analyzer | Free Portfolio Analysis Tool | Lician',
  description: 'Free portfolio diversification calculator. Analyze your holdings by sector and asset class, get a diversification score, and receive actionable recommendations to reduce risk.',
  keywords: [
    'portfolio diversification calculator',
    'portfolio analyzer',
    'diversification score',
    'asset allocation calculator',
    'sector allocation',
    'portfolio risk analysis',
    'investment diversification',
    'portfolio rebalancing',
    'stock portfolio analyzer',
    'asset class diversification',
  ],
  alternates: {
    canonical: `${SITE_URL}/calculators/portfolio-diversification`,
  },
  openGraph: {
    title: 'Portfolio Diversification Analyzer - Analyze Your Investment Mix',
    description: 'Free portfolio analyzer. Input your holdings and get a diversification score with recommendations to reduce risk across sectors and asset classes.',
    url: `${SITE_URL}/calculators/portfolio-diversification`,
    siteName: 'Lician',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portfolio Diversification Analyzer | Lician',
    description: 'Analyze your portfolio diversification and get recommendations to reduce risk.',
  },
}

const faqs = [
  {
    question: 'How many stocks do I need for diversification?',
    answer: 'Research suggests 20-30 stocks across different sectors provides substantial diversification benefits. Beyond that, additional holdings have diminishing returns. For most investors, low-cost index funds or ETFs offer instant diversification with a single purchase.',
  },
  {
    question: 'What is a good diversification score?',
    answer: 'A score of 85+ is excellent, 70-84 is good, 50-69 is moderate, and below 50 indicates poor diversification. The score considers sector diversity, asset class variety, position concentration, and overall portfolio balance.',
  },
  {
    question: 'Can you be over-diversified?',
    answer: 'Yes, "diworsification" occurs when adding positions dilutes returns without meaningful risk reduction. Owning 5 tech ETFs doesn\'t diversify—you\'re just holding the same thing multiple ways. Focus on assets with genuinely different characteristics.',
  },
  {
    question: 'How often should I rebalance my portfolio?',
    answer: 'Rebalance annually or when allocations drift more than 5% from targets. More frequent rebalancing increases trading costs and taxes. Many advisors recommend checking quarterly and only rebalancing when necessary.',
  },
]

export default function PortfolioDiversificationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Calculators', url: `${SITE_URL}/calculators` },
    { name: 'Portfolio Diversification Analyzer', url: `${SITE_URL}/calculators/portfolio-diversification` },
  ])

  const faqSchema = getFAQSchema(faqs)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, faqSchema]),
        }}
      />
      {children}
    </>
  )
}
