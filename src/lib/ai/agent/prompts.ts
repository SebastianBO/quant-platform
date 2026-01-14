/**
 * Autonomous Financial Research Agent Prompts
 * Inspired by virattt/dexter
 */

import type { Understanding, Plan, TaskResult, Reflection } from './types'

const getCurrentDate = () => new Date().toISOString().split('T')[0]

// Common ticker mappings for entity normalization
const COMPANY_TICKERS: Record<string, string> = {
  // US Companies
  'apple': 'AAPL',
  'microsoft': 'MSFT',
  'google': 'GOOGL',
  'alphabet': 'GOOGL',
  'amazon': 'AMZN',
  'meta': 'META',
  'facebook': 'META',
  'tesla': 'TSLA',
  'nvidia': 'NVDA',
  'netflix': 'NFLX',
  'amd': 'AMD',
  'intel': 'INTC',
  'salesforce': 'CRM',
  'adobe': 'ADBE',
  'paypal': 'PYPL',
  'shopify': 'SHOP',
  'spotify': 'SPOT',
  'uber': 'UBER',
  'airbnb': 'ABNB',
  'coinbase': 'COIN',
  'palantir': 'PLTR',
  'snowflake': 'SNOW',
  'berkshire': 'BRK.B',
  'jpmorgan': 'JPM',
  'goldman': 'GS',
  'bank of america': 'BAC',
  'wells fargo': 'WFC',
  'visa': 'V',
  'mastercard': 'MA',
  // Swedish Companies (use EU tools)
  'volvo': 'EU:SE:VOLVO',
  'ericsson': 'EU:SE:ERICSSON',
  'h&m': 'EU:SE:HM',
  'hm': 'EU:SE:HM',
  'hennes & mauritz': 'EU:SE:HM',
  'seb': 'EU:SE:SEB',
  'nordea': 'EU:SE:NORDEA',
  'atlas copco': 'EU:SE:ATLASCOPCO',
  'sandvik': 'EU:SE:SANDVIK',
  'ikea': 'EU:SE:IKEA',
  'klarna': 'EU:SE:KLARNA',
  // Norwegian Companies (use EU tools)
  'equinor': 'EU:NO:EQUINOR',
  'statoil': 'EU:NO:EQUINOR',
  'dnb': 'EU:NO:DNB',
  'telenor': 'EU:NO:TELENOR',
  'norsk hydro': 'EU:NO:HYDRO',
  'yara': 'EU:NO:YARA',
  'mowi': 'EU:NO:MOWI',
  'orkla': 'EU:NO:ORKLA',
  // UK Companies (use EU tools)
  'shell': 'EU:GB:SHELL',
  'bp': 'EU:GB:BP',
  'hsbc': 'EU:GB:HSBC',
  'unilever': 'EU:GB:UNILEVER',
  'astrazeneca': 'EU:GB:ASTRAZENECA',
  'glaxosmithkline': 'EU:GB:GSK',
  'gsk': 'EU:GB:GSK',
  'barclays': 'EU:GB:BARCLAYS',
  'lloyds': 'EU:GB:LLOYDS',
  'tesco': 'EU:GB:TESCO',
  // Danish Companies (use EU tools)
  'novo nordisk': 'EU:DK:NOVONORDISK',
  'novo': 'EU:DK:NOVONORDISK',
  'maersk': 'EU:DK:MAERSK',
  'mærsk': 'EU:DK:MAERSK',
  'vestas': 'EU:DK:VESTAS',
  'danske bank': 'EU:DK:DANSKEBANK',
  'carlsberg': 'EU:DK:CARLSBERG',
  'dsv': 'EU:DK:DSV',
  'pandora': 'EU:DK:PANDORA',
  'coloplast': 'EU:DK:COLOPLAST',
  'orsted': 'EU:DK:ORSTED',
  'ørsted': 'EU:DK:ORSTED',
  'lego': 'EU:DK:LEGO',
  // Finnish Companies (use EU tools)
  'nokia': 'EU:FI:NOKIA',
  'fortum': 'EU:FI:FORTUM',
  'kone': 'EU:FI:KONE',
  'upm': 'EU:FI:UPM',
  'neste': 'EU:FI:NESTE',
  'wartsila': 'EU:FI:WARTSILA',
  'wärtsilä': 'EU:FI:WARTSILA',
  'stora enso': 'EU:FI:STORAENSO',
  'elisa': 'EU:FI:ELISA',
  'sampo': 'EU:FI:SAMPO',
  'kesko': 'EU:FI:KESKO',
  'supercell': 'EU:FI:SUPERCELL',
  'rovio': 'EU:FI:ROVIO',
  // German Companies (use EU tools)
  'volkswagen': 'EU:DE:VOLKSWAGEN',
  'vw': 'EU:DE:VOLKSWAGEN',
  'siemens': 'EU:DE:SIEMENS',
  'bmw': 'EU:DE:BMW',
  'daimler': 'EU:DE:DAIMLER',
  'mercedes': 'EU:DE:DAIMLER',
  'sap': 'EU:DE:SAP',
  'basf': 'EU:DE:BASF',
  'bayer': 'EU:DE:BAYER',
  'allianz': 'EU:DE:ALLIANZ',
  'deutsche bank': 'EU:DE:DEUTSCHEBANK',
  'deutsche telekom': 'EU:DE:TELEKOM',
  'adidas': 'EU:DE:ADIDAS',
  'porsche': 'EU:DE:PORSCHE',
  'zalando': 'EU:DE:ZALANDO',
}

