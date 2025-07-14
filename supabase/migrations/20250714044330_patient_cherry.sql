/*
  # Fix User Registration Schema

  1. New Tables
    - Ensures proper user_confirmations table structure
    - Adds missing trigger for user creation
  2. Security
    - Sets appropriate RLS policies
    - Ensures proper authentication flow
*/

-- Check if user_confirmations table exists and create if not
CREATE TABLE IF NOT EXISTS public.user_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL,
  created_at timestamptz DEFAULT now(),
  confirmed_at timestamptz DEFAULT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + '24:00:00'::interval)
);

-- Add constraint to ensure token is not empty
ALTER TABLE public.user_confirmations
  DROP CONSTRAINT IF EXISTS token_not_empty;

ALTER TABLE public.user_confirmations
  ADD CONSTRAINT token_not_empty CHECK (token <> '');

-- Create unique index on token
CREATE UNIQUE INDEX IF NOT EXISTS user_confirmations_token_key
  ON public.user_confirmations(token);

-- Enable RLS on user_confirmations
ALTER TABLE public.user_confirmations ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for user_confirmations
DROP POLICY IF EXISTS "Users can read their own confirmation data" ON public.user_confirmations;
CREATE POLICY "Users can read their own confirmation data"
  ON public.user_confirmations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create or replace function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a profile for the new user
  INSERT INTO public.user_profiles (user_id, display_name, created_at)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure user_profiles table exists
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  bio text,
  location text,
  website text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for user_profiles
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();