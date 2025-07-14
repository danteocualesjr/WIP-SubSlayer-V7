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
      setProfile({
        displayName: user?.email?.split('@')[0] || '',
        email: user?.email || '',
        bio: 'Subscription management enthusiast',
        location: '',
        website: '',
        avatar: null,
        joinDate: user?.created_at || new Date().toISOString(),
      });
      
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
        
      }).catch(error => {
        console.error('Error in profile loading process:', error);
      });
      
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
        .maybeSingle();
      
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
    
    // Compress avatar data if it's a base64 string
    let avatarUrl = profileData.avatar;
    
    // If avatar is a large base64 string, we should upload it to Supabase storage
    if (typeof avatarUrl === 'string' && avatarUrl.startsWith('data:image')) {
      try {
        // Extract file type and data
        const matches = avatarUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        
        if (!matches || matches.length !== 3) {
          throw new Error('Invalid image data');
        }
        
        const contentType = matches[1];
        const base64Data = matches[2];
        const extension = contentType.split('/')[1] || 'png';
        
        // Convert base64 to blob
        const byteCharacters = atob(base64Data);
        const byteArrays = [];
        
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
          const slice = byteCharacters.slice(offset, offset + 512);
          
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        
        const blob = new Blob(byteArrays, { type: contentType });
        
        // Upload to Supabase Storage
        const fileName = `avatar-${user.id}-${Date.now()}.${extension}`;
        const filePath = `avatars/${fileName}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(filePath, blob, {
            contentType,
            upsert: true
          });
        
        if (uploadError) {
          console.error('Error uploading avatar to storage:', uploadError);
          // Continue with profile update but without the avatar
          avatarUrl = null;
        } else {
          // Get public URL for the uploaded file
          const { data: { publicUrl } } = supabase.storage
            .from('profiles')
            .getPublicUrl(filePath);
            
          avatarUrl = publicUrl;
        }
      } catch (error) {
        console.error('Error processing avatar for upload:', error);
        // Continue with profile update but without the avatar
        avatarUrl = null;
      }
    }
    
    try {
     // First check if the user profile already exists
     const { data: existingProfile, error: checkError } = await supabase
       .from('user_profiles')
       .select('id')
       .eq('user_id', user.id)
       .maybeSingle();
       
     if (checkError) {
       console.error('Error checking existing profile:', checkError);
       return { success: false, error: checkError.message };
     }
     
     // Prepare the profile data
     const profileRecord = {
       user_id: user.id,
       display_name: profileData.displayName,
       bio: profileData.bio,
       location: profileData.location,
       website: profileData.website,
       avatar_url: avatarUrl,
       updated_at: new Date().toISOString(),
     };
     
     let error;
     
     if (existingProfile) {
       // Update existing profile
       const { error: updateError } = await supabase
         .from('user_profiles')
         .update(profileRecord)
         .eq('user_id', user.id);
       
       error = updateError;
     } else {
       // Insert new profile
       const { error: insertError } = await supabase
         .from('user_profiles')
         .insert(profileRecord);
       
       error = insertError;
     }
     
     if (error) {
       console.error('Error saving profile to Supabase:', error);
       return { success: false, error: error.message };
     }
     
     return { success: true };
   } catch (error) {
     console.error('Error in saveProfileToSupabase:', error);
     return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
   }
 };

 const saveProfileToSupabaseOld = async (profileData: ProfileData) => {
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

    // Check if avatar data is too large for localStorage
    const avatarData = profileData.avatar;
    let avatarUrl = null;
    
    // If avatar is a base64 string, it's likely too large for localStorage
    if (typeof avatarData === 'string' && avatarData.startsWith('data:image')) {
      // Store only a reference to the avatar, not the full data
      avatarUrl = avatarData;
      profileData.avatar = null; // Don't store the full image data in localStorage
    }

    try {
      const updatedProfile = { ...profile, ...profileData };
      setProfile(updatedProfile);
      
      try {
        // Save minimal profile data to localStorage (without large avatar)
        const storageProfile = { ...updatedProfile, avatar: null };
        localStorage.setItem(`${PROFILE_STORAGE_PREFIX}${user.id}`, JSON.stringify(storageProfile));
      } catch (storageError) {
        console.warn('Failed to save profile to localStorage:', storageError);
        // Continue execution - localStorage is just a backup
      }
      
      // Save to Supabase for persistence
      // Use a timeout to ensure UI updates first, then handle the async operation
      setTimeout(() => {
        // If we have an avatar URL, restore it for Supabase storage
        const supabaseProfile = { ...updatedProfile };
        if (avatarUrl) {
          supabaseProfile.avatar = avatarUrl;
        }
        
        saveProfileToSupabase(supabaseProfile)
          .then(result => {
            if (!result.success) {
              console.error('Error saving profile to Supabase:', result.error);
            }
          })
          .catch(err => {
            console.error('Unexpected error in saveProfileToSupabase:', err);
          });
      }, 0);
      
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
      // Use a timeout to ensure UI updates first, then handle the async operation
      setTimeout(() => {
        saveProfileToSupabase(updatedProfile)
          .then(result => {
            if (!result.success) {
              console.error('Error saving avatar to Supabase:', result.error);
            }
          })
          .catch(err => {
            console.error('Unexpected error in saveProfileToSupabase:', err);
          });
      }, 0);
      
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