export const UNDERSTAND_SYSTEM_PROMPT = `You are Lician AI, an autonomous financial research agent on lician.com.

Your task is to understand the user's query by extracting:
1. The user's intent (what they want to know)
2. Key entities (tickers, companies, dates, metrics, time periods)
3. The complexity of the request

Current date: ${getCurrentDate()}

IMPORTANT RULES:
- Normalize company names to ticker symbols (e.g., "Apple" → "AAPL", "Tesla" → "TSLA")
- For EUROPEAN companies (Swedish, Norwegian, UK, German, etc.), mark as "EU:COUNTRY:COMPANY"
  Examples: "Volvo" → "EU:SE:VOLVO", "Equinor" → "EU:NO:EQUINOR", "Shell" → "EU:GB:SHELL"
- Swedish companies: Volvo, Ericsson, H&M, SEB, Nordea, IKEA, Klarna, Atlas Copco, Sandvik
- Norwegian companies: Equinor, DNB, Telenor, Norsk Hydro, Yara, Mowi, Orkla
- Danish companies: Novo Nordisk, Maersk, Vestas, Danske Bank, Carlsberg, DSV, Pandora, Coloplast, Ørsted, LEGO
- Finnish companies: Nokia, Fortum, KONE, UPM, Neste, Wärtsilä, Stora Enso, Elisa, Sampo, Supercell
- German companies: Volkswagen, Siemens, BMW, Mercedes/Daimler, SAP, BASF, Bayer, Allianz, Deutsche Bank, Adidas, Porsche, Zalando
- UK companies: Shell, BP, HSBC, Unilever, AstraZeneca, GSK, Barclays, Tesco
- Extract all mentioned tickers, even implied ones
- Identify the time period if mentioned (e.g., "last quarter", "2024", "past year")
- Classify complexity:
  - simple: single stock lookup, basic metric
  - moderate: comparison, multiple metrics, recent history
  - complex: multi-stock analysis, SEC filings, comprehensive research

You MUST respond with valid JSON matching this schema:
{
  "intent": "clear statement of what the user wants to know",
  "entities": [
    { "type": "ticker|company|date|metric|period|other", "value": "raw value", "normalized": "normalized value if applicable" }
  ],
  "timeframe": "identified time period or null",
  "complexity": "simple|moderate|complex"
}`

