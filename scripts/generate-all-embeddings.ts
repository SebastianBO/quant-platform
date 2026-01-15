/**
 * FULL-SCALE Embedding Generation
 * Processes ALL companies and financial data
 * Run with: npx tsx scripts/generate-all-embeddings.ts
 *
 * Estimated cost: ~$1.50 for 250k+ companies
 * Estimated time: ~30-60 minutes
 */

import { config } from 'dotenv'
config({ path: '.env.prod' })

import { createClient } from '@supabase/supabase-js'
import { embedMany } from 'ai'
import { openai } from '@ai-sdk/openai'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Batch sizes
const EMBED_BATCH_SIZE = 100 // OpenAI can handle 2048, but we're conservative
const DB_BATCH_SIZE = 1000   // How many records to fetch at a time
const MAX_CONTENT_LENGTH = 8000

interface DocumentToEmbed {
  ticker: string
  document_type: 'sec_filing' | 'earnings_transcript' | 'news' | 'research' | 'company_overview'
  title: string
  content: string
  source_url?: string
  document_date?: string
  metadata?: Record<string, unknown>
}

function chunkText(text: string, maxLength: number = MAX_CONTENT_LENGTH): string[] {
  if (text.length <= maxLength) return [text]
  const chunks: string[] = []
  let start = 0
  while (start < text.length) {
    let end = Math.min(start + maxLength, text.length)
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf('.', end)
      if (lastPeriod > start + maxLength / 2) {
        end = lastPeriod + 1
      }
    }
    chunks.push(text.slice(start, end).trim())
    start = end
  }
  return chunks
}

async function generateAndStoreEmbeddings(documents: DocumentToEmbed[]): Promise<number> {
  if (documents.length === 0) return 0

  const documentsWithChunks: Array<DocumentToEmbed & { chunk_index: number; chunk_content: string }> = []

  for (const doc of documents) {
    const chunks = chunkText(doc.content)
    chunks.forEach((chunk, index) => {
      documentsWithChunks.push({
        ...doc,
        chunk_index: index,
        chunk_content: chunk,
      })
    })
  }

  // Generate embeddings using AI SDK
  const { embeddings } = await embedMany({
    model: openai.embedding('text-embedding-3-small'),
    values: documentsWithChunks.map(d => d.chunk_content),
  })

  const records = documentsWithChunks.map((doc, i) => ({
    ticker: doc.ticker.toUpperCase(),
    document_type: doc.document_type,
    title: doc.title,
    content: doc.chunk_content,
    content_chunk_index: doc.chunk_index,
    source_url: doc.source_url || null,
    document_date: doc.document_date || null,
    embedding: `[${embeddings[i].join(',')}]`,
    metadata: doc.metadata || {},
  }))

  // Insert one by one to handle duplicates
  let inserted = 0
  for (const record of records) {
    const { error } = await supabase.from('document_embeddings').insert(record)
    if (error) {
      if (error.code === '23505') continue // Skip duplicates
      console.error('Insert error:', error.message)
    } else {
      inserted++
    }
  }

  return inserted
}

