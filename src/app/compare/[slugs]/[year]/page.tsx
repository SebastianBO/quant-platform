import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { YEARS } from '@/lib/stocks-full'

export const dynamic = 'force-static'
export const revalidate = 86400

type Props = {
  params: Promise<{ slugs: string; year: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slugs, year } = await params
  const [ticker1, ticker2] = slugs.split('-vs-')

  if (!ticker1 || !ticker2 || !YEARS.includes(year)) {
    return { title: 'Not Found' }
  }

  const t1 = ticker1.toUpperCase()
  const t2 = ticker2.toUpperCase()
  const title = `${t1} vs ${t2} Stock Comparison ${year} | Historical Analysis`
  const description = `Compare ${t1} and ${t2} stock performance in ${year}. Historical PE ratio, revenue, earnings, market cap, and stock price comparison for ${year}.`

  return {
    title,
    description,
    openGraph: { title, description },
    alternates: {
      canonical: `https://lician.com/compare/${slugs}/${year}`,
    },
  }
}

export default async function HistoricalComparisonPage({ params }: Props) {
  const { slugs, year } = await params
  const [ticker1, ticker2] = slugs.split('-vs-')

  if (!ticker1 || !ticker2 || !YEARS.includes(year)) {
    notFound()
  }

  const t1 = ticker1.toUpperCase()
  const t2 = ticker2.toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <nav className="text-sm mb-4">
          <Link href="/" className="text-blue-600 hover:underline">Home</Link>
          {' > '}
          <Link href={`/compare/${slugs}`} className="text-blue-600 hover:underline">
            {t1} vs {t2}
          </Link>
          {' > '}
          <span className="text-gray-600 dark:text-gray-400">{year}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-4">
          {t1} vs {t2} Stock Comparison ({year})
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Historical comparison of {t1} and {t2} stocks for the year {year}.
          Analyze how these companies performed against each other in terms of
          valuation, growth, and market performance.
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{year} Performance Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
              <h3 className="font-medium text-lg mb-2">{t1}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View detailed {year} metrics for {t1}
              </p>
              <Link
                href={`/stock/${ticker1.toLowerCase()}`}
                className="text-blue-600 hover:underline text-sm"
              >
                View {t1} profile &rarr;
              </Link>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
              <h3 className="font-medium text-lg mb-2">{t2}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View detailed {year} metrics for {t2}
              </p>
              <Link
                href={`/stock/${ticker2.toLowerCase()}`}
                className="text-blue-600 hover:underline text-sm"
              >
                View {t2} profile &rarr;
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Other Years</h2>
          <div className="flex flex-wrap gap-2">
            {YEARS.filter(y => y !== year).map(y => (
              <Link
                key={y}
                href={`/compare/${slugs}/${y}`}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-blue-100 dark:hover:bg-blue-900 transition"
              >
                {y}
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            href={`/compare/${slugs}`}
            className="text-blue-600 hover:underline"
          >
            View current {t1} vs {t2} comparison &rarr;
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