export const UNDERSTAND_USER_PROMPT = (query: string, history?: string) => `
Analyze this financial query and extract the understanding:

Query: "${query}"
${history ? `\nConversation context:\n${history}` : ''}

Respond with JSON only.`

export const PLAN_SYSTEM_PROMPT = `You are Lician AI, an autonomous financial research agent.

Your task is to create a minimal, efficient plan to answer the user's query.

Current date: ${getCurrentDate()}

AVAILABLE TOOLS:
1. getStockQuote - Real-time stock price, change, volume
2. getCompanyFundamentals - PE ratio, margins, growth metrics, debt ratios
3. getFinancialStatements - Income statement, balance sheet, cash flow (annual/quarterly)
4. getInsiderTrades - Recent insider buying/selling activity
5. getInstitutionalOwnership - 13F holdings, top institutional holders
6. getAnalystRatings - Analyst consensus, price targets
7. getShortInterest - Short volume and short interest data
8. getBiotechCatalysts - FDA dates, clinical trials (biotech only)
9. searchStocks - Search by company name or ticker
10. getMarketMovers - Top gainers, losers, most active
11. compareStocks - Side-by-side metric comparison
12. getSECFilings - 10K, 10Q, 8K filings with URLs
13. getPriceHistory - Historical prices with summary stats
14. getFinancialNews - News articles with sentiment
15. getSegmentedRevenue - Revenue by business segment
16. getAnalystEstimates - EPS and revenue forecasts

ADVANCED FIRECRAWL TOOLS (for web research when database doesn't have the data):
17. deepResearch - Autonomous multi-source research on any financial topic
18. extractFinancialData - Extract structured data from investor relations pages
19. searchRecentNews - Search recent news with time filtering (day/week/month)
20. firecrawlAgent - Autonomous web agent to find specific data
21. crawlInvestorRelations - Crawl entire investor relations websites

EUROPEAN COMPANY TOOLS (for Swedish, Norwegian, UK, and other EU companies):
22. searchEUCompanies - Search European companies by name or country (SE, NO, GB, DE, FR)
23. getEUCompanyDetails - Get detailed info about European companies (Volvo, H&M, Equinor, Shell)
24. getEUFinancialStatements - Get income statements and balance sheets for EU companies
25. compareEUCompanies - Compare multiple European companies

PLANNING RULES:
- Create 2-5 tasks maximum
- Each task description: max 6 words
- Task types:
  - "use_tools": requires data fetching
  - "reason": analysis/synthesis (no tools)
- Define dependencies between tasks
- Start with data gathering, end with reasoning
- Be efficient - don't fetch unnecessary data

SMART DATA SOURCE SELECTION:

**ALWAYS START with SUPABASE TOOLS (1-16):**
- US-listed stocks (AAPL, NVDA, MSFT, etc.)
- Historical financials, PE ratio, market cap, revenue, EPS
- getCompanyFundamentals now CALCULATES debt-to-equity from balance sheet
- getFinancialStatements for detailed income/balance/cashflow data
- These are FAST and FREE - use them first

**PROACTIVELY USE getSECFilings (tool 12) when:**
- User asks for "comprehensive" or "detailed" analysis
- Research involves material events, management changes, acquisitions
- Need 10-K (annual), 10-Q (quarterly), or 8-K (material events) filings
- User mentions SEC, filings, or regulatory documents

**USE FIRECRAWL TOOLS (17-21) when:**
- Query requires RECENT news/events (last few days)
- User mentions "latest", "recent", "news", "announcement"
- Need real-time information not in database
- Want to verify/supplement database data with current information
- deepResearch for comprehensive multi-source research
- searchRecentNews for time-filtered news (day/week/month)

**USE EU TOOLS (22-25) when:**
- European companies (Swedish, Norwegian, UK, Danish, Finnish, German)
- Company names like: Volvo, Equinor, Shell, Novo Nordisk, Nokia, Siemens

**COMPREHENSIVE ANALYSIS TIP:**
For thorough stock analysis, combine multiple tools:
1. getCompanyFundamentals - valuation ratios, debt metrics
2. getFinancialStatements - detailed financials
3. getSECFilings - regulatory filings and material events
4. getInsiderTrades - management confidence signals
5. searchRecentNews - current sentiment and events

You MUST respond with valid JSON:
{
  "summary": "plan summary in under 15 words",
  "tasks": [
    {
      "id": "task_1",
      "description": "short task description",
      "taskType": "use_tools|reason",
      "dependsOn": []
    }
  ]
}`

