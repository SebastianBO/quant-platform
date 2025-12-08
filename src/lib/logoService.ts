// Logo Service - Fetches stock logos from EODHD API with Clearbit fallback
// Based on portfoliocare-expo implementation

const LOGO_CACHE = new Map<string, string>()
const LOADING_CACHE = new Map<string, Promise<string | null>>()

// Common stock symbol to company domain mapping for Clearbit fallback
const SYMBOL_TO_DOMAIN: Record<string, string> = {
  'AAPL': 'apple.com',
  'MSFT': 'microsoft.com',
  'GOOGL': 'google.com',
  'GOOG': 'google.com',
  'AMZN': 'amazon.com',
  'META': 'meta.com',
  'NVDA': 'nvidia.com',
  'TSLA': 'tesla.com',
  'JPM': 'jpmorganchase.com',
  'V': 'visa.com',
  'MA': 'mastercard.com',
  'JNJ': 'jnj.com',
  'WMT': 'walmart.com',
  'PG': 'pg.com',
  'UNH': 'unitedhealthgroup.com',
  'HD': 'homedepot.com',
  'DIS': 'disney.com',
  'PYPL': 'paypal.com',
  'NFLX': 'netflix.com',
  'ADBE': 'adobe.com',
  'CRM': 'salesforce.com',
  'INTC': 'intel.com',
  'AMD': 'amd.com',
  'CSCO': 'cisco.com',
  'PEP': 'pepsico.com',
  'KO': 'coca-cola.com',
  'NKE': 'nike.com',
  'MCD': 'mcdonalds.com',
  'SBUX': 'starbucks.com',
  'BA': 'boeing.com',
  'GS': 'goldmansachs.com',
  'IBM': 'ibm.com',
  'ORCL': 'oracle.com',
  'UBER': 'uber.com',
  'ABNB': 'airbnb.com',
  'SQ': 'squareup.com',
  'SHOP': 'shopify.com',
  'SNAP': 'snap.com',
  'SPOT': 'spotify.com',
  'ZM': 'zoom.us',
  'COIN': 'coinbase.com',
  'HOOD': 'robinhood.com',
  'PLTR': 'palantir.com',
  'RBLX': 'roblox.com',
  'RIVN': 'rivian.com',
  'LCID': 'lucidmotors.com',
  'F': 'ford.com',
  'GM': 'gm.com',
  'T': 'att.com',
  'VZ': 'verizon.com',
  'TMUS': 't-mobile.com',
  'XOM': 'exxonmobil.com',
  'CVX': 'chevron.com',
  'PFE': 'pfizer.com',
  'MRNA': 'modernatx.com',
  'LLY': 'lilly.com',
  'ABBV': 'abbvie.com',
  'TMO': 'thermofisher.com',
  'UPS': 'ups.com',
  'FDX': 'fedex.com',
  'CAT': 'caterpillar.com',
  'DE': 'deere.com',
  'MMM': '3m.com',
  'GE': 'ge.com',
  'HON': 'honeywell.com',
  'LMT': 'lockheedmartin.com',
  'RTX': 'rtx.com',
  'NOW': 'servicenow.com',
  'SNOW': 'snowflake.com',
  'DDOG': 'datadoghq.com',
  'NET': 'cloudflare.com',
  'CRWD': 'crowdstrike.com',
  'ZS': 'zscaler.com',
  'OKTA': 'okta.com',
  'TWLO': 'twilio.com',
  'MDB': 'mongodb.com',
  'ESTC': 'elastic.co',
  'PATH': 'uipath.com',
  'U': 'unity.com',
  'ROKU': 'roku.com',
  'TTD': 'thetradedesk.com',
  'PINS': 'pinterest.com',
  'TWTR': 'twitter.com',
  'X': 'x.com',
  'MGNI': 'magnite.com',
}

// Get EODHD logo URL
export function getEodhdLogoUrl(symbol: string, exchange: string = 'US'): string {
  return `https://eodhistoricaldata.com/img/logos/${exchange}/${symbol.toUpperCase()}.png`
}

// Get Clearbit logo URL from domain
export function getClearbitLogoUrl(domain: string): string {
  return `https://logo.clearbit.com/${domain}`
}

// Get Clearbit logo URL from symbol (if mapping exists)
export function getClearbitLogoFromSymbol(symbol: string): string | null {
  const domain = SYMBOL_TO_DOMAIN[symbol.toUpperCase()]
  return domain ? getClearbitLogoUrl(domain) : null
}

export async function getStockLogo(symbol: string, exchange: string = 'US'): Promise<string | null> {
  try {
    const cacheKey = `${symbol.toUpperCase()}.${exchange}`

    // Return cached logo if available
    if (LOGO_CACHE.has(cacheKey)) {
      return LOGO_CACHE.get(cacheKey) || null
    }

    // Check if already loading to prevent duplicate requests
    if (LOADING_CACHE.has(cacheKey)) {
      return LOADING_CACHE.get(cacheKey) || null
    }

    // EODHD direct logo URL
    const logoUrl = `https://eodhistoricaldata.com/img/logos/${exchange}/${symbol.toUpperCase()}.png`

    // Create loading promise
    const loadingPromise = new Promise<string | null>(async (resolve) => {
      try {
        // Verify the logo exists by attempting to load it
        const response = await fetch(logoUrl, { method: 'HEAD' })
        if (response.ok) {
          LOGO_CACHE.set(cacheKey, logoUrl)
          resolve(logoUrl)
        } else {
          // Try Clearbit fallback
          const clearbitUrl = getClearbitLogoFromSymbol(symbol)
          if (clearbitUrl) {
            LOGO_CACHE.set(cacheKey, clearbitUrl)
            resolve(clearbitUrl)
          } else {
            resolve(null)
          }
        }
      } catch {
        // Try Clearbit fallback on error
        const clearbitUrl = getClearbitLogoFromSymbol(symbol)
        if (clearbitUrl) {
          LOGO_CACHE.set(cacheKey, clearbitUrl)
          resolve(clearbitUrl)
        } else {
          resolve(null)
        }
      } finally {
        LOADING_CACHE.delete(cacheKey)
      }
    })

    LOADING_CACHE.set(cacheKey, loadingPromise)
    return loadingPromise
  } catch (error) {
    console.error(`Error getting logo for ${symbol}:`, error)
    return null
  }
}

export async function getBatchLogos(symbols: { symbol: string; exchange?: string }[]): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>()

  await Promise.all(
    symbols.map(async ({ symbol, exchange = 'US' }) => {
      const logo = await getStockLogo(symbol, exchange)
      results.set(symbol.toUpperCase(), logo)
    })
  )

  return results
}

// Generate a placeholder color based on symbol
export function getSymbolColor(symbol: string): string {
  const colors = [
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#eab308'
  ]

  let hash = 0
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length]
}
