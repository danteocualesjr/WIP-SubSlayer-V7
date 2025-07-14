/*
  # Create storage bucket for profile images
  
  1. New Storage Bucket
    - Creates a 'profiles' bucket for storing user profile images
    - Sets up appropriate security policies
  
  2. Security
    - Enables public access for profile images
    - Sets up RLS policies for uploads
*/

-- Create a storage bucket for profile images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to profile images
CREATE POLICY "Public Access to Profiles" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'profiles');

-- Allow authenticated users to upload their own profile images
CREATE POLICY "Users can upload their own profile images" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profiles' AND
    (storage.foldername(name))[1] = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[2]
  );

-- Allow users to update/delete their own profile images
CREATE POLICY "Users can update their own profile images" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profiles' AND
    (storage.foldername(name))[1] = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[2]
  );

CREATE POLICY "Users can delete their own profile images" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profiles' AND
    (storage.foldername(name))[1] = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[2]
  );