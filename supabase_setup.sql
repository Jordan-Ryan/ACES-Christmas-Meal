-- Create table for ACES Christmas Meal orders
CREATE TABLE IF NOT EXISTS aces_christmas_meal (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  is_child BOOLEAN NOT NULL DEFAULT false,
  has_paid BOOLEAN DEFAULT false,
  order_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on id for faster lookups
CREATE INDEX IF NOT EXISTS idx_aces_christmas_meal_id ON aces_christmas_meal(id);

-- Enable Row Level Security (optional, but recommended)
ALTER TABLE aces_christmas_meal ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (adjust based on your needs)
CREATE POLICY "Allow all operations on aces_christmas_meal"
  ON aces_christmas_meal
  FOR ALL
  USING (true)
  WITH CHECK (true);