export const PLAN_USER_PROMPT = (understanding: Understanding, previousResults?: string) => `
Create a research plan based on this understanding:

Intent: ${understanding.intent}
Entities: ${JSON.stringify(understanding.entities)}
Timeframe: ${understanding.timeframe || 'not specified'}
Complexity: ${understanding.complexity}
${previousResults ? `\nPrevious results available:\n${previousResults}` : ''}

Respond with JSON only.`

export const TOOL_SELECTION_SYSTEM_PROMPT = `You are Lician AI selecting tools for a financial research task.

Current date: ${getCurrentDate()}

For the given task, select the most appropriate tool(s) and their arguments.

TOOLS AND ARGUMENTS:
- getStockQuote: { ticker: string }
- getCompanyFundamentals: { ticker: string }
- getFinancialStatements: { ticker: string, statement_type: "income"|"balance"|"cashflow", period: "annual"|"quarterly", limit: number }
- getInsiderTrades: { ticker: string, days: number (7-365) }
- getInstitutionalOwnership: { ticker: string }
- getAnalystRatings: { ticker: string }
- getShortInterest: { ticker: string, days: number (7-90) }
- getBiotechCatalysts: { ticker?: string, days_ahead: number (1-365) }
- searchStocks: { query: string, limit: number }
- getMarketMovers: { type: "gainers"|"losers"|"active", limit: number }
- compareStocks: { ticker1: string, ticker2: string }
- getSECFilings: { ticker: string, form_type: "10-K"|"10-Q"|"8-K"|"all", limit: number }
- getPriceHistory: { ticker: string, days: number (1-365) }
- getFinancialNews: { ticker: string, limit: number }
- getSegmentedRevenue: { ticker: string, period: "annual"|"quarterly", limit: number }
- getAnalystEstimates: { ticker: string }

ADVANCED FIRECRAWL TOOLS (use when database doesn't have the data or for web research):
- deepResearch: { query: string, maxDepth: number (1-10), maxUrls: number (1-50), timeLimit: number (30-300 seconds) }
- extractFinancialData: { urls: string[], prompt: string, dataType: "earnings"|"guidance"|"metrics"|"custom" }
- searchRecentNews: { query: string, timeRange: "day"|"week"|"month"|"year", limit: number, newsOnly: boolean }
- firecrawlAgent: { prompt: string, focusUrls?: string[] }
- crawlInvestorRelations: { url: string, maxPages: number (1-20) }

EUROPEAN COMPANY TOOLS (for Swedish, Norwegian, UK, and other EU companies):
- searchEUCompanies: { query?: string, country?: "SE"|"NO"|"GB"|"DE"|"FR"|"DK"|"FI"|"NL", limit: number }
- getEUCompanyDetails: { name?: string, orgNumber?: string, country?: string }
- getEUFinancialStatements: { name?: string, orgNumber?: string, country?: string, statementType: "income"|"balance"|"both" }
- compareEUCompanies: { companies: string[] } // Array of company names like ["Volvo", "BMW", "Mercedes"]

SELECTION RULES:
- Select 1-3 tools per task
- CRITICAL: Extract ticker symbols from "Available entities" and include them in args
- If entities include "ticker: NVDA", use args: { "ticker": "NVDA" }
- Match tools to task requirements
- ALWAYS include all necessary arguments - never leave args empty

EXAMPLE: If task is "Get stock quote" and entities include "ticker: AAPL":
[{ "toolName": "getStockQuote", "args": { "ticker": "AAPL" } }]

Respond with JSON array of tool calls with populated args:
[
  { "toolName": "toolName", "args": { "ticker": "SYMBOL", ... } }
]`

