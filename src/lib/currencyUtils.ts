// Fallback FX rates (USD as base) - used when API is unavailable
const FALLBACK_FX_RATES_FROM_USD: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  SEK: 10.85,
  GBP: 0.79,
  JPY: 149.50,
  CHF: 0.88,
  CAD: 1.36,
  AUD: 1.52,
  NOK: 10.67,
  DKK: 6.87,
  NZD: 1.64,
  HKD: 7.82,
  SGD: 1.34,
  CNY: 7.26,
  INR: 83.42,
}

// Cache for real-time FX rates
let cachedRates: Record<string, number> | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Fetch real-time FX rates from EODHD via our API
 */
export async function fetchFXRates(): Promise<Record<string, number>> {
  // Return cached rates if valid
  if (cachedRates && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedRates
  }

  try {
    const response = await fetch('/api/fx')
    if (response.ok) {
      const data = await response.json()
      if (data.rates) {
        cachedRates = data.rates
        cacheTimestamp = Date.now()
        return data.rates
      }
    }
  } catch (error) {
    console.error('Error fetching FX rates:', error)
  }

  // Return fallback if API fails
  return FALLBACK_FX_RATES_FROM_USD
}

/**
 * Get current FX rates (sync version using cache or fallback)
 */
export function getFXRates(): Record<string, number> {
  return cachedRates || FALLBACK_FX_RATES_FROM_USD
}

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (!amount || isNaN(amount)) return 0
  if (fromCurrency === toCurrency) return amount

  const rates = getFXRates()

  // USD to target currency
  if (fromCurrency === 'USD') {
    return amount * (rates[toCurrency] || 1)
  }

  // Source currency to USD
  if (toCurrency === 'USD') {
    return amount / (rates[fromCurrency] || 1)
  }

  // Cross conversion through USD
  const amountInUSD = amount / (rates[fromCurrency] || 1)
  return amountInUSD * (rates[toCurrency] || 1)
}

/**
 * Get exchange rate from one currency to another
 */
export function getExchangeRate(fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return 1

  const rates = getFXRates()

  // USD to target currency
  if (fromCurrency === 'USD') {
    return rates[toCurrency] || 1
  }

  // Source currency to USD
  if (toCurrency === 'USD') {
    return 1 / (rates[fromCurrency] || 1)
  }

  // Cross conversion through USD
  return (rates[toCurrency] || 1) / (rates[fromCurrency] || 1)
}

/**
 * Format currency with proper symbol
 */
export function formatCurrencyValue(value: number, currency: string = 'USD'): string {
  const safeValue = parseFloat(String(value)) || 0

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(safeValue)
  } catch {
    // Fallback if currency code is invalid
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      SEK: 'kr ',
      NOK: 'kr ',
      DKK: 'kr ',
      JPY: '¥',
      CHF: 'Fr ',
    }
    const symbol = symbols[currency] || currency + ' '
    return `${symbol}${safeValue.toLocaleString()}`
  }
}

/**
 * Calculate portfolio value with currency conversion
 * All stock prices are assumed to be in USD
 */
export function calculatePortfolioValueWithConversion(
  investments: Array<{
    quantity?: number
    shares?: number
    current_price?: number | null
    purchase_price?: number | null
    avg_cost?: number | null
    market_value?: number | null
    current_value?: number | null
  }>,
  portfolioCurrency: string = 'USD'
): {
  totalValueInPortfolioCurrency: number
  totalCostInPortfolioCurrency: number
  totalGainLoss: number
  totalGainLossPercent: number
  exchangeRate: number
} {
  // Stock prices from EODHD are in USD
  const stockPriceCurrency = 'USD'
  const exchangeRate = getExchangeRate(stockPriceCurrency, portfolioCurrency)

  let totalValueUSD = 0
  let totalCostUSD = 0

  for (const inv of investments) {
    const shares = inv.quantity || inv.shares || 0
    const currentPrice = inv.current_price || inv.purchase_price || inv.avg_cost || 0
    const avgCost = inv.purchase_price || inv.avg_cost || currentPrice

    // Values in USD
    const valueUSD = inv.current_value || inv.market_value || (shares * currentPrice)
    const costUSD = shares * avgCost

    totalValueUSD += valueUSD
    totalCostUSD += costUSD
  }

  // Convert to portfolio currency
  const totalValueInPortfolioCurrency = totalValueUSD * exchangeRate
  const totalCostInPortfolioCurrency = totalCostUSD * exchangeRate
  const totalGainLoss = totalValueInPortfolioCurrency - totalCostInPortfolioCurrency
  const totalGainLossPercent = totalCostInPortfolioCurrency > 0
    ? (totalGainLoss / totalCostInPortfolioCurrency) * 100
    : 0

  return {
    totalValueInPortfolioCurrency,
    totalCostInPortfolioCurrency,
    totalGainLoss,
    totalGainLossPercent,
    exchangeRate,
  }
}
