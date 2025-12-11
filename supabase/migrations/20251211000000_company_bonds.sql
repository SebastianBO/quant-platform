-- Company Bonds Table
-- Caches corporate bond listings from OpenFIGI
-- Updated weekly via sync-bonds cron job

CREATE TABLE IF NOT EXISTS company_bonds (
  id BIGSERIAL PRIMARY KEY,
  ticker VARCHAR(20) NOT NULL,
  figi VARCHAR(20) NOT NULL UNIQUE,
  issuer VARCHAR(255),
  bond_ticker VARCHAR(100),
  coupon_rate DECIMAL(6, 3),
  maturity_date DATE,
  description TEXT,
  exchange VARCHAR(20),
  is_matured BOOLEAN DEFAULT FALSE,
  years_to_maturity DECIMAL(4, 1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_company_bonds_ticker ON company_bonds(ticker);
CREATE INDEX IF NOT EXISTS idx_company_bonds_maturity ON company_bonds(maturity_date) WHERE NOT is_matured;
CREATE INDEX IF NOT EXISTS idx_company_bonds_coupon ON company_bonds(coupon_rate);

-- Company Bonds Summary Table (aggregated stats per ticker)
CREATE TABLE IF NOT EXISTS company_bonds_summary (
  ticker VARCHAR(20) PRIMARY KEY,
  issuer VARCHAR(255),
  total_bonds INT DEFAULT 0,
  total_matured INT DEFAULT 0,
  avg_coupon_rate DECIMAL(6, 3),
  maturing_soon_count INT DEFAULT 0,
  maturity_years INT[],
  last_synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_company_bonds_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_company_bonds_timestamp ON company_bonds;
CREATE TRIGGER update_company_bonds_timestamp
  BEFORE UPDATE ON company_bonds
  FOR EACH ROW
  EXECUTE FUNCTION update_company_bonds_timestamp();

-- RLS Policies (read-only public access)
ALTER TABLE company_bonds ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_bonds_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for company_bonds"
  ON company_bonds FOR SELECT
  USING (true);

CREATE POLICY "Allow public read for company_bonds_summary"
  ON company_bonds_summary FOR SELECT
  USING (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access to company_bonds"
  ON company_bonds FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to company_bonds_summary"
  ON company_bonds_summary FOR ALL
  USING (auth.role() = 'service_role');
