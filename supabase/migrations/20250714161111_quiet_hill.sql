/*
  # Fix Duplicate Policy Error
  
  1. Changes
     - Adds a conditional check before creating the policy "Users can read own subscriptions"
     - Uses DO block to safely check if policy exists before attempting to create it
     - Ensures idempotent execution (can be run multiple times without error)
*/

-- First, check if the policy exists before trying to create it
DO $$
BEGIN
  -- Check if the policy already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'subscriptions' 
    AND policyname = 'Users can read own subscriptions'
  ) THEN
    -- Only create the policy if it doesn't exist
    EXECUTE 'CREATE POLICY "Users can read own subscriptions" ON public.subscriptions FOR SELECT TO authenticated USING (uid() = user_id)';
  END IF;
END $$;

-- Make sure pgcrypto extension is enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Ensure the update_updated_at_column function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;