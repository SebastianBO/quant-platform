'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TrendingUp, DollarSign, BarChart3, Shield } from 'lucide-react'

interface AnalysisNavigationProps {
  ticker: string
}

export function AnalysisNavigation({ ticker }: AnalysisNavigationProps) {
  const pathname = usePathname()
  const symbol = ticker.toLowerCase()

  const analysisTypes = [
    {
      name: 'Valuation',
      href: `/analysis/${symbol}/valuation`,
      icon: DollarSign,
      description: 'Fair value & DCF analysis',
    },
    {
      name: 'Dividend',
      href: `/analysis/${symbol}/dividend`,
      icon: TrendingUp,
      description: 'Yield & payout analysis',
    },
    {
      name: 'Growth',
      href: `/analysis/${symbol}/growth`,
      icon: BarChart3,
      description: 'Revenue & earnings trends',
    },
    {
      name: 'Health',
      href: `/analysis/${symbol}/health`,
      icon: Shield,
      description: 'Balance sheet & debt',
    },
  ]

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 mb-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-hide">
          {analysisTypes.map((type) => {
            const Icon = type.icon
            const isActive = pathname === type.href

            return (
              <Link
                key={type.name}
                href={type.href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">{type.name}</span>
                  <span className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    {type.description}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
