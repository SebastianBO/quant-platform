import { Metadata } from 'next'
import Link from 'next/link'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  SITE_URL,
} from '@/lib/seo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import SEOSidebar from '@/components/SEOSidebar'

// Force dynamic rendering since we fetch data
export const revalidate = 3600

export const metadata: Metadata = {
  title: '10 Year Treasury Rate Today - US Treasury Yields & Bond Rates 2025',
  description: 'View current US Treasury yields and bond rates including 10 year treasury rate, 2 year treasury, 30 year treasury bond rates. Live yield curve data updated daily.',
  keywords: [
    'treasury yields',
    '10 year treasury rate',
    'bond yields today',
    'us treasury bonds',
    'interest rates',
    'yield curve',
    '2 year treasury',
    '30 year treasury',
    'bond rates',
    'treasury rate today',
    'government bonds',
    'bond market',
    'treasury bill rates',
    'yield curve inversion',
  ],
  openGraph: {
    title: '10 Year Treasury Rate & US Bond Yields Today',
    description: 'Live US Treasury yields and bond rates. Track the 10 year treasury rate, yield curve, and all government bond rates.',
    type: 'website',
    url: 'https://lician.com/bonds',
  },
  alternates: {
    canonical: 'https://lician.com/bonds',
  },
  twitter: {
    card: 'summary_large_image',
    title: '10 Year Treasury Rate & Bond Yields Today',
    description: 'Track live US Treasury yields, bond rates, and the yield curve.',
  },
}

// Fetch treasury data server-side
async function getTreasuryData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lician.com'
    const response = await fetch(`${baseUrl}/api/treasury`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    })

    if (!response.ok) {
      throw new Error('Failed to fetch treasury data')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching treasury data:', error)
    // Return fallback data
    return {
      yieldCurve: [
        { maturity: '1M', name: '1 Month', yield: 5.25 },
        { maturity: '3M', name: '3 Month', yield: 5.22 },
        { maturity: '6M', name: '6 Month', yield: 5.05 },
        { maturity: '1Y', name: '1 Year', yield: 4.65 },
        { maturity: '2Y', name: '2 Year', yield: 4.25 },
        { maturity: '5Y', name: '5 Year', yield: 4.10 },
        { maturity: '10Y', name: '10 Year', yield: 4.20 },
        { maturity: '30Y', name: '30 Year', yield: 4.45 },
      ],
      inverted: true,
      spread: -0.0005,
    }
  }
}

