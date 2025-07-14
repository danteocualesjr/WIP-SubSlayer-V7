/*
  # Create profile storage bucket

  1. Storage
    - Create a storage bucket for profile images
    - Set up public access policies
  2. Security
    - Enable RLS on the bucket
    - Add policy for authenticated users to upload their own avatars
*/

-- Create storage bucket for profile images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the bucket
CREATE POLICY "Public profiles are viewable by everyone" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profiles');

CREATE POLICY "Users can upload their own profile pictures" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'profiles' AND (storage.foldername(name))[1] = 'avatars');

CREATE POLICY "Users can update their own profile pictures" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'profiles' AND (storage.foldername(name))[1] = 'avatars');

-- Ensure user_profiles table has the right structure
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

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile"
ON public.user_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.user_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create trigger for updated_at
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