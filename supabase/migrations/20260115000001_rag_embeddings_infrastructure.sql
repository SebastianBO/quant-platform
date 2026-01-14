-- RAG Embeddings Infrastructure for Financial AI Agent
-- Creates NEW document_embeddings table for SEC filings, news, research
-- NOTE: Existing earnings_embeddings table (from portfoliocare-expo) is left unchanged

-- ============================================
-- PHASE 1: Enable Vector Extension
-- ============================================

-- Enable pgvector for similarity search (already exists, will skip)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- PHASE 2: Document Embeddings Table (NEW)
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
-- PHASE 3: Similarity Search Function
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

-- ============================================
-- PHASE 4: RLS Policy for Document Embeddings
-- ============================================

ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;

-- Service role only for embeddings (internal processing)
DROP POLICY IF EXISTS "Service role access" ON document_embeddings;
CREATE POLICY "Service role access" ON document_embeddings
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE document_embeddings IS 'Stores vector embeddings for financial documents (SEC filings, earnings, news) for RAG';
COMMENT ON FUNCTION match_documents(halfvec(1536), float, int, text, text) IS 'Semantic similarity search for financial documents using halfvec embeddings';
