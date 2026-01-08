import { Metadata } from 'next'
import { Suspense } from 'react'
import { setRequestLocale } from 'next-intl/server'
import ManusStyleHomeIntl from "@/components/ManusStyleHomeIntl"
import { SITE_URL } from "@/lib/seo"
import { routing, type Locale } from '@/i18n/routing'

type Props = {
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params

  const titles: Record<Locale, string> = {
    en: 'Lician - AI-Powered Stock Analysis & Investment Research Platform',
    es: 'Lician - Plataforma de Analisis de Inversiones con IA',
    de: 'Lician - KI-Aktienanalyse & Investment-Research-Plattform',
    sv: 'Lician - AI-driven Aktieanalys & Investeringsplattform',
    fr: 'Lician - Plateforme d\'Analyse Boursiere et Recherche d\'Investissement par IA',
  }

  const descriptions: Record<Locale, string> = {
    en: 'Free AI-powered stock analysis platform with real-time data, DCF valuations, financial metrics, analyst ratings, and investment insights. Research stocks, compare companies, and make informed investment decisions.',
    es: 'Plataforma gratuita de analisis de acciones con IA con datos en tiempo real, valoraciones DCF, metricas financieras, calificaciones de analistas e insights de inversion.',
    de: 'Kostenlose KI-gestutzte Aktienanalyse-Plattform mit Echtzeitdaten, DCF-Bewertungen, Finanzkennzahlen, Analystenbewertungen und Anlageeinblicken.',
    sv: 'Gratis AI-driven aktieanalysplattform med realtidsdata, DCF-varderingar, finansiella nyckeltal, analytikerbetygoch investeringsinsikter.',
    fr: 'Plateforme gratuite d\'analyse boursiere par IA avec donnees en temps reel, valorisations DCF, metriques financieres, notations d\'analystes et insights d\'investissement.',
  }

  const localeCode = locale as Locale
  const canonicalUrl = locale === 'en' ? SITE_URL : `${SITE_URL}/${locale}`

  return {
    title: titles[localeCode] || titles.en,
    description: descriptions[localeCode] || descriptions.en,
    keywords: [
      'stock analysis',
      'AI stock analysis',
      'stock research',
      'investment research',
      'stock screener',
      'DCF valuation',
      'fundamental analysis',
      'stock market analysis',
      'stock picker',
      'investment platform',
    ],
    openGraph: {
      title: titles[localeCode] || titles.en,
      description: descriptions[localeCode] || descriptions.en,
      type: 'website',
      url: canonicalUrl,
      locale: locale === 'en' ? 'en_US' : locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[localeCode] || titles.en,
      description: descriptions[localeCode] || descriptions.en,
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': SITE_URL,
        'es': `${SITE_URL}/es`,
        'de': `${SITE_URL}/de`,
        'sv': `${SITE_URL}/sv`,
        'fr': `${SITE_URL}/fr`,
      },
    },
  }
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-500 mx-auto mb-4" />
        <p className="text-muted-foreground">Loading Lician...</p>
      </div>
    </div>
  )
}

export default async function Home({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <Suspense fallback={<LoadingState />}>
      <ManusStyleHomeIntl />
    </Suspense>
  )
}
