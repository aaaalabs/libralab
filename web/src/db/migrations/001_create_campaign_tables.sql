-- Create campaign_deposits table
CREATE TABLE IF NOT EXISTS campaign_deposits (
  id SERIAL PRIMARY KEY,
  tier_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending'
);

-- Create campaign_progress table
CREATE TABLE IF NOT EXISTS campaign_progress (
  id SERIAL PRIMARY KEY,
  current_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  goal_amount DECIMAL(10,2) NOT NULL DEFAULT 8000,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tier_slots table
CREATE TABLE IF NOT EXISTS tier_slots (
  tier_id VARCHAR(255) PRIMARY KEY,
  max_slots INTEGER NOT NULL,
  used_slots INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial campaign progress
INSERT INTO campaign_progress (current_amount, goal_amount)
VALUES (400, 8000)
ON CONFLICT DO NOTHING;

-- Insert initial tier slots
INSERT INTO tier_slots (tier_id, max_slots, used_slots)
VALUES 
  ('pioneer', 5, 0),
  ('early-adopter', 8, 0),
  ('community', 12, 0)
ON CONFLICT DO NOTHING;
