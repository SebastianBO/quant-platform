/**
 * Smart Biotech Company Mapper
 *
 * Automatically maps stock tickers to clinical trial sponsors using:
 * 1. SEC EDGAR for official company names (CIK lookup)
 * 2. openFDA for manufacturer names used in drug approvals
 * 3. Fuzzy matching for ClinicalTrials.gov sponsor variations
 * 4. Learning from successful matches
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Common biotech/pharma suffixes and variations to normalize
const COMPANY_SUFFIXES = [
  ' Inc.', ' Inc', ' Incorporated', ' Corp.', ' Corp', ' Corporation',
  ' LLC', ' L.L.C.', ' Ltd.', ' Ltd', ' Limited', ' PLC', ' plc',
  ' Co.', ' Co', ' Company', ' Pharmaceuticals', ' Pharmaceutical',
  ' Biopharmaceuticals', ' Therapeutics', ' Biosciences', ' Sciences',
  ' Biotech', ' Biotechnology', ' AG', ' SA', ' SE', ' NV', ' BV',
  ', Inc.', ', Inc', ', LLC', ', Ltd.'
]

// Normalize company name for matching
export function normalizeCompanyName(name: string): string {
  let normalized = name.trim()

  // Remove common suffixes
  for (const suffix of COMPANY_SUFFIXES) {
    if (normalized.toLowerCase().endsWith(suffix.toLowerCase())) {
      normalized = normalized.slice(0, -suffix.length).trim()
    }
  }

  // Remove punctuation and extra spaces
  normalized = normalized
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()

  return normalized
}

// Calculate similarity score between two strings (0-1)
export function similarityScore(str1: string, str2: string): number {
  const s1 = normalizeCompanyName(str1)
  const s2 = normalizeCompanyName(str2)

  if (s1 === s2) return 1.0

  // Check if one contains the other
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.9
  }

  // Levenshtein distance-based similarity
  const maxLen = Math.max(s1.length, s2.length)
  if (maxLen === 0) return 1.0

  const distance = levenshteinDistance(s1, s2)
  return 1 - (distance / maxLen)
}

function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length
  const n = str2.length
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
  }

  return dp[m][n]
}

// Fetch company info from SEC EDGAR
export async function fetchCompanyFromSEC(ticker: string): Promise<{
  cik: string
  companyName: string
  ticker: string
} | null> {
  try {
    // SEC company tickers JSON endpoint
    const response = await fetch(
      'https://www.sec.gov/files/company_tickers.json',
      {
        headers: {
          'User-Agent': 'QuantPlatform contact@example.com',
          'Accept': 'application/json'
        }
      }
    )

    if (!response.ok) return null

    const data = await response.json()

    // Find by ticker
    for (const key of Object.keys(data)) {
      const company = data[key]
      if (company.ticker?.toUpperCase() === ticker.toUpperCase()) {
        return {
          cik: String(company.cik_str).padStart(10, '0'),
          companyName: company.title,
          ticker: company.ticker
        }
      }
    }

    return null
  } catch (error) {
    console.error('SEC EDGAR lookup failed:', error)
    return null
  }
}

// Fetch manufacturer names from openFDA
export async function fetchManufacturerFromFDA(companyName: string): Promise<string[]> {
  try {
    const searchName = encodeURIComponent(companyName.split(' ')[0]) // Use first word
    const response = await fetch(
      `https://api.fda.gov/drug/drugsfda.json?search=openfda.manufacturer_name:${searchName}&limit=10`
    )

    if (!response.ok) return []

    const data = await response.json()
    const manufacturers = new Set<string>()

    for (const result of data.results || []) {
      const names = result.openfda?.manufacturer_name || []
      names.forEach((name: string) => manufacturers.add(name))
    }

    return Array.from(manufacturers)
  } catch (error) {
    console.error('openFDA lookup failed:', error)
    return []
  }
}

// Fetch sponsor variations from ClinicalTrials.gov
export async function fetchSponsorVariations(companyName: string): Promise<string[]> {
  try {
    // Search for studies by this sponsor
    const searchName = encodeURIComponent(companyName)
    const response = await fetch(
      `https://clinicaltrials.gov/api/v2/studies?query.spons=${searchName}&pageSize=20&format=json`
    )

    if (!response.ok) return []

    const data = await response.json()
    const sponsors = new Set<string>()

    for (const study of data.studies || []) {
      const sponsor = study.protocolSection?.sponsorCollaboratorsModule?.leadSponsor?.name
      if (sponsor) sponsors.add(sponsor)

      // Also get collaborators
      const collaborators = study.protocolSection?.sponsorCollaboratorsModule?.collaborators || []
      for (const collab of collaborators) {
        if (collab.name) sponsors.add(collab.name)
      }
    }

    return Array.from(sponsors)
  } catch (error) {
    console.error('ClinicalTrials.gov lookup failed:', error)
    return []
  }
}

// Main function: Auto-discover and map a biotech company
export async function autoMapBiotechCompany(
  ticker: string,
  supabase?: SupabaseClient
): Promise<{
  ticker: string
  companyName: string
  cik: string | null
  sponsorAliases: string[]
  fdaManufacturerNames: string[]
  confidence: number
}> {
  const result = {
    ticker: ticker.toUpperCase(),
    companyName: '',
    cik: null as string | null,
    sponsorAliases: [] as string[],
    fdaManufacturerNames: [] as string[],
    confidence: 0
  }

  // 1. Get official company name from SEC
  const secData = await fetchCompanyFromSEC(ticker)
  if (secData) {
    result.companyName = secData.companyName
    result.cik = secData.cik
    result.confidence += 0.4
  }

  // If no SEC data, we can't proceed reliably
  if (!result.companyName) {
    return result
  }

  // 2. Get FDA manufacturer names
  result.fdaManufacturerNames = await fetchManufacturerFromFDA(result.companyName)
  if (result.fdaManufacturerNames.length > 0) {
    result.confidence += 0.2
  }

  // 3. Get sponsor variations from ClinicalTrials.gov
  const ctSponsors = await fetchSponsorVariations(result.companyName)

  // 4. Match and deduplicate all variations
  const allVariations = new Set<string>([result.companyName])

  // Add FDA names that are similar
  for (const fdaName of result.fdaManufacturerNames) {
    if (similarityScore(fdaName, result.companyName) > 0.5) {
      allVariations.add(fdaName)
    }
  }

  // Add CT.gov sponsors that are similar
  for (const sponsor of ctSponsors) {
    if (similarityScore(sponsor, result.companyName) > 0.5) {
      allVariations.add(sponsor)
    }
  }

  result.sponsorAliases = Array.from(allVariations)

  if (result.sponsorAliases.length > 1) {
    result.confidence += 0.2
  }

  // 5. Verify by checking if we can find trials
  if (result.sponsorAliases.length > 0) {
    const verifyResponse = await fetch(
      `https://clinicaltrials.gov/api/v2/studies?query.spons=${encodeURIComponent(result.sponsorAliases[0])}&pageSize=1&format=json`
    )
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json()
      if (verifyData.studies?.length > 0) {
        result.confidence += 0.2
      }
    }
  }

  // 6. Save to database if we have supabase client
  if (supabase && result.confidence >= 0.6) {
    await supabase.from('biotech_company_mapping').upsert({
      ticker: result.ticker,
      company_name: result.companyName,
      cik: result.cik,
      sponsor_aliases: result.sponsorAliases,
      is_biotech: true,
      updated_at: new Date().toISOString()
    }, { onConflict: 'ticker' })
  }

  return result
}

// Batch discover multiple tickers
export async function batchDiscoverBiotechCompanies(
  tickers: string[],
  supabase?: SupabaseClient
): Promise<Map<string, Awaited<ReturnType<typeof autoMapBiotechCompany>>>> {
  const results = new Map<string, Awaited<ReturnType<typeof autoMapBiotechCompany>>>()

  for (const ticker of tickers) {
    // Rate limit: wait between requests
    await new Promise(resolve => setTimeout(resolve, 1000))

    const mapping = await autoMapBiotechCompany(ticker, supabase)
    results.set(ticker, mapping)

    console.log(`Mapped ${ticker}: ${mapping.companyName} (confidence: ${mapping.confidence})`)
  }

  return results
}

// Find best matching ticker for a sponsor name
export async function findTickerForSponsor(
  sponsorName: string,
  supabase: SupabaseClient
): Promise<string | null> {
  // First check our mapping table
  const { data: mappings } = await supabase
    .from('biotech_company_mapping')
    .select('ticker, company_name, sponsor_aliases')

  if (!mappings) return null

  let bestMatch: { ticker: string; score: number } | null = null

  for (const mapping of mappings) {
    // Check company name
    let score = similarityScore(sponsorName, mapping.company_name)

    // Check aliases
    for (const alias of mapping.sponsor_aliases || []) {
      const aliasScore = similarityScore(sponsorName, alias)
      if (aliasScore > score) score = aliasScore
    }

    if (score > 0.7 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { ticker: mapping.ticker, score }
    }
  }

  return bestMatch?.ticker || null
}

// Healthcare/Biotech sector tickers for auto-discovery
export const BIOTECH_TICKERS = [
  // Large Cap Pharma
  'PFE', 'JNJ', 'ABBV', 'MRK', 'LLY', 'BMY', 'AMGN', 'GILD', 'REGN', 'VRTX',
  // Large Cap Biotech
  'MRNA', 'BIIB', 'ALNY', 'SGEN', 'INCY', 'BMRN', 'EXEL', 'SRPT', 'IONS', 'NBIX',
  // Gene Therapy / Editing
  'CRSP', 'EDIT', 'NTLA', 'BEAM', 'VERV', 'RCKT', 'BLUE',
  // Mid Cap Biotech
  'UTHR', 'RARE', 'FOLD', 'ACAD', 'IMVT', 'ARWR', 'CYTK', 'INSM', 'PCVX', 'ARVN',
  // Small Cap / Emerging
  'KRTX', 'DAWN', 'RXRX', 'VERA', 'PRAX', 'JANX', 'TGTX', 'ROIV', 'DMTK', 'IMCR',
  // CNS / Neurology
  'SAGE', 'AXSM', 'CRTX', 'PRTA', 'DNLI', 'ANNX', 'DRUG',
  // Oncology
  'LEGN', 'SNDX', 'KYMR', 'IMTX', 'IOVA', 'FATE', 'BCYC',
  // Rare Disease
  'QURE', 'SWTX', 'PTGX', 'YMAB', 'RGNX',
  // Immunology
  'HZNP', 'ANAB', 'RLAY', 'TVTX', 'KALV'
]
