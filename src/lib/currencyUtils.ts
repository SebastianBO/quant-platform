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
 * Determine stock's native currency
 * Priority: 1) Stored currency from database, 2) Ticker suffix detection, 3) Default USD
 * .ST = Stockholm (SEK), .L = London (GBP), .DE = Germany (EUR), etc.
 */
export function getStockCurrency(ticker: string, storedCurrency?: string | null): string {
  // If we have a stored currency from Tink/Plaid/manual entry, use it
  if (storedCurrency) return storedCurrency.toUpperCase()

  // Otherwise, detect from ticker suffix
  const t = ticker.toUpperCase()
  if (t.endsWith('.ST')) return 'SEK'
  if (t.endsWith('.L')) return 'GBP'
  if (t.endsWith('.DE') || t.endsWith('.F')) return 'EUR'
  if (t.endsWith('.PA')) return 'EUR'
  if (t.endsWith('.TO')) return 'CAD'
  if (t.endsWith('.AX')) return 'AUD'
  if (t.endsWith('.HK')) return 'HKD'
  if (t.endsWith('.T')) return 'JPY'
  return 'USD' // Default for US stocks
}

/**
 * Calculate portfolio value with currency conversion
 * Stock prices are in their native currency based on exchange
 */
export function calculatePortfolioValueWithConversion(
  investments: Array<{
    ticker?: string
    asset_identifier?: string
    quantity?: number
    shares?: number
    current_price?: number | null
    purchase_price?: number | null
    avg_cost?: number | null
    market_value?: number | null
    current_value?: number | null
    currency?: string | null // Stored currency from database
  }>,
  portfolioCurrency: string = 'USD'
): {
  totalValueInPortfolioCurrency: number
  totalCostInPortfolioCurrency: number
  totalGainLoss: number
  totalGainLossPercent: number
  exchangeRate: number
} {
  let totalValueInPortfolioCurrency = 0
  let totalCostInPortfolioCurrency = 0

  for (const inv of investments) {
    const ticker = (inv.ticker || inv.asset_identifier || '').toUpperCase()
    // Use stored currency if available, otherwise detect from ticker
    const stockCurrency = getStockCurrency(ticker, inv.currency)
    const shares = inv.quantity || inv.shares || 0
    const currentPrice = inv.current_price || inv.purchase_price || inv.avg_cost || 0
    const avgCost = inv.purchase_price || inv.avg_cost || currentPrice

    // Values in stock's native currency
    const valueInStockCurrency = inv.current_value || inv.market_value || (shares * currentPrice)
    const costInStockCurrency = shares * avgCost

    // Convert from stock currency to portfolio currency
    totalValueInPortfolioCurrency += convertCurrency(valueInStockCurrency, stockCurrency, portfolioCurrency)
    totalCostInPortfolioCurrency += convertCurrency(costInStockCurrency, stockCurrency, portfolioCurrency)
  }

  const totalGainLoss = totalValueInPortfolioCurrency - totalCostInPortfolioCurrency
  const totalGainLossPercent = totalCostInPortfolioCurrency > 0
    ? (totalGainLoss / totalCostInPortfolioCurrency) * 100
    : 0

  // Exchange rate is now per-stock, so return average or USD rate as reference
  const exchangeRate = getExchangeRate('USD', portfolioCurrency)

  return {
    totalValueInPortfolioCurrency,
    totalCostInPortfolioCurrency,
    totalGainLoss,
    totalGainLossPercent,
    exchangeRate,
  }
}
