-- Add credentials_id column to tink_connections table
-- This stores the Tink credentials ID from the Products flow

ALTER TABLE tink_connections
ADD COLUMN IF NOT EXISTS credentials_id TEXT;

-- Create index for faster lookups by credentials_id
CREATE INDEX IF NOT EXISTS idx_tink_connections_credentials_id
ON tink_connections(credentials_id);
