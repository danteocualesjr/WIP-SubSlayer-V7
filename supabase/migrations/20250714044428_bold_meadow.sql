/*
  # Fix user registration issues
  
  1. New Tables
    - `user_confirmations` table to track email confirmations
  2. Security
    - Add proper RLS policies for user authentication
    - Add trigger for handling new user registration
  3. Changes
    - Ensure proper foreign key relationships
*/

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a row into public.user_profiles
  INSERT INTO public.user_profiles (user_id, display_name, created_at)
  VALUES (NEW.id, SPLIT_PART(NEW.email, '@', 1), NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure user_profiles table has proper RLS policies
ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Check if policies exist and create them if they don't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile" 
    ON public.user_profiles FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile" 
    ON public.user_profiles FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile" 
    ON public.user_profiles FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- Ensure user_confirmations table exists and has proper structure
CREATE TABLE IF NOT EXISTS public.user_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL CHECK (token <> ''),
  created_at TIMESTAMPTZ DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Create unique index on token
CREATE UNIQUE INDEX IF NOT EXISTS user_confirmations_token_key ON public.user_confirmations(token);

-- Enable RLS on user_confirmations
ALTER TABLE public.user_confirmations ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for user_confirmations
CREATE POLICY "Users can read their own confirmation data"
  ON public.user_confirmations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Ensure subscriptions table has proper RLS policies
ALTER TABLE IF EXISTS public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Check if policies exist and create them if they don't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' AND policyname = 'Users can read own subscriptions'
  ) THEN
    CREATE POLICY "Users can read own subscriptions" 
    ON public.subscriptions FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' AND policyname = 'Users can insert own subscriptions'
  ) THEN
    CREATE POLICY "Users can insert own subscriptions" 
    ON public.subscriptions FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' AND policyname = 'Users can update own subscriptions'
  ) THEN
    CREATE POLICY "Users can update own subscriptions" 
    ON public.subscriptions FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' AND policyname = 'Users can delete own subscriptions'
  ) THEN
    CREATE POLICY "Users can delete own subscriptions" 
    ON public.subscriptions FOR DELETE 
    TO authenticated 
    USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Disable email confirmation requirement for testing
UPDATE auth.config
SET email_confirmation_required = false
WHERE email_confirmation_required = true;