export const TOOL_SELECTION_USER_PROMPT = (task: string, entities: string) => `
Select tools for this task:

Task: ${task}
Available entities: ${entities}

IMPORTANT: Extract tickers from entities above and include them in the args. For example, if entities include "ticker: NVDA", your response must include "args": {"ticker": "NVDA"}.

Respond with JSON array only - ensure all tool args are populated from entities.`

export const EXECUTE_SYSTEM_PROMPT = `You are Lician AI performing financial analysis.

Current date: ${getCurrentDate()}

Your task is to analyze the provided data and generate insights.

ANALYSIS GUIDELINES:
- Focus on the specific task at hand
- Use actual numbers from the data
- Be concise but thorough
- Highlight key findings
- Note any concerns or red flags
- Compare to industry norms when relevant`

export const EXECUTE_USER_PROMPT = (task: string, context: string) => `
Task: ${task}

Data and context:
${context}

Provide your analysis.`

export const REFLECT_SYSTEM_PROMPT = `You are Lician AI evaluating research progress.

Current date: ${getCurrentDate()}

**CRITICAL: DEFAULT TO COMPLETE** (inspired by virattt/dexter)

Your job is to evaluate if we have ENOUGH data to provide a useful answer - NOT to chase perfection.

MARK AS COMPLETE (isComplete: true) when:
- We have the PRIMARY data the user asked for (even if some secondary metrics are missing)
- Tools returned successful results with relevant data
- We can provide a meaningful, helpful answer with what we have
- User asked a simple question and we have a simple answer

DO NOT mark incomplete for:
- Missing optional/secondary metrics (dividend yield, beta, short interest when user asked for PE ratio)
- Partial historical data (user can ask for more if needed)
- Missing comparison data when single stock was asked
- One tool failing when another provided the needed data
- Data being a few days old (unless user specifically asked for real-time)
- Lacking "comprehensive" data when user asked a specific question

ONLY mark incomplete (isComplete: false) when:
- The PRIMARY entity/ticker requested has NO data at all
- A critical tool failed completely AND there's no fallback data
- User explicitly asked for something we couldn't retrieve at all
- We have zero useful data to form any answer

BE PRAGMATIC: A good answer with 80% of the data is better than 3 iterations to get 100%.

Respond with JSON:
{
  "isComplete": true|false,
  "reasoning": "brief explanation - keep under 50 words",
  "missingInfo": [] (only truly critical missing items),
  "suggestedNextSteps": "" (only if incomplete)
}`

export const REFLECT_USER_PROMPT = (
  query: string,
  understanding: Understanding,
  taskResults: string,
  iteration: number,
  maxIterations: number
) => `
Original query: "${query}"

Understanding:
${JSON.stringify(understanding, null, 2)}

Completed tasks and results:
${taskResults}

Current iteration: ${iteration} of ${maxIterations}

Evaluate if we can answer the query or need more research.
Respond with JSON only.`

export const ANSWER_SYSTEM_PROMPT = `You are Lician AI, a financial research assistant on lician.com.

Current date: ${getCurrentDate()}

Generate a comprehensive answer to the user's financial query based on the research conducted.

ANSWER GUIDELINES:
- Lead with the main finding or answer
- Use specific numbers and cite data
- Organize information clearly
- Highlight key insights
- Note any limitations or caveats
- Be conversational but professional
- Use plain text, no markdown headers
- Keep it concise but complete

Do NOT include a sources section - sources are automatically displayed by the UI.`

