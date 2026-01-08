import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { RANKING_METRICS, METRIC_NAMES, SECTORS, SECTOR_NAMES } from '@/lib/sectors'
import { YEARS } from '@/lib/stocks-full'

export const dynamic = 'force-static'
export const revalidate = 86400

type Props = {
  params: Promise<{ metric: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { metric } = await params
  if (!RANKING_METRICS.includes(metric)) return { title: 'Not Found' }

  const name = METRIC_NAMES[metric] || metric
  const title = `Top Stocks by ${name} | Best ${name} Stocks 2026`
  const description = `Stocks with the highest ${name}. Ranked list of top companies by ${name} with analysis and comparison.`

  return {
    title,
    description,
    openGraph: { title, description },
    alternates: { canonical: `https://lician.com/top/${metric}` },
  }
}

export default async function TopMetricPage({ params }: Props) {
  const { metric } = await params
  if (!RANKING_METRICS.includes(metric)) notFound()

  const name = METRIC_NAMES[metric] || metric

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <nav className="text-sm mb-4">
          <Link href="/" className="text-blue-600 hover:underline">Home</Link>
          {' > '}
          <Link href="/rankings" className="text-blue-600 hover:underline">Rankings</Link>
          {' > '}
          <span className="text-gray-600">{name}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-4">Top Stocks by {name}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Stocks ranked by {name}. Find companies with the best {name} for investment opportunities.
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Filter by Sector</h2>
          <div className="flex flex-wrap gap-2">
            {SECTORS.map(sector => (
              <Link
                key={sector}
                href={`/top/${metric}/${sector}`}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-blue-100 text-sm"
              >
                {SECTOR_NAMES[sector]}
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Historical Rankings</h2>
          <div className="flex flex-wrap gap-2">
            {YEARS.map(year => (
              <Link
                key={year}
                href={`/top/${metric}?year=${year}`}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-blue-100 text-sm"
              >
                {year}
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Other Rankings</h2>
          <div className="flex flex-wrap gap-2">
            {RANKING_METRICS.filter(m => m !== metric).slice(0, 15).map(m => (
              <Link
                key={m}
                href={`/top/${m}`}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-blue-100 text-sm"
              >
                {METRIC_NAMES[m]}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
