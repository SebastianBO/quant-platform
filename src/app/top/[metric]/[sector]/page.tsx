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
    <div className="min-h-dvh bg-black">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <nav className="text-sm mb-4">
          <Link href="/" className="motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] rounded" style={{ color: '#479ffa' }}>Home</Link>
          {' > '}
          <Link href={`/top/${metric}`} className="motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] rounded" style={{ color: '#479ffa' }}>{metricName}</Link>
          {' > '}
          <span style={{ color: '#868f97' }}>{sectorName}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-4 text-balance">Top {sectorName} Stocks by {metricName}</h1>
        <p className="mb-6" style={{ color: '#868f97' }}>
          {sectorName} stocks ranked by {metricName}. Discover the best performers in the sector.
        </p>

        <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-balance">Other Sectors</h2>
          <div className="flex flex-wrap gap-2">
            {SECTORS.filter(s => s !== sector).map(s => (
              <Link
                key={s}
                href={`/top/${metric}/${s}`}
                className="px-3 py-1 bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] text-sm"
              >
                {SECTOR_NAMES[s]}
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-balance">Other Metrics</h2>
          <div className="flex flex-wrap gap-2">
            {RANKING_METRICS.filter(m => m !== metric).slice(0, 12).map(m => (
              <Link
                key={m}
                href={`/top/${m}/${sector}`}
                className="px-3 py-1 bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] text-sm"
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
