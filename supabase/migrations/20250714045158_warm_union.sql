/*
  # Fix User Confirmation Issue
  
  1. Changes
     - Modify the user_confirmations table to make confirmed_at and expires_at nullable
     - Add a trigger to automatically create a confirmation record when a new user is created
     - Add a function to handle the confirmation process
  
  2. Security
     - Maintain existing RLS policies
*/

-- Make confirmed_at and expires_at nullable in user_confirmations table
ALTER TABLE user_confirmations 
  ALTER COLUMN confirmed_at DROP NOT NULL,
  ALTER COLUMN expires_at DROP NOT NULL;

-- Create or replace function to handle user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a record into user_confirmations
  INSERT INTO user_confirmations (user_id, token)
  VALUES (NEW.id, encode(gen_random_bytes(32), 'hex'));
  
  -- Create a profile for the new user
  INSERT INTO user_profiles (user_id, display_name, bio)
  VALUES (NEW.id, split_part(NEW.email, '@', 1), 'Subscription management enthusiast');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create confirmation record for new users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
  END IF;
END
$$;

-- Create function to confirm a user
CREATE OR REPLACE FUNCTION confirm_user(token_input TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  confirmation_record user_confirmations;
  result BOOLEAN;
BEGIN
  -- Find the confirmation record
  SELECT * INTO confirmation_record
  FROM user_confirmations
  WHERE token = token_input;
  
  -- If no record found, return false
  IF confirmation_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Update the confirmation record
  UPDATE user_confirmations
  SET confirmed_at = NOW()
  WHERE token = token_input;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;