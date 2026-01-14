/**
 * Test RAG search functionality
 * Run with: npx tsx scripts/test-rag-search.ts
 */

import { config } from 'dotenv'
config({ path: '.env.prod' })

import { createClient } from '@supabase/supabase-js'
import { embed } from 'ai'
import { openai } from '@ai-sdk/openai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function testRAGSearch(query: string, ticker?: string) {
  console.log(`\n🔍 Searching for: "${query}"${ticker ? ` (ticker: ${ticker})` : ''}`)

  // Generate embedding for query
  const { embedding: queryEmbedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: query,
  })

  // Search using RPC function
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: `[${queryEmbedding.join(',')}]`,
    match_threshold: 0.5, // Lower threshold for testing
    match_count: 5,
    filter_ticker: ticker?.toUpperCase() || null,
    filter_doc_type: null,
  })

  if (error) {
    console.error('❌ Search error:', error)
    return
  }

  if (!data || data.length === 0) {
    console.log('📭 No results found')
    return
  }

  console.log(`\n✅ Found ${data.length} results:\n`)

  for (const doc of data) {
    console.log(`  📄 ${doc.ticker} - ${doc.title}`)
    console.log(`     Type: ${doc.document_type}`)
    console.log(`     Similarity: ${(doc.similarity * 100).toFixed(1)}%`)
    console.log(`     Content: ${doc.content.substring(0, 150)}...`)
    console.log('')
  }
}

async function main() {
  console.log('🧪 Testing RAG Search...')

  // Test 1: General query about Apple
  await testRAGSearch('Apple technology company')

  // Test 2: Query about revenue
  await testRAGSearch('quarterly revenue financial results')

  // Test 3: Filtered by ticker
  await testRAGSearch('financial results', 'AAPL')

  // Test 4: Query about specific sector
  await testRAGSearch('healthcare biotechnology pharmaceutical')

  console.log('\n✅ RAG search tests complete!')
}

main()
