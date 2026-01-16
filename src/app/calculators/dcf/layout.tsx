import { Metadata } from 'next'
import { getBreadcrumbSchema, getFAQSchema, SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'DCF Valuation Calculator | Discounted Cash Flow Stock Valuation | Lician',
  description: 'Free DCF calculator to determine intrinsic stock value. Enter free cash flow, growth rate, and discount rate to calculate fair value per share with margin of safety.',
  keywords: [
    'dcf calculator',
    'discounted cash flow calculator',
    'intrinsic value calculator',
    'stock valuation calculator',
    'dcf valuation',
    'fair value calculator',
    'wacc calculator',
    'terminal value calculator',
    'present value calculator',
    'free cash flow valuation',
  ],
  alternates: {
    canonical: `${SITE_URL}/calculators/dcf`,
  },
  openGraph: {
    title: 'DCF Valuation Calculator - Calculate Intrinsic Stock Value',
    description: 'Free discounted cash flow calculator. Project future cash flows, apply discount rates, and determine fair value per share with margin of safety.',
    url: `${SITE_URL}/calculators/dcf`,
    siteName: 'Lician',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DCF Valuation Calculator | Lician',
    description: 'Calculate intrinsic stock value using discounted cash flow analysis with margin of safety.',
  },
}

const faqs = [
  {
    question: 'What discount rate should I use for DCF?',
    answer: 'For stable large-cap stocks, use 8-10%. For riskier growth stocks, use 10-15%. The discount rate (WACC) represents your required rate of return and should reflect investment risk.',
  },
  {
    question: 'Where do I find Free Cash Flow for a stock?',
    answer: 'Free Cash Flow is found on the Cash Flow Statement. Calculate it as Operating Cash Flow minus Capital Expenditures (CapEx). Visit the Financials tab on any stock page on Lician to find this data.',
  },
  {
    question: 'Why is terminal value such a large percentage of DCF value?',
    answer: 'Terminal value captures all cash flows beyond your projection period—potentially decades of growth. It typically represents 60-80% of total DCF value, which is why conservative terminal growth assumptions (2-3%) are critical.',
  },
  {
    question: 'What margin of safety should I use?',
    answer: 'Warren Buffett recommends 25-50% margin of safety. This means only buying if the stock trades at 50-75% of calculated intrinsic value, protecting against estimation errors.',
  },
]

export default function DCFCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Calculators', url: `${SITE_URL}/calculators` },
    { name: 'DCF Valuation Calculator', url: `${SITE_URL}/calculators/dcf` },
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
