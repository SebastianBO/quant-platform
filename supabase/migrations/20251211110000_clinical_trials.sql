-- Clinical Trials Tables
-- Tracks clinical trials from ClinicalTrials.gov and FDA approvals
-- For biotech catalyst tracking and investment analysis

-- Clinical Trials Table (from ClinicalTrials.gov)
CREATE TABLE IF NOT EXISTS clinical_trials (
  id BIGSERIAL PRIMARY KEY,
  nct_id VARCHAR(20) NOT NULL UNIQUE,
  ticker VARCHAR(20), -- Associated stock ticker (if public company)
  sponsor VARCHAR(255) NOT NULL,
  brief_title TEXT NOT NULL,
  official_title TEXT,
  phase VARCHAR(20), -- PHASE1, PHASE2, PHASE3, PHASE4, NA, EARLY_PHASE1
  overall_status VARCHAR(50), -- RECRUITING, COMPLETED, ACTIVE_NOT_RECRUITING, etc.
  conditions TEXT[], -- Array of conditions/diseases
  interventions JSONB, -- Drug/treatment details
  primary_completion_date DATE,
  completion_date DATE,
  study_first_posted DATE,
  last_update_posted DATE,
  enrollment_count INT,
  enrollment_type VARCHAR(20), -- ACTUAL, ESTIMATED
  study_type VARCHAR(50), -- INTERVENTIONAL, OBSERVATIONAL
  locations JSONB, -- Study locations
  has_results BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for clinical_trials
CREATE INDEX IF NOT EXISTS idx_clinical_trials_ticker ON clinical_trials(ticker);
CREATE INDEX IF NOT EXISTS idx_clinical_trials_sponsor ON clinical_trials(sponsor);
CREATE INDEX IF NOT EXISTS idx_clinical_trials_phase ON clinical_trials(phase);
CREATE INDEX IF NOT EXISTS idx_clinical_trials_status ON clinical_trials(overall_status);
CREATE INDEX IF NOT EXISTS idx_clinical_trials_completion ON clinical_trials(primary_completion_date);
CREATE INDEX IF NOT EXISTS idx_clinical_trials_conditions ON clinical_trials USING GIN(conditions);

-- FDA Drug Approvals Table (from openFDA DrugsFDA)
CREATE TABLE IF NOT EXISTS fda_drug_approvals (
  id BIGSERIAL PRIMARY KEY,
  application_number VARCHAR(20) NOT NULL UNIQUE, -- NDA/BLA number
  ticker VARCHAR(20), -- Associated stock ticker
  sponsor_name VARCHAR(255),
  brand_name VARCHAR(255),
  generic_name VARCHAR(255),
  product_type VARCHAR(50), -- HUMAN PRESCRIPTION DRUG, etc.
  submission_type VARCHAR(20), -- ORIG, SUPPL
  submission_status VARCHAR(20), -- AP (approved), TA (tentative approval)
  submission_status_date DATE,
  review_priority VARCHAR(50), -- STANDARD, PRIORITY
  active_ingredients JSONB,
  dosage_form VARCHAR(100),
  route VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fda_drug_approvals
CREATE INDEX IF NOT EXISTS idx_fda_approvals_ticker ON fda_drug_approvals(ticker);
CREATE INDEX IF NOT EXISTS idx_fda_approvals_sponsor ON fda_drug_approvals(sponsor_name);
CREATE INDEX IF NOT EXISTS idx_fda_approvals_status_date ON fda_drug_approvals(submission_status_date);
CREATE INDEX IF NOT EXISTS idx_fda_approvals_brand ON fda_drug_approvals(brand_name);

-- Biotech Catalysts Table (derived from trials + FDA data)
CREATE TABLE IF NOT EXISTS biotech_catalysts (
  id BIGSERIAL PRIMARY KEY,
  ticker VARCHAR(20) NOT NULL,
  catalyst_type VARCHAR(50) NOT NULL, -- TRIAL_RESULT, FDA_DECISION, PDUFA_DATE, ADCOM_MEETING
  title TEXT NOT NULL,
  description TEXT,
  expected_date DATE,
  expected_date_precision VARCHAR(20), -- EXACT, MONTH, QUARTER, YEAR
  source_type VARCHAR(20), -- CLINICAL_TRIAL, FDA, COMPANY_ANNOUNCEMENT
  source_id VARCHAR(50), -- NCT ID or FDA application number
  drug_name VARCHAR(255),
  indication VARCHAR(255),
  phase VARCHAR(20),
  importance VARCHAR(20) DEFAULT 'MEDIUM', -- HIGH, MEDIUM, LOW
  is_confirmed BOOLEAN DEFAULT FALSE,
  outcome VARCHAR(50), -- POSITIVE, NEGATIVE, MIXED, PENDING
  outcome_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for biotech_catalysts
CREATE INDEX IF NOT EXISTS idx_biotech_catalysts_ticker ON biotech_catalysts(ticker);
CREATE INDEX IF NOT EXISTS idx_biotech_catalysts_date ON biotech_catalysts(expected_date);
CREATE INDEX IF NOT EXISTS idx_biotech_catalysts_type ON biotech_catalysts(catalyst_type);
CREATE INDEX IF NOT EXISTS idx_biotech_catalysts_importance ON biotech_catalysts(importance);
CREATE INDEX IF NOT EXISTS idx_biotech_catalysts_pending ON biotech_catalysts(expected_date)
  WHERE outcome = 'PENDING';

-- Ticker to Sponsor Mapping (for linking trials to stocks)
CREATE TABLE IF NOT EXISTS biotech_company_mapping (
  ticker VARCHAR(20) PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  sponsor_aliases TEXT[], -- Alternative names used in ClinicalTrials.gov
  cik VARCHAR(20), -- SEC CIK number
  sector VARCHAR(50) DEFAULT 'Healthcare',
  industry VARCHAR(100),
  market_cap_tier VARCHAR(20), -- LARGE, MID, SMALL, MICRO
  is_biotech BOOLEAN DEFAULT TRUE,
  focus_areas TEXT[], -- Oncology, Immunology, Rare Disease, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial biotech company mappings
INSERT INTO biotech_company_mapping (ticker, company_name, sponsor_aliases, industry, market_cap_tier, focus_areas)
VALUES
  ('PFE', 'Pfizer Inc', ARRAY['Pfizer', 'PFIZER INC', 'Pfizer Inc.'], 'Pharmaceuticals', 'LARGE', ARRAY['Oncology', 'Immunology', 'Vaccines']),
  ('MRNA', 'Moderna Inc', ARRAY['Moderna', 'MODERNA INC', 'Moderna, Inc.', 'ModernaTX'], 'Biotechnology', 'LARGE', ARRAY['mRNA Therapeutics', 'Vaccines', 'Oncology']),
  ('JNJ', 'Johnson & Johnson', ARRAY['Johnson & Johnson', 'Janssen', 'J&J', 'JOHNSON & JOHNSON'], 'Pharmaceuticals', 'LARGE', ARRAY['Oncology', 'Immunology', 'Neuroscience']),
  ('ABBV', 'AbbVie Inc', ARRAY['AbbVie', 'ABBVIE INC', 'AbbVie Inc.'], 'Pharmaceuticals', 'LARGE', ARRAY['Immunology', 'Oncology', 'Neuroscience']),
  ('MRK', 'Merck & Co', ARRAY['Merck', 'MERCK & CO', 'Merck Sharp & Dohme', 'MSD'], 'Pharmaceuticals', 'LARGE', ARRAY['Oncology', 'Vaccines', 'Immunology']),
  ('LLY', 'Eli Lilly', ARRAY['Eli Lilly', 'ELI LILLY', 'Lilly', 'Eli Lilly and Company'], 'Pharmaceuticals', 'LARGE', ARRAY['Diabetes', 'Oncology', 'Neuroscience']),
  ('BMY', 'Bristol-Myers Squibb', ARRAY['Bristol-Myers Squibb', 'BMS', 'BRISTOL-MYERS SQUIBB'], 'Pharmaceuticals', 'LARGE', ARRAY['Oncology', 'Immunology', 'Cardiovascular']),
  ('AMGN', 'Amgen Inc', ARRAY['Amgen', 'AMGEN INC', 'Amgen Inc.'], 'Biotechnology', 'LARGE', ARRAY['Oncology', 'Bone Health', 'Inflammation']),
  ('GILD', 'Gilead Sciences', ARRAY['Gilead', 'GILEAD SCIENCES', 'Gilead Sciences, Inc.'], 'Biotechnology', 'LARGE', ARRAY['HIV', 'Hepatitis', 'Oncology']),
  ('REGN', 'Regeneron Pharmaceuticals', ARRAY['Regeneron', 'REGENERON', 'Regeneron Pharmaceuticals, Inc.'], 'Biotechnology', 'LARGE', ARRAY['Ophthalmology', 'Immunology', 'Oncology']),
  ('VRTX', 'Vertex Pharmaceuticals', ARRAY['Vertex', 'VERTEX', 'Vertex Pharmaceuticals Incorporated'], 'Biotechnology', 'LARGE', ARRAY['Cystic Fibrosis', 'Gene Editing', 'Pain']),
  ('BIIB', 'Biogen Inc', ARRAY['Biogen', 'BIOGEN', 'Biogen Inc.'], 'Biotechnology', 'LARGE', ARRAY['Neuroscience', 'Multiple Sclerosis', 'Alzheimers']),
  ('ALNY', 'Alnylam Pharmaceuticals', ARRAY['Alnylam', 'ALNYLAM', 'Alnylam Pharmaceuticals, Inc.'], 'Biotechnology', 'MID', ARRAY['RNAi Therapeutics', 'Rare Disease']),
  ('SGEN', 'Seagen Inc', ARRAY['Seagen', 'SEAGEN', 'Seattle Genetics'], 'Biotechnology', 'MID', ARRAY['Oncology', 'ADC']),
  ('INCY', 'Incyte Corporation', ARRAY['Incyte', 'INCYTE', 'Incyte Corporation'], 'Biotechnology', 'MID', ARRAY['Oncology', 'Inflammation']),
  ('BMRN', 'BioMarin Pharmaceutical', ARRAY['BioMarin', 'BIOMARIN', 'BioMarin Pharmaceutical Inc.'], 'Biotechnology', 'MID', ARRAY['Rare Disease', 'Gene Therapy']),
  ('EXEL', 'Exelixis Inc', ARRAY['Exelixis', 'EXELIXIS'], 'Biotechnology', 'MID', ARRAY['Oncology']),
  ('SRPT', 'Sarepta Therapeutics', ARRAY['Sarepta', 'SAREPTA', 'Sarepta Therapeutics, Inc.'], 'Biotechnology', 'MID', ARRAY['Gene Therapy', 'Duchenne Muscular Dystrophy']),
  ('IONS', 'Ionis Pharmaceuticals', ARRAY['Ionis', 'IONIS', 'Ionis Pharmaceuticals, Inc.'], 'Biotechnology', 'MID', ARRAY['Antisense', 'Rare Disease']),
  ('NBIX', 'Neurocrine Biosciences', ARRAY['Neurocrine', 'NEUROCRINE', 'Neurocrine Biosciences, Inc.'], 'Biotechnology', 'MID', ARRAY['Neuroscience']),
  ('UTHR', 'United Therapeutics', ARRAY['United Therapeutics', 'UNITED THERAPEUTICS'], 'Biotechnology', 'MID', ARRAY['Pulmonary', 'Organ Transplant']),
  ('RARE', 'Ultragenyx Pharmaceutical', ARRAY['Ultragenyx', 'ULTRAGENYX'], 'Biotechnology', 'MID', ARRAY['Rare Disease', 'Gene Therapy']),
  ('FOLD', 'Amicus Therapeutics', ARRAY['Amicus', 'AMICUS', 'Amicus Therapeutics, Inc.'], 'Biotechnology', 'SMALL', ARRAY['Rare Disease', 'Gene Therapy']),
  ('CRSP', 'CRISPR Therapeutics', ARRAY['CRISPR', 'CRISPR Therapeutics', 'CRISPR Therapeutics AG'], 'Biotechnology', 'MID', ARRAY['Gene Editing', 'Cell Therapy']),
  ('EDIT', 'Editas Medicine', ARRAY['Editas', 'EDITAS', 'Editas Medicine, Inc.'], 'Biotechnology', 'SMALL', ARRAY['Gene Editing']),
  ('NTLA', 'Intellia Therapeutics', ARRAY['Intellia', 'INTELLIA', 'Intellia Therapeutics, Inc.'], 'Biotechnology', 'MID', ARRAY['Gene Editing', 'In Vivo']),
  ('BEAM', 'Beam Therapeutics', ARRAY['Beam', 'BEAM', 'Beam Therapeutics Inc.'], 'Biotechnology', 'SMALL', ARRAY['Base Editing', 'Gene Editing']),
  ('VERV', 'Verve Therapeutics', ARRAY['Verve', 'VERVE', 'Verve Therapeutics, Inc.'], 'Biotechnology', 'SMALL', ARRAY['Gene Editing', 'Cardiovascular']),
  ('RCKT', 'Rocket Pharmaceuticals', ARRAY['Rocket', 'ROCKET', 'Rocket Pharmaceuticals, Inc.'], 'Biotechnology', 'SMALL', ARRAY['Gene Therapy', 'Rare Disease']),
  ('BLUE', 'bluebird bio', ARRAY['bluebird', 'BLUEBIRD', 'bluebird bio, Inc.'], 'Biotechnology', 'SMALL', ARRAY['Gene Therapy', 'Cell Therapy']),
  ('ACAD', 'ACADIA Pharmaceuticals', ARRAY['ACADIA', 'Acadia', 'ACADIA Pharmaceuticals Inc.'], 'Biotechnology', 'MID', ARRAY['Neuroscience']),
  ('IMVT', 'Immunovant Inc', ARRAY['Immunovant', 'IMMUNOVANT'], 'Biotechnology', 'SMALL', ARRAY['Autoimmune']),
  ('ARWR', 'Arrowhead Pharmaceuticals', ARRAY['Arrowhead', 'ARROWHEAD', 'Arrowhead Pharmaceuticals, Inc.'], 'Biotechnology', 'MID', ARRAY['RNAi', 'Liver Disease']),
  ('CYTK', 'Cytokinetics', ARRAY['Cytokinetics', 'CYTOKINETICS', 'Cytokinetics, Incorporated'], 'Biotechnology', 'MID', ARRAY['Cardiovascular', 'Neuromuscular']),
  ('INSM', 'Insmed Incorporated', ARRAY['Insmed', 'INSMED'], 'Biotechnology', 'MID', ARRAY['Pulmonary', 'Rare Disease']),
  ('PCVX', 'Vaxcyte Inc', ARRAY['Vaxcyte', 'VAXCYTE'], 'Biotechnology', 'MID', ARRAY['Vaccines']),
  ('ARVN', 'Arvinas Inc', ARRAY['Arvinas', 'ARVINAS'], 'Biotechnology', 'SMALL', ARRAY['Protein Degradation', 'Oncology']),
  ('KRTX', 'Karuna Therapeutics', ARRAY['Karuna', 'KARUNA'], 'Biotechnology', 'MID', ARRAY['Neuroscience', 'Psychiatry']),
  ('DAWN', 'Day One Biopharmaceuticals', ARRAY['Day One', 'DAY ONE'], 'Biotechnology', 'SMALL', ARRAY['Pediatric Oncology']),
  ('RXRX', 'Recursion Pharmaceuticals', ARRAY['Recursion', 'RECURSION'], 'Biotechnology', 'SMALL', ARRAY['AI Drug Discovery'])
ON CONFLICT (ticker) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  sponsor_aliases = EXCLUDED.sponsor_aliases,
  industry = EXCLUDED.industry,
  market_cap_tier = EXCLUDED.market_cap_tier,
  focus_areas = EXCLUDED.focus_areas,
  updated_at = NOW();

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_clinical_trials_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_clinical_trials_timestamp ON clinical_trials;
CREATE TRIGGER update_clinical_trials_timestamp
  BEFORE UPDATE ON clinical_trials
  FOR EACH ROW
  EXECUTE FUNCTION update_clinical_trials_timestamp();

DROP TRIGGER IF EXISTS update_fda_approvals_timestamp ON fda_drug_approvals;
CREATE TRIGGER update_fda_approvals_timestamp
  BEFORE UPDATE ON fda_drug_approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_clinical_trials_timestamp();

DROP TRIGGER IF EXISTS update_biotech_catalysts_timestamp ON biotech_catalysts;
CREATE TRIGGER update_biotech_catalysts_timestamp
  BEFORE UPDATE ON biotech_catalysts
  FOR EACH ROW
  EXECUTE FUNCTION update_clinical_trials_timestamp();

-- RLS Policies (read-only public access)
ALTER TABLE clinical_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE fda_drug_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE biotech_catalysts ENABLE ROW LEVEL SECURITY;
ALTER TABLE biotech_company_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for clinical_trials"
  ON clinical_trials FOR SELECT
  USING (true);

CREATE POLICY "Allow public read for fda_drug_approvals"
  ON fda_drug_approvals FOR SELECT
  USING (true);

CREATE POLICY "Allow public read for biotech_catalysts"
  ON biotech_catalysts FOR SELECT
  USING (true);

CREATE POLICY "Allow public read for biotech_company_mapping"
  ON biotech_company_mapping FOR SELECT
  USING (true);

-- Service role full access
CREATE POLICY "Allow service role full access to clinical_trials"
  ON clinical_trials FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to fda_drug_approvals"
  ON fda_drug_approvals FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to biotech_catalysts"
  ON biotech_catalysts FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to biotech_company_mapping"
  ON biotech_company_mapping FOR ALL
  USING (auth.role() = 'service_role');
