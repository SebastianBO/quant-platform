-- Short Volume Data Table
-- Stores daily FINRA short sale volume data for all symbols

CREATE TABLE IF NOT EXISTS short_volume (
  id BIGSERIAL PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL,
  trade_date DATE NOT NULL,
  short_volume BIGINT NOT NULL DEFAULT 0,
  short_exempt_volume BIGINT NOT NULL DEFAULT 0,
  total_volume BIGINT NOT NULL DEFAULT 0,
  short_percent DECIMAL(6,2) GENERATED ALWAYS AS (
    CASE WHEN total_volume > 0
      THEN (short_volume::DECIMAL / total_volume * 100)::DECIMAL(6,2)
      ELSE 0
    END
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint to prevent duplicates
  CONSTRAINT unique_symbol_date UNIQUE (symbol, trade_date)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_short_volume_symbol ON short_volume(symbol);
CREATE INDEX IF NOT EXISTS idx_short_volume_date ON short_volume(trade_date DESC);
CREATE INDEX IF NOT EXISTS idx_short_volume_symbol_date ON short_volume(symbol, trade_date DESC);
CREATE INDEX IF NOT EXISTS idx_short_volume_short_percent ON short_volume(short_percent DESC);

-- Enable RLS
ALTER TABLE short_volume ENABLE ROW LEVEL SECURITY;

-- Allow public read access (this is public market data)
CREATE POLICY "Public read access for short volume data"
  ON short_volume
  FOR SELECT
  TO public
  USING (true);

-- Only service role can insert/update (Edge Functions)
CREATE POLICY "Service role can insert short volume data"
  ON short_volume
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update short volume data"
  ON short_volume
  FOR UPDATE
  TO service_role
  USING (true);

-- Table for tracking ingestion runs
CREATE TABLE IF NOT EXISTS short_volume_ingestion_log (
  id BIGSERIAL PRIMARY KEY,
  trade_date DATE NOT NULL,
  symbols_processed INT DEFAULT 0,
  symbols_inserted INT DEFAULT 0,
  symbols_updated INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- pending, running, completed, failed
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  CONSTRAINT unique_ingestion_date UNIQUE (trade_date)
);

-- Function to get most shorted stocks
CREATE OR REPLACE FUNCTION get_most_shorted_stocks(
  p_date DATE DEFAULT CURRENT_DATE,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  symbol VARCHAR(20),
  trade_date DATE,
  short_volume BIGINT,
  total_volume BIGINT,
  short_percent DECIMAL(6,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sv.symbol,
    sv.trade_date,
    sv.short_volume,
    sv.total_volume,
    sv.short_percent
  FROM short_volume sv
  WHERE sv.trade_date = (
    SELECT MAX(trade_date) FROM short_volume WHERE trade_date <= p_date
  )
  AND sv.total_volume > 100000 -- Filter out low volume stocks
  ORDER BY sv.short_percent DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get short volume history for a symbol
CREATE OR REPLACE FUNCTION get_short_volume_history(
  p_symbol VARCHAR(20),
  p_days INT DEFAULT 45
)
RETURNS TABLE (
  trade_date DATE,
  short_volume BIGINT,
  short_exempt_volume BIGINT,
  total_volume BIGINT,
  short_percent DECIMAL(6,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sv.trade_date,
    sv.short_volume,
    sv.short_exempt_volume,
    sv.total_volume,
    sv.short_percent
  FROM short_volume sv
  WHERE sv.symbol = UPPER(p_symbol)
  ORDER BY sv.trade_date DESC
  LIMIT p_days;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE short_volume IS 'Daily FINRA short sale volume data. Updated daily via Edge Function.';
COMMENT ON TABLE short_volume_ingestion_log IS 'Tracks daily data ingestion runs for monitoring.';