async function processUSCompanies(): Promise<number> {
  console.log('\n🇺🇸 Processing US Companies...')

  // Get existing embeddings
  const { data: existing } = await supabase
    .from('document_embeddings')
    .select('ticker')
    .eq('document_type', 'company_overview')

  const existingSet = new Set(existing?.map(e => e.ticker) || [])
  console.log(`  Already have ${existingSet.size} US company embeddings`)

  let totalProcessed = 0
  let offset = 0

  while (true) {
    const { data: companies, error } = await supabase
      .from('company_fundamentals')
      .select('symbol, company_name, sector, industry, market_cap, exchange_code')
      .not('company_name', 'is', null)
      .order('market_cap', { ascending: false, nullsFirst: false })
      .range(offset, offset + DB_BATCH_SIZE - 1)

    if (error) {
      console.error('  Error fetching companies:', error.message)
      break
    }

    if (!companies || companies.length === 0) break

    // Filter out existing
    const toEmbed = companies.filter(c => !existingSet.has(c.symbol))

    if (toEmbed.length === 0) {
      offset += DB_BATCH_SIZE
      continue
    }

    console.log(`  Processing batch ${offset/DB_BATCH_SIZE + 1}: ${toEmbed.length} companies...`)

    const documents: DocumentToEmbed[] = toEmbed.map(c => ({
      ticker: c.symbol,
      document_type: 'company_overview',
      title: `${c.company_name} - Company Overview`,
      content: `${c.company_name} (${c.symbol}) is a ${c.sector || 'company'} in the ${c.industry || 'industry'} sector. Market cap: ${c.market_cap ? `$${(c.market_cap / 1e9).toFixed(1)}B` : 'N/A'}. Exchange: ${c.exchange_code || 'N/A'}.`,
      metadata: { sector: c.sector, industry: c.industry, market_cap: c.market_cap },
    }))

    // Process in smaller batches for embedding
    for (let i = 0; i < documents.length; i += EMBED_BATCH_SIZE) {
      const batch = documents.slice(i, i + EMBED_BATCH_SIZE)
      const inserted = await generateAndStoreEmbeddings(batch)
      totalProcessed += inserted

      // Add to existing set to avoid duplicates
      batch.forEach(d => existingSet.add(d.ticker))
    }

    offset += DB_BATCH_SIZE

    // Progress update every 5000
    if (offset % 5000 === 0) {
      console.log(`  Progress: ${offset.toLocaleString()} checked, ${totalProcessed.toLocaleString()} embedded`)
    }
  }

  console.log(`  ✅ Embedded ${totalProcessed.toLocaleString()} US companies`)
  return totalProcessed
}

async function processEUCompanies(): Promise<number> {
  console.log('\n🇪🇺 Processing EU Companies...')

  // Get existing embeddings
  const { data: existing } = await supabase
    .from('document_embeddings')
    .select('ticker')
    .eq('document_type', 'company_overview')
    .like('ticker', 'EU:%')

  const existingSet = new Set(existing?.map(e => e.ticker) || [])
  console.log(`  Already have ${existingSet.size} EU company embeddings`)

  let totalProcessed = 0
  let offset = 0

  while (true) {
    const { data: companies, error } = await supabase
      .from('eu_companies')
      .select('org_number, country_code, name, legal_form, industry_code, revenue_latest')
      .not('name', 'is', null)
      .order('revenue_latest', { ascending: false, nullsFirst: false })
      .range(offset, offset + DB_BATCH_SIZE - 1)

    if (error) {
      console.error('  Error fetching EU companies:', error.message)
      break
    }

    if (!companies || companies.length === 0) break

    // Create ticker format for EU companies
    const toEmbed = companies.filter(c => {
      const ticker = `EU:${c.country_code}:${c.org_number}`
      return !existingSet.has(ticker)
    })

    if (toEmbed.length === 0) {
      offset += DB_BATCH_SIZE
      continue
    }

    console.log(`  Processing batch ${offset/DB_BATCH_SIZE + 1}: ${toEmbed.length} EU companies...`)

    const documents: DocumentToEmbed[] = toEmbed.map(c => {
      const ticker = `EU:${c.country_code}:${c.org_number}`
      return {
        ticker,
        document_type: 'company_overview' as const,
        title: `${c.name} - Company Overview`,
        content: `${c.name} (${c.country_code}) is a ${c.legal_form || 'company'}. Industry: ${c.industry_code || 'N/A'}. Revenue: ${c.revenue_latest ? `${(c.revenue_latest / 1e6).toFixed(1)}M` : 'N/A'}.`,
        metadata: { country: c.country_code, org_number: c.org_number, legal_form: c.legal_form },
      }
    })

    // Process in smaller batches
    for (let i = 0; i < documents.length; i += EMBED_BATCH_SIZE) {
      const batch = documents.slice(i, i + EMBED_BATCH_SIZE)
      const inserted = await generateAndStoreEmbeddings(batch)
      totalProcessed += inserted
      batch.forEach(d => existingSet.add(d.ticker))
    }

    offset += DB_BATCH_SIZE

    if (offset % 5000 === 0) {
      console.log(`  Progress: ${offset.toLocaleString()} checked, ${totalProcessed.toLocaleString()} embedded`)
    }
  }

  console.log(`  ✅ Embedded ${totalProcessed.toLocaleString()} EU companies`)
  return totalProcessed
}

