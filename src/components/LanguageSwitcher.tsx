"use client"

import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/routing'
import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  className?: string
  variant?: 'dropdown' | 'inline' | 'compact'
}

export default function LanguageSwitcher({
  className,
  variant = 'dropdown'
}: LanguageSwitcherProps) {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('language')
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLocaleChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale })
    setIsOpen(false)
  }

  if (variant === 'compact') {
    return (
      <div className={cn("relative", className)} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
          title={t('select')}
        >
          <Globe className="w-5 h-5" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-xl shadow-xl py-2 z-50">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocaleChange(loc)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                  locale === loc
                    ? "bg-green-500/10 text-green-500"
                    : "text-foreground hover:bg-secondary"
                )}
              >
                <span className="text-base">{localeFlags[loc]}</span>
                <span>{localeNames[loc]}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={cn(
              "px-2 py-1 text-sm rounded transition-colors",
              locale === loc
                ? "bg-green-500/10 text-green-500 font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
            title={localeNames[loc]}
          >
            {loc.toUpperCase()}
          </button>
        ))}
      </div>
    )
  }

  // Default dropdown variant
  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg border border-border",
          "bg-card hover:bg-secondary transition-colors text-sm"
        )}
      >
        <span className="text-base">{localeFlags[locale]}</span>
        <span>{localeNames[locale]}</span>
        <ChevronDown className={cn(
          "w-4 h-4 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl py-2 z-50">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => handleLocaleChange(loc)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                locale === loc
                  ? "bg-green-500/10 text-green-500"
                  : "text-foreground hover:bg-secondary"
              )}
            >
              <span className="text-base">{localeFlags[loc]}</span>
              <span>{localeNames[loc]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
