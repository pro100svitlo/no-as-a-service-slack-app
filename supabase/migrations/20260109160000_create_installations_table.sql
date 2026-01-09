-- Create installations table to store Slack workspace tokens
CREATE TABLE IF NOT EXISTS installations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id TEXT UNIQUE NOT NULL,
  team_name TEXT NOT NULL,
  bot_token TEXT NOT NULL,
  bot_user_id TEXT,
  scope TEXT,
  app_id TEXT,
  enterprise_id TEXT,
  enterprise_name TEXT,
  authed_user_id TEXT,
  authed_user_token TEXT,
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on team_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_installations_team_id ON installations(team_id);

-- Create index on enterprise_id for enterprise lookups
CREATE INDEX IF NOT EXISTS idx_installations_enterprise_id ON installations(enterprise_id);

-- Add RLS policies (Row Level Security)
ALTER TABLE installations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to read/write all installations
CREATE POLICY "Service role can manage installations" ON installations
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE installations IS 'Stores Slack workspace installation data and bot tokens';