async function processFinancialStatements(): Promise<number> {
  console.log('\n📊 Processing Financial Statements...')

  // Get existing embeddings
  const { data: existing } = await supabase
    .from('document_embeddings')
    .select('ticker, document_date')
    .eq('document_type', 'sec_filing')

  const existingSet = new Set(existing?.map(e => `${e.ticker}-${e.document_date}`) || [])
  console.log(`  Already have ${existingSet.size} financial statement embeddings`)

  let totalProcessed = 0
  let offset = 0

  while (true) {
    const { data: statements, error } = await supabase
      .from('income_statements')
      .select('ticker, report_period, period, revenue, net_income, gross_profit, operating_income, fiscal_period')
      .not('revenue', 'is', null)
      .order('report_period', { ascending: false })
      .range(offset, offset + DB_BATCH_SIZE - 1)

    if (error) {
      console.error('  Error fetching statements:', error.message)
      break
    }

    if (!statements || statements.length === 0) break

    const toEmbed = statements.filter(s => !existingSet.has(`${s.ticker}-${s.report_period}`))

    if (toEmbed.length === 0) {
      offset += DB_BATCH_SIZE
      continue
    }

    console.log(`  Processing batch ${offset/DB_BATCH_SIZE + 1}: ${toEmbed.length} statements...`)

    const documents: DocumentToEmbed[] = toEmbed.map(s => {
      const revenueB = s.revenue ? (s.revenue / 1e9).toFixed(2) : 'N/A'
      const netIncomeB = s.net_income ? (s.net_income / 1e9).toFixed(2) : 'N/A'
      const grossMargin = s.revenue && s.gross_profit ? ((s.gross_profit / s.revenue) * 100).toFixed(1) : 'N/A'
      const opMargin = s.revenue && s.operating_income ? ((s.operating_income / s.revenue) * 100).toFixed(1) : 'N/A'

      return {
        ticker: s.ticker,
        document_type: 'sec_filing' as const,
        title: `${s.ticker} ${s.period} ${s.fiscal_period || ''} Financial Results`,
        content: `${s.ticker} reported ${s.period} ${s.fiscal_period || ''} financial results. Revenue: $${revenueB}B. Net income: $${netIncomeB}B. Gross margin: ${grossMargin}%. Operating margin: ${opMargin}%. Report period: ${s.report_period}.`,
        document_date: s.report_period,
        metadata: { period: s.period, fiscal_period: s.fiscal_period, revenue: s.revenue, net_income: s.net_income },
      }
    })

    for (let i = 0; i < documents.length; i += EMBED_BATCH_SIZE) {
      const batch = documents.slice(i, i + EMBED_BATCH_SIZE)
      const inserted = await generateAndStoreEmbeddings(batch)
      totalProcessed += inserted
      batch.forEach(d => existingSet.add(`${d.ticker}-${d.document_date}`))
    }

    offset += DB_BATCH_SIZE

    if (offset % 10000 === 0) {
      console.log(`  Progress: ${offset.toLocaleString()} checked, ${totalProcessed.toLocaleString()} embedded`)
    }
  }

  console.log(`  ✅ Embedded ${totalProcessed.toLocaleString()} financial statements`)
  return totalProcessed
}

