import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { embedMany } from 'ai'
import { openai } from '@ai-sdk/openai'

// =============================================================================
// EMBEDDING GENERATION CRON JOB
// Processes documents from multiple sources and generates embeddings
// Uses AI SDK embedMany() with text-embedding-3-small (5x cheaper than ada-002)
// =============================================================================

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Chunk size for batch embedding (OpenAI limit is ~8000 tokens per batch)
const BATCH_SIZE = 50
const MAX_CONTENT_LENGTH = 8000 // Truncate long content

interface DocumentToEmbed {
  ticker: string
  document_type: 'sec_filing' | 'earnings_transcript' | 'news' | 'research' | 'company_overview'
  title: string
  content: string
  source_url?: string
  document_date?: string
  metadata?: Record<string, unknown>
}

/**
 * Chunk text into smaller pieces for long documents
 */
function chunkText(text: string, maxLength: number = MAX_CONTENT_LENGTH): string[] {
  if (text.length <= maxLength) return [text]

  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    // Try to break at sentence boundary
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

/**
 * Generate embeddings for a batch of documents
 */
async function generateAndStoreEmbeddings(documents: DocumentToEmbed[]): Promise<number> {
  if (documents.length === 0) return 0

  // Prepare content for embedding (with chunking for long docs)
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

  // Prepare records for insertion
  const records = documentsWithChunks.map((doc, i) => ({
    ticker: doc.ticker.toUpperCase(),
    document_type: doc.document_type,
    title: doc.title,
    content: doc.chunk_content,
    content_chunk_index: doc.chunk_index,
    source_url: doc.source_url || null,
    document_date: doc.document_date || null,
    embedding: `[${embeddings[i].join(',')}]`, // Format for halfvec
    metadata: doc.metadata || {},
  }))

  // Insert into document_embeddings (use insert, duplicates handled by checking first)
  const { error } = await getSupabase()
    .from('document_embeddings')
    .insert(records)

  if (error) {
    console.error('Error inserting embeddings:', error)
    throw error
  }

  return records.length
}

/**
 * Process company fundamentals into embeddings
 */
async function processCompanyFundamentals(limit: number): Promise<number> {
  // Get companies that don't have embeddings yet
  const { data: companies, error } = await getSupabase()
    .from('company_fundamentals')
    .select('symbol, company_name, sector, industry, description, market_cap, exchange_code')
    .not('description', 'is', null)
    .limit(limit)

  if (error || !companies) {
    console.error('Error fetching companies:', error)
    return 0
  }

  // Check which already have embeddings
  const symbols = companies.map(c => c.symbol)
  const { data: existing } = await getSupabase()
    .from('document_embeddings')
    .select('ticker')
    .eq('document_type', 'company_overview')
    .in('ticker', symbols)

  const existingSet = new Set(existing?.map(e => e.ticker) || [])
  const toEmbed = companies.filter(c => !existingSet.has(c.symbol))

  if (toEmbed.length === 0) return 0

  const documents: DocumentToEmbed[] = toEmbed.map(c => ({
    ticker: c.symbol,
    document_type: 'company_overview',
    title: `${c.company_name} - Company Overview`,
    content: `${c.company_name} (${c.symbol}) is a ${c.sector || 'company'} in the ${c.industry || 'industry'} sector. ${c.description || ''} Market cap: ${c.market_cap ? `$${(c.market_cap / 1e9).toFixed(1)}B` : 'N/A'}. Exchange: ${c.exchange_code || 'N/A'}.`,
    metadata: { sector: c.sector, industry: c.industry, market_cap: c.market_cap },
  }))

  // Process in batches
  let total = 0
  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    const batch = documents.slice(i, i + BATCH_SIZE)
    total += await generateAndStoreEmbeddings(batch)
  }

  return total
}

/**
 * Process SEC filings into embeddings
 */