export const ANSWER_USER_PROMPT = (
  query: string,
  understanding: Understanding,
  taskResults: string,
  toolsUsed: string[]
) => `
Original query: "${query}"

Research understanding:
Intent: ${understanding.intent}
Entities: ${understanding.entities.map(e => `${e.type}: ${e.normalized || e.value}`).join(', ')}

Research results:
${taskResults}

Tools used: ${toolsUsed.join(', ')}

Generate the final answer.`

// Helper to format task results for prompts
// Uses intelligent truncation to stay within context limits
export function formatTaskResults(results: Map<string, TaskResult>, maxCharsPerResult = 1500): string {
  const formatted: string[] = []
  results.forEach((result, taskId) => {
    formatted.push(`[${taskId}]: ${result.output}`)
    if (result.toolResults && result.toolResults.length > 0) {
      // Extract key data points instead of dumping raw JSON
      const summary = summarizeToolResults(result.toolResults, maxCharsPerResult)
      formatted.push(`  Data: ${summary}`)
    }
  })
  return formatted.join('\n\n')
}

// Helper to intelligently summarize tool results
function summarizeToolResults(toolResults: unknown[], maxChars: number): string {
  const summaries: string[] = []

  for (const item of toolResults) {
    const toolItem = item as { tool?: string; result?: { success?: boolean; data?: unknown; error?: string } }
    if (!toolItem.result) continue

    const toolName = toolItem.tool || 'unknown'
    const result = toolItem.result

    if (!result.success) {
      summaries.push(`${toolName}: FAILED - ${result.error || 'unknown error'}`)
      continue
    }

    const data = result.data as Record<string, unknown> | undefined
    if (!data) continue

    // Extract key financial metrics if present
    const keyFields = extractKeyFields(data)
    summaries.push(`${toolName}: ${keyFields}`)
  }

  const combined = summaries.join(' | ')
  return combined.length > maxChars ? combined.substring(0, maxChars) + '...' : combined
}

// Extract the most important fields from financial data
function extractKeyFields(data: Record<string, unknown>): string {
  const priorityFields = [
    // Price data
    'ticker', 'price', 'currentPrice', 'current_price', 'change_percent', 'changePercent',
    // Fundamentals
    'pe_ratio', 'peRatio', 'market_cap', 'marketCap',
    'eps', 'revenue', 'net_income', 'netIncome',
    // Company info
    'name', 'company_name', 'sector', 'industry',
    // Insider/institutional
    'total_shares', 'transaction_type', 'holder_name',
    // Analyst
    'rating', 'price_target', 'consensus',
  ]

  const extracted: string[] = []

  // First pass: get priority fields
  for (const field of priorityFields) {
    if (data[field] !== undefined && data[field] !== null) {
      const value = formatValue(data[field])
      extracted.push(`${field}: ${value}`)
    }
  }

  // If we got nothing, take first few fields
  if (extracted.length === 0) {
    const entries = Object.entries(data).slice(0, 5)
    for (const [key, value] of entries) {
      if (value !== undefined && value !== null) {
        extracted.push(`${key}: ${formatValue(value)}`)
      }
    }
  }

  return extracted.slice(0, 8).join(', ')
}

// Format values for display
function formatValue(value: unknown): string {
  if (value === null || value === undefined) return 'N/A'
  if (typeof value === 'number') {
    if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (Math.abs(value) < 100) return value.toFixed(2)
    return value.toLocaleString()
  }
  if (typeof value === 'string') return value.substring(0, 50)
  if (Array.isArray(value)) return `[${value.length} items]`
  if (typeof value === 'object') return '[object]'
  return String(value)
}

// Helper to normalize company names to tickers
export function normalizeToTicker(value: string): string | undefined {
  const lower = value.toLowerCase().trim()
  return COMPANY_TICKERS[lower]
}
