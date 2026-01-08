import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const locales = ['en', 'es', 'de', 'sv', 'fr'] as const
export type Locale = (typeof locales)[number]

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  sv: 'Svenska',
  fr: 'Français',
}

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  de: '🇩🇪',
  sv: '🇸🇪',
  fr: '🇫🇷',
}

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  localePrefix: 'as-needed', // Only show locale prefix for non-default locales
})

// Navigation helpers with locale awareness
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
