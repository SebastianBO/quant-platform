# RAG Embeddings Infrastructure (Jan 15, 2026)

## Overview

RAG is the **SLOW PATH** - only use for unstructured text queries. Lician uses **pgvector** with **halfvec** storage and **HNSW** indexes for semantic search on financial documents. This enables queries like "What did Apple say about iPhone sales?" to return relevant passages from SEC filings and earnings transcripts.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EMBEDDING PIPELINE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│   User Query → AI SDK embed() → text-embedding-3-small → 1536-dim vector   │
│                                      ↓                                       │
│                         Supabase match_documents() RPC                       │
│                                      ↓                                       │
│                    HNSW cosine similarity search (halfvec)                   │
│                                      ↓                                       │
│                      Top-K relevant document chunks                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Technology Choices (Researched Jan 2026)

### Why pgvector (not Vector Buckets)?

| Feature | pgvector | Vector Buckets |
|---------|----------|----------------|
| **Scale** | <1M vectors | 10M+ vectors |
| **Latency** | ~10-100ms | ~100-500ms |
| **Use Case** | User-facing queries | Archival/batch |
| **Our Need** | ✅ Perfect fit | ❌ Overkill |

Vector Buckets (S3-native) are for massive scale. We have <100K documents - pgvector is ideal.

### Why halfvec (not vector)?

| Type | Storage | Bits | Quality Loss |
|------|---------|------|--------------|
| `vector(1536)` | Full | 32-bit | None |
| `halfvec(1536)` | **50% less** | 16-bit | Minimal |

halfvec saves 50% storage with negligible quality loss. Recommended by Supabase.

### Why HNSW (not IVFFlat)?

| Index | Speed | Training | Memory |
|-------|-------|----------|--------|
| IVFFlat | Fast | Required | Lower |
| **HNSW** | Fastest | None | Higher |

HNSW is the latest best practice - faster and no training phase.

### Why text-embedding-3-small (not ada-002)?

| Model | Dimensions | Cost/1M tokens | Quality |
|-------|-----------|----------------|---------|
| ada-002 | 1536 | $0.10 | Good |
| **3-small** | 1536 | **$0.02** | Same |
| 3-large | 3072 | $0.13 | Best |

5x cheaper with same quality. Uses AI SDK `embed()` function.

## Database Schema

### document_embeddings Table

```sql
-- Migration: 20260115000001_rag_embeddings_infrastructure.sql

CREATE TABLE document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Document identification
  ticker TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'sec_filing',           -- 10-K, 10-Q, 8-K filings
    'earnings_transcript',  -- Earnings call transcripts
    'news',                 -- News articles
    'research',             -- Analyst reports
    'company_overview'      -- Company descriptions
  )),
  source_url TEXT,
  document_date DATE,

  -- Content
  title TEXT,
  content TEXT NOT NULL,
  content_chunk_index INTEGER DEFAULT 0,  -- For long docs split into chunks

  -- Embedding (halfvec for 50% storage savings)
  embedding halfvec(1536),

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- HNSW index for fast similarity search
CREATE INDEX idx_document_embeddings_vector
  ON document_embeddings
  USING hnsw (embedding halfvec_cosine_ops);
```

### match_documents() RPC Function

```sql
CREATE FUNCTION match_documents(
  query_embedding halfvec(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_ticker text DEFAULT NULL,
  filter_doc_type text DEFAULT NULL
)
RETURNS TABLE (
  id UUID, ticker TEXT, document_type TEXT, title TEXT,
  content TEXT, source_url TEXT, document_date DATE, similarity float
);
```

## AI Tools

### searchFinancialDocuments

Primary RAG search tool for semantic queries.

```typescript
// Usage in AI agent
const results = await searchFinancialDocuments({
  query: "What did Apple say about iPhone sales?",
  ticker: "AAPL",
  documentType: "earnings_transcript",
  limit: 5
})
```

### getSemanticContext

Retrieves context from multiple document types for comprehensive answers.

```typescript
const context = await getSemanticContext({
  query: "Apple's revenue guidance",
  tickers: ["AAPL"],
  topK: 3
})
```

## Embedding Generation

### Cron Job: /api/cron/generate-embeddings

Processes documents in batches using AI SDK `embedMany()`.

```typescript
import { embedMany } from 'ai'
import { openai } from '@ai-sdk/openai'

// Batch embed documents (auto-chunks large batches)
const { embeddings } = await embedMany({
  model: openai.embedding('text-embedding-3-small'),
  values: documents.map(d => d.content),
})
```

### Document Sources

| Source | Trigger | Priority |
|--------|---------|----------|
| SEC Filings | On sync from EDGAR | High |
| Company Fundamentals | On profile update | Medium |
| News Articles | On Firecrawl fetch | Medium |
| Earnings Transcripts | Manual/Firecrawl | High |

## Current Data Status

| Table | Records | Embeddings |
|-------|---------|------------|
| `document_embeddings` | 0 | Pending |
| `income_statements` | 313,902 | Not embedded |
| `sec_filings` | 1,245 | Not embedded |
| `company_fundamentals` | 139,584 | Not embedded |

## Files

### Migration
- `supabase/migrations/20260115000001_rag_embeddings_infrastructure.sql`

### AI Tools
- `src/lib/ai/tools.ts` - searchFinancialDocuments, getSemanticContext

### Cron Jobs (to create)
- `/api/cron/generate-embeddings` - Batch embedding generation

## Environment Variables

```bash
# AI SDK uses this automatically for embeddings
OPENAI_API_KEY=sk-...

# Supabase for vector storage
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Testing RAG

```bash
# Test semantic search (requires documents in database)
curl -X POST https://lician.com/api/chat/autonomous \
  -H "Content-Type: application/json" \
  -d '{"query": "What did Apple say about iPhone sales?", "model": "gpt-4o-mini"}'
```
