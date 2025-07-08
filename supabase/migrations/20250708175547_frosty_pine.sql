/*
  # Fix Subscriptions Table and Policies

  This migration creates the subscriptions table and related policies if they don't already exist.
  It uses conditional logic to prevent errors when running multiple times.

  1. Creates subscriptions table with proper constraints
  2. Enables Row Level Security
  3. Creates access policies for authenticated users
  4. Creates updated_at trigger
*/

-- Create subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  cost numeric(10,2) NOT NULL,
  currency text DEFAULT 'USD' NOT NULL,
  billing_cycle text NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
  next_billing date NOT NULL,
  category text,
  status text DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'paused', 'cancelled')),
  color text DEFAULT '#8B5CF6',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$
BEGIN
  -- Check if "Users can read own subscriptions" policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' 
    AND policyname = 'Users can read own subscriptions'
  ) THEN
    CREATE POLICY "Users can read own subscriptions"
      ON subscriptions
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Check if "Users can insert own subscriptions" policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' 
    AND policyname = 'Users can insert own subscriptions'
  ) THEN
    CREATE POLICY "Users can insert own subscriptions"
      ON subscriptions
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Check if "Users can update own subscriptions" policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' 
    AND policyname = 'Users can update own subscriptions'
  ) THEN
    CREATE POLICY "Users can update own subscriptions"
      ON subscriptions
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Check if "Users can delete own subscriptions" policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' 
    AND policyname = 'Users can delete own subscriptions'
  ) THEN
    CREATE POLICY "Users can delete own subscriptions"
      ON subscriptions
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_subscriptions_updated_at'
  ) THEN
    CREATE TRIGGER update_subscriptions_updated_at
      BEFORE UPDATE ON subscriptions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;