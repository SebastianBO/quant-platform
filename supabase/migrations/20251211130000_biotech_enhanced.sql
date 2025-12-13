-- Enhanced Biotech Features for Investors
-- PDUFA tracking, cash runway, pipeline visualization, 8-K alerts

-- PDUFA Dates Table (FDA decision deadlines)
CREATE TABLE IF NOT EXISTS pdufa_dates (
  id BIGSERIAL PRIMARY KEY,
  ticker VARCHAR(20),
  company_name VARCHAR(255) NOT NULL,
  drug_name VARCHAR(255) NOT NULL,
  indication VARCHAR(255),
  application_type VARCHAR(20), -- NDA, BLA, sNDA, sBLA
  application_number VARCHAR(30),
  pdufa_date DATE NOT NULL,
  decision_type VARCHAR(50), -- APPROVAL, CRL (Complete Response Letter), EXTENSION
  is_priority_review BOOLEAN DEFAULT FALSE,
  is_breakthrough_therapy BOOLEAN DEFAULT FALSE,
  is_accelerated_approval BOOLEAN DEFAULT FALSE,
  is_fast_track BOOLEAN DEFAULT FALSE,
  adcom_date DATE, -- Advisory Committee meeting if scheduled
  adcom_outcome VARCHAR(50), -- FAVORABLE, UNFAVORABLE, MIXED
  outcome VARCHAR(50), -- APPROVED, CRL, PENDING, WITHDRAWN
  outcome_date DATE,
  notes TEXT,
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pdufa_dates_date ON pdufa_dates(pdufa_date);
CREATE INDEX idx_pdufa_dates_ticker ON pdufa_dates(ticker);
CREATE INDEX idx_pdufa_dates_pending ON pdufa_dates(pdufa_date) WHERE outcome = 'PENDING';

-- Drug Pipeline Table (comprehensive pipeline tracking)
CREATE TABLE IF NOT EXISTS drug_pipeline (
  id BIGSERIAL PRIMARY KEY,
  ticker VARCHAR(20) NOT NULL,
  drug_name VARCHAR(255) NOT NULL,
  drug_class VARCHAR(100), -- Small molecule, mAb, ADC, Gene therapy, etc.
  mechanism_of_action TEXT,
  indications JSONB, -- Array of indications with phase per indication
  lead_indication VARCHAR(255),
  current_phase VARCHAR(20), -- PRECLINICAL, PHASE1, PHASE2, PHASE3, FILED, APPROVED
  phase_start_date DATE,
  expected_phase_completion DATE,
  partnered_with VARCHAR(255), -- Partner company if any
  partnership_value DECIMAL(15,2),
  peak_sales_estimate DECIMAL(15,2), -- Analyst estimates
  probability_of_success DECIMAL(5,2), -- Based on phase
  competitive_landscape TEXT,
  key_differentiators TEXT,
  patent_expiry DATE,
  orphan_drug_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ticker, drug_name)
);

CREATE INDEX idx_drug_pipeline_ticker ON drug_pipeline(ticker);
CREATE INDEX idx_drug_pipeline_phase ON drug_pipeline(current_phase);
CREATE INDEX idx_drug_pipeline_indication ON drug_pipeline USING GIN(indications);

-- Biotech Financials (cash runway specific)
CREATE TABLE IF NOT EXISTS biotech_financials (
  id BIGSERIAL PRIMARY KEY,
  ticker VARCHAR(20) NOT NULL,
  fiscal_period VARCHAR(10), -- Q1 2024, FY 2023
  fiscal_year INT,
  fiscal_quarter INT,
  report_date DATE,

  -- Cash position
  cash_and_equivalents DECIMAL(15,2),
  short_term_investments DECIMAL(15,2),
  total_cash DECIMAL(15,2), -- Cash + ST investments

  -- Burn rate
  operating_expenses DECIMAL(15,2),
  rd_expenses DECIMAL(15,2),
  sga_expenses DECIMAL(15,2),
  quarterly_cash_burn DECIMAL(15,2),

  -- Runway calculation
  cash_runway_quarters DECIMAL(4,1), -- Quarters of cash remaining
  cash_runway_date DATE, -- Estimated date cash runs out

  -- Revenue (if any)
  total_revenue DECIMAL(15,2),
  product_revenue DECIMAL(15,2),
  collaboration_revenue DECIMAL(15,2),

  -- Dilution tracking
  shares_outstanding BIGINT,
  shares_change_qoq DECIMAL(5,2), -- % change in shares
  atm_capacity_remaining DECIMAL(15,2), -- Remaining ATM offering capacity
  shelf_registration_amount DECIMAL(15,2), -- Amount on shelf

  -- Guidance
  rd_guidance_low DECIMAL(15,2),
  rd_guidance_high DECIMAL(15,2),
  cash_guidance TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ticker, fiscal_year, fiscal_quarter)
);

