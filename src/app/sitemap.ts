import { MetadataRoute } from 'next'

// S&P 500 + Popular stocks + ETFs
const ALL_STOCKS = [
  // S&P 500
  'AAPL', 'ABBV', 'ABT', 'ACN', 'ADBE', 'ADI', 'ADP', 'ADSK', 'AEP', 'AES',
  'AFL', 'AIG', 'AIZ', 'AJG', 'AKAM', 'ALB', 'ALGN', 'ALL', 'ALLE', 'AMAT',
  'AMCR', 'AMD', 'AME', 'AMGN', 'AMP', 'AMT', 'AMZN', 'ANET', 'ANSS', 'AON',
  'AOS', 'APA', 'APD', 'APH', 'APTV', 'ARE', 'ATO', 'AVB', 'AVGO', 'AVY',
  'AWK', 'AXP', 'AZO', 'BA', 'BAC', 'BAX', 'BBY', 'BDX', 'BEN',
  'BIIB', 'BIO', 'BK', 'BKNG', 'BLK', 'BMY', 'BR', 'BRO', 'BSX',
  'BWA', 'BXP', 'C', 'CAG', 'CAH', 'CARR', 'CAT', 'CB', 'CBOE', 'CBRE',
  'CCI', 'CCL', 'CDNS', 'CDW', 'CE', 'CEG', 'CF', 'CFG', 'CHD', 'CHRW',
  'CHTR', 'CI', 'CINF', 'CL', 'CLX', 'CMA', 'CMCSA', 'CME', 'CMG', 'CMI',
  'CMS', 'CNC', 'CNP', 'COF', 'COO', 'COP', 'COST', 'CPB', 'CPRT', 'CPT',
  'CRL', 'CRM', 'CSCO', 'CSGP', 'CSX', 'CTAS', 'CTLT', 'CTRA', 'CTSH', 'CTVA',
  'CVS', 'CVX', 'CZR', 'D', 'DAL', 'DD', 'DE', 'DFS', 'DG', 'DGX',
  'DHI', 'DHR', 'DIS', 'DLR', 'DLTR', 'DOV', 'DOW', 'DPZ', 'DRI', 'DTE',
  'DUK', 'DVA', 'DVN', 'DXCM', 'EA', 'EBAY', 'ECL', 'ED', 'EFX', 'EG',
  'EIX', 'EL', 'EMN', 'EMR', 'ENPH', 'EOG', 'EPAM', 'EQIX', 'EQR', 'EQT',
  'ES', 'ESS', 'ETN', 'ETR', 'EVRG', 'EW', 'EXC', 'EXPD', 'EXPE', 'EXR',
  'F', 'FANG', 'FAST', 'FCX', 'FDS', 'FDX', 'FE', 'FFIV', 'FIS', 'FITB',
  'FLT', 'FMC', 'FOX', 'FOXA', 'FRT', 'FSLR', 'FTNT', 'FTV', 'GD', 'GE',
  'GEHC', 'GEN', 'GILD', 'GIS', 'GL', 'GLW', 'GM', 'GNRC', 'GOOG', 'GOOGL',
  'GPC', 'GPN', 'GRMN', 'GS', 'GWW', 'HAL', 'HAS', 'HBAN', 'HCA', 'HD',
  'HES', 'HIG', 'HII', 'HLT', 'HOLX', 'HON', 'HPE', 'HPQ', 'HRL', 'HSIC',
  'HST', 'HSY', 'HUBB', 'HUM', 'HWM', 'IBM', 'ICE', 'IDXX', 'IEX', 'IFF',
  'ILMN', 'INCY', 'INTC', 'INTU', 'INVH', 'IP', 'IPG', 'IQV', 'IR', 'IRM',
  'ISRG', 'IT', 'ITW', 'IVZ', 'J', 'JBHT', 'JCI', 'JKHY', 'JNJ', 'JNPR',
  'JPM', 'K', 'KDP', 'KEY', 'KEYS', 'KHC', 'KIM', 'KLAC', 'KMB', 'KMI',
  'KMX', 'KO', 'KR', 'L', 'LDOS', 'LEN', 'LH', 'LHX', 'LIN', 'LKQ',
  'LLY', 'LMT', 'LNC', 'LNT', 'LOW', 'LRCX', 'LULU', 'LUV', 'LVS', 'LW',
  'LYB', 'LYV', 'MA', 'MAA', 'MAR', 'MAS', 'MCD', 'MCHP', 'MCK', 'MCO',
  'MDLZ', 'MDT', 'MET', 'META', 'MGM', 'MHK', 'MKC', 'MKTX', 'MLM', 'MMC',
  'MMM', 'MNST', 'MO', 'MOH', 'MOS', 'MPC', 'MPWR', 'MRK', 'MRNA', 'MRO',
  'MS', 'MSCI', 'MSFT', 'MSI', 'MTB', 'MTCH', 'MTD', 'MU', 'NCLH', 'NDAQ',
  'NDSN', 'NEE', 'NEM', 'NFLX', 'NI', 'NKE', 'NOC', 'NOW', 'NRG', 'NSC',
  'NTAP', 'NTRS', 'NUE', 'NVDA', 'NVR', 'NWL', 'NWS', 'NWSA', 'O', 'ODFL',
  'OGN', 'OKE', 'OMC', 'ON', 'ORCL', 'ORLY', 'OTIS', 'OXY', 'PARA', 'PAYC',
  'PAYX', 'PCAR', 'PCG', 'PEAK', 'PEG', 'PEP', 'PFE', 'PFG', 'PG', 'PGR',
  'PH', 'PHM', 'PKG', 'PKI', 'PLD', 'PM', 'PNC', 'PNR', 'PNW', 'POOL',
  'PPG', 'PPL', 'PRU', 'PSA', 'PSX', 'PTC', 'PVH', 'PWR', 'PYPL', 'QCOM',
  'QRVO', 'RCL', 'REG', 'REGN', 'RF', 'RHI', 'RJF', 'RL', 'RMD', 'ROK',
  'ROL', 'ROP', 'ROST', 'RSG', 'RTX', 'RVTY', 'SBAC', 'SBUX', 'SCHW', 'SHW',
  'SJM', 'SLB', 'SMCI', 'SNA', 'SNPS', 'SO', 'SPG', 'SPGI', 'SRE', 'STE',
  'STLD', 'STT', 'STX', 'STZ', 'SWK', 'SWKS', 'SYF', 'SYK', 'SYY', 'T',
  'TAP', 'TDG', 'TDY', 'TECH', 'TEL', 'TER', 'TFC', 'TFX', 'TGT', 'TJX',
  'TMO', 'TMUS', 'TPR', 'TRGP', 'TRMB', 'TROW', 'TRV', 'TSCO', 'TSLA', 'TSN',
  'TT', 'TTWO', 'TXN', 'TXT', 'TYL', 'UAL', 'UDR', 'UHS', 'ULTA', 'UNH',
  'UNP', 'UPS', 'URI', 'USB', 'V', 'VFC', 'VICI', 'VLO', 'VMC', 'VRSK',
  'VRSN', 'VRTX', 'VTR', 'VTRS', 'VZ', 'WAB', 'WAT', 'WBA', 'WBD', 'WDC',
  'WEC', 'WELL', 'WFC', 'WHR', 'WM', 'WMB', 'WMT', 'WRB', 'WRK', 'WST',
  'WTW', 'WY', 'WYNN', 'XEL', 'XOM', 'XRAY', 'XYL', 'YUM', 'ZBH', 'ZBRA',
  'ZION', 'ZTS',
  // Popular non-S&P stocks
  'PLTR', 'COIN', 'RIVN', 'LCID', 'NIO', 'SOFI', 'HOOD', 'GME', 'AMC',
  'MARA', 'RIOT', 'PLUG', 'SPCE', 'DKNG', 'RBLX', 'U', 'SNAP', 'PINS',
  'ROKU', 'ZM', 'DOCU', 'CRWD', 'SNOW', 'NET', 'DDOG', 'MDB', 'OKTA',
  // Popular ETFs
  'SPY', 'QQQ', 'VOO', 'VTI', 'IWM', 'DIA', 'ARKK', 'XLF', 'XLE', 'XLK',
]

