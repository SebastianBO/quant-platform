import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { QUARTERS } from '@/lib/stocks-full'

export const dynamic = 'force-static'
export const revalidate = 86400

type Props = {
  params: Promise<{ slugs: string; quarter: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slugs, quarter } = await params
  const [ticker1, ticker2] = slugs.split('-vs-')

  if (!ticker1 || !ticker2 || !QUARTERS.includes(quarter)) {
    return { title: 'Not Found' }
  }

  const t1 = ticker1.toUpperCase()
  const t2 = ticker2.toUpperCase()
  const title = `${t1} vs ${t2} ${quarter} | Quarterly Comparison`
  const description = `Compare ${t1} and ${t2} performance in ${quarter}. Quarterly earnings, revenue, and stock performance comparison.`

  return {
    title,
    description,
    openGraph: { title, description },
    alternates: {
      canonical: `https://lician.com/compare/${slugs}/q/${quarter}`,
    },
  }
}

export default async function QuarterlyComparisonPage({ params }: Props) {
  const { slugs, quarter } = await params
  const [ticker1, ticker2] = slugs.split('-vs-')

  if (!ticker1 || !ticker2 || !QUARTERS.includes(quarter)) {
    notFound()
  }

  const t1 = ticker1.toUpperCase()
  const t2 = ticker2.toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <nav className="text-sm mb-4">
          <Link href="/" className="text-blue-600 hover:underline">Home</Link>
          {' > '}
          <Link href={`/compare/${slugs}`} className="text-blue-600 hover:underline">
            {t1} vs {t2}
          </Link>
          {' > '}
          <span className="text-gray-600">{quarter}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-4">
          {t1} vs {t2} ({quarter})
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Quarterly comparison of {t1} and {t2} for {quarter}.
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Other Quarters</h2>
          <div className="flex flex-wrap gap-2">
            {QUARTERS.filter(q => q !== quarter).map(q => (
              <Link
                key={q}
                href={`/compare/${slugs}/q/${q}`}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-blue-100 text-sm"
              >
                {q}
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link href={`/compare/${slugs}`} className="text-blue-600 hover:underline">
            View current comparison &rarr;
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
