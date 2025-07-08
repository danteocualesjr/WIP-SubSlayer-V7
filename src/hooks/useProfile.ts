import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';
import { PROFILE_STORAGE_PREFIX } from '../lib/constants';

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
    bio: 'Subscription management enthusiast',
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
        bio: 'Subscription management enthusiast',
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
      
      // First try to load from Supabase
      fetchProfileFromSupabase().then(supabaseProfile => {
        if (supabaseProfile) {
          setProfile(supabaseProfile);
          
          // Also update local storage for backup
          localStorage.setItem(`${PROFILE_STORAGE_PREFIX}${user?.id}`, JSON.stringify(supabaseProfile));
          return;
        }
      
        // If no Supabase profile, try local storage
        const storageKeys = [
          `${PROFILE_STORAGE_PREFIX}${user?.id}`,
          `profile_${user?.id}`,
          `profile_${user?.email}`,
        ];
        
        let savedProfile = null;
        
        // Try each storage key until we find a valid profile
        for (const key of storageKeys) {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const parsed = JSON.parse(data);
              if (parsed && typeof parsed === 'object') {
                savedProfile = data;
                console.log(`Found profile data using key: ${key}`);
                break;
              }
            } catch (e) {
              console.warn(`Failed to parse profile data for key ${key}:`, e);
            }
          }
        }
        
        if (savedProfile) {
          const parsedProfile = JSON.parse(savedProfile);
          setProfile(parsedProfile);
          
          // Save to Supabase for persistence
          saveProfileToSupabase(parsedProfile);
          
          // Migrate to the new storage key format if needed
          if (!localStorage.getItem(`${PROFILE_STORAGE_PREFIX}${user?.id}`)) {
            localStorage.setItem(`${PROFILE_STORAGE_PREFIX}${user?.id}`, savedProfile);
            console.log('Migrated profile data to new storage key format');
          }
        } else {
          // Initialize with user data if no saved profile
          const displayName = user?.user_metadata?.full_name || 
                             user?.user_metadata?.name || 
                             user?.email?.split('@')[0] || '';
                             
          const newProfile = {
            displayName: displayName,
            email: user?.email || '',
            bio: 'Subscription management enthusiast',
            location: '',
            website: '',
            avatar: null,
            joinDate: user?.created_at || new Date().toISOString(),
          };
          
          setProfile(newProfile);
          
          // Save the new profile to Supabase
          saveProfileToSupabase(newProfile);
        }
        
        setLoading(false);
      }).catch(error => {
        console.error('Error in profile loading process:', error);
        setLoading(false);
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      // Fallback to user data
      setProfile({
        displayName: user?.email?.split('@')[0] || '',
        email: user?.email || '',
        bio: 'Subscription management enthusiast',
        location: '',
        website: '',
        avatar: null,
        joinDate: user?.created_at || new Date().toISOString(),
      });
      setLoading(false);
    }
  };
  
  const fetchProfileFromSupabase = async (): Promise<ProfileData | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.warn('Error fetching profile from Supabase:', error);
        return null;
      }
      
      if (!data) return null;
      
      return {
        displayName: data.display_name || '',
        email: user.email || '',
        bio: data.bio || 'Subscription management enthusiast',
        location: data.location || '',
        website: data.website || '',
        avatar: data.avatar_url || null,
        joinDate: data.created_at || user?.created_at || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching profile from Supabase:', error);
      return null;
    }
  };
  
  const saveProfileToSupabase = async (profileData: ProfileData) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          display_name: profileData.displayName,
          bio: profileData.bio,
          location: profileData.location,
          website: profileData.website,
          avatar_url: profileData.avatar,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });
      
      if (error) {
        console.error('Error saving profile to Supabase:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } finally {
    }
  };

  const saveProfile = (profileData: Partial<ProfileData>) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const updatedProfile = { ...profile, ...profileData };
      setProfile(updatedProfile);
      
      // Save to local storage as backup
      localStorage.setItem(`${PROFILE_STORAGE_PREFIX}${user.id}`, JSON.stringify(updatedProfile));
      
      // Also update the old storage key for backward compatibility
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedProfile));
      
      // Save to Supabase for persistence
      saveProfileToSupabase(updatedProfile);
      
      return { success: true };
    } catch (error) {
      console.error('Error saving profile:', error);
      return { success: false, error: 'Failed to save profile' };
    }
  };

  const updateAvatar = (avatarData: string) => {
    if (!user) return;

    try {
      const updatedProfile = { ...profile, avatar: avatarData };
      setProfile(updatedProfile);
      
      // Save to local storage
      localStorage.setItem(`${PROFILE_STORAGE_PREFIX}${user.id}`, JSON.stringify(updatedProfile));
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedProfile));
      
      // Save to Supabase
      saveProfileToSupabase(updatedProfile);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating avatar:', error);
      return { success: false, error: 'Failed to update avatar' };
    }
  };

  return {
    profile,
    loading,
    saveProfile,
    updateAvatar,
    refetch: loadProfile,
  };
}