// Comparison pairs
const COMPARISON_PAIRS = [
  ['AAPL', 'MSFT'], ['AAPL', 'GOOGL'], ['MSFT', 'GOOGL'], ['META', 'GOOGL'],
  ['AMZN', 'MSFT'], ['AMZN', 'GOOGL'], ['AAPL', 'AMZN'], ['META', 'AAPL'],
  ['NVDA', 'AMD'], ['NVDA', 'INTC'], ['AMD', 'INTC'], ['AVGO', 'QCOM'],
  ['TSLA', 'F'], ['TSLA', 'GM'], ['TSLA', 'RIVN'], ['F', 'GM'],
  ['JPM', 'BAC'], ['JPM', 'WFC'], ['BAC', 'C'], ['GS', 'MS'], ['V', 'MA'],
  ['NFLX', 'DIS'], ['NFLX', 'PARA'], ['DIS', 'WBD'], ['ROKU', 'NFLX'],
  ['WMT', 'TGT'], ['HD', 'LOW'], ['COST', 'WMT'], ['AMZN', 'WMT'],
  ['CRM', 'MSFT'], ['SNOW', 'PLTR'], ['DDOG', 'CRWD'], ['NET', 'CRWD'],
  ['KO', 'PEP'], ['NKE', 'LULU'], ['SBUX', 'CMG'], ['MCD', 'YUM'],
  ['PFE', 'MRK'], ['JNJ', 'ABBV'], ['LLY', 'NVO'], ['UNH', 'CVS'],
  ['XOM', 'CVX'], ['COP', 'XOM'], ['SLB', 'HAL'], ['NEE', 'DUK'],
  ['SPY', 'VOO'], ['SPY', 'QQQ'], ['VOO', 'VTI'], ['QQQ', 'ARKK'],
]

