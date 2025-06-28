import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced error checking for environment variables
if (!supabaseUrl) {
  console.error('VITE_SUPABASE_URL is not defined in environment variables');
  throw new Error('Missing VITE_SUPABASE_URL environment variable. Please check your .env file.');
}

if (!supabaseAnonKey) {
  console.error('VITE_SUPABASE_ANON_KEY is not defined in environment variables');
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable. Please check your .env file.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch {
  console.error('Invalid VITE_SUPABASE_URL format:', supabaseUrl);
  throw new Error('Invalid VITE_SUPABASE_URL format. Please check your .env file.');
}

// Create Supabase client with error handling
let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
} catch (error) {
  console.error('Failed to create Supabase client:', error);
  throw new Error('Failed to initialize Supabase client. Please check your configuration.');
}

export { supabase };

export type Database = {
  public: {
    Tables: {
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          cost: number;
          currency: string;
          billing_cycle: 'monthly' | 'annual';
          next_billing: string;
          category: string | null;
          status: 'active' | 'paused' | 'cancelled';
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          cost: number;
          currency?: string;
          billing_cycle: 'monthly' | 'annual';
          next_billing: string;
          category?: string | null;
          status?: 'active' | 'paused' | 'cancelled';
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          cost?: number;
          currency?: string;
          billing_cycle?: 'monthly' | 'annual';
          next_billing?: string;
          category?: string | null;
          status?: 'active' | 'paused' | 'cancelled';
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};