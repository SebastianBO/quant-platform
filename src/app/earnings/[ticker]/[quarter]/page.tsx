import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ALL_STOCKS_FULL, QUARTERS } from '@/lib/stocks-full'

export const dynamic = 'force-static'
export const revalidate = 86400

type Props = {
  params: Promise<{ ticker: string; quarter: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker, quarter } = await params
  const t = ticker.toUpperCase()

  if (!ALL_STOCKS_FULL.includes(t) || !QUARTERS.includes(quarter)) {
    return { title: 'Not Found' }
  }

  const [year, q] = quarter.split('-')
  const qName = `Q${q.replace('Q', '')} ${year}`

  const title = `${t} Earnings ${qName} | Quarterly Results & Analysis`
  const description = `${t} ${qName} earnings report: EPS, revenue, guidance, analyst estimates, and earnings call highlights. Historical quarterly performance data.`

  return {
    title,
    description,
    openGraph: { title, description },
    alternates: {
      canonical: `https://lician.com/earnings/${ticker.toLowerCase()}/${quarter}`,
    },
  }
}

export default async function QuarterlyEarningsPage({ params }: Props) {
  const { ticker, quarter } = await params
  const t = ticker.toUpperCase()

  if (!ALL_STOCKS_FULL.includes(t) || !QUARTERS.includes(quarter)) {
    notFound()
  }

  const [year, q] = quarter.split('-')
  const qName = `Q${q.replace('Q', '')} ${year}`

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <nav className="text-sm mb-4">
          <Link href="/" className="text-blue-600 hover:underline">Home</Link>
          {' > '}
          <Link href={`/stock/${ticker.toLowerCase()}`} className="text-blue-600 hover:underline">
            {t}
          </Link>
          {' > '}
          <Link href={`/earnings/${ticker.toLowerCase()}`} className="text-blue-600 hover:underline">
            Earnings
          </Link>
          {' > '}
          <span className="text-gray-600 dark:text-gray-400">{qName}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-4">
          {t} Earnings {qName}
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Detailed earnings analysis for {t} in {qName}. Review EPS, revenue,
          guidance, and compare to analyst estimates.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Earnings Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Quarter</span>
                <span className="font-medium">{qName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Stock</span>
                <span className="font-medium">{t}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              EPS, revenue, and guidance data for this quarter.
            </p>
            <Link
              href={`/stock/${ticker.toLowerCase()}`}
              className="text-blue-600 hover:underline text-sm mt-2 inline-block"
            >
              View full {t} profile &rarr;
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Other Quarters</h2>
          <div className="flex flex-wrap gap-2">
            {QUARTERS.filter(q => q !== quarter).slice(-12).map(q => (
              <Link
                key={q}
                href={`/earnings/${ticker.toLowerCase()}/${q}`}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-blue-100 dark:hover:bg-blue-900 transition text-sm"
              >
                {q}
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link
            href={`/earnings/${ticker.toLowerCase()}`}
            className="text-blue-600 hover:underline"
          >
            View all {t} earnings history &rarr;
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
