/*
  # User Email Confirmation

  1. New Tables
    - `user_confirmations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `token` (text, unique)
      - `created_at` (timestamp)
      - `confirmed_at` (timestamp, nullable)
      - `expires_at` (timestamp)
  
  2. Security
    - Enable RLS on `user_confirmations` table
    - Add policy for authenticated users to read their own confirmation data
    - Add function to send welcome email on user creation
    - Add trigger to call the function when a user is created
*/

-- Create user_confirmations table
CREATE TABLE IF NOT EXISTS user_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  confirmed_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  CONSTRAINT token_not_empty CHECK (token <> '')
);

-- Enable RLS
ALTER TABLE user_confirmations ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own confirmation data
CREATE POLICY "Users can read their own confirmation data"
  ON user_confirmations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to send welcome email
CREATE OR REPLACE FUNCTION send_welcome_email()
RETURNS TRIGGER AS $$
DECLARE
  token text;
BEGIN
  -- Generate a unique token
  token := encode(gen_random_bytes(32), 'hex');
  
  -- Insert into user_confirmations
  INSERT INTO user_confirmations (user_id, token)
  VALUES (NEW.id, token);
  
  -- Call the Edge Function to send the welcome email
  -- This is done asynchronously to avoid blocking the transaction
  PERFORM
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/welcome-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key')
      ),
      body := jsonb_build_object(
        'email', NEW.email,
        'name', COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        'token', token
      )
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to send welcome email on user creation
DROP TRIGGER IF EXISTS send_welcome_email_trigger ON auth.users;
CREATE TRIGGER send_welcome_email_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION send_welcome_email();

-- Function to confirm user email
CREATE OR REPLACE FUNCTION confirm_user_email(token_input text)
RETURNS boolean AS $$
DECLARE
  confirmation_record user_confirmations;
  result boolean;
BEGIN
  -- Find the confirmation record
  SELECT * INTO confirmation_record
  FROM user_confirmations
  WHERE token = token_input
  AND confirmed_at IS NULL
  AND expires_at > now();
  
  -- If no valid record found, return false
  IF confirmation_record IS NULL THEN
    RETURN false;
  END IF;
  
  -- Update the confirmation record
  UPDATE user_confirmations
  SET confirmed_at = now()
  WHERE id = confirmation_record.id;
  
  -- Update the user's email_confirmed_at
  UPDATE auth.users
  SET email_confirmed_at = now()
  WHERE id = confirmation_record.user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to resend confirmation email
CREATE OR REPLACE FUNCTION resend_confirmation_email(user_id_input uuid)
RETURNS boolean AS $$
DECLARE
  user_record auth.users;
  new_token text;
BEGIN
  -- Find the user
  SELECT * INTO user_record
  FROM auth.users
  WHERE id = user_id_input;
  
  -- If no user found, return false
  IF user_record IS NULL THEN
    RETURN false;
  END IF;
  
  -- Generate a new token
  new_token := encode(gen_random_bytes(32), 'hex');
  
  -- Update or insert confirmation record
  INSERT INTO user_confirmations (user_id, token)
  VALUES (user_id_input, new_token)
  ON CONFLICT (user_id) DO UPDATE
  SET token = new_token,
      created_at = now(),
      confirmed_at = NULL,
      expires_at = now() + interval '24 hours';
  
  -- Call the Edge Function to send the welcome email
  PERFORM
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/welcome-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key')
      ),
      body := jsonb_build_object(
        'email', user_record.email,
        'name', COALESCE(user_record.raw_user_meta_data->>'full_name', user_record.raw_user_meta_data->>'name', split_part(user_record.email, '@', 1)),
        'token', new_token
      )
    );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;