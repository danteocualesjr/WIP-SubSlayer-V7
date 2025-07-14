import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';
import { PROFILE_STORAGE_PREFIX, DEFAULT_PROFILE_BIO } from '../lib/constants';

interface ProfileData {
  displayName: string;
  email: string;
  bio: string;
  location: string;
  website: string;
  avatar: string | null;
  joinDate: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    displayName: '',
    email: '',
    bio: DEFAULT_PROFILE_BIO,
    location: '',
    website: '',
    avatar: null,
    joinDate: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);

  // Load profile data on mount and when user changes
  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      // Reset profile to defaults when user logs out
      setProfile({
        displayName: '',
        email: '',
        bio: DEFAULT_PROFILE_BIO,
        location: '',
        website: '',
        avatar: null,
        joinDate: new Date().toISOString(),
      });
      setLoading(false);
    }
  }, [user]);

  const loadProfile = () => {
    try {
      setLoading(true);
      setProfile({
        displayName: user?.email?.split('@')[0] || '',
        email: user?.email || '',
        bio: DEFAULT_PROFILE_BIO,
        location: '',
        website: '',
        avatar: null,
        joinDate: user?.created_at || new Date().toISOString(),
      });
      
     // Try to load from local storage
     const storageKey = `${PROFILE_STORAGE_PREFIX}${user?.id}`;
     const savedProfile = localStorage.getItem(storageKey);
     
     if (savedProfile) {
       try {
         const parsedProfile = JSON.parse(savedProfile);
         setProfile(parsedProfile);
       } catch (e) {
         console.warn('Failed to parse profile data:', e);
       }
     } else {
       // Initialize with user data if no saved profile
       const displayName = user?.user_metadata?.full_name || 
                          user?.user_metadata?.name || 
                          user?.email?.split('@')[0] || '';
                          
       const newProfile = {
         displayName: displayName,
         email: user?.email || '',
         bio: DEFAULT_PROFILE_BIO,
         location: '',
         website: '',
         avatar: null,
         joinDate: user?.created_at || new Date().toISOString(),
       };
       
       setProfile(newProfile);
       localStorage.setItem(storageKey, JSON.stringify(newProfile));
     }
      
      // Always set loading to false after a short delay to ensure UI updates
      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading profile:', error);
      // Fallback to user data
      setProfile({
        displayName: user?.email?.split('@')[0] || '',
        email: user?.email || '',
        bio: DEFAULT_PROFILE_BIO,
        location: '',
        website: '',
        avatar: null,
        joinDate: user?.created_at || new Date().toISOString(),
      });
      setLoading(false);
    }
  };
  

  const saveProfile = (profileData: Partial<ProfileData>) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      const updatedProfile = { ...profile, ...profileData };
      setProfile(updatedProfile);
      
     // Save to localStorage
     localStorage.setItem(`${PROFILE_STORAGE_PREFIX}${user.id}`, JSON.stringify(updatedProfile));
      
      return { success: true };
    } catch (error) {
      console.error('Error saving profile:', error);
      return { success: false, error: 'Failed to save profile' };
    }
  };

  return {
    profile,
    loading,
    saveProfile,
    refetch: loadProfile,
  };
}