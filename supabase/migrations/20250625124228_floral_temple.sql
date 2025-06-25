/*
  # Create subscriptions table

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, subscription service name)
      - `description` (text, optional description)
      - `cost` (decimal, subscription cost)
      - `currency` (text, currency code)
      - `billing_cycle` (text, monthly or annual)
      - `next_billing` (date, next billing date)
      - `category` (text, subscription category)
      - `status` (text, active/paused/cancelled)
      - `color` (text, hex color for UI)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `subscriptions` table
    - Add policy for users to read their own subscriptions
    - Add policy for users to insert their own subscriptions
    - Add policy for users to update their own subscriptions
    - Add policy for users to delete their own subscriptions
*/

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  cost decimal(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  billing_cycle text NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
  next_billing date NOT NULL,
  category text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  color text DEFAULT '#8B5CF6',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON subscriptions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();