import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { INDUSTRIES, INDUSTRY_NAMES, SECTORS, SECTOR_NAMES } from '@/lib/sectors'
import { YEARS } from '@/lib/stocks-full'

export const dynamic = 'force-static'
export const revalidate = 86400

type Props = {
  params: Promise<{ industry: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { industry } = await params
  if (!INDUSTRIES.includes(industry)) return { title: 'Not Found' }

  const name = INDUSTRY_NAMES[industry] || industry
  const title = `${name} Stocks | Top ${name} Companies to Buy`
  const description = `Best ${name} stocks ranked by performance. Compare ${name} industry companies by market cap, growth, and valuation metrics.`

  return {
    title,
    description,
    openGraph: { title, description },
    alternates: { canonical: `https://lician.com/industry/${industry}` },
  }
}

export default async function IndustryPage({ params }: Props) {
  const { industry } = await params
  if (!INDUSTRIES.includes(industry)) notFound()

  const name = INDUSTRY_NAMES[industry] || industry

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <nav className="text-sm mb-4">
          <Link href="/" className="text-blue-600 hover:underline">Home</Link>
          {' > '}
          <Link href="/industries" className="text-blue-600 hover:underline">Industries</Link>
          {' > '}
          <span className="text-gray-600">{name}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-4">{name} Industry Stocks</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Complete list of {name} stocks with analysis. Find the best {name} companies
          to invest in based on fundamentals and growth potential.
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Historical Performance</h2>
          <div className="flex flex-wrap gap-2">
            {YEARS.map(year => (
              <Link
                key={year}
                href={`/industry/${industry}/${year}`}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-blue-100 text-sm"
              >
                {year}
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Related Industries</h2>
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.filter(i => i !== industry).slice(0, 20).map(i => (
              <Link
                key={i}
                href={`/industry/${i}`}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-blue-100 text-sm"
              >
                {INDUSTRY_NAMES[i]}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