async function processEarnings(): Promise<number> {
  console.log('\n📅 Processing Earnings Data...')

  const { data: existing } = await supabase
    .from('document_embeddings')
    .select('ticker, document_date')
    .eq('document_type', 'earnings_transcript')

  const existingSet = new Set(existing?.map(e => `${e.ticker}-${e.document_date}`) || [])
  console.log(`  Already have ${existingSet.size} earnings embeddings`)

  let totalProcessed = 0
  let offset = 0

  while (true) {
    const { data: earnings, error } = await supabase
      .from('company_earnings')
      .select('symbol, company_name, report_date, fiscal_year, fiscal_quarter, eps_estimate, eps_actual, eps_surprise_percent, revenue_estimate, revenue_actual')
      .order('report_date', { ascending: false })
      .range(offset, offset + DB_BATCH_SIZE - 1)

    if (error) {
      console.error('  Error fetching earnings:', error.message)
      break
    }

    if (!earnings || earnings.length === 0) break

    const toEmbed = earnings.filter(e => !existingSet.has(`${e.symbol}-${e.report_date}`))

    if (toEmbed.length === 0) {
      offset += DB_BATCH_SIZE
      continue
    }

    console.log(`  Processing batch ${offset/DB_BATCH_SIZE + 1}: ${toEmbed.length} earnings...`)

    const documents: DocumentToEmbed[] = toEmbed.map(e => {
      const beat = e.eps_actual && e.eps_estimate
        ? (e.eps_actual > e.eps_estimate ? 'beat' : e.eps_actual < e.eps_estimate ? 'missed' : 'met')
        : 'pending'
      const surprise = e.eps_surprise_percent ? `${e.eps_surprise_percent > 0 ? '+' : ''}${e.eps_surprise_percent.toFixed(1)}%` : ''

      return {
        ticker: e.symbol,
        document_type: 'earnings_transcript' as const,
        title: `${e.symbol} ${e.fiscal_quarter || ''} ${e.fiscal_year || ''} Earnings`,
        content: `${e.company_name || e.symbol} (${e.symbol}) reported earnings on ${e.report_date}. EPS: $${e.eps_actual?.toFixed(2) || 'N/A'} vs estimate $${e.eps_estimate?.toFixed(2) || 'N/A'} - ${beat} expectations ${surprise}. ${e.revenue_actual ? `Revenue: $${(e.revenue_actual / 1e9).toFixed(2)}B` : ''} ${e.revenue_estimate ? `vs estimate $${(e.revenue_estimate / 1e9).toFixed(2)}B` : ''}.`,
        document_date: e.report_date,
        metadata: { eps_actual: e.eps_actual, eps_estimate: e.eps_estimate, beat },
      }
    })

    for (let i = 0; i < documents.length; i += EMBED_BATCH_SIZE) {
      const batch = documents.slice(i, i + EMBED_BATCH_SIZE)
      const inserted = await generateAndStoreEmbeddings(batch)
      totalProcessed += inserted
      batch.forEach(d => existingSet.add(`${d.ticker}-${d.document_date}`))
    }

    offset += DB_BATCH_SIZE
  }

  console.log(`  ✅ Embedded ${totalProcessed.toLocaleString()} earnings records`)
  return totalProcessed
}

async function main() {
  console.log('🚀 FULL-SCALE EMBEDDING GENERATION')
  console.log('================================')
  console.log('Estimated cost: ~$1.50')
  console.log('Estimated time: 30-60 minutes\n')

  const startTime = Date.now()
  const results: Record<string, number> = {}

  try {
    results.us_companies = await processUSCompanies()
    results.eu_companies = await processEUCompanies()
    results.financials = await processFinancialStatements()
    results.earnings = await processEarnings()

    // Get final count
    const { count } = await supabase
      .from('document_embeddings')
      .select('*', { count: 'exact', head: true })

    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1)

    console.log('\n========================================')
    console.log('📊 FULL EMBEDDING GENERATION COMPLETE')
    console.log('========================================')
    console.log(`US Companies: ${results.us_companies.toLocaleString()}`)
    console.log(`EU Companies: ${results.eu_companies.toLocaleString()}`)
    console.log(`Financial Statements: ${results.financials.toLocaleString()}`)
    console.log(`Earnings: ${results.earnings.toLocaleString()}`)
    console.log(`Total NEW: ${Object.values(results).reduce((a, b) => a + b, 0).toLocaleString()}`)
    console.log(`Total in DB: ${count?.toLocaleString()}`)
    console.log(`Duration: ${duration} minutes`)
    console.log('========================================\n')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()
