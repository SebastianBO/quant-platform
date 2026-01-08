/**
 * GICS Sectors and Industries for pSEO pages
 * Based on Global Industry Classification Standard
 */

export const SECTORS = [
  'technology',
  'healthcare',
  'financials',
  'consumer-discretionary',
  'consumer-staples',
  'industrials',
  'energy',
  'utilities',
  'real-estate',
  'materials',
  'communication-services',
]

export const SECTOR_NAMES: Record<string, string> = {
  'technology': 'Technology',
  'healthcare': 'Healthcare',
  'financials': 'Financials',
  'consumer-discretionary': 'Consumer Discretionary',
  'consumer-staples': 'Consumer Staples',
  'industrials': 'Industrials',
  'energy': 'Energy',
  'utilities': 'Utilities',
  'real-estate': 'Real Estate',
  'materials': 'Materials',
  'communication-services': 'Communication Services',
}

export const INDUSTRIES = [
  // Technology
  'software', 'semiconductors', 'it-services', 'hardware', 'electronic-equipment',
  'technology-distributors', 'communications-equipment', 'internet-services',

  // Healthcare
  'biotechnology', 'pharmaceuticals', 'healthcare-equipment', 'healthcare-services',
  'life-sciences-tools', 'managed-healthcare', 'healthcare-facilities',
  'healthcare-distributors', 'healthcare-technology',

  // Financials
  'banks', 'diversified-financials', 'insurance', 'capital-markets',
  'consumer-finance', 'mortgage-reits', 'asset-management', 'financial-exchanges',

  // Consumer Discretionary
  'retail', 'automobiles', 'hotels-restaurants', 'household-durables',
  'textiles-apparel', 'leisure-products', 'auto-components', 'distributors',

  // Consumer Staples
  'food-beverage', 'household-products', 'personal-products', 'food-retail',
  'tobacco', 'hypermarkets', 'drug-retail',

  // Industrials
  'aerospace-defense', 'machinery', 'industrial-conglomerates', 'electrical-equipment',
  'building-products', 'construction-engineering', 'trading-companies',
  'commercial-services', 'professional-services', 'air-freight', 'airlines',
  'marine', 'road-rail', 'transportation-infrastructure',

  // Energy
  'oil-gas-exploration', 'oil-gas-equipment', 'oil-gas-refining', 'oil-gas-storage',
  'coal-consumable-fuels', 'integrated-oil-gas',

  // Utilities
  'electric-utilities', 'gas-utilities', 'multi-utilities', 'water-utilities',
  'independent-power', 'renewable-electricity',

  // Real Estate
  'equity-reits', 'real-estate-management', 'real-estate-development',
  'diversified-reits', 'industrial-reits', 'hotel-reits', 'office-reits',
  'healthcare-reits', 'residential-reits', 'retail-reits', 'specialized-reits',

  // Materials
  'chemicals', 'construction-materials', 'containers-packaging', 'metals-mining',
  'paper-forest-products', 'gold', 'silver', 'steel', 'aluminum', 'copper',

  // Communication Services
  'media', 'entertainment', 'interactive-media', 'telecom-services',
  'wireless-telecom', 'advertising', 'broadcasting', 'cable-satellite',
  'publishing', 'movies-entertainment',
]

