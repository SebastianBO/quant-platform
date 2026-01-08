import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { INDUSTRIES, INDUSTRY_NAMES } from '@/lib/sectors'
import { YEARS } from '@/lib/stocks-full'

export const dynamic = 'force-static'
export const revalidate = 86400

type Props = {
  params: Promise<{ industry: string; year: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { industry, year } = await params
  if (!INDUSTRIES.includes(industry) || !YEARS.includes(year)) return { title: 'Not Found' }

  const name = INDUSTRY_NAMES[industry] || industry
  const title = `${name} Stocks ${year} | Historical Industry Performance`
  const description = `${name} industry performance in ${year}. Top performers and analysis for ${name} stocks during ${year}.`

  return {
    title,
    description,
    openGraph: { title, description },
    alternates: { canonical: `https://lician.com/industry/${industry}/${year}` },
  }
}

export default async function IndustryYearPage({ params }: Props) {
  const { industry, year } = await params
  if (!INDUSTRIES.includes(industry) || !YEARS.includes(year)) notFound()

  const name = INDUSTRY_NAMES[industry] || industry

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <nav className="text-sm mb-4">
          <Link href="/" className="text-blue-600 hover:underline">Home</Link>
          {' > '}
          <Link href={`/industry/${industry}`} className="text-blue-600 hover:underline">{name}</Link>
          {' > '}
          <span className="text-gray-600">{year}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-4">{name} Industry {year}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Historical performance of {name} industry stocks in {year}.
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Other Years</h2>
          <div className="flex flex-wrap gap-2">
            {YEARS.filter(y => y !== year).map(y => (
              <Link
                key={y}
                href={`/industry/${industry}/${y}`}
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
