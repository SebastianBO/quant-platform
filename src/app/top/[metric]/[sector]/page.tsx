import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { RANKING_METRICS, METRIC_NAMES, SECTORS, SECTOR_NAMES } from '@/lib/sectors'

export const dynamic = 'force-static'
export const revalidate = 86400

type Props = {
  params: Promise<{ metric: string; sector: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { metric, sector } = await params
  if (!RANKING_METRICS.includes(metric) || !SECTORS.includes(sector)) {
    return { title: 'Not Found' }
  }

  const metricName = METRIC_NAMES[metric] || metric
  const sectorName = SECTOR_NAMES[sector] || sector
  const title = `Top ${sectorName} Stocks by ${metricName}`
  const description = `Best ${sectorName} stocks ranked by ${metricName}. Find top ${sectorName} companies with highest ${metricName}.`

  return {
    title,
    description,
    openGraph: { title, description },
    alternates: { canonical: `https://lician.com/top/${metric}/${sector}` },
  }
}

export default async function TopMetricSectorPage({ params }: Props) {
  const { metric, sector } = await params
  if (!RANKING_METRICS.includes(metric) || !SECTORS.includes(sector)) notFound()

  const metricName = METRIC_NAMES[metric] || metric
  const sectorName = SECTOR_NAMES[sector] || sector

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <nav className="text-sm mb-4">
          <Link href="/" className="text-blue-600 hover:underline">Home</Link>
          {' > '}
          <Link href={`/top/${metric}`} className="text-blue-600 hover:underline">{metricName}</Link>
          {' > '}
          <span className="text-gray-600">{sectorName}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-4">Top {sectorName} Stocks by {metricName}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {sectorName} stocks ranked by {metricName}. Discover the best performers in the sector.
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Other Sectors</h2>
          <div className="flex flex-wrap gap-2">
            {SECTORS.filter(s => s !== sector).map(s => (
              <Link
                key={s}
                href={`/top/${metric}/${s}`}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-blue-100 text-sm"
              >
                {SECTOR_NAMES[s]}
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Other Metrics</h2>
          <div className="flex flex-wrap gap-2">
            {RANKING_METRICS.filter(m => m !== metric).slice(0, 12).map(m => (
              <Link
                key={m}
                href={`/top/${m}/${sector}`}
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
