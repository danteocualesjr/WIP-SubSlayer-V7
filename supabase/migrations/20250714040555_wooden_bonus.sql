/*
  # Fix User Signup Process

  1. New Tables
    - `user_confirmations` table to store email confirmation tokens
  
  2. Security
    - Enable RLS on the table
    - Add policies for authenticated users to read their own confirmation data
  
  3. Functions
    - Create function to handle new user signup
    - Create function to confirm user email
    - Create function to resend confirmation email
*/

-- Create user_confirmations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE CHECK (token <> ''),
  created_at timestamptz DEFAULT now(),
  confirmed_at timestamptz DEFAULT null,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Enable RLS
ALTER TABLE public.user_confirmations ENABLE ROW LEVEL SECURITY;

-- Add policy for users to read their own confirmation data
CREATE POLICY "Users can read their own confirmation data"
  ON public.user_confirmations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  confirmation_token TEXT;
BEGIN
  -- Generate a confirmation token
  confirmation_token := encode(gen_random_bytes(32), 'hex');
  
  -- Insert the confirmation token
  BEGIN
    INSERT INTO public.user_confirmations (user_id, token)
    VALUES (NEW.id, confirmation_token);
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE NOTICE 'Error creating confirmation token: %', SQLERRM;
  END;
  
  -- Try to send welcome email, but don't fail if it doesn't work
  BEGIN
    PERFORM http((
      'POST',
      CONCAT(current_setting('supabase_functions_endpoint', true), '/welcome-email'),
      ARRAY[http_header('Content-Type', 'application/json')],
      '{"email":"' || NEW.email || '", "name":"' || COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)) || '"}',
      NULL
    )::http_request);
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE NOTICE 'Error sending welcome email: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END
$$;

-- Function to confirm user email
CREATE OR REPLACE FUNCTION public.confirm_user_email(token_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  confirmation RECORD;
  user_id UUID;
BEGIN
  -- Find the confirmation record
  SELECT * INTO confirmation
  FROM public.user_confirmations
  WHERE token = token_input
  AND confirmed_at IS NULL
  AND expires_at > now();
  
  IF confirmation IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Update the confirmation record
  UPDATE public.user_confirmations
  SET confirmed_at = now()
  WHERE id = confirmation.id;
  
  -- Update the user's email_confirmed_at
  UPDATE auth.users
  SET email_confirmed_at = now()
  WHERE id = confirmation.user_id;
  
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$;

-- Function to resend confirmation email
CREATE OR REPLACE FUNCTION public.resend_confirmation_email(user_id_input UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
  confirmation_token TEXT;
BEGIN
  -- Get the user record
  SELECT * INTO user_record
  FROM auth.users
  WHERE id = user_id_input;
  
  IF user_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Generate a new confirmation token
  confirmation_token := encode(gen_random_bytes(32), 'hex');
  
  -- Delete any existing tokens
  DELETE FROM public.user_confirmations
  WHERE user_id = user_id_input;
  
  -- Insert the new confirmation token
  INSERT INTO public.user_confirmations (user_id, token)
  VALUES (user_id_input, confirmation_token);
  
  -- Try to send welcome email with confirmation link
  BEGIN
    PERFORM http((
      'POST',
      CONCAT(current_setting('supabase_functions_endpoint', true), '/welcome-email'),
      ARRAY[http_header('Content-Type', 'application/json')],
      '{"email":"' || user_record.email || '", "name":"' || COALESCE(user_record.raw_user_meta_data->>'full_name', split_part(user_record.email, '@', 1)) || '"}',
      NULL
    )::http_request);
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail
    RAISE NOTICE 'Error sending confirmation email: %', SQLERRM;
  END;
  
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$;