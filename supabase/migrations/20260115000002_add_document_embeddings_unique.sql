-- Add unique constraint for document_embeddings upsert
-- Allows re-running embedding generation without duplicates

-- Create unique constraint on ticker + document_type + content_chunk_index
-- This ensures we don't have duplicate embeddings for the same document chunk
CREATE UNIQUE INDEX IF NOT EXISTS idx_document_embeddings_unique
  ON document_embeddings(ticker, document_type, content_chunk_index)
  WHERE source_url IS NULL;

-- For documents with source_url, use that as part of the unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_document_embeddings_unique_url
  ON document_embeddings(ticker, document_type, source_url, content_chunk_index)
  WHERE source_url IS NOT NULL;
