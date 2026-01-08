// Smart sync prioritization for pSEO coverage
// Tiers based on search volume and market importance

// Tier 1: Mega caps + Meme stocks (highest search volume) - ~150 stocks
export const TIER_1_STOCKS = [
  // Magnificent 7 + Tech giants
  'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA',
  'AVGO', 'ORCL', 'CRM', 'ADBE', 'AMD', 'INTC', 'CSCO', 'QCOM',
  'TXN', 'AMAT', 'MU', 'LRCX', 'KLAC', 'SNPS', 'CDNS', 'MRVL',

  // Finance
  'JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'BLK', 'SCHW', 'AXP', 'V', 'MA',

  // Healthcare
  'UNH', 'JNJ', 'LLY', 'PFE', 'ABBV', 'MRK', 'TMO', 'ABT', 'DHR', 'BMY',

  // Consumer
  'WMT', 'COST', 'HD', 'MCD', 'SBUX', 'NKE', 'TGT', 'LOW', 'TJX', 'BKNG',
  'DIS', 'NFLX', 'CMCSA', 'PG', 'KO', 'PEP',

  // Energy & Industrial
  'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'CAT', 'DE', 'BA', 'HON', 'UPS', 'RTX', 'GE', 'LMT',

  // Meme stocks (very high search volume)
  'GME', 'AMC', 'BBBY', 'BB', 'NOK', 'PLTR', 'SOFI', 'LCID', 'RIVN', 'NIO',
  'HOOD', 'COIN', 'MARA', 'RIOT', 'CLSK',

  // Crypto-adjacent
  'MSTR', 'SQ', 'PYPL',

  // AI hype stocks
  'SMCI', 'ARM', 'AI', 'PLTR', 'SNOW', 'PATH', 'DDOG', 'NET', 'CRWD', 'ZS',

  // EV & Clean Energy
  'TSLA', 'RIVN', 'LCID', 'NIO', 'XPEV', 'LI', 'F', 'GM', 'ENPH', 'SEDG', 'FSLR',

  // Biotech popular
  'MRNA', 'BNTX', 'REGN', 'VRTX', 'GILD', 'BIIB', 'ILMN',

  // BRK
  'BRK-A', 'BRK-B',
]

// Tier 2: S&P 500 remaining - ~350 more stocks
// Will be pulled dynamically from index composition

// Tier 3: NASDAQ 100 + Russell 1000 - ~600 more stocks

// Tier 4: Russell 2000 + ADRs - ~2000 stocks

// Tier 5: All remaining SEC-listed - ~4000 stocks

export const SYNC_CONFIG = {
  // Tier 1: Sync multiple times daily (highest priority)
  tier1: {
    stocks: TIER_1_STOCKS,
    frequency: 'every 4 hours',
    cronSchedule: '0 */4 * * *', // Every 4 hours
    batchSize: 50,
  },

  // Tier 2-5: Progressive sync
  continuation: {
    frequency: 'hourly',
    cronSchedule: '30 * * * *', // Every hour at :30
    batchSize: 100, // 100 stocks per hour = 2400/day = 3 days for full sync
  },

  // Fresh data sync for stale records
  refresh: {
    maxAge: 7, // days
    cronSchedule: '0 3 * * *', // 3 AM daily
    batchSize: 200,
  }
}

// Helper to check if a stock is in priority tiers
export function getStockTier(ticker: string): number {
  if (TIER_1_STOCKS.includes(ticker.toUpperCase())) return 1
  // Could add more tier checks here based on index membership
  return 5 // Default tier
}

// Get sync priority score (higher = sync sooner)
export function getSyncPriority(ticker: string, lastSyncDate?: Date): number {
  const tier = getStockTier(ticker)
  const tierScore = (6 - tier) * 1000 // Tier 1 = 5000, Tier 5 = 1000

  // Freshness score: older data = higher priority
  let freshnessScore = 0
  if (lastSyncDate) {
    const daysSinceSync = (Date.now() - lastSyncDate.getTime()) / (1000 * 60 * 60 * 24)
    freshnessScore = Math.min(daysSinceSync * 10, 500) // Max 500 points
  } else {
    freshnessScore = 500 // Never synced = high priority
  }

  return tierScore + freshnessScore
}
