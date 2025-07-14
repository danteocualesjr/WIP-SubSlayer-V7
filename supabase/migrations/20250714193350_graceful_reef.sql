/*
  # Fix Profile Upload Functionality

  1. Changes
    - Adds proper unique constraint on user_id in user_profiles table
    - Ensures avatar_url column exists and is properly configured
    - Creates proper RLS policies for profile management
    - Adds storage bucket for profile avatars if it doesn't exist
*/

-- First, check if the user_profiles table exists and create it if not
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
    CREATE TABLE public.user_profiles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      display_name text,
      bio text,
      location text,
      website text,
      avatar_url text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Add unique constraint on user_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_profiles_user_id_key' AND conrelid = 'public.user_profiles'::regclass
  ) THEN
    ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Create index on user_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'user_profiles_user_id_idx' AND tablename = 'user_profiles'
  ) THEN
    CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON public.user_profiles (user_id);
  END IF;
END $$;

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;

-- Create RLS policies
CREATE POLICY "Users can insert their own profile" 
  ON public.user_profiles 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
  ON public.user_profiles 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own profile" 
  ON public.user_profiles 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Create updated_at trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_user_profiles_updated_at' AND tgrelid = 'public.user_profiles'::regclass
  ) THEN
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create storage bucket for avatars if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'avatars'
  ) THEN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('avatars', 'avatars', true);
  END IF;
END $$;

-- Set up storage policies for avatars
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Users can upload avatar images." ON storage.objects;

CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatar images."
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create a view to make it easier to join user data
CREATE OR REPLACE VIEW public.user_profiles_view AS
SELECT
  p.id,
  p.user_id,
  p.display_name,
  p.bio,
  p.location,
  p.website,
  p.avatar_url,
  p.created_at,
  p.updated_at,
  u.email
FROM
  public.user_profiles p
JOIN
  auth.users u ON p.user_id = u.id;

-- Enable RLS on the view
ALTER VIEW public.user_profiles_view SECURITY INVOKER;