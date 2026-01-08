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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <nav className="text-sm mb-4">
          <Link href="/" className="text-blue-600 hover:underline">Home</Link>
          {' > '}
          <Link href={`/sector/${sector}`} className="text-blue-600 hover:underline">{name}</Link>
          {' > '}
          <span className="text-gray-600">{year}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-4">{name} Sector Performance {year}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Historical analysis of {name} sector stocks in {year}. Review top performers,
          sector returns, and key events that shaped the {name} market.
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{year} Highlights</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Performance data for {name} sector during {year}.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Other Years</h2>
          <div className="flex flex-wrap gap-2">
            {YEARS.filter(y => y !== year).map(y => (
              <Link
                key={y}
                href={`/sector/${sector}/${y}`}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-blue-100 text-sm"
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
