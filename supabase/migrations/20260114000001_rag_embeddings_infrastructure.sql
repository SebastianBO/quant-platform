-- RAG Embeddings Infrastructure for Financial AI Agent
-- Based on portfoliocare-expo embeddings system
-- Uses pgvector for semantic search on financial documents

-- ============================================
-- PHASE 1: Enable Vector Extension
-- ============================================

-- Enable pgvector for similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- PHASE 2: Document Embeddings Table
-- Stores SEC filings, earnings transcripts, news for RAG
-- ============================================

CREATE TABLE IF NOT EXISTS document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Document identification
  ticker TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('sec_filing', 'earnings_transcript', 'news', 'research', 'company_overview')),
  source_url TEXT,
  document_date DATE,

  -- Content
  title TEXT,
  content TEXT NOT NULL,
  content_chunk_index INTEGER DEFAULT 0, -- For long documents split into chunks

  -- Embedding (1536 dims for OpenAI ada-002)
  -- Using halfvec for 50% storage savings (16-bit vs 32-bit floats)
  embedding halfvec(1536),

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast retrieval
CREATE INDEX IF NOT EXISTS idx_document_embeddings_ticker ON document_embeddings(ticker);
CREATE INDEX IF NOT EXISTS idx_document_embeddings_type ON document_embeddings(document_type);
CREATE INDEX IF NOT EXISTS idx_document_embeddings_date ON document_embeddings(document_date DESC);

-- Vector similarity index (HNSW for fast approximate search)
-- HNSW is faster than IVFFlat and doesn't require training
CREATE INDEX IF NOT EXISTS idx_document_embeddings_vector
  ON document_embeddings
  USING hnsw (embedding halfvec_cosine_ops);

-- ============================================
-- PHASE 3: Earnings Embeddings Table
-- Specialized embeddings for earnings data (like portfoliocare-expo)
-- ============================================

CREATE TABLE IF NOT EXISTS earnings_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to company earnings
  company_earnings_id INTEGER,
  ticker TEXT NOT NULL,
  report_date DATE,
  fiscal_year INTEGER,
  fiscal_quarter INTEGER,

  -- Multiple embedding types (384 dims for gte-small)
  -- Using halfvec for storage efficiency
  insight_embedding halfvec(384),           -- Text insight embedding
  surprise_pattern_embedding halfvec(384),  -- Numerical pattern embedding
  performance_embedding halfvec(384),       -- Performance context embedding
  timing_embedding halfvec(384),            -- Timing pattern embedding
  market_reaction_embedding halfvec(384),   -- Market reaction embedding

  -- Categorization
  insight_text TEXT,
  eps_surprise_bucket TEXT CHECK (eps_surprise_bucket IN ('massive_beat', 'beat', 'inline', 'miss', 'massive_miss')),
  seasonal_context TEXT,
  volatility_bucket TEXT CHECK (volatility_bucket IN ('extreme_vol', 'high_vol', 'medium_vol', 'low_vol')),

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(company_earnings_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_earnings_embeddings_ticker ON earnings_embeddings(ticker);
CREATE INDEX IF NOT EXISTS idx_earnings_embeddings_date ON earnings_embeddings(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_earnings_embeddings_surprise ON earnings_embeddings(eps_surprise_bucket);

-- Vector indexes for similarity search (HNSW)
CREATE INDEX IF NOT EXISTS idx_earnings_embeddings_insight_vector
  ON earnings_embeddings
  USING hnsw (insight_embedding halfvec_cosine_ops);

-- ============================================
-- PHASE 4: Embedding Queue Table
-- For async processing of documents
-- ============================================

CREATE TABLE IF NOT EXISTS embedding_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Job details
  ticker TEXT NOT NULL,
  document_type TEXT NOT NULL,
  content TEXT NOT NULL,
  source_url TEXT,

  -- Processing status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  priority INTEGER DEFAULT 0,
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Index for queue processing
CREATE INDEX IF NOT EXISTS idx_embedding_queue_status ON embedding_queue(status, priority DESC, created_at);

-- ============================================
-- PHASE 5: Similarity Search Functions
-- ============================================

-- Search documents by semantic similarity
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding halfvec(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_ticker text DEFAULT NULL,
  filter_doc_type text DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  ticker TEXT,
  document_type TEXT,
  title TEXT,
  content TEXT,
  source_url TEXT,
  document_date DATE,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.ticker,
    d.document_type,
    d.title,
    d.content,
    d.source_url,
    d.document_date,
    1 - (d.embedding <=> query_embedding) as similarity
  FROM document_embeddings d
  WHERE
    (filter_ticker IS NULL OR d.ticker = filter_ticker)
    AND (filter_doc_type IS NULL OR d.document_type = filter_doc_type)
    AND 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Search earnings by surprise pattern similarity
CREATE OR REPLACE FUNCTION match_earnings_patterns(
  query_embedding halfvec(384),
  match_count int DEFAULT 10,
  filter_surprise_bucket text DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  ticker TEXT,
  report_date DATE,
  insight_text TEXT,
  eps_surprise_bucket TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.ticker,
    e.report_date,
    e.insight_text,
    e.eps_surprise_bucket,
    1 - (e.insight_embedding <=> query_embedding) as similarity
  FROM earnings_embeddings e
  WHERE
    (filter_surprise_bucket IS NULL OR e.eps_surprise_bucket = filter_surprise_bucket)
  ORDER BY e.insight_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================
-- PHASE 6: RLS Policies
-- ============================================

ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE embedding_queue ENABLE ROW LEVEL SECURITY;

-- Service role only for embeddings (internal processing)
CREATE POLICY "Service role access" ON document_embeddings
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role access" ON earnings_embeddings
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role access" ON embedding_queue
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- PHASE 7: Helper Functions
-- ============================================

-- Get embedding queue stats
CREATE OR REPLACE FUNCTION get_embedding_queue_stats()
RETURNS TABLE (
  status TEXT,
  count BIGINT
)
LANGUAGE sql
AS $$
  SELECT status, count(*)::bigint
  FROM embedding_queue
  GROUP BY status;
$$;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE document_embeddings IS 'Stores vector embeddings for financial documents (SEC filings, earnings, news) for RAG';
COMMENT ON TABLE earnings_embeddings IS 'Specialized embeddings for earnings analysis with multiple embedding types';
COMMENT ON TABLE embedding_queue IS 'Async queue for document embedding processing';
COMMENT ON FUNCTION match_documents IS 'Semantic similarity search for financial documents';
COMMENT ON FUNCTION match_earnings_patterns IS 'Find similar earnings patterns by embedding similarity';