// Sectors
const SECTORS = [
  'technology', 'healthcare', 'financials', 'energy', 'consumer-discretionary',
  'consumer-staples', 'industrials', 'materials', 'utilities', 'real-estate',
  'communication-services'
]

// Industries
const INDUSTRIES = [
  'software', 'semiconductors', 'banks', 'retail', 'pharmaceuticals',
  'biotechnology', 'insurance', 'aerospace', 'automotive', 'oil-gas',
  'telecommunications', 'media', 'real-estate', 'construction', 'chemicals',
  'consumer-electronics', 'restaurants', 'apparel', 'hotels', 'utilities',
  'mining', 'fintech', 'cloud-computing', 'cybersecurity', 'artificial-intelligence',
  'e-commerce',
]

// All pSEO metric pages (400+ routes)
const METRIC_PAGES = [
  '3p-seller-services', '5g-upgrade-revenue', 'active-accounts', 'active-buyers',
  'active-players', 'active-sellers', 'ad-impressions', 'ad-load', 'ad-spend',
  'ad-tier-subs', 'adhesives', 'admissions', 'adr', 'advertising-revenue',
  'aftermarket-revenue', 'agricultural-chemicals', 'aircraft-deliveries', 'aisc',
  'api-calls', 'approval-rate', 'aroon', 'arpu', 'arpu-streaming', 'arr-growth',
  'asia-revenue', 'asp-trend', 'assets-under-management', 'automation-revenue',
  'autoship', 'availability-zones', 'average-check', 'average-length-of-stay',
  'average-loan-size', 'average-project-value', 'average-ticket', 'backlog-growth',
  'battery-capacity', 'battery-cost', 'battery-storage', 'bear-case', 'bed-count',
  'benefits-revenue', 'beta', 'beverage-cans', 'billings', 'bnpl-volume',
  'bollinger-bands', 'book-to-bill-ratio', 'book-value', 'borrow-rate',
  'brand-awareness', 'brand-portfolio', 'brand-sales', 'breakout', 'bull-case',
  'buy-or-sell', 'buybacks', 'capacity-utilization', 'capex', 'carbon-credits',
  'case-volume', 'cash-position', 'category-mix', 'cci', 'charging-network',
  'china-revenue', 'churn', 'classified-revenue', 'clean-energy-tax', 'cloud-margin',
  'cloud-revenue', 'coatings', 'collection-rate', 'colocation-revenue', 'commerce-cloud',
  'commodity-costs', 'company-owned', 'comparable-sales', 'connected-fitness',
  'connection-revenue', 'consensus', 'console-sales', 'content-library', 'contract-wins',
  'contraction-rate', 'conversion-rate', 'copper-production', 'corrugated',
  'creator-payouts', 'credit-losses', 'crm-revenue', 'crop-prices', 'cross-border',
  'ctv-revenue', 'currency-exposure', 'customer-acquisition-cost', 'customers',
  'data-center-capacity', 'data-cloud', 'dau', 'days-to-cover', 'dealership-count',
  'debt-to-equity', 'debt-underwriting', 'defense-backlog', 'demand-side', 'design-wins',
  'developer-ecosystem', 'development-pipeline', 'digital-revenue', 'digital-sales',
  'dilution', 'direct-to-consumer', 'distribution-points', 'dollar-based-retention',
  'donchian-channels', 'dpo', 'drive-thru-mix', 'earnings-surprise', 'ebit-margin',
  'elder-ray', 'emerging-markets', 'employee-experience', 'employees-on-platform',
  'engagement-time', 'enterprise-customers', 'enterprise-deals', 'enterprise-value',
  'equipment-sales', 'equities-trading', 'equity-underwriting', 'etf-flows',
  'europe-revenue', 'ev-credits', 'ev-deliveries', 'ev-ebitda', 'ev-market-share',
  'ev-range', 'expansion-revenue', 'expense-ratio', 'exploration-spend', 'f35-deliveries',
  'fab-utilization', 'farm-income', 'feedstock-costs', 'fertilizer-volume', 'fiber-miles',
  'fibonacci', 'ficc-revenue', 'finance-insurance', 'financing-cash-flow', 'fitness-equipment',
  'flexible-packaging', 'float', 'foundry-revenue', 'fragrance-revenue', 'franchise-fees',
  'franchise-revenue', 'franchised', 'free-cash-flow', 'free-cash-flow-margin', 'free-to-paid',
  'fulfillment-revenue', 'full-price-sales', 'fund-performance', 'funded-backlog',
  'funding-costs', 'game-pipeline', 'game-sales', 'geographic-diversification',
  'geographic-mix', 'gigafactory', 'glass-containers', 'gmv', 'gold-production',
  'gpu-new', 'gpu-used', 'grade-trend', 'grain-storage', 'green-hydrogen',
  'grooming-revenue', 'gross-margin', 'gross-margin-retail', 'gross-retention',
  'ground-lease-risk', 'guidance', 'gym-locations', 'gym-memberships', 'haircare-revenue',
  'handle', 'hcm-revenue', 'hold-rate', 'home-improvement', 'homeowner-leads',
  'hyperscale-customers', 'iaas-revenue', 'ib-revenue', 'ichimoku', 'igaming-revenue',
  'in-game-purchases', 'industry-clouds', 'industry-rank', 'influencer-marketing',
  'innovation-pipeline', 'installed-base', 'institutional-aum', 'integration-partners',
  'interconnection-revenue', 'international-defense', 'international-revenue',
  'international-streaming', 'inventory-per-store', 'inventory-turns', 'investing-cash-flow',
  'investment-thesis', 'iron-ore', 'is-overvalued', 'is-undervalued', 'keltner-channels',
  'know-sure-thing', 'labor-hours', 'lead-times', 'learning-revenue', 'lease-escalators',
  'leased-capacity', 'live-services', 'livestock-exposure', 'loyalty-members', 'ma-advisory',
  'macd', 'makeup-revenue', 'managed-rooms', 'market-access', 'market-share-trend',
  'marketing-cloud', 'marketing-spend', 'marketplace-revenue', 'mass-index', 'mau',
  'measurement', 'medicare-revenue', 'megawatts', 'membership-attrition', 'membership-dues',
  'memory-pricing', 'merchant-count', 'mining-reserves', 'module-adoption', 'momentum',
  'momentum-indicator', 'monetization', 'monthly-vs-annual', 'moving-average',
  'net-interest-spread', 'net-margin', 'new-vehicle-sales', 'occupancy', 'operating-cash-flow',
  'operating-margin', 'orders', 'organic-growth', 'organic-products', 'original-content',
  'originations', 'paas-revenue', 'packaging-price-cost', 'packaging-volume', 'paid-seats',
  'parabolic-sar', 'parlay-mix', 'parts-service', 'passive-vs-active', 'patient-volume',
  'payment-volume-growth', 'payor-mix', 'payroll-revenue', 'peer-comparison', 'peg-ratio',
  'personal-training', 'pet-adoption', 'pet-food-revenue', 'pet-insurance', 'pet-pharmacy',
  'pet-supplies', 'petrochemical', 'pipeline-rooms', 'pivot-points', 'plastic-containers',
  'plastics', 'platform-customers', 'platform-revenue', 'platform-usage', 'portfolio-size',
  'power-cost', 'precision-ag', 'prestige-vs-mass', 'price-mix', 'price-per-case',
  'price-to-book', 'price-to-fcf', 'price-to-sales', 'private-label', 'process-node',
  'profit-margin', 'programmatic-revenue', 'promotional-activity', 'promotional-intensity',
  'pue', 'realized-prices', 'relative-strength', 'renewable-percentage', 'renewable-ppa',
  'repeat-rate', 'research-development', 'restaurant-count', 'retail-aum', 'retail-media',
  'revenue-per-admission', 'revenue-per-tower', 'revisions', 'revpar', 'roa', 'roc', 'roce',
  'roic', 'room-count', 'rpo', 'rsi', 'saas-revenue', 'sales-cloud', 'same-restaurant-sales',
  'same-store-sales-auto', 'seasonality', 'seed-sales', 'sentiment', 'service-cloud',
  'service-professionals', 'service-revenue', 'services-revenue', 'shares-outstanding',
  'shares-short', 'short-squeeze', 'shrinkage', 'skincare-revenue', 'small-cells',
  'solar-capacity', 'space-revenue', 'specialty-chemicals', 'states-live', 'stochastic',
  'stock-outlook', 'streaming-revenue', 'streaming-subs', 'subscriber-ltv', 'subscribers',
  'subscription-gaming', 'subscription-growth', 'subscription-revenue', 'supertrend',
  'supply-side', 'support-resistance', 'surgery-volume', 'sustainability-beauty',
  'sustainable-packaging', 'take-rate', 'talent-revenue', 'tenancy-ratio', 'tower-count',
  'tpv', 'trading-revenue', 'traffic', 'transaction-count', 'travel-retail', 'trend',
  'trial-conversion', 'trix', 'ultimate-oscillator', 'underwriting', 'upgrade-downgrade',
  'us-revenue', 'used-vehicle-sales', 'user-growth', 'veterinary-services', 'volatility',
  'volume-growth', 'volume-shipped', 'vwap', 'wafer-starts', 'wholesale-revenue',
  'williams-r', 'wind-capacity', 'workforce-analytics', 'working-capital', 'workout-content',
  'workspace-revenue', 'worth-buying',
]