async function processSECFilings(limit: number): Promise<number> {
  const { data: filings, error } = await supabase
    .from('sec_filings')
    .select('ticker, form_type, filing_date, description, filing_url')
    .not('description', 'is', null)
    .order('filing_date', { ascending: false })
    .limit(limit)

  if (error || !filings) {
    console.error('Error fetching SEC filings:', error)
    return 0
  }

  // Check which already have embeddings
  const { data: existing } = await supabase
    .from('document_embeddings')
    .select('ticker, source_url')
    .eq('document_type', 'sec_filing')

  const existingSet = new Set(existing?.map(e => `${e.ticker}-${e.source_url}`) || [])
  const toEmbed = filings.filter(f => !existingSet.has(`${f.ticker}-${f.filing_url}`))

  if (toEmbed.length === 0) return 0

  const documents: DocumentToEmbed[] = toEmbed.map(f => ({
    ticker: f.ticker,
    document_type: 'sec_filing',
    title: `${f.ticker} ${f.form_type} Filing`,
    content: f.description || `${f.form_type} filing for ${f.ticker} on ${f.filing_date}`,
    source_url: f.filing_url,
    document_date: f.filing_date,
    metadata: { form_type: f.form_type },
  }))

  let total = 0
  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    const batch = documents.slice(i, i + BATCH_SIZE)
    total += await generateAndStoreEmbeddings(batch)
  }

  return total
}

/**
 * Process income statement insights into embeddings
 */
async function processFinancialInsights(limit: number): Promise<number> {
  // Get recent income statements with meaningful data
  const { data: statements, error } = await supabase
    .from('income_statements')
    .select('ticker, report_date, period, revenue, net_income, gross_profit, operating_income, fiscal_year')
    .not('revenue', 'is', null)
    .order('report_date', { ascending: false })
    .limit(limit)

  if (error || !statements) {
    console.error('Error fetching income statements:', error)
    return 0
  }

  // Check existing
  const keys = statements.map(s => `${s.ticker}-${s.report_date}-${s.period}`)
  const { data: existing } = await supabase
    .from('document_embeddings')
    .select('ticker, document_date, metadata')
    .eq('document_type', 'sec_filing')

  const existingSet = new Set(
    existing?.map(e => `${e.ticker}-${e.document_date}-${(e.metadata as { period?: string })?.period || ''}`) || []
  )
  const toEmbed = statements.filter(s => !existingSet.has(`${s.ticker}-${s.report_date}-${s.period}`))

  if (toEmbed.length === 0) return 0

  const documents: DocumentToEmbed[] = toEmbed.slice(0, 200).map(s => {
    const revenueB = s.revenue ? (s.revenue / 1e9).toFixed(2) : 'N/A'
    const netIncomeB = s.net_income ? (s.net_income / 1e9).toFixed(2) : 'N/A'
    const grossMargin = s.revenue && s.gross_profit ? ((s.gross_profit / s.revenue) * 100).toFixed(1) : 'N/A'
    const opMargin = s.revenue && s.operating_income ? ((s.operating_income / s.revenue) * 100).toFixed(1) : 'N/A'

    return {
      ticker: s.ticker,
      document_type: 'sec_filing' as const,
      title: `${s.ticker} ${s.period} ${s.fiscal_year} Financial Results`,
      content: `${s.ticker} reported ${s.period} ${s.fiscal_year} financial results. Revenue: $${revenueB}B. Net income: $${netIncomeB}B. Gross margin: ${grossMargin}%. Operating margin: ${opMargin}%. Report date: ${s.report_date}.`,
      document_date: s.report_date,
      metadata: { period: s.period, fiscal_year: s.fiscal_year, revenue: s.revenue, net_income: s.net_income },
    }
  })

  let total = 0
  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    const batch = documents.slice(i, i + BATCH_SIZE)
    total += await generateAndStoreEmbeddings(batch)
  }

  return total
}

/**
 * Main handler
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // Auth check for production
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const source = searchParams.get('source') || 'all'
  const limit = parseInt(searchParams.get('limit') || '100')

  try {
    const results: Record<string, number> = {}

    if (source === 'all' || source === 'companies') {
      results.companies = await processCompanyFundamentals(limit)
    }

    if (source === 'all' || source === 'sec') {
      results.sec_filings = await processSECFilings(limit)
    }

    if (source === 'all' || source === 'financials') {
      results.financial_insights = await processFinancialInsights(limit)
    }

    // Get total count
    const { count } = await supabase
      .from('document_embeddings')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      success: true,
      message: 'Embeddings generated successfully',
      results,
      total_embeddings: count,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Embedding generation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
