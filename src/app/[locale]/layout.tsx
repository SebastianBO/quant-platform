import type React from "react"
import type { Metadata, Viewport } from "next"
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing, type Locale } from '@/i18n/routing'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params

  // Locale-specific metadata
  const titles: Record<Locale, string> = {
    en: "Lician - AI-Powered Stock Research & Analysis Platform",
    es: "Lician - Plataforma de Analisis de Acciones con IA",
    de: "Lician - KI-gestutzte Aktienanalyse-Plattform",
    sv: "Lician - AI-driven Aktieanalysplattform",
    fr: "Lician - Plateforme d'Analyse Boursiere par IA",
  }

  const descriptions: Record<Locale, string> = {
    en: "Make better investment decisions with AI-powered stock analysis, real-time quotes, DCF valuations, and institutional ownership tracking.",
    es: "Tome mejores decisiones de inversion con analisis de acciones impulsado por IA, cotizaciones en tiempo real, valoraciones DCF y seguimiento de propiedad institucional.",
    de: "Treffen Sie bessere Anlageentscheidungen mit KI-gestutzter Aktienanalyse, Echtzeit-Kursen, DCF-Bewertungen und Tracking institutioneller Beteiligungen.",
    sv: "Fatta battre investeringsbeslut med AI-driven aktieanalys, realtidskurser, DCF-varderingar och sparning av institutionellt agande.",
    fr: "Prenez de meilleures decisions d'investissement grace a l'analyse boursiere par IA, aux cotations en temps reel, aux valorisations DCF et au suivi des participations institutionnelles.",
  }

  const localeCode = locale as Locale

  return {
    title: titles[localeCode] || titles.en,
    description: descriptions[localeCode] || descriptions.en,
    alternates: {
      canonical: `https://lician.com/${locale === 'en' ? '' : locale}`,
      languages: {
        'en': 'https://lician.com',
        'es': 'https://lician.com/es',
        'de': 'https://lician.com/de',
        'sv': 'https://lician.com/sv',
        'fr': 'https://lician.com/fr',
      },
    },
    openGraph: {
      locale: locale === 'en' ? 'en_US' : locale,
    },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  // Validate that the incoming `locale` is valid
  if (!routing.locales.includes(locale as Locale)) {
    notFound()
  }

  // Enable static rendering
  setRequestLocale(locale)

  // Get messages for the locale
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