export const INDUSTRY_NAMES: Record<string, string> = {
  'software': 'Software',
  'semiconductors': 'Semiconductors',
  'it-services': 'IT Services',
  'hardware': 'Computer Hardware',
  'electronic-equipment': 'Electronic Equipment',
  'technology-distributors': 'Technology Distributors',
  'communications-equipment': 'Communications Equipment',
  'internet-services': 'Internet Services',
  'biotechnology': 'Biotechnology',
  'pharmaceuticals': 'Pharmaceuticals',
  'healthcare-equipment': 'Healthcare Equipment',
  'healthcare-services': 'Healthcare Services',
  'life-sciences-tools': 'Life Sciences Tools',
  'managed-healthcare': 'Managed Healthcare',
  'healthcare-facilities': 'Healthcare Facilities',
  'healthcare-distributors': 'Healthcare Distributors',
  'healthcare-technology': 'Healthcare Technology',
  'banks': 'Banks',
  'diversified-financials': 'Diversified Financials',
  'insurance': 'Insurance',
  'capital-markets': 'Capital Markets',
  'consumer-finance': 'Consumer Finance',
  'mortgage-reits': 'Mortgage REITs',
  'asset-management': 'Asset Management',
  'financial-exchanges': 'Financial Exchanges',
  'retail': 'Retail',
  'automobiles': 'Automobiles',
  'hotels-restaurants': 'Hotels & Restaurants',
  'household-durables': 'Household Durables',
  'textiles-apparel': 'Textiles & Apparel',
  'leisure-products': 'Leisure Products',
  'auto-components': 'Auto Components',
  'distributors': 'Distributors',
  'food-beverage': 'Food & Beverage',
  'household-products': 'Household Products',
  'personal-products': 'Personal Products',
  'food-retail': 'Food Retail',
  'tobacco': 'Tobacco',
  'hypermarkets': 'Hypermarkets',
  'drug-retail': 'Drug Retail',
  'aerospace-defense': 'Aerospace & Defense',
  'machinery': 'Machinery',
  'industrial-conglomerates': 'Industrial Conglomerates',
  'electrical-equipment': 'Electrical Equipment',
  'building-products': 'Building Products',
  'construction-engineering': 'Construction & Engineering',
  'trading-companies': 'Trading Companies',
  'commercial-services': 'Commercial Services',
  'professional-services': 'Professional Services',
  'air-freight': 'Air Freight & Logistics',
  'airlines': 'Airlines',
  'marine': 'Marine',
  'road-rail': 'Road & Rail',
  'transportation-infrastructure': 'Transportation Infrastructure',
  'oil-gas-exploration': 'Oil & Gas Exploration',
  'oil-gas-equipment': 'Oil & Gas Equipment',
  'oil-gas-refining': 'Oil & Gas Refining',
  'oil-gas-storage': 'Oil & Gas Storage',
  'coal-consumable-fuels': 'Coal & Consumable Fuels',
  'integrated-oil-gas': 'Integrated Oil & Gas',
  'electric-utilities': 'Electric Utilities',
  'gas-utilities': 'Gas Utilities',
  'multi-utilities': 'Multi-Utilities',
  'water-utilities': 'Water Utilities',
  'independent-power': 'Independent Power',
  'renewable-electricity': 'Renewable Electricity',
  'equity-reits': 'Equity REITs',
  'real-estate-management': 'Real Estate Management',
  'real-estate-development': 'Real Estate Development',
  'diversified-reits': 'Diversified REITs',
  'industrial-reits': 'Industrial REITs',
  'hotel-reits': 'Hotel REITs',
  'office-reits': 'Office REITs',
  'healthcare-reits': 'Healthcare REITs',
  'residential-reits': 'Residential REITs',
  'retail-reits': 'Retail REITs',
  'specialized-reits': 'Specialized REITs',
  'chemicals': 'Chemicals',
  'construction-materials': 'Construction Materials',
  'containers-packaging': 'Containers & Packaging',
  'metals-mining': 'Metals & Mining',
  'paper-forest-products': 'Paper & Forest Products',
  'gold': 'Gold',
  'silver': 'Silver',
  'steel': 'Steel',
  'aluminum': 'Aluminum',
  'copper': 'Copper',
  'media': 'Media',
  'entertainment': 'Entertainment',
  'interactive-media': 'Interactive Media',
  'telecom-services': 'Telecom Services',
  'wireless-telecom': 'Wireless Telecom',
  'advertising': 'Advertising',
  'broadcasting': 'Broadcasting',
  'cable-satellite': 'Cable & Satellite',
  'publishing': 'Publishing',
  'movies-entertainment': 'Movies & Entertainment',
}

// Metrics for ranking pages
export const RANKING_METRICS = [
  // Valuation
  'pe-ratio', 'forward-pe', 'price-to-book', 'price-to-sales', 'ev-ebitda', 'peg-ratio',
  // Profitability
  'profit-margin', 'operating-margin', 'gross-margin', 'net-margin', 'roa', 'roe', 'roic',
  // Growth
  'revenue-growth', 'earnings-growth', 'eps-growth', 'dividend-growth',
  // Dividends
  'dividend-yield', 'payout-ratio',
  // Size
  'market-cap', 'enterprise-value', 'revenue', 'net-income',
  // Momentum
  'ytd-return', '52-week-return', '1-month-return', '3-month-return',
  // Risk
  'beta', 'volatility',
  // Short Interest
  'short-interest', 'days-to-cover', 'short-ratio',
  // Analyst
  'analyst-rating', 'price-target-upside', 'analyst-count',
  // Insider
  'insider-buying', 'insider-ownership',
  // Institutional
  'institutional-ownership', 'institutional-buying',
]

export const METRIC_NAMES: Record<string, string> = {
  'pe-ratio': 'P/E Ratio',
  'forward-pe': 'Forward P/E',
  'price-to-book': 'Price to Book',
  'price-to-sales': 'Price to Sales',
  'ev-ebitda': 'EV/EBITDA',
  'peg-ratio': 'PEG Ratio',
  'profit-margin': 'Profit Margin',
  'operating-margin': 'Operating Margin',
  'gross-margin': 'Gross Margin',
  'net-margin': 'Net Margin',
  'roa': 'Return on Assets',
  'roe': 'Return on Equity',
  'roic': 'Return on Invested Capital',
  'revenue-growth': 'Revenue Growth',
  'earnings-growth': 'Earnings Growth',
  'eps-growth': 'EPS Growth',
  'dividend-growth': 'Dividend Growth',
  'dividend-yield': 'Dividend Yield',
  'payout-ratio': 'Payout Ratio',
  'market-cap': 'Market Cap',
  'enterprise-value': 'Enterprise Value',
  'revenue': 'Revenue',
  'net-income': 'Net Income',
  'ytd-return': 'YTD Return',
  '52-week-return': '52-Week Return',
  '1-month-return': '1-Month Return',
  '3-month-return': '3-Month Return',
  'beta': 'Beta',
  'volatility': 'Volatility',
  'short-interest': 'Short Interest',
  'days-to-cover': 'Days to Cover',
  'short-ratio': 'Short Ratio',
  'analyst-rating': 'Analyst Rating',
  'price-target-upside': 'Price Target Upside',
  'analyst-count': 'Analyst Count',
  'insider-buying': 'Insider Buying',
  'insider-ownership': 'Insider Ownership',
  'institutional-ownership': 'Institutional Ownership',
  'institutional-buying': 'Institutional Buying',
}