const bondFAQs = [
  {
    question: 'What is the 10 year treasury rate today?',
    answer: 'The 10 year treasury rate (also called the 10 year treasury yield) is the interest rate the US government pays on debt that matures in 10 years. It serves as a benchmark for mortgage rates, corporate bonds, and other lending rates. The 10 year treasury is one of the most watched indicators in financial markets as it reflects investor expectations for inflation, economic growth, and Federal Reserve policy.',
  },
  {
    question: 'What are US Treasury yields?',
    answer: 'US Treasury yields are the interest rates paid on US government debt securities. These include Treasury bills (1-12 months), Treasury notes (2-10 years), and Treasury bonds (20-30 years). Yields move inversely to bond prices - when bond prices rise, yields fall, and vice versa. Treasury yields are considered "risk-free" rates since they are backed by the full faith and credit of the US government.',
  },
  {
    question: 'What is the yield curve and why does it matter?',
    answer: 'The yield curve is a line that plots interest rates across different maturity dates for US Treasury bonds. A normal yield curve slopes upward, meaning longer-term bonds pay higher yields than shorter-term bonds. An inverted yield curve (when short-term rates exceed long-term rates) has historically been a reliable predictor of economic recessions, typically occurring 12-18 months before a downturn.',
  },
  {
    question: 'What causes treasury yields to rise or fall?',
    answer: 'Treasury yields are influenced by several factors: Federal Reserve policy and interest rate decisions, inflation expectations, economic growth outlook, supply and demand for bonds, geopolitical events, and investor risk appetite. When the Fed raises rates or inflation expectations increase, treasury yields typically rise. During economic uncertainty, investors flee to the safety of treasuries, driving yields down.',
  },
  {
    question: 'How do treasury yields affect stocks?',
    answer: 'Rising treasury yields can negatively impact stocks in several ways: higher yields make bonds more attractive relative to stocks, increased borrowing costs reduce corporate profits, and higher discount rates lower the present value of future earnings. Growth stocks and technology companies are especially sensitive to rising yields. Conversely, falling yields often support higher stock valuations.',
  },
  {
    question: 'What is the difference between 2 year and 10 year treasury rates?',
    answer: 'The 2 year treasury rate reflects short-term interest rate expectations and is heavily influenced by Federal Reserve policy. The 10 year treasury rate reflects longer-term economic growth and inflation expectations. The spread between these two rates (10 year minus 2 year) is closely watched - a negative spread (inversion) suggests investors expect the Fed to cut rates in the future, often preceding recessions.',
  },
  {
    question: 'Should I buy treasury bonds when yields are high?',
    answer: 'High treasury yields can be attractive for income-focused investors, especially when yields exceed inflation rates (providing real positive returns). Treasury bonds offer safety, predictable income, and portfolio diversification. However, bond prices fall when yields rise, so if rates continue climbing, existing bonds lose value. Consider your time horizon, income needs, and whether you plan to hold until maturity or trade bonds.',
  },
  {
    question: 'What is a treasury bill vs treasury note vs treasury bond?',
    answer: 'Treasury bills (T-bills) mature in 1 year or less and are sold at a discount to face value. Treasury notes (T-notes) mature in 2-10 years and pay interest every 6 months. Treasury bonds (T-bonds) mature in 20-30 years and also pay semi-annual interest. All are backed by the US government, but they differ in maturity length, interest payment structure, and sensitivity to interest rate changes.',
  },
  {
    question: 'How do I invest in US Treasury bonds?',
    answer: 'You can buy Treasury securities directly from the government at TreasuryDirect.gov with no fees or commissions. You can also buy them through banks and brokers, or invest in Treasury ETFs like SHY (1-3 year), IEF (7-10 year), or TLT (20+ year). Treasury ETFs provide liquidity and diversification but charge small expense ratios. Direct purchases are best for buy-and-hold investors.',
  },
  {
    question: 'Are treasury bonds safe investments?',
    answer: 'US Treasury bonds are considered among the safest investments in the world because they are backed by the full faith and credit of the US government, which has never defaulted on its debt. However, they are not risk-free: bond prices fluctuate with interest rates (interest rate risk), and if inflation exceeds the yield, you lose purchasing power (inflation risk). For capital preservation and guaranteed returns, treasuries are excellent choices.',
  },
  {
    question: 'What is the relationship between Fed rates and treasury yields?',
    answer: 'The Federal Reserve controls short-term interest rates (like the federal funds rate), which directly influences short-term treasury yields (1-month to 2-year). Longer-term treasury yields (10-year, 30-year) are set by market forces based on inflation expectations and economic outlook. When the Fed raises rates, short-term yields rise immediately, while long-term yields may rise less or even fall if investors expect slower future growth.',
  },
  {
    question: 'How does inflation affect bond yields?',
    answer: 'Inflation erodes the purchasing power of fixed bond payments, so investors demand higher yields to compensate for inflation risk. When inflation expectations rise, bond yields increase to provide real (inflation-adjusted) returns. The 10-year treasury yield typically includes a premium for expected inflation over the next decade. When inflation falls, bond yields often decline as well. Compare treasury yields to inflation rates to determine real returns.',
  },
  {
    question: 'What does an inverted yield curve predict?',
    answer: 'An inverted yield curve (when short-term rates exceed long-term rates) has predicted every US recession since 1950, with only one false signal. The 2-year vs 10-year spread is most closely watched. Inversion suggests investors expect the Federal Reserve to cut rates in the future due to economic weakness. However, there is typically a 12-24 month lag between inversion and recession, and markets can remain strong during this period.',
  },
  {
    question: 'How do treasury yields affect mortgage rates?',
    answer: 'Mortgage rates closely track the 10-year treasury yield, typically trading 1.5-2 percentage points higher to compensate lenders for credit risk and prepayment risk. When the 10-year treasury yield rises, mortgage rates usually follow, making homes less affordable. When treasury yields fall, mortgage rates decline, boosting housing demand. This is why the Federal Reserve watches housing markets closely when setting interest rate policy.',
  },
]

