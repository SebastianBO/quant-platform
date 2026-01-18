import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { SECTORS, SECTOR_NAMES, INDUSTRIES } from '@/lib/sectors'
import { ALL_STOCKS_FULL, YEARS } from '@/lib/stocks-full'

export const dynamic = 'force-static'
export const revalidate = 86400

type Props = {
  params: Promise<{ sector: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sector } = await params
  if (!SECTORS.includes(sector)) return { title: 'Not Found' }

  const name = SECTOR_NAMES[sector] || sector
  const title = `${name} Stocks | Top ${name} Companies & Analysis`
  const description = `Discover the best ${name} stocks to buy. Compare ${name} sector companies by market cap, PE ratio, dividend yield, and growth metrics.`

  return {
    title,
    description,
    openGraph: { title, description },
    alternates: { canonical: `https://lician.com/sector/${sector}` },
  }
}

export default async function SectorPage({ params }: Props) {
  const { sector } = await params
  if (!SECTORS.includes(sector)) notFound()

  const name = SECTOR_NAMES[sector] || sector

  return (
    <div className="min-h-dvh bg-black">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <nav className="text-sm mb-4">
          <Link href="/" className="text-[#479ffa] hover:underline motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:outline-none rounded">Home</Link>
          {' > '}
          <Link href="/sectors" className="text-[#479ffa] hover:underline motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:outline-none rounded">Sectors</Link>
          {' > '}
          <span className="text-[#868f97]">{name}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-4 text-balance">{name} Sector Stocks</h1>
        <p className="text-[#868f97] mb-6">
          Comprehensive analysis of {name} sector stocks. Compare top companies by valuation,
          growth, and financial metrics.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-balance">Sector Overview</h2>
            <p className="text-[#868f97]">
              The {name} sector includes companies focused on {name.toLowerCase()} products and services.
            </p>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-balance">Key Metrics</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Companies</span>
                <span className="font-medium tabular-nums">500+</span>
              </div>
              <div className="flex justify-between">
                <span>Avg P/E Ratio</span>
                <span className="font-medium tabular-nums">--</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-balance">Historical Performance</h2>
          <div className="flex flex-wrap gap-2">
            {YEARS.map(year => (
              <Link
                key={year}
                href={`/sector/${sector}/${year}`}
                className="px-3 py-1 bg-white/[0.03] border border-white/[0.08] rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] text-sm motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:outline-none tabular-nums"
              >
                {year}
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-balance">All Sectors</h2>
          <div className="flex flex-wrap gap-2">
            {SECTORS.filter(s => s !== sector).map(s => (
              <Link
                key={s}
                href={`/sector/${s}`}
                className="px-3 py-1 bg-white/[0.03] border border-white/[0.08] rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] text-sm motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:outline-none"
              >
                {SECTOR_NAMES[s]}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
