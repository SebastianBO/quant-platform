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
    <div className="min-h-dvh bg-black">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <nav className="text-sm mb-4">
          <Link href="/" className="text-[#479ffa] hover:underline motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]">Home</Link>
          {' > '}
          <Link href="/industries" className="text-[#479ffa] hover:underline motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]">Industries</Link>
          {' > '}
          <span className="text-[#868f97]">{name}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-4 text-balance">{name} Industry Stocks</h1>
        <p className="text-[#868f97] mb-6">
          Complete list of {name} stocks with analysis. Find the best {name} companies
          to invest in based on fundamentals and growth potential.
        </p>

        <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-balance">Historical Performance</h2>
          <div className="flex flex-wrap gap-2">
            {YEARS.map(year => (
              <Link
                key={year}
                href={`/industry/${industry}/${year}`}
                className="px-3 py-1 bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] text-sm motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] tabular-nums"
              >
                {year}
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-balance">Related Industries</h2>
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.filter(i => i !== industry).slice(0, 20).map(i => (
              <Link
                key={i}
                href={`/industry/${i}`}
                className="px-3 py-1 bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] text-sm motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
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
