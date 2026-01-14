/**
 * Generate embeddings for all financial data
 * Run with: npx tsx scripts/generate-embeddings.ts
 */

import { config } from 'dotenv'
config({ path: '.env.prod' })

import { createClient } from '@supabase/supabase-js'
import { embedMany } from 'ai'
import { openai } from '@ai-sdk/openai'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const BATCH_SIZE = 50
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

  console.log(`  Generating embeddings for ${documentsWithChunks.length} chunks...`)

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

  // Insert records one by one to handle duplicates gracefully
  let inserted = 0
  for (const record of records) {
    const { error } = await supabase.from('document_embeddings').insert(record)
    if (error) {
      if (error.code === '23505') {
        // Skip duplicates
        continue
      }
      console.error('Error inserting embedding:', error)
      throw error
    }
    inserted++
  }

  return inserted
}

async function processCompanyFundamentals(limit: number): Promise<number> {
  console.log(`\n📊 Processing company fundamentals (limit: ${limit})...`)

  // company_fundamentals uses: symbol, company_name, sector, industry, market_cap, exchange_code
  // No description column - we'll create summary from available fields
  const { data: companies, error } = await supabase
    .from('company_fundamentals')
    .select('symbol, company_name, sector, industry, market_cap, exchange_code')
    .not('company_name', 'is', null)
    .limit(limit)

  if (error || !companies) {
    console.error('Error fetching companies:', error)
    return 0
  }

  const symbols = companies.map(c => c.symbol)
  const { data: existing } = await supabase
    .from('document_embeddings')
    .select('ticker')
    .eq('document_type', 'company_overview')
    .in('ticker', symbols)

  const existingSet = new Set(existing?.map(e => e.ticker) || [])
  const toEmbed = companies.filter(c => !existingSet.has(c.symbol))

  console.log(`  Found ${companies.length} companies, ${toEmbed.length} need embedding`)

  if (toEmbed.length === 0) return 0

  const documents: DocumentToEmbed[] = toEmbed.map(c => ({
    ticker: c.symbol,
    document_type: 'company_overview',
    title: `${c.company_name} - Company Overview`,
    content: `${c.company_name} (${c.symbol}) is a ${c.sector || 'company'} in the ${c.industry || 'industry'} sector. Market cap: ${c.market_cap ? `$${(c.market_cap / 1e9).toFixed(1)}B` : 'N/A'}. Exchange: ${c.exchange_code || 'N/A'}.`,
    metadata: { sector: c.sector, industry: c.industry, market_cap: c.market_cap },
  }))

  let total = 0
  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    const batch = documents.slice(i, i + BATCH_SIZE)
    console.log(`  Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(documents.length/BATCH_SIZE)}...`)
    total += await generateAndStoreEmbeddings(batch)
  }

  console.log(`  ✅ Generated ${total} company embeddings`)
  return total
}

async function processFinancialInsights(limit: number): Promise<number> {
  console.log(`\n📈 Processing financial insights (limit: ${limit})...`)

  // income_statements uses: ticker, report_period (not report_date), period, fiscal_period
  const { data: statements, error } = await supabase
    .from('income_statements')
    .select('ticker, report_period, period, revenue, net_income, gross_profit, operating_income, fiscal_period')
    .not('revenue', 'is', null)
    .order('report_period', { ascending: false })
    .limit(limit)

  if (error || !statements) {
    console.error('Error fetching income statements:', error)
    return 0
  }

  // Get existing embeddings
  const { data: existing } = await supabase
    .from('document_embeddings')
    .select('ticker, document_date')
    .eq('document_type', 'sec_filing')

  const existingSet = new Set(
    existing?.map(e => `${e.ticker}-${e.document_date}`) || []
  )

  const toEmbed = statements.filter(s => !existingSet.has(`${s.ticker}-${s.report_period}`))
  console.log(`  Found ${statements.length} statements, ${toEmbed.length} need embedding`)

  if (toEmbed.length === 0) return 0

  const documents: DocumentToEmbed[] = toEmbed.slice(0, 500).map(s => {
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

  let total = 0
  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    const batch = documents.slice(i, i + BATCH_SIZE)
    console.log(`  Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(documents.length/BATCH_SIZE)}...`)
    total += await generateAndStoreEmbeddings(batch)
  }

  console.log(`  ✅ Generated ${total} financial insight embeddings`)
  return total
}

async function main() {
  console.log('🚀 Starting embedding generation...\n')

  const startTime = Date.now()
  const results: Record<string, number> = {}

  try {
    results.companies = await processCompanyFundamentals(200)
    results.financials = await processFinancialInsights(500)

    // Get total count
    const { count } = await supabase
      .from('document_embeddings')
      .select('*', { count: 'exact', head: true })

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)

    console.log('\n========================================')
    console.log('📊 EMBEDDING GENERATION COMPLETE')
    console.log('========================================')
    console.log(`Companies: ${results.companies}`)
    console.log(`Financial insights: ${results.financials}`)
    console.log(`Total embeddings in DB: ${count}`)
    console.log(`Duration: ${duration}s`)
    console.log('========================================\n')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()
