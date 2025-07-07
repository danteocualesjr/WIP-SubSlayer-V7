import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

// Define a storage key prefix for profile data
const PROFILE_STORAGE_KEY_PREFIX = 'subslayer_profile_';

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
      
      // Try multiple storage keys to handle potential migration issues
      const storageKeys = [
        `${PROFILE_STORAGE_KEY_PREFIX}${user?.id}`,
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
        
        // Migrate to the new storage key format if needed
        if (!localStorage.getItem(`${PROFILE_STORAGE_KEY_PREFIX}${user?.id}`)) {
          localStorage.setItem(`${PROFILE_STORAGE_KEY_PREFIX}${user?.id}`, savedProfile);
          console.log('Migrated profile data to new storage key format');
        }
      } else {
        // Initialize with user data if no saved profile
        const displayName = user?.user_metadata?.full_name || 
                           user?.user_metadata?.name || 
                           user?.email?.split('@')[0] || '';
                           
        setProfile({
          displayName: displayName,
          email: user?.email || '',
          bio: 'Subscription management enthusiast',
          location: '',
          website: '',
          avatar: null,
          joinDate: user?.created_at || new Date().toISOString(),
        });
      }
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
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = (profileData: Partial<ProfileData>) => {
    if (!user) return;

    try {
      // Use the new storage key format
      const updatedProfile = { ...profile, ...profileData };
      setProfile(updatedProfile);
      localStorage.setItem(`${PROFILE_STORAGE_KEY_PREFIX}${user.id}`, JSON.stringify(updatedProfile));
      
      // Also update the old storage key for backward compatibility
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedProfile));
      
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
      localStorage.setItem(`${PROFILE_STORAGE_KEY_PREFIX}${user.id}`, JSON.stringify(updatedProfile));
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedProfile));
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