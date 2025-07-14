/*
  # Fix Database Errors

  1. Database Schema Updates
    - Add unique constraint to user_profiles.user_id for upsert operations
    - Create stripe_customers table for Stripe integration
    - Create stripe_subscriptions table for subscription data
    - Create stripe_user_subscriptions view for consolidated subscription info

  2. Security
    - Enable RLS on all new tables
    - Add appropriate policies for authenticated users
    - Grant necessary permissions on views

  3. Notes
    - This migration fixes the "no unique constraint" error for user profiles
    - Creates the missing stripe_user_subscriptions relation
    - Sets up proper Stripe integration tables
*/

-- Fix user_profiles table to support upsert operations
ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id);

-- Create stripe_customers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.stripe_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id text UNIQUE NOT NULL,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on stripe_customers
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;

-- Create policy for stripe_customers
CREATE POLICY "Users can view their own stripe customer data"
  ON public.stripe_customers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create stripe_subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.stripe_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id text NOT NULL,
  subscription_id text UNIQUE NOT NULL,
  status text NOT NULL,
  price_id text,
  current_period_start bigint,
  current_period_end bigint,
  cancel_at_period_end boolean DEFAULT false,
  payment_method_brand text,
  payment_method_last4 text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  FOREIGN KEY (customer_id) REFERENCES public.stripe_customers(customer_id) ON DELETE CASCADE
);

-- Enable RLS on stripe_subscriptions
ALTER TABLE public.stripe_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy for stripe_subscriptions
CREATE POLICY "Users can view their own stripe subscription data"
  ON public.stripe_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id FROM public.stripe_customers WHERE user_id = auth.uid()
    )
  );

-- Create the stripe_user_subscriptions view
CREATE OR REPLACE VIEW public.stripe_user_subscriptions AS
SELECT
  sc.user_id,
  sc.customer_id,
  ss.subscription_id,
  ss.status AS subscription_status,
  ss.price_id,
  ss.current_period_start,
  ss.current_period_end,
  ss.cancel_at_period_end,
  ss.payment_method_brand,
  ss.payment_method_last4,
  ss.created_at,
  ss.updated_at
FROM
  public.stripe_customers sc
LEFT JOIN
  public.stripe_subscriptions ss ON sc.customer_id = ss.customer_id
WHERE
  sc.user_id = auth.uid();

-- Grant SELECT permission on the view to authenticated users
GRANT SELECT ON public.stripe_user_subscriptions TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON public.stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_customer_id ON public.stripe_customers(customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_customer_id ON public.stripe_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_subscription_id ON public.stripe_subscriptions(subscription_id);