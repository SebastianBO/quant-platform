import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { SECTORS, SECTOR_NAMES } from '@/lib/sectors'
import { YEARS } from '@/lib/stocks-full'

export const dynamic = 'force-static'
export const revalidate = 86400

type Props = {
  params: Promise<{ sector: string; year: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sector, year } = await params
  if (!SECTORS.includes(sector) || !YEARS.includes(year)) return { title: 'Not Found' }

  const name = SECTOR_NAMES[sector] || sector
  const title = `${name} Stocks ${year} | Historical Sector Performance`
  const description = `${name} sector performance in ${year}. Top gainers, losers, and key metrics for ${name} stocks during ${year}.`

  return {
    title,
    description,
    openGraph: { title, description },
    alternates: { canonical: `https://lician.com/sector/${sector}/${year}` },
  }
}

export default async function SectorYearPage({ params }: Props) {
  const { sector, year } = await params
  if (!SECTORS.includes(sector) || !YEARS.includes(year)) notFound()

  const name = SECTOR_NAMES[sector] || sector

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <nav className="text-sm mb-4">
          <Link href="/" className="text-[#479ffa] hover:text-[#479ffa]/80 motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]">Home</Link>
          {' > '}
          <Link href={`/sector/${sector}`} className="text-[#479ffa] hover:text-[#479ffa]/80 motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]">{name}</Link>
          {' > '}
          <span className="text-[#868f97]">{year}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-4 text-balance">{name} Sector Performance {year}</h1>
        <p className="text-[#868f97] mb-6">
          Historical analysis of {name} sector stocks in {year}. Review top performers,
          sector returns, and key events that shaped the {name} market.
        </p>

        <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 mb-6 motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-white/[0.15]">
          <h2 className="text-xl font-semibold mb-4 text-balance">{year} Highlights</h2>
          <p className="text-[#868f97]">
            Performance data for {name} sector during {year}.
          </p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 mb-6 motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-white/[0.15]">
          <h2 className="text-xl font-semibold mb-4 text-balance">Other Years</h2>
          <div className="flex flex-wrap gap-2">
            {YEARS.filter(y => y !== year).map(y => (
              <Link
                key={y}
                href={`/sector/${sector}/${y}`}
                className="px-3 py-1 bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl text-sm motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-white/[0.15] focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
              >
                {y}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
