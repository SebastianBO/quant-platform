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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <nav className="text-sm mb-4">
          <Link href="/" className="text-blue-600 hover:underline">Home</Link>
          {' > '}
          <Link href="/sectors" className="text-blue-600 hover:underline">Sectors</Link>
          {' > '}
          <span className="text-gray-600">{name}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-4">{name} Sector Stocks</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Comprehensive analysis of {name} sector stocks. Compare top companies by valuation,
          growth, and financial metrics.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Sector Overview</h2>
            <p className="text-gray-600 dark:text-gray-400">
              The {name} sector includes companies focused on {name.toLowerCase()} products and services.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Companies</span>
                <span className="font-medium">500+</span>
              </div>
              <div className="flex justify-between">
                <span>Avg P/E Ratio</span>
                <span className="font-medium">--</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Historical Performance</h2>
          <div className="flex flex-wrap gap-2">
            {YEARS.map(year => (
              <Link
                key={year}
                href={`/sector/${sector}/${year}`}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-blue-100 text-sm"
              >
                {year}
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">All Sectors</h2>
          <div className="flex flex-wrap gap-2">
            {SECTORS.filter(s => s !== sector).map(s => (
              <Link
                key={s}
                href={`/sector/${s}`}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-blue-100 text-sm"
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
