import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

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
      // Reset profile when user logs out
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
      const savedProfile = localStorage.getItem(`profile_${user?.id}`);
      
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
      } else {
        // Initialize with user data if no saved profile
        setProfile({
          displayName: user?.email?.split('@')[0] || '',
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
      const updatedProfile = { ...profile, ...profileData };
      setProfile(updatedProfile);
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