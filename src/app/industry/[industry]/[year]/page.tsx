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
    <div className="min-h-dvh bg-black">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <nav className="text-sm mb-4">
          <Link href="/" className="text-[#479ffa] hover:underline motion-safe:transition-all motion-safe:duration-150 ease-out">Home</Link>
          {' > '}
          <Link href={`/industry/${industry}`} className="text-[#479ffa] hover:underline motion-safe:transition-all motion-safe:duration-150 ease-out">{name}</Link>
          {' > '}
          <span className="text-[#868f97]">{year}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-4 text-balance">{name} Industry {year}</h1>
        <p className="text-[#868f97] mb-6">
          Historical performance of {name} industry stocks in {year}.
        </p>

        <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-balance">Other Years</h2>
          <div className="flex flex-wrap gap-2">
            {YEARS.filter(y => y !== year).map(y => (
              <Link
                key={y}
                href={`/industry/${industry}/${y}`}
                className="px-3 py-1 bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] text-sm tabular-nums"
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