export default async function BondsPage() {
  const treasuryData = await getTreasuryData()
  const pageUrl = `${SITE_URL}/bonds`

  // Get key yields for description
  const y10 = treasuryData.yieldCurve.find((y: any) => y.maturity === '10Y')
  const y2 = treasuryData.yieldCurve.find((y: any) => y.maturity === '2Y')
  const y30 = treasuryData.yieldCurve.find((y: any) => y.maturity === '30Y')

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Bonds & Treasury Yields', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'US Treasury Yields & Bond Rates - Live Yield Curve Data',
    description: 'Track current US Treasury yields including 10 year treasury rate, 2 year, 30 year, and complete yield curve. Understand bond markets and interest rates.',
    url: pageUrl,
    keywords: [
      'treasury yields',
      '10 year treasury rate',
      'bond yields',
      'yield curve',
      'interest rates',
    ],
  })

  const faqSchema = getFAQSchema(bondFAQs)

  // Calculate max yield for chart scaling
  const maxYield = Math.max(...treasuryData.yieldCurve.map((y: any) => y.yield))
  const minYield = Math.min(...treasuryData.yieldCurve.map((y: any) => y.yield))

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, articleSchema, faqSchema]),
        }}
      />
      <main className="min-h-screen bg-background text-foreground pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Sidebar - hidden on mobile, shown on lg+ */}
            <div className="hidden lg:block">
              <SEOSidebar />
            </div>
            <div className="flex-1 min-w-0">
          {/* Breadcrumbs */}
          <nav className="text-sm text-muted-foreground mb-4 sm:mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            {' / '}
            <span className="text-foreground">Bonds & Treasury Yields</span>
          </nav>

          {/* Hero Section */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              US Treasury Yields & Bond Rates
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl">
              Live treasury bond yields and interest rates. Track the 10 year treasury rate,
              yield curve, and all US government bond rates updated daily.
            </p>
          </div>

          {/* Current Yield Highlights */}
          <section className="mb-8 sm:mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {[
                { label: '2 Year', data: y2 },
                { label: '10 Year', data: y10 },
                { label: '30 Year', data: y30 },
                {
                  label: '10Y-2Y Spread',
                  data: {
                    yield: ((y10?.yield || 0) - (y2?.yield || 0)),
                    name: treasuryData.inverted ? 'INVERTED' : 'NORMAL',
                  },
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-card p-4 sm:p-6 rounded-xl border border-border"
                >
                  <div className="text-xs sm:text-sm text-muted-foreground mb-2">
                    {item.label}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-green-500">
                    {item.data?.yield?.toFixed(2)}%
                  </div>
                  {idx === 3 && (
                    <div
                      className={`text-xs mt-2 font-medium ${
                        treasuryData.inverted
                          ? 'text-red-500'
                          : 'text-green-500'
                      }`}
                    >
                      {item.data?.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Complete Yield Curve */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
              Current Treasury Yield Curve
            </h2>
            <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
              {/* Yield Curve Visualization */}
              <div className="mb-6">
                <div className="relative h-48 sm:h-64 flex items-end justify-around gap-1 sm:gap-2">
                  {treasuryData.yieldCurve.map((item: any, idx: number) => {
                    const heightPercent =
                      ((item.yield - minYield) / (maxYield - minYield)) * 100
                    return (
                      <div
                        key={idx}
                        className="flex flex-col items-center flex-1"
                      >
                        <div className="text-xs text-muted-foreground mb-2">
                          {item.yield.toFixed(2)}%
                        </div>
                        <div
                          className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg transition-all hover:from-green-500 hover:to-green-300"
                          style={{ height: `${Math.max(heightPercent, 10)}%` }}
                        />
                        <div className="text-xs font-medium mt-2">
                          {item.maturity}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Yield Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {treasuryData.yieldCurve.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-background rounded-lg"
                  >
                    <span className="font-medium text-sm">{item.name}</span>
                    <span className="text-green-500 font-bold text-sm">
                      {item.yield.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>

              {treasuryData.inverted && (
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-xl sm:text-2xl">⚠️</span>
                    <div>
                      <h3 className="font-bold text-red-500 mb-1 text-sm sm:text-base">
                        Inverted Yield Curve
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        The yield curve is currently inverted (short-term rates
                        exceed long-term rates). Historically, this has been a
                        reliable predictor of economic recessions within 12-24
                        months.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* What Are Treasury Bonds */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
              Understanding US Treasury Bonds
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
                <h3 className="text-lg sm:text-xl font-bold mb-3 text-green-500">
                  What Are Treasury Yields?
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  Treasury yields are the interest rates paid on US government
                  debt securities. They represent the return investors receive
                  for lending money to the federal government. Yields move
                  inversely to bond prices and reflect market expectations for
                  inflation, economic growth, and Federal Reserve policy.
                </p>
                <ul className="list-disc list-inside text-sm sm:text-base text-muted-foreground space-y-2">
                  <li>Risk-free benchmark rates</li>
                  <li>Backed by US government</li>
                  <li>Inversely related to bond prices</li>
                  <li>Reflect inflation expectations</li>
                </ul>
              </div>

              <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
                <h3 className="text-lg sm:text-xl font-bold mb-3 text-green-500">
                  Types of Treasury Securities
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm mb-1">
                      Treasury Bills (T-Bills)
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Mature in 1 year or less. Sold at discount to face value.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm mb-1">
                      Treasury Notes (T-Notes)
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Mature in 2-10 years. Pay interest every 6 months.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm mb-1">
                      Treasury Bonds (T-Bonds)
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Mature in 20-30 years. Highest long-term yields.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Why Treasury Yields Matter */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
              Why Treasury Yields Matter for Investors
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
                <div className="text-2xl sm:text-3xl mb-3">📈</div>
                <h3 className="text-base sm:text-lg font-bold mb-2">Stock Valuations</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Rising treasury yields increase the discount rate used to
                  value stocks, often pressuring equity valuations. Growth
                  stocks are especially sensitive to yield changes.
                </p>
              </div>

              <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
                <div className="text-2xl sm:text-3xl mb-3">🏠</div>
                <h3 className="text-base sm:text-lg font-bold mb-2">Mortgage Rates</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  The 10-year treasury rate is the primary benchmark for
                  30-year mortgage rates. When the 10-year yield rises, home
                  borrowing costs increase.
                </p>
              </div>

              <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
                <div className="text-2xl sm:text-3xl mb-3">💼</div>
                <h3 className="text-base sm:text-lg font-bold mb-2">Corporate Bonds</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Corporate bond yields are priced relative to treasuries.
                  Rising treasury yields force companies to pay higher interest
                  on new debt issuance.
                </p>
              </div>

              <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
                <div className="text-2xl sm:text-3xl mb-3">🌍</div>
                <h3 className="text-base sm:text-lg font-bold mb-2">Dollar Strength</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Higher US treasury yields attract foreign investment, often
                  strengthening the dollar. This impacts international trade
                  and corporate earnings.
                </p>
              </div>

              <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
                <div className="text-2xl sm:text-3xl mb-3">📊</div>
                <h3 className="text-base sm:text-lg font-bold mb-2">Economic Indicator</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  The yield curve shape predicts economic conditions. An
                  inverted curve (short rates above long rates) often precedes
                  recessions.
                </p>
              </div>

              <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
                <div className="text-2xl sm:text-3xl mb-3">💰</div>
                <h3 className="text-base sm:text-lg font-bold mb-2">Alternative to Stocks</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  When treasury yields are high, bonds become more attractive
                  relative to stocks, potentially pulling investment away from
                  equities.
                </p>
              </div>
            </div>
          </section>

          {/* How to Interpret the Yield Curve */}
          <section className="mb-8 sm:mb-12 bg-card p-4 sm:p-6 lg:p-8 rounded-xl border border-border">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
              How to Interpret the Yield Curve
            </h2>
            <div className="space-y-4 sm:space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                    ↗
                  </div>
                  <h3 className="text-base sm:text-xl font-bold">Normal Yield Curve</h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground ml-0 sm:ml-15">
                  Long-term rates exceed short-term rates (slopes upward).
                  Indicates healthy economic expectations with moderate growth
                  and inflation. Investors demand higher compensation for
                  long-term risk. This is the most common and healthy curve
                  shape.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                    →
                  </div>
                  <h3 className="text-base sm:text-xl font-bold">Flat Yield Curve</h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground ml-0 sm:ml-15">
                  Short and long-term rates are similar (flat line). Often
                  occurs during transition periods when the Fed is hiking rates
                  but long-term growth concerns persist. Can signal economic
                  uncertainty and often precedes either inversion or
                  steepening.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl">
                    ↘
                  </div>
                  <h3 className="text-base sm:text-xl font-bold">Inverted Yield Curve</h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground ml-0 sm:ml-15">
                  Short-term rates exceed long-term rates (slopes downward).
                  Has predicted every US recession since 1950. Suggests
                  investors expect the Federal Reserve to cut rates due to
                  economic weakness. Markets often remain strong for 12-24
                  months after inversion before recession hits.
                </p>
              </div>
            </div>
          </section>

          {/* Bond Investment Strategies */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
              Bond Investment Strategies
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
                <div className="text-2xl sm:text-3xl mb-3">🎯</div>
                <h3 className="text-base sm:text-lg font-bold mb-2">Buy and Hold</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Purchase treasuries and hold until maturity. Provides
                  predictable income and return of principal. Best for capital
                  preservation and income generation.
                </p>
              </div>

              <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
                <div className="text-2xl sm:text-3xl mb-3">⏰</div>
                <h3 className="text-base sm:text-lg font-bold mb-2">Laddering</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Buy bonds with staggered maturities (e.g., 1, 3, 5, 10 years).
                  Provides liquidity as bonds mature regularly while capturing
                  different interest rates.
                </p>
              </div>

              <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
                <div className="text-2xl sm:text-3xl mb-3">📊</div>
                <h3 className="text-base sm:text-lg font-bold mb-2">Duration Targeting</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Match bond duration to investment time horizon. Longer
                  duration = higher interest rate risk but higher yields.
                  Shorter duration = lower risk, lower returns.
                </p>
              </div>

              <div className="bg-card p-4 sm:p-6 rounded-xl border border-border">
                <div className="text-2xl sm:text-3xl mb-3">🔄</div>
                <h3 className="text-base sm:text-lg font-bold mb-2">Bond ETFs</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Invest in treasury ETFs for instant diversification and
                  liquidity. Popular options: SHY (1-3 year), IEF (7-10 year),
                  TLT (20+ year).
                </p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {bondFAQs.map((faq, index) => (
                <details
                  key={index}
                  className="bg-card p-4 sm:p-6 rounded-xl border border-border group"
                >
                  <summary className="text-base sm:text-lg font-bold cursor-pointer list-none flex items-center justify-between gap-4">
                    <span className="flex-1">{faq.question}</span>
                    <span className="text-green-500 group-open:rotate-180 transition-transform flex-shrink-0">
                      ▼
                    </span>
                  </summary>
                  <p className="text-sm sm:text-base text-muted-foreground mt-3 sm:mt-4 leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* Related Links */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
              Related Market Research Tools
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Link
                href="/markets"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-xl sm:text-2xl mb-2">📊</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors text-sm sm:text-base">
                  Market Movers
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Top gainers and losers
                </p>
              </Link>

              <Link
                href="/sectors"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-xl sm:text-2xl mb-2">🏢</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors text-sm sm:text-base">
                  Sectors
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Browse by industry
                </p>
              </Link>

              <Link
                href="/earnings"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-xl sm:text-2xl mb-2">📅</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors text-sm sm:text-base">
                  Earnings Calendar
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Upcoming earnings
                </p>
              </Link>

              <Link
                href="/dashboard"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-xl sm:text-2xl mb-2">🔍</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors text-sm sm:text-base">
                  Stock Analysis
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  AI-powered research
                </p>
              </Link>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 sm:p-8 lg:p-12 rounded-xl text-white text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
              Analyze Stocks with AI-Powered Research
            </h2>
            <p className="text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 opacity-90 max-w-2xl mx-auto">
              Understanding bond yields is crucial for stock valuation. Use our
              AI-powered platform to analyze how interest rates affect your
              stock portfolio with DCF valuations, risk analysis, and more.
            </p>
            <Link
              href="/dashboard"
              className="inline-block w-full sm:w-auto bg-white text-green-600 hover:bg-gray-100 px-6 sm:px-8 py-3 rounded-lg font-bold transition-colors"
            >
              Start Analyzing Stocks Free
            </Link>
          </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
