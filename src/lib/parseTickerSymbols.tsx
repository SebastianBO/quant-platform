import React from 'react'
import { StockTickerChip } from '@/components/StockProfilePopup'

// Common stock tickers to recognize (uppercase, 1-5 characters)
const COMMON_TICKERS = new Set([
  // Big Tech
  'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'META', 'NVDA', 'TSLA',
  // Finance
  'JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'V', 'MA', 'AXP',
  // Healthcare
  'JNJ', 'UNH', 'PFE', 'MRK', 'ABBV', 'LLY', 'TMO', 'ABT',
  // Consumer
  'WMT', 'HD', 'PG', 'KO', 'PEP', 'MCD', 'NKE', 'SBUX',
  // Energy
  'XOM', 'CVX', 'COP', 'SLB', 'EOG',
  // Semiconductors
  'AMD', 'INTC', 'QCOM', 'AVGO', 'TXN', 'MU', 'AMAT',
  // Communication
  'DIS', 'NFLX', 'CMCSA', 'T', 'VZ', 'TMUS',
  // Industrial
  'CAT', 'BA', 'HON', 'UPS', 'RTX', 'LMT', 'GE',
  // EV/Auto
  'F', 'GM', 'RIVN', 'LCID',
  // Crypto-related
  'COIN', 'MSTR', 'RIOT', 'MARA',
  // Meme stocks
  'GME', 'AMC', 'BBBY', 'BB',
  // Others
  'CRM', 'ORCL', 'IBM', 'ADBE', 'NOW', 'SNOW', 'PLTR', 'SQ', 'PYPL',
  'SHOP', 'UBER', 'LYFT', 'ABNB', 'ZM', 'DOCU', 'CRWD', 'NET', 'DDOG',
  'SPY', 'QQQ', 'IWM', 'VTI', 'VOO', // ETFs
])

// Words that look like tickers but aren't
const EXCLUDED_WORDS = new Set([
  'I', 'A', 'THE', 'IS', 'IT', 'AT', 'TO', 'IN', 'ON', 'OR', 'AN',
  'BY', 'IF', 'SO', 'AS', 'UP', 'NO', 'BE', 'WE', 'US', 'HE', 'DO',
  'GO', 'MY', 'AI', 'CEO', 'CFO', 'IPO', 'ETF', 'SEC', 'FDA', 'EPS',
  'PE', 'PS', 'PB', 'EV', 'DCF', 'ROE', 'ROA', 'API', 'USA', 'UK',
  'EU', 'GDP', 'CPI', 'FED', 'USD', 'EUR', 'GBP', 'YTD', 'YOY', 'QOQ',
  'AM', 'PM', 'EST', 'PST', 'PT', 'ET', 'GDP', 'LLC', 'INC', 'CEO',
])

// Regex patterns for ticker detection
// Pattern 1: $AAPL format (most reliable)
// Pattern 2: (AAPL) in parentheses
// Pattern 3: Standalone uppercase 2-5 letter word that's a known ticker

/**
 * Parse text and replace ticker symbols with clickable StockTickerChip components
 * Returns an array of React elements and strings
 */
export function parseTickerSymbols(text: string): React.ReactNode[] {
  const elements: React.ReactNode[] = []
  let lastIndex = 0

  // Pattern for $TICKER or (TICKER) or standalone TICKER
  const tickerPattern = /\$([A-Z]{1,5})\b|\(([A-Z]{1,5})\)|(?<![A-Za-z])([A-Z]{2,5})(?![A-Za-z])/g

  let match
  while ((match = tickerPattern.exec(text)) !== null) {
    // Get the ticker from whichever group matched
    const ticker = match[1] || match[2] || match[3]

    // Skip if it's an excluded word
    if (EXCLUDED_WORDS.has(ticker)) continue

    // For standalone tickers (group 3), only match if it's a known ticker
    // For $TICKER (group 1) or (TICKER) (group 2), always match
    const isDollarFormat = !!match[1]
    const isParenFormat = !!match[2]
    const isStandalone = !!match[3]

    if (isStandalone && !COMMON_TICKERS.has(ticker)) {
      continue // Skip unknown standalone tickers
    }

    // Add text before this match
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index))
    }

    // Add the ticker chip
    elements.push(
      <StockTickerChip key={`${ticker}-${match.index}`} symbol={ticker} />
    )

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex))
  }

  return elements.length > 0 ? elements : [text]
}

/**
 * Component that renders text with parsed ticker symbols
 */
interface ParsedTextProps {
  text: string
  className?: string
}

export function ParsedText({ text, className }: ParsedTextProps) {
  const parsed = parseTickerSymbols(text)
  return <span className={className}>{parsed}</span>
}

/**
 * Parse markdown-style text preserving basic formatting
 * Returns React elements with ticker chips and basic formatting
 */
export function parseTickerSymbolsWithMarkdown(text: string): React.ReactNode[] {
  // First split by code blocks to preserve them
  const codeBlockPattern = /```[\s\S]*?```|`[^`]+`/g
  const parts: { type: 'text' | 'code'; content: string }[] = []
  let lastIndex = 0
  let match

  while ((match = codeBlockPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }
    parts.push({ type: 'code', content: match[0] })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) })
  }

  // Process each part
  const elements: React.ReactNode[] = []
  parts.forEach((part, i) => {
    if (part.type === 'code') {
      // Preserve code blocks as-is
      if (part.content.startsWith('```')) {
        elements.push(
          <pre key={`code-${i}`} className="bg-secondary/50 p-2 rounded text-sm my-2 overflow-x-auto">
            <code>{part.content.slice(3, -3)}</code>
          </pre>
        )
      } else {
        elements.push(
          <code key={`code-${i}`} className="bg-secondary/50 px-1 rounded text-sm">
            {part.content.slice(1, -1)}
          </code>
        )
      }
    } else {
      // Parse tickers in text parts
      elements.push(...parseTickerSymbols(part.content))
    }
  })

  return elements
}