CREATE INDEX idx_biotech_financials_ticker ON biotech_financials(ticker);
CREATE INDEX idx_biotech_financials_date ON biotech_financials(report_date);
CREATE INDEX idx_biotech_financials_runway ON biotech_financials(cash_runway_quarters);

-- SEC 8-K Alert Types for biotech
CREATE TABLE IF NOT EXISTS biotech_8k_alerts (
  id BIGSERIAL PRIMARY KEY,
  ticker VARCHAR(20) NOT NULL,
  filing_date DATE NOT NULL,
  accession_number VARCHAR(30) UNIQUE,
  alert_type VARCHAR(50), -- TRIAL_RESULT, FDA_UPDATE, PARTNERSHIP, FINANCING, EXECUTIVE_CHANGE
  headline TEXT,
  summary TEXT,
  sentiment VARCHAR(20), -- POSITIVE, NEGATIVE, NEUTRAL
  drug_mentioned VARCHAR(255),
  trial_nct_id VARCHAR(20),
  is_material BOOLEAN DEFAULT TRUE,
  sec_filing_url TEXT,
  press_release_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_biotech_8k_ticker ON biotech_8k_alerts(ticker);
CREATE INDEX idx_biotech_8k_date ON biotech_8k_alerts(filing_date);
CREATE INDEX idx_biotech_8k_type ON biotech_8k_alerts(alert_type);

-- Competitor Tracking (same indication trials)
CREATE TABLE IF NOT EXISTS indication_competitors (
  id BIGSERIAL PRIMARY KEY,
  indication VARCHAR(255) NOT NULL,
  indication_normalized VARCHAR(255), -- Standardized name
  therapeutic_area VARCHAR(100), -- Oncology, CNS, etc.
  market_size_estimate DECIMAL(15,2), -- TAM estimate
  competitors JSONB, -- Array of {ticker, drug_name, phase, expected_approval}
  leader_ticker VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(indication_normalized)
);

CREATE INDEX idx_indication_competitors_area ON indication_competitors(therapeutic_area);
CREATE INDEX idx_indication_competitors_leaders ON indication_competitors USING GIN(competitors);

-- Biotech Watchlist (user-specific)
CREATE TABLE IF NOT EXISTS biotech_watchlist (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker VARCHAR(20) NOT NULL,
  alert_on_pdufa BOOLEAN DEFAULT TRUE,
  alert_on_trial_update BOOLEAN DEFAULT TRUE,
  alert_on_8k BOOLEAN DEFAULT TRUE,
  alert_on_cash_runway BOOLEAN DEFAULT TRUE,
  cash_runway_threshold INT DEFAULT 4, -- Alert if < N quarters
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, ticker)
);

CREATE INDEX idx_biotech_watchlist_user ON biotech_watchlist(user_id);
CREATE INDEX idx_biotech_watchlist_ticker ON biotech_watchlist(ticker);

-- Add probability of success by phase (industry standard)
INSERT INTO indication_competitors (indication, indication_normalized, therapeutic_area, competitors)
VALUES
  ('Phase Success Rates', 'PHASE_SUCCESS_RATES', 'Reference', '{"phase1_to_phase2": 0.52, "phase2_to_phase3": 0.29, "phase3_to_approval": 0.58, "overall": 0.079}')
ON CONFLICT (indication_normalized) DO NOTHING;

-- RLS Policies
ALTER TABLE pdufa_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE biotech_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE biotech_8k_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE indication_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE biotech_watchlist ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Allow public read for pdufa_dates" ON pdufa_dates FOR SELECT USING (true);
CREATE POLICY "Allow public read for drug_pipeline" ON drug_pipeline FOR SELECT USING (true);
CREATE POLICY "Allow public read for biotech_financials" ON biotech_financials FOR SELECT USING (true);
CREATE POLICY "Allow public read for biotech_8k_alerts" ON biotech_8k_alerts FOR SELECT USING (true);
CREATE POLICY "Allow public read for indication_competitors" ON indication_competitors FOR SELECT USING (true);

-- User-specific watchlist policies
CREATE POLICY "Users can view own watchlist" ON biotech_watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own watchlist" ON biotech_watchlist FOR ALL USING (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "Service role access pdufa_dates" ON pdufa_dates FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access drug_pipeline" ON drug_pipeline FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access biotech_financials" ON biotech_financials FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access biotech_8k_alerts" ON biotech_8k_alerts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access indication_competitors" ON indication_competitors FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access biotech_watchlist" ON biotech_watchlist FOR ALL USING (auth.role() = 'service_role');

-- Update admin status to include biotech tables
-- Add biotech tables to DATABASE_TABLES in admin/status/route.ts
