import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SITE_URL, getBreadcrumbSchema, getArticleSchema } from '@/lib/seo'
import { RelatedLinks } from '@/components/seo/RelatedLinks'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600

async function getStockData(ticker: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const fundamentalsRes = await fetch(`${baseUrl}/api/fundamentals?ticker=${ticker}`, {
      next: { revalidate: 3600 }
    })

    const fundamentals = fundamentalsRes.ok ? await fundamentalsRes.json() : null

    return {
      fundamentals,
    }
  } catch (error) {
    console.error('Error fetching installed base data:', error)
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const data = await getStockData(symbol)
  const companyName = data?.fundamentals?.company?.name || symbol

  const title = `${symbol} Installed Base - Equipment & Customer Base ${currentYear}`
  const description = `Analyze ${symbol} installed base and customer footprint for ${companyName}. Track equipment deployment, customer base growth, and installed unit trends.`

  return {
    title,
    description,
    keywords: [
      `${symbol} installed base`,
      `${symbol} customer base`,
      `${symbol} equipment deployed`,
      `${companyName} installed base`,
      `${symbol} installed units`,
      `${symbol} customer footprint`,
      `${symbol} equipment base`,
    ],
    openGraph: {
      title: `${symbol} Installed Base - Equipment & Customer Base`,
      description,
      type: 'article',
      url: `${SITE_URL}/installed-base/${ticker.toLowerCase()}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Installed Base`,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/installed-base/${ticker.toLowerCase()}`,
    },
  }
}

export default async function InstalledBasePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const data = await getStockData(symbol)

  if (!data || !data.fundamentals) {
    notFound()
  }

  const companyName = data.fundamentals?.company?.name || symbol
  const pageUrl = `${SITE_URL}/installed-base/${ticker.toLowerCase()}`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: `${symbol} Stock`, url: `${SITE_URL}/stock/${ticker.toLowerCase()}` },
    { name: 'Installed Base', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Installed Base - Equipment & Customer Base ${currentYear}`,
    description: `Comprehensive analysis of ${companyName} (${symbol}) installed base, equipment deployment, and customer footprint.`,
    url: pageUrl,
    keywords: [
      `${symbol} installed base`,
      `${symbol} customer base`,
      `${companyName} equipment deployed`,
    ],
  })

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is ${symbol}'s installed base?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${companyName}'s installed base represents the total equipment and systems deployed at customer locations.`
        }
      },
      {
        '@type': 'Question',
        name: `Why is ${symbol}'s installed base important?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The installed base for ${companyName} drives recurring revenue from parts, service, and upgrades.`
        }
      },
    ],
  }

  const schemas = [breadcrumbSchema, articleSchema, faqSchema]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemas),
        }}
      />

      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold mb-4">{symbol} Installed Base</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Equipment deployment and customer base analysis for {companyName}
          </p>

          <div className="prose prose-invert max-w-none">
            <p>
              Track {companyName} ({symbol}) installed base of equipment and systems.
              A growing installed base provides opportunities for recurring revenue from parts, service, and upgrades.
            </p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </div>
    </>
  )
}