// Core stock page types (applied to each ticker)
const STOCK_PAGE_TYPES = [
  'stock', 'price', 'quote', 'should-i-buy', 'buy', 'prediction', 'forecast',
  'earnings', 'dividend', 'growth', 'eps', 'valuation', 'analyst', 'revenue',
  'target-price', 'rating', 'competitors', 'insider', 'news', 'institutional',
  'ownership', 'financials', 'income-statement', 'options', 'chart', 'history',
  'sec', 'balance-sheet', 'profile', 'margins', 'debt', 'debt-analysis',
  'pe-ratio', 'cash-flow', 'short-interest', 'volume', '52-week-high',
  'market-cap', 'roe',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://lician.com'
  const currentDate = new Date().toISOString()
  const routes: MetadataRoute.Sitemap = []

  // Homepage
  routes.push({
    url: baseUrl,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 1.0,
  })

  // Main platform pages
  const mainPages = ['dashboard', 'screener', 'news', 'markets', 'earnings', 'dividends',
    'ipo', 'stock-splits', 'economic-calendar', 'analyst-ratings', 'insider-trading',
    'institutional', 'short-interest', 'options', 'bonds', 'forex', 'commodities',
    'crypto', 'etfs', 'penny-stocks', 'blue-chip-stocks', 'biotech', 'sectors',
    'insights', 'learn', 'premium', 'login']

  mainPages.forEach((page) => {
    routes.push({
      url: `${baseUrl}/${page}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    })
  })

  // Sector pages
  SECTORS.forEach((sector) => {
    routes.push({
      url: `${baseUrl}/sectors/${sector}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    })
  })

  // Industry pages
  INDUSTRIES.forEach((industry) => {
    routes.push({
      url: `${baseUrl}/stocks/${industry}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.85,
    })
  })

  // Stock pages - core pages for each ticker
  ALL_STOCKS.forEach((ticker, index) => {
    const basePriority = index < 20 ? 0.9 : index < 50 ? 0.85 : index < 100 ? 0.8 : 0.75
    const t = ticker.toLowerCase()

    // Main stock page
    routes.push({
      url: `${baseUrl}/stock/${t}`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: basePriority,
    })

    // Alternative ticker-stock URL format
    routes.push({
      url: `${baseUrl}/${t}-stock`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: basePriority - 0.05,
    })

    // Core stock page types
    STOCK_PAGE_TYPES.forEach((pageType) => {
      if (pageType !== 'stock') {
        routes.push({
          url: `${baseUrl}/${pageType}/${t}`,
          lastModified: currentDate,
          changeFrequency: pageType === 'news' ? 'hourly' : 'daily',
          priority: basePriority - 0.1,
        })
      }
    })
  })

  // pSEO Metric pages - limited to top 50 stocks to reduce sitemap size
  // Full metrics coverage available via /sitemap-metrics.xml
  const TOP_STOCKS = ALL_STOCKS.slice(0, 50)
  const TOP_METRICS = METRIC_PAGES.slice(0, 20)
  TOP_METRICS.forEach((metric) => {
    TOP_STOCKS.forEach((ticker, index) => {
      const basePriority = index < 20 ? 0.7 : 0.65
      routes.push({
        url: `${baseUrl}/${metric}/${ticker.toLowerCase()}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: basePriority,
      })
    })
  })

  // Comparison pages
  COMPARISON_PAIRS.forEach(([ticker1, ticker2]) => {
    routes.push({
      url: `${baseUrl}/compare/${ticker1.toLowerCase()}-vs-${ticker2.toLowerCase()}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.7,
    })
  })

  return routes
}
