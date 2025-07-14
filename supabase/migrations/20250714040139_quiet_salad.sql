@@ .. @@
 /*
   # Create user confirmation system
 
   1. New Tables
     - `user_confirmations`
       - `id` (uuid, primary key)
       - `user_id` (uuid, foreign key to auth.users)
       - `token` (text, unique confirmation token)
       - `created_at` (timestamp)
       - `confirmed_at` (timestamp, nullable)
       - `expires_at` (timestamp, 24 hours from creation)
   
   2. Security
     - Enable RLS on `user_confirmations` table
     - Add policy for users to read their own confirmation data
   
   3. Functions
     - `handle_new_user()` - Creates user profile and sends welcome email
     - `send_welcome_email()` - Sends welcome email with confirmation link
     - `confirm_user_email()` - Confirms user email when token is used
 */
 
+-- First, ensure the users table exists in public schema (if needed)
+CREATE TABLE IF NOT EXISTS public.users (
+  id uuid PRIMARY KEY DEFAULT auth.uid(),
+  email text,
+  created_at timestamptz DEFAULT now(),
+  updated_at timestamptz DEFAULT now()
+);
+
+-- Enable RLS on users table
+ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
+
+-- Create policy for users to read their own data
+CREATE POLICY "Users can read own data" ON public.users
+  FOR SELECT TO authenticated
+  USING (auth.uid() = id);
+
+-- Create policy for service role to insert users
+CREATE POLICY "Service role can insert users" ON public.users
+  FOR INSERT TO service_role
+  WITH CHECK (true);
+
 -- Create user_confirmations table
 CREATE TABLE IF NOT EXISTS user_confirmations (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   user_id uuid NOT NULL,
   token text UNIQUE NOT NULL CHECK (token <> ''),
   created_at timestamptz DEFAULT now(),
   confirmed_at timestamptz,
   expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
 );
 
-ALTER TABLE user_confirmations ADD CONSTRAINT user_confirmations_user_id_fkey 
-  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
+-- Add foreign key constraint to auth.users
+DO $$
+BEGIN
+  IF NOT EXISTS (
+    SELECT 1 FROM information_schema.table_constraints 
+    WHERE constraint_name = 'user_confirmations_user_id_fkey'
+  ) THEN
+    ALTER TABLE user_confirmations ADD CONSTRAINT user_confirmations_user_id_fkey 
+      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
+  END IF;
+END $$;
 
 -- Enable RLS
 ALTER TABLE user_confirmations ENABLE ROW LEVEL SECURITY;
 
 -- Create RLS policy
-CREATE POLICY "Users can read their own confirmation data"
+CREATE POLICY "Users can read their own confirmation data" 
   ON user_confirmations
   FOR SELECT
   TO authenticated
   USING (auth.uid() = user_id);
 
+-- Create policy for service role to manage confirmations
+CREATE POLICY "Service role can manage confirmations" 
+  ON user_confirmations
+  FOR ALL
+  TO service_role
+  USING (true)
+  WITH CHECK (true);
+
 -- Function to generate secure random token
 CREATE OR REPLACE FUNCTION generate_confirmation_token()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 AS $$
 BEGIN
   RETURN encode(gen_random_bytes(32), 'base64url');
 END;
 $$;
 
 -- Function to send welcome email (called by trigger)
 CREATE OR REPLACE FUNCTION send_welcome_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 AS $$
 DECLARE
   confirmation_token text;
   function_url text;
 BEGIN
+  -- Only proceed if this is a new user signup (not an admin creating a user)
+  IF NEW.email_confirmed_at IS NOT NULL THEN
+    RETURN NEW;
+  END IF;
+
+  -- Create user record in public.users table
+  INSERT INTO public.users (id, email, created_at, updated_at)
+  VALUES (NEW.id, NEW.email, NEW.created_at, NEW.updated_at)
+  ON CONFLICT (id) DO UPDATE SET
+    email = EXCLUDED.email,
+    updated_at = EXCLUDED.updated_at;
+
   -- Generate confirmation token
   confirmation_token := generate_confirmation_token();
   
   -- Store confirmation token
   INSERT INTO user_confirmations (user_id, token)
   VALUES (NEW.id, confirmation_token);
   
-  -- Call the welcome email edge function
-  function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/welcome-email';
-  
-  PERFORM net.http_post(
-    url := function_url,
-    headers := jsonb_build_object(
-      'Content-Type', 'application/json',
-      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
-    ),
-    body := jsonb_build_object(
-      'user_id', NEW.id,
-      'email', NEW.email,
-      'confirmation_token', confirmation_token
-    )
-  );
+  -- Try to call the welcome email edge function, but don't fail if it doesn't work
+  BEGIN
+    function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/welcome-email';
+    
+    PERFORM net.http_post(
+      url := function_url,
+      headers := jsonb_build_object(
+        'Content-Type', 'application/json',
+        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
+      ),
+      body := jsonb_build_object(
+        'user_id', NEW.id,
+        'email', NEW.email,
+        'confirmation_token', confirmation_token
+      )
+    );
+  EXCEPTION WHEN OTHERS THEN
+    -- Log the error but don't fail the user creation
+    RAISE WARNING 'Failed to send welcome email for user %: %', NEW.id, SQLERRM;
+  END;
   
   RETURN NEW;
 END;
 $$;
 
 -- Function to confirm user email
 CREATE OR REPLACE FUNCTION confirm_user_email(confirmation_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 AS $$
 DECLARE
   user_record record;
   result jsonb;
 BEGIN
   -- Find the confirmation record
   SELECT uc.user_id, uc.confirmed_at, uc.expires_at, au.email_confirmed_at
   INTO user_record
   FROM user_confirmations uc
   JOIN auth.users au ON au.id = uc.user_id
   WHERE uc.token = confirmation_token;
   
   -- Check if token exists
   IF NOT FOUND THEN
     RETURN jsonb_build_object('success', false, 'message', 'Invalid confirmation token');
   END IF;
   
   -- Check if already confirmed
   IF user_record.confirmed_at IS NOT NULL THEN
     RETURN jsonb_build_object('success', false, 'message', 'Email already confirmed');
   END IF;
   
   -- Check if token expired
   IF user_record.expires_at < now() THEN
     RETURN jsonb_build_object('success', false, 'message', 'Confirmation token has expired');
   END IF;
   
   -- Update confirmation record
   UPDATE user_confirmations 
   SET confirmed_at = now() 
   WHERE token = confirmation_token;
   
   -- Update auth.users email_confirmed_at if not already set
   IF user_record.email_confirmed_at IS NULL THEN
     UPDATE auth.users 
     SET email_confirmed_at = now() 
     WHERE id = user_record.user_id;
   END IF;
   
   RETURN jsonb_build_object('success', true, 'message', 'Email confirmed successfully');
 END;
 $$;
 
--- Create trigger for new user signups
-CREATE OR REPLACE TRIGGER on_auth_user_created
+-- Drop existing trigger if it exists
+DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
+
+-- Create trigger for new user signups (only for unconfirmed users)
+CREATE TRIGGER on_auth_user_created
   AFTER INSERT ON auth.users
   FOR EACH ROW
-  EXECUTE FUNCTION send_welcome_email();