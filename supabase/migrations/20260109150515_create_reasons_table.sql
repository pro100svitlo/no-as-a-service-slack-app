-- Create reasons table
CREATE TABLE IF NOT EXISTS reasons (
  id BIGSERIAL PRIMARY KEY,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster random selection
CREATE INDEX IF NOT EXISTS idx_reasons_id ON reasons(id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_reasons_updated_at
  BEFORE UPDATE ON reasons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE reasons ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to all users
CREATE POLICY "Allow read access to all users" ON reasons
  FOR SELECT
  USING (true);

-- Create policy to allow insert/update/delete for service role only
CREATE POLICY "Allow all access for service role" ON reasons
  FOR ALL
  USING (auth.role() = 'service_role');
