-- Create short_volume table if not exists
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
  CONSTRAINT unique_symbol_date UNIQUE (symbol, trade_date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_short_volume_symbol ON short_volume(symbol);
CREATE INDEX IF NOT EXISTS idx_short_volume_date ON short_volume(trade_date DESC);
CREATE INDEX IF NOT EXISTS idx_short_volume_symbol_date ON short_volume(symbol, trade_date DESC);
CREATE INDEX IF NOT EXISTS idx_short_volume_short_percent ON short_volume(short_percent DESC);

-- Enable RLS
ALTER TABLE short_volume ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policy to avoid conflicts
DROP POLICY IF EXISTS "Public read access for short volume data" ON short_volume;
CREATE POLICY "Public read access for short volume data"
  ON short_volume FOR SELECT TO public USING (true);

-- Create the function
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
  AND sv.total_volume > 100000
  ORDER BY sv.short_percent DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
