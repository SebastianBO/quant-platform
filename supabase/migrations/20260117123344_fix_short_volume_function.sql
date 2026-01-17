-- Drop the old function first (it has wrong return type)
DROP FUNCTION IF EXISTS get_most_shorted_stocks(DATE, INT);

-- Recreate with correct column names (matching what the page expects)
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
    sv.symbol AS symbol,
    sv.trade_date AS trade_date,
    sv.short_volume AS short_volume,
    sv.total_volume AS total_volume,
    sv.short_percent AS short_percent
  FROM short_volume sv
  WHERE sv.trade_date = (
    SELECT MAX(sv2.trade_date) FROM short_volume sv2 WHERE sv2.trade_date <= p_date
  )
  AND sv.total_volume > 100000
  ORDER BY sv.short_percent DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
