"use client"

import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { TrendingUp, FileText, Target, Activity, DollarSign, BarChart3, ArrowRight } from "lucide-react"

interface StockInternalLinksProps {
  ticker: string
  companyName?: string
  sector?: string
}

// Sector-specific comparison tickers
const SECTOR_COMPARISONS: Record<string, string[]> = {
  'Technology': ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA'],
  'Communication Services': ['META', 'GOOGL', 'DIS', 'NFLX', 'T'],
  'Consumer Cyclical': ['AMZN', 'TSLA', 'HD', 'NKE', 'MCD'],
  'Consumer Defensive': ['WMT', 'PG', 'KO', 'PEP', 'COST'],
  'Financial Services': ['JPM', 'BAC', 'WFC', 'GS', 'MS'],
  'Financial': ['JPM', 'BAC', 'WFC', 'GS', 'MS'],
  'Healthcare': ['JNJ', 'UNH', 'PFE', 'ABBV', 'LLY'],
  'Industrials': ['BA', 'CAT', 'GE', 'HON', 'UPS'],
  'Energy': ['XOM', 'CVX', 'COP', 'SLB', 'EOG'],
  'Real Estate': ['AMT', 'PLD', 'CCI', 'EQIX', 'PSA'],
  'Materials': ['LIN', 'APD', 'SHW', 'ECL', 'DD'],
  'Utilities': ['NEE', 'DUK', 'SO', 'D', 'AEP'],
}

// Popular stocks by sector for "Similar Stocks"
const SECTOR_SIMILAR_STOCKS: Record<string, { ticker: string; name: string }[]> = {
  'Technology': [
    { ticker: 'AAPL', name: 'Apple' },
    { ticker: 'MSFT', name: 'Microsoft' },
    { ticker: 'GOOGL', name: 'Alphabet' },
    { ticker: 'META', name: 'Meta' },
    { ticker: 'NVDA', name: 'NVIDIA' },
    { ticker: 'TSLA', name: 'Tesla' },
  ],
  'Communication Services': [
    { ticker: 'META', name: 'Meta' },
    { ticker: 'GOOGL', name: 'Alphabet' },
    { ticker: 'DIS', name: 'Disney' },
    { ticker: 'NFLX', name: 'Netflix' },
    { ticker: 'CMCSA', name: 'Comcast' },
    { ticker: 'T', name: 'AT&T' },
  ],
  'Consumer Cyclical': [
    { ticker: 'AMZN', name: 'Amazon' },
    { ticker: 'TSLA', name: 'Tesla' },
    { ticker: 'HD', name: 'Home Depot' },
    { ticker: 'NKE', name: 'Nike' },
    { ticker: 'MCD', name: 'McDonald\'s' },
    { ticker: 'SBUX', name: 'Starbucks' },
  ],
  'Consumer Defensive': [
    { ticker: 'WMT', name: 'Walmart' },
    { ticker: 'PG', name: 'Procter & Gamble' },
    { ticker: 'KO', name: 'Coca-Cola' },
    { ticker: 'PEP', name: 'PepsiCo' },
    { ticker: 'COST', name: 'Costco' },
    { ticker: 'PM', name: 'Philip Morris' },
  ],
  'Financial Services': [
    { ticker: 'JPM', name: 'JPMorgan' },
    { ticker: 'BAC', name: 'Bank of America' },
    { ticker: 'WFC', name: 'Wells Fargo' },
    { ticker: 'GS', name: 'Goldman Sachs' },
    { ticker: 'MS', name: 'Morgan Stanley' },
    { ticker: 'C', name: 'Citigroup' },
  ],
  'Financial': [
    { ticker: 'JPM', name: 'JPMorgan' },
    { ticker: 'BAC', name: 'Bank of America' },
    { ticker: 'WFC', name: 'Wells Fargo' },
    { ticker: 'GS', name: 'Goldman Sachs' },
    { ticker: 'MS', name: 'Morgan Stanley' },
    { ticker: 'C', name: 'Citigroup' },
  ],
  'Healthcare': [
    { ticker: 'JNJ', name: 'Johnson & Johnson' },
    { ticker: 'UNH', name: 'UnitedHealth' },
    { ticker: 'PFE', name: 'Pfizer' },
    { ticker: 'ABBV', name: 'AbbVie' },
    { ticker: 'LLY', name: 'Eli Lilly' },
    { ticker: 'TMO', name: 'Thermo Fisher' },
  ],
  'Industrials': [
    { ticker: 'BA', name: 'Boeing' },
    { ticker: 'CAT', name: 'Caterpillar' },
    { ticker: 'GE', name: 'General Electric' },
    { ticker: 'HON', name: 'Honeywell' },
    { ticker: 'UPS', name: 'UPS' },
    { ticker: 'RTX', name: 'Raytheon' },
  ],
  'Energy': [
    { ticker: 'XOM', name: 'Exxon Mobil' },
    { ticker: 'CVX', name: 'Chevron' },
    { ticker: 'COP', name: 'ConocoPhillips' },
    { ticker: 'SLB', name: 'Schlumberger' },
    { ticker: 'EOG', name: 'EOG Resources' },
    { ticker: 'MPC', name: 'Marathon Petroleum' },
  ],
  'Real Estate': [
    { ticker: 'AMT', name: 'American Tower' },
    { ticker: 'PLD', name: 'Prologis' },
    { ticker: 'CCI', name: 'Crown Castle' },
    { ticker: 'EQIX', name: 'Equinix' },
    { ticker: 'PSA', name: 'Public Storage' },
    { ticker: 'SPG', name: 'Simon Property' },
  ],
  'Materials': [
    { ticker: 'LIN', name: 'Linde' },
    { ticker: 'APD', name: 'Air Products' },
    { ticker: 'SHW', name: 'Sherwin-Williams' },
    { ticker: 'ECL', name: 'Ecolab' },
    { ticker: 'DD', name: 'DuPont' },
    { ticker: 'NEM', name: 'Newmont' },
  ],
  'Utilities': [
    { ticker: 'NEE', name: 'NextEra Energy' },
    { ticker: 'DUK', name: 'Duke Energy' },
    { ticker: 'SO', name: 'Southern Company' },
    { ticker: 'D', name: 'Dominion Energy' },
    { ticker: 'AEP', name: 'American Electric' },
    { ticker: 'EXC', name: 'Exelon' },
  ],
}

