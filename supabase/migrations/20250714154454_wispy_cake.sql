```sql
-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Ensure the user_profiles table exists and has the correct schema
-- This script is designed to be idempotent.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
        -- Create the user_profiles table if it does not exist
        CREATE TABLE public.user_profiles (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
            display_name text,
            email text,
            bio text,
            location text,
            website text,
            avatar_url text,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );

        -- Add RLS policies for user_profiles
        ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can insert their own profile"
        ON public.user_profiles FOR INSERT TO authenticated
        WITH CHECK (uid() = user_id);

        CREATE POLICY "Users can update their own profile"
        ON public.user_profiles FOR UPDATE TO authenticated
        USING (uid() = user_id)
        WITH CHECK (uid() = user_id);

        CREATE POLICY "Users can view their own profile"
        ON public.user_profiles FOR SELECT TO authenticated
        USING (uid() = user_id);

        -- Create a trigger to update the updated_at column
        CREATE OR REPLACE FUNCTION public.update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER update_user_profiles_updated_at
        BEFORE UPDATE ON public.user_profiles
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();

    ELSE
        -- If the table exists, ensure the 'id' column has the correct default
        -- Check if the default is already gen_random_uuid()
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'user_profiles'
            AND column_name = 'id'
            AND column_default = 'gen_random_uuid()'
        ) THEN
            -- If not, alter the column to set the default
            ALTER TABLE public.user_profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();
        END IF;

        -- Ensure user_id column is correctly set up
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'user_profiles'
            AND column_name = 'user_id'
            AND data_type = 'uuid'
            AND is_nullable = 'NO'
        ) THEN
            -- Add or alter user_id column if it's not correctly defined
            -- This might require dropping and re-adding if data types are incompatible,
            -- but for a simple fix, we assume it exists and might just need NOT NULL or type check.
            -- For now, assuming it's a simple default fix.
            ALTER TABLE public.user_profiles ALTER COLUMN user_id SET NOT NULL;
            -- Add foreign key constraint if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_profiles_user_id_fkey') THEN
                ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
            END IF;
        END IF;

        -- Ensure email column exists
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'user_profiles'
            AND column_name = 'email'
        ) THEN
            ALTER TABLE public.user_profiles ADD COLUMN email text;
        END IF;

        -- Ensure created_at column exists and has default
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'user_profiles'
            AND column_name = 'created_at'
        ) THEN
            ALTER TABLE public.user_profiles ADD COLUMN created_at timestamp with time zone DEFAULT now();
        END IF;

        -- Ensure updated_at column exists and has default
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'user_profiles'
            AND column_name = 'updated_at'
        ) THEN
            ALTER TABLE public.user_profiles ADD COLUMN updated_at timestamp with time zone DEFAULT now();
        END IF;

        -- Ensure RLS is enabled
        IF (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.user_profiles'::regclass) IS FALSE THEN
            ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
        END IF;

        -- Re-create RLS policies to ensure they are correct and exist
        DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
        CREATE POLICY "Users can insert their own profile"
        ON public.user_profiles FOR INSERT TO authenticated
        WITH CHECK (uid() = user_id);

        DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
        CREATE POLICY "Users can update their own profile"
        ON public.user_profiles FOR UPDATE TO authenticated
        USING (uid() = user_id)
        WITH CHECK (uid() = user_id);

        DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
        CREATE POLICY "Users can view their own profile"
        ON public.user_profiles FOR SELECT TO authenticated
        USING (uid() = user_id);

        -- Re-create update_updated_at_column function and trigger to ensure they are correct
        DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
        DROP FUNCTION IF EXISTS public.update_updated_at_column();

        CREATE OR REPLACE FUNCTION public.update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER update_user_profiles_updated_at
        BEFORE UPDATE ON public.user_profiles
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();

    END IF;
END
$$;

-- Ensure handle_new_user function exists and is correct
-- This function is typically triggered by auth.users inserts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, NEW.email); -- Default display_name to email for new users
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger on auth.users exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
```