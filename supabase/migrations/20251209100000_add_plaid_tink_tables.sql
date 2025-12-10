-- Create plaid_items table for storing Plaid access tokens
CREATE TABLE IF NOT EXISTS plaid_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  institution_id TEXT,
  institution_name TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tink_connections table for storing Tink tokens
CREATE TABLE IF NOT EXISTS tink_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT,
  expires_in INTEGER,
  scope TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add Plaid-specific columns to investments table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investments' AND column_name = 'plaid_holding_id') THEN
    ALTER TABLE investments ADD COLUMN plaid_holding_id TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investments' AND column_name = 'plaid_account_id') THEN
    ALTER TABLE investments ADD COLUMN plaid_account_id TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investments' AND column_name = 'tink_holding_id') THEN
    ALTER TABLE investments ADD COLUMN tink_holding_id TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investments' AND column_name = 'last_updated_from_plaid') THEN
    ALTER TABLE investments ADD COLUMN last_updated_from_plaid TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investments' AND column_name = 'last_updated_from_tink') THEN
    ALTER TABLE investments ADD COLUMN last_updated_from_tink TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investments' AND column_name = 'isin') THEN
    ALTER TABLE investments ADD COLUMN isin TEXT;
  END IF;
END $$;

-- Add Plaid/Tink columns to portfolios table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'portfolios' AND column_name = 'plaid_item_id') THEN
    ALTER TABLE portfolios ADD COLUMN plaid_item_id TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'portfolios' AND column_name = 'tink_connected') THEN
    ALTER TABLE portfolios ADD COLUMN tink_connected BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_plaid_items_user_id ON plaid_items(user_id);
CREATE INDEX IF NOT EXISTS idx_plaid_items_item_id ON plaid_items(item_id);
CREATE INDEX IF NOT EXISTS idx_tink_connections_user_id ON tink_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_plaid_holding_id ON investments(plaid_holding_id);
CREATE INDEX IF NOT EXISTS idx_investments_tink_holding_id ON investments(tink_holding_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_plaid_item_id ON portfolios(plaid_item_id);

-- Enable RLS on new tables
ALTER TABLE plaid_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tink_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for plaid_items
DROP POLICY IF EXISTS "Users can view their own plaid items" ON plaid_items;
CREATE POLICY "Users can view their own plaid items" ON plaid_items
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own plaid items" ON plaid_items;
CREATE POLICY "Users can insert their own plaid items" ON plaid_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own plaid items" ON plaid_items;
CREATE POLICY "Users can update their own plaid items" ON plaid_items
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own plaid items" ON plaid_items;
CREATE POLICY "Users can delete their own plaid items" ON plaid_items
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for tink_connections
DROP POLICY IF EXISTS "Users can view their own tink connections" ON tink_connections;
CREATE POLICY "Users can view their own tink connections" ON tink_connections
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own tink connections" ON tink_connections;
CREATE POLICY "Users can insert their own tink connections" ON tink_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tink connections" ON tink_connections;
CREATE POLICY "Users can update their own tink connections" ON tink_connections
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tink connections" ON tink_connections;
CREATE POLICY "Users can delete their own tink connections" ON tink_connections
  FOR DELETE USING (auth.uid() = user_id);
