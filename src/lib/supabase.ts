import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are available
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

let supabase: any = null;

if (isSupabaseConfigured) {
  try {
    // Validate URL format
    new URL(supabaseUrl);
    
    // Create Supabase client
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

    // Add error handling for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      } else if (event === 'SIGNED_OUT') {
        // Clear any corrupted session data
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.removeItem('supabase.auth.token');
      }
    });

  } catch (error) {
    console.warn('Failed to create Supabase client:', error);
    supabase = null;
  }
} else {
  console.warn('Supabase environment variables not configured. Running in demo mode.');
}

// Export a safe supabase client that won't throw errors
export { supabase };

// Export a function to check if Supabase is properly configured
export const isSupabaseReady = () => {
  return supabase !== null && isSupabaseConfigured;
};

// Helper function to clear corrupted auth data
export const clearAuthData = () => {
  try {
    // Clear all possible auth-related storage keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('supabase')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Also clear session storage
    const sessionKeysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.includes('supabase')) {
        sessionKeysToRemove.push(key);
      }
    }
    sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
    
    console.log('Cleared corrupted auth data');
  } catch (error) {
    console.warn('Failed to clear auth data:', error);
  }
};

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