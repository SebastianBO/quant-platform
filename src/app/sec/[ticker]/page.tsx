import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} SEC Filings - 10-K, 10-Q, 8-K & Form 4`,
    description: `${symbol} SEC filings including 10-K annual reports, 10-Q quarterly reports, 8-K current reports, and Form 4 insider transactions. Access EDGAR filings.`,
    keywords: [
      `${symbol} SEC filings`,
      `${symbol} 10-K`,
      `${symbol} 10-Q`,
      `${symbol} 8-K`,
      `${symbol} annual report`,
      `${symbol} EDGAR`,
      `${symbol} form 4`,
    ],
    openGraph: {
      title: `${symbol} SEC Filings | 10-K, 10-Q, 8-K Reports`,
      description: `Access ${symbol} SEC EDGAR filings including annual and quarterly reports.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/sec/${ticker.toLowerCase()}`,
    },
  }
}

async function getStockData(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${ticker}`,
      { next: { revalidate: 3600 } }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

async function getSECFilings(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/sec-filings?ticker=${ticker}`,
      { next: { revalidate: 3600 } }
    )
    if (!response.ok) return []
    const data = await response.json()
    return data.filings || data || []
  } catch {
    return []
  }
}

export default async function SECPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const [stockData, secFilings] = await Promise.all([
    getStockData(symbol),
    getSECFilings(symbol)
  ])

  if (!stockData?.snapshot) notFound()

  const { companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const cik = companyFacts?.cik
  const pageUrl = `${SITE_URL}/sec/${ticker.toLowerCase()}`

  // Categorize filings
  const filings = secFilings.slice(0, 30)
  const annualReports = filings.filter((f: any) => f.form === '10-K' || f.formType === '10-K')
  const quarterlyReports = filings.filter((f: any) => f.form === '10-Q' || f.formType === '10-Q')
  const currentReports = filings.filter((f: any) => f.form === '8-K' || f.formType === '8-K')
  const insiderFilings = filings.filter((f: any) => f.form === '4' || f.formType === '4')

  const secFaqs = [
    {
      question: `Where can I find ${symbol} SEC filings?`,
      answer: `${symbol} SEC filings are available on this page and through the SEC EDGAR database. ${cik ? `${companyName}'s CIK number is ${cik}.` : ''} Key filings include 10-K (annual), 10-Q (quarterly), and 8-K (current events).`
    },
    {
      question: `What is ${symbol} 10-K filing?`,
      answer: `The 10-K is ${symbol}'s annual report filed with the SEC. It contains comprehensive financial information including audited financial statements, business overview, risk factors, and management discussion & analysis (MD&A).`
    },
    {
      question: `What is ${symbol} 10-Q filing?`,
      answer: `The 10-Q is ${symbol}'s quarterly report filed with the SEC after each of the first three fiscal quarters. It includes unaudited financial statements and updated disclosures.`
    },
    {
      question: `What are ${symbol} Form 4 filings?`,
      answer: `Form 4 filings disclose ${symbol} insider transactions - stock purchases and sales by company executives, directors, and major shareholders. These must be filed within 2 business days of the transaction.`
    },
    {
      question: `What is ${symbol} 8-K filing?`,
      answer: `8-K filings report material events at ${symbol} that shareholders should know about, such as acquisitions, executive changes, earnings announcements, or other significant developments.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'SEC Filings', url: `${SITE_URL}/sec` },
      { name: `${symbol} Filings`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} SEC Filings - 10-K, 10-Q, 8-K Reports`,
      description: `SEC EDGAR filings for ${symbol} (${companyName}) including annual and quarterly reports.`,
      url: pageUrl,
      keywords: [`${symbol} SEC filings`, `${symbol} 10-K`, `${symbol} 10-Q`, `${symbol} 8-K`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(secFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <span>{symbol} SEC Filings</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} SEC Filings</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - 10-K, 10-Q, 8-K & Form 4 filings</p>

          {/* Company Info */}
          <div className="bg-card p-6 rounded-lg border border-border mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Company</p>
                <p className="font-bold">{companyName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ticker</p>
                <p className="font-bold">{symbol}</p>
              </div>
              {cik && (
                <div>
                  <p className="text-sm text-muted-foreground">CIK</p>
                  <p className="font-bold">{cik}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Total Filings</p>
                <p className="font-bold">{filings.length}+</p>
              </div>
            </div>
          </div>

          {/* Filing Types */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30 text-center">
              <p className="text-2xl font-bold">{annualReports.length}</p>
              <p className="text-sm text-muted-foreground">10-K Annual</p>
            </div>
            <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/30 text-center">
              <p className="text-2xl font-bold">{quarterlyReports.length}</p>
              <p className="text-sm text-muted-foreground">10-Q Quarterly</p>
            </div>
            <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/30 text-center">
              <p className="text-2xl font-bold">{currentReports.length}</p>
              <p className="text-sm text-muted-foreground">8-K Current</p>
            </div>
            <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/30 text-center">
              <p className="text-2xl font-bold">{insiderFilings.length}</p>
              <p className="text-sm text-muted-foreground">Form 4 Insider</p>
            </div>
          </div>

          {/* Recent Filings */}
          {filings.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Recent SEC Filings</h2>
              <div className="space-y-3">
                {filings.slice(0, 15).map((filing: any, i: number) => (
                  <a
                    key={i}
                    href={filing.url || filing.filingUrl || `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cik}&type=${filing.form || filing.formType}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-card p-4 rounded-lg border border-border hover:border-green-500/50"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold mr-3 ${
                          (filing.form || filing.formType) === '10-K' ? 'bg-blue-500/20 text-blue-400' :
                          (filing.form || filing.formType) === '10-Q' ? 'bg-green-500/20 text-green-400' :
                          (filing.form || filing.formType) === '8-K' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {filing.form || filing.formType}
                        </span>
                        <span className="font-medium">{filing.description || filing.primaryDocument || 'SEC Filing'}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{filing.filedAt || filing.filingDate || filing.date}</span>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {filings.length === 0 && (
            <div className="bg-card p-8 rounded-lg border border-border text-center mb-12">
              <p className="text-muted-foreground">Loading SEC filings for {symbol}...</p>
              <a
                href={`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=${encodeURIComponent(companyName)}&type=&dateb=&owner=include&count=40`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 text-green-500 hover:underline"
              >
                View on SEC EDGAR →
              </a>
            </div>
          )}

          {/* SEC EDGAR Link */}
          <section className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">View All {symbol} Filings on SEC EDGAR</h2>
            <p className="text-muted-foreground mb-6">Access the official SEC database for complete filing history</p>
            <a
              href={cik ? `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cik}&type=&dateb=&owner=include&count=40` : `https://www.sec.gov/cgi-bin/browse-edgar?company=${encodeURIComponent(symbol)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
            >
              Open SEC EDGAR
            </a>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {secFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
