import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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