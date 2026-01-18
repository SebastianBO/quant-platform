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
    <div className="min-h-dvh bg-black">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8 pt-24">
        <nav className="text-sm text-[#868f97] mb-4">
          <Link href="/" className="hover:text-white motion-safe:transition-colors motion-safe:duration-150 ease-out">Home</Link>
          {' > '}
          <Link href={`/compare/${slugs}`} className="hover:text-white motion-safe:transition-colors motion-safe:duration-150 ease-out">
            {t1} vs {t2}
          </Link>
          {' > '}
          <span>{year}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-4">
          {t1} vs {t2} Stock Comparison ({year})
        </h1>

        <p className="text-[#868f97] mb-6">
          Historical comparison of {t1} and {t2} stocks for the year {year}.
          Analyze how these companies performed against each other in terms of
          valuation, growth, and market performance.
        </p>

        <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{year} Performance Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
              <h3 className="font-medium text-lg mb-2">{t1}</h3>
              <p className="text-sm text-[#868f97] mb-3">
                View detailed {year} metrics for {t1}
              </p>
              <Link
                href={`/stock/${ticker1.toLowerCase()}`}
                className="text-[#479ffa] hover:text-[#479ffa]/80 text-sm motion-safe:transition-colors motion-safe:duration-150 ease-out"
              >
                View {t1} profile →
              </Link>
            </div>
            <div className="p-4 bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
              <h3 className="font-medium text-lg mb-2">{t2}</h3>
              <p className="text-sm text-[#868f97] mb-3">
                View detailed {year} metrics for {t2}
              </p>
              <Link
                href={`/stock/${ticker2.toLowerCase()}`}
                className="text-[#479ffa] hover:text-[#479ffa]/80 text-sm motion-safe:transition-colors motion-safe:duration-150 ease-out"
              >
                View {t2} profile →
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Other Years</h2>
          <div className="flex flex-wrap gap-2">
            {YEARS.filter(y => y !== year).map(y => (
              <Link
                key={y}
                href={`/compare/${slugs}/${y}`}
                className="px-3 py-1 bg-white/[0.03] border border-white/[0.08] rounded-full hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out"
              >
                {y}
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            href={`/compare/${slugs}`}
            className="text-[#479ffa] hover:text-[#479ffa]/80 motion-safe:transition-colors motion-safe:duration-150 ease-out"
          >
            View current {t1} vs {t2} comparison →
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
