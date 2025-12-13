-- Update biotech company mappings with corrected sponsor aliases
-- These are the exact sponsor names used in ClinicalTrials.gov

UPDATE biotech_company_mapping SET
  sponsor_aliases = ARRAY['Pfizer', 'Pfizer Inc', 'Pfizer Inc.', 'PFIZER INC', 'Pfizer, Inc.', 'Pfizer Vaccines']
WHERE ticker = 'PFE';

UPDATE biotech_company_mapping SET
  sponsor_aliases = ARRAY['ModernaTX, Inc.', 'Moderna', 'ModernaTX', 'Moderna, Inc.', 'Moderna Inc']
WHERE ticker = 'MRNA';

UPDATE biotech_company_mapping SET
  sponsor_aliases = ARRAY['Janssen Research & Development, LLC', 'Janssen', 'Janssen Vaccines & Prevention B.V.', 'Johnson & Johnson', 'Janssen Pharmaceuticals']
WHERE ticker = 'JNJ';

UPDATE biotech_company_mapping SET
  sponsor_aliases = ARRAY['AbbVie', 'AbbVie Inc.', 'AbbVie Inc']
WHERE ticker = 'ABBV';

UPDATE biotech_company_mapping SET
  sponsor_aliases = ARRAY['Merck Sharp & Dohme LLC', 'Merck Sharp & Dohme Corp.', 'Merck & Co., Inc.', 'MSD', 'Merck']
WHERE ticker = 'MRK';

UPDATE biotech_company_mapping SET
  sponsor_aliases = ARRAY['Eli Lilly and Company', 'Eli Lilly', 'Lilly']
WHERE ticker = 'LLY';

UPDATE biotech_company_mapping SET
  sponsor_aliases = ARRAY['Bristol-Myers Squibb', 'Bristol Myers Squibb', 'BMS']
WHERE ticker = 'BMY';

UPDATE biotech_company_mapping SET
  sponsor_aliases = ARRAY['Amgen', 'Amgen Inc.', 'Amgen Inc']
WHERE ticker = 'AMGN';

UPDATE biotech_company_mapping SET
  sponsor_aliases = ARRAY['Gilead Sciences', 'Gilead Sciences, Inc.', 'Gilead']
WHERE ticker = 'GILD';

UPDATE biotech_company_mapping SET
  sponsor_aliases = ARRAY['Regeneron Pharmaceuticals', 'Regeneron Pharmaceuticals, Inc.', 'Regeneron']
WHERE ticker = 'REGN';

UPDATE biotech_company_mapping SET
  sponsor_aliases = ARRAY['Vertex Pharmaceuticals Incorporated', 'Vertex Pharmaceuticals', 'Vertex']
WHERE ticker = 'VRTX';

UPDATE biotech_company_mapping SET
  sponsor_aliases = ARRAY['Biogen', 'Biogen Inc.', 'Biogen Idec']
WHERE ticker = 'BIIB';

UPDATE biotech_company_mapping SET
  sponsor_aliases = ARRAY['Alnylam Pharmaceuticals', 'Alnylam Pharmaceuticals, Inc.', 'Alnylam']
WHERE ticker = 'ALNY';

UPDATE biotech_company_mapping SET
  sponsor_aliases = ARRAY['Seagen Inc.', 'Seattle Genetics, Inc.', 'Seattle Genetics', 'Seagen']
WHERE ticker = 'SGEN';

UPDATE biotech_company_mapping SET
  sponsor_aliases = ARRAY['Incyte Corporation', 'Incyte']
WHERE ticker = 'INCY';

UPDATE biotech_company_mapping SET
  sponsor_aliases = ARRAY['BioMarin Pharmaceutical', 'BioMarin Pharmaceutical Inc.', 'BioMarin']
WHERE ticker = 'BMRN';

UPDATE biotech_company_mapping SET
  sponsor_aliases = ARRAY['Exelixis', 'Exelixis, Inc.']
WHERE ticker = 'EXEL';

UPDATE biotech_company_mapping SET
  sponsor_aliases = ARRAY['Sarepta Therapeutics, Inc.', 'Sarepta Therapeutics', 'Sarepta']
WHERE ticker = 'SRPT';

UPDATE biotech_company_mapping SET
  sponsor_aliases = ARRAY['Ionis Pharmaceuticals, Inc.', 'Ionis Pharmaceuticals', 'Ionis']
WHERE ticker = 'IONS';

UPDATE biotech_company_mapping SET
  sponsor_aliases = ARRAY['CRISPR Therapeutics AG', 'CRISPR Therapeutics', 'CRISPR/Cas9']
WHERE ticker = 'CRSP';

UPDATE biotech_company_mapping SET
  sponsor_aliases = ARRAY['Intellia Therapeutics, Inc.', 'Intellia Therapeutics', 'Intellia']
WHERE ticker = 'NTLA';

UPDATE biotech_company_mapping SET
  sponsor_aliases = ARRAY['Beam Therapeutics Inc.', 'Beam Therapeutics', 'Beam']
WHERE ticker = 'BEAM';

UPDATE biotech_company_mapping SET
  sponsor_aliases = ARRAY['bluebird bio, Inc.', 'bluebird bio', 'Bluebird Bio']
WHERE ticker = 'BLUE';

UPDATE biotech_company_mapping SET
  sponsor_aliases = ARRAY['Arrowhead Pharmaceuticals', 'Arrowhead Research Corporation', 'Arrowhead']
WHERE ticker = 'ARWR';

UPDATE biotech_company_mapping SET
  sponsor_aliases = ARRAY['Cytokinetics', 'Cytokinetics, Incorporated']
WHERE ticker = 'CYTK';
