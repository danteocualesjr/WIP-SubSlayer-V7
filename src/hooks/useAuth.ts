import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, clearAuthData } from '../lib/supabase';
import { PROFILE_STORAGE_PREFIX } from '../lib/constants';

export function useAuth() {
  
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const signInWithGoogle = async () => {
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`
        }
      });
      
      return { data, error };
      
    } catch (error) {
      console.error('Google sign in error:', error);
      return { data: null, error };
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session with error handling
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('Session error:', error);
          // If there's an error getting the session, clear corrupted data
          if (error.message?.includes('refresh_token_not_found') || 
              error.message?.includes('Invalid Refresh Token')) {
            clearAuthData();
            // Force a clean navigation to root instead of reload
            window.location.href = '/';
            return;
          }
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          // Clear potentially corrupted data and reset state
          clearAuthData();
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes with error handling
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', event);

      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      } else if (event === 'SIGNED_OUT') {
        clearAuthData();
        window.location.href = '/';
      }

      try {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (error) {
        console.error('Auth state change error:', error);
        clearAuthData();
        setSession(null);
        setUser(null);
        setLoading(false);
        window.location.href = '/';
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}`,
          data: {
            email: email,
          }
        }
      });
      return { data, error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      // Always clear auth data regardless of error to ensure clean state
      clearAuthData();
      return { error };
    } catch (error) {
      console.error('Sign out error:', error);
      clearAuthData();
      return { error };
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };
}