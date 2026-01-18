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
    <div className="min-h-screen bg-black">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <nav className="text-sm mb-4">
          <Link href="/" className="text-[#479ffa] hover:text-[#479ffa]/80 motion-safe:transition-colors motion-safe:duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded">Home</Link>
          {' > '}
          <Link href="/rankings" className="text-[#479ffa] hover:text-[#479ffa]/80 motion-safe:transition-colors motion-safe:duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded">Rankings</Link>
          {' > '}
          <span className="text-[#868f97]">{name}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-4 text-balance">Top Stocks by {name}</h1>
        <p className="text-[#868f97] mb-6">
          Stocks ranked by {name}. Find companies with the best {name} for investment opportunities.
        </p>

        <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-balance">Filter by Sector</h2>
          <div className="flex flex-wrap gap-2">
            {SECTORS.map(sector => (
              <Link
                key={sector}
                href={`/top/${metric}/${sector}`}
                className="px-3 py-1 bg-white/[0.03] border border-white/[0.08] rounded-lg hover:bg-white/[0.05] hover:border-white/[0.15] text-sm motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
              >
                {SECTOR_NAMES[sector]}
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-balance">Historical Rankings</h2>
          <div className="flex flex-wrap gap-2">
            {YEARS.map(year => (
              <Link
                key={year}
                href={`/top/${metric}?year=${year}`}
                className="px-3 py-1 bg-white/[0.03] border border-white/[0.08] rounded-lg hover:bg-white/[0.05] hover:border-white/[0.15] text-sm tabular-nums motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
              >
                {year}
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-balance">Other Rankings</h2>
          <div className="flex flex-wrap gap-2">
            {RANKING_METRICS.filter(m => m !== metric).slice(0, 15).map(m => (
              <Link
                key={m}
                href={`/top/${m}`}
                className="px-3 py-1 bg-white/[0.03] border border-white/[0.08] rounded-lg hover:bg-white/[0.05] hover:border-white/[0.15] text-sm motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
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