export default function StockInternalLinks({ ticker, companyName, sector }: StockInternalLinksProps) {
  const displayName = companyName || ticker
  const upperTicker = ticker.toUpperCase()

  // Get comparison tickers based on sector (exclude current ticker)
  const comparisonTickers = (SECTOR_COMPARISONS[sector || ''] || SECTOR_COMPARISONS['Technology'])
    .filter(t => t !== upperTicker)
    .slice(0, 5)

  // Get similar stocks based on sector (exclude current ticker)
  const similarStocks = (SECTOR_SIMILAR_STOCKS[sector || ''] || SECTOR_SIMILAR_STOCKS['Technology'])
    .filter(s => s.ticker !== upperTicker)
    .slice(0, 6)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Analysis Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="w-5 h-5 text-[#479ffa]" />
            Analysis for {displayName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Link
              href={`/analysis/${ticker.toLowerCase()}/valuation`}
              className="flex items-center justify-between p-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] transition-colors duration-100 group"
            >
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-[#4ebe96]" />
                <div>
                  <p className="font-medium text-sm">Is {displayName} Undervalued?</p>
                  <p className="text-xs text-[#868f97]">DCF valuation analysis</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#868f97] group-hover:text-white transition-colors duration-100" />
            </Link>

            <Link
              href={`/analysis/${ticker.toLowerCase()}/dividend`}
              className="flex items-center justify-between p-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] transition-colors duration-100 group"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium text-sm">{displayName} Dividend Analysis</p>
                  <p className="text-xs text-[#868f97]">Yield, payout ratio & history</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#868f97] group-hover:text-white transition-colors duration-100" />
            </Link>

            <Link
              href={`/analysis/${ticker.toLowerCase()}/growth`}
              className="flex items-center justify-between p-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] transition-colors duration-100 group"
            >
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium text-sm">{displayName} Growth Analysis</p>
                  <p className="text-xs text-[#868f97]">Revenue & earnings growth</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#868f97] group-hover:text-white transition-colors duration-100" />
            </Link>

            <Link
              href={`/analysis/${ticker.toLowerCase()}/health`}
              className="flex items-center justify-between p-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] transition-colors duration-100 group"
            >
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-sm">{displayName} Financial Health</p>
                  <p className="text-xs text-[#868f97]">Debt, liquidity & solvency</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#868f97] group-hover:text-white transition-colors duration-100" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Related Pages Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-[#4ebe96]" />
            Related Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Link
              href={`/should-i-buy/${ticker.toLowerCase()}`}
              className="flex items-center justify-between p-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] transition-colors duration-100 group"
            >
              <div>
                <p className="font-medium text-sm">Should I Buy {displayName}?</p>
                <p className="text-xs text-[#868f97]">AI-powered investment decision guide</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#868f97] group-hover:text-white transition-colors duration-100" />
            </Link>

            <Link
              href={`/prediction/${ticker.toLowerCase()}`}
              className="flex items-center justify-between p-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] transition-colors duration-100 group"
            >
              <div>
                <p className="font-medium text-sm">{displayName} Price Prediction</p>
                <p className="text-xs text-[#868f97]">Technical & fundamental forecasts</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#868f97] group-hover:text-white transition-colors duration-100" />
            </Link>

            <Link
              href={`/stock/${ticker.toLowerCase()}`}
              className="flex items-center justify-between p-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] transition-colors duration-100 group"
            >
              <div>
                <p className="font-medium text-sm">{displayName} Stock Overview</p>
                <p className="text-xs text-[#868f97]">Complete stock analysis dashboard</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#868f97] group-hover:text-white transition-colors duration-100" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Compare Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-[#479ffa]" />
            Compare {displayName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {comparisonTickers.map((compareTicker) => (
              <Link
                key={compareTicker}
                href={`/compare/${ticker.toLowerCase()}-vs-${compareTicker.toLowerCase()}`}
                className="p-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] transition-colors duration-100 text-center group"
              >
                <p className="font-medium text-sm group-hover:text-[#4ebe96] transition-colors duration-100">
                  vs {compareTicker}
                </p>
                <p className="text-xs text-[#868f97] mt-1">Compare</p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Similar Stocks Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            Similar Stocks in {sector || 'Technology'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {similarStocks.map((stock) => (
              <Link
                key={stock.ticker}
                href={`/stock/${stock.ticker.toLowerCase()}`}
                className="p-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] transition-colors duration-100 text-center group"
              >
                <p className="font-bold text-sm group-hover:text-[#4ebe96] transition-colors duration-100">
                  {stock.ticker}
                </p>
                <p className="text-xs text-[#868f97] mt-1 truncate">{stock.name}</p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
