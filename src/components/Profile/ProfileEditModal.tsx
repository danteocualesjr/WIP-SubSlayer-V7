import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Upload, User, Mail, MapPin, Globe, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profileData: any) => void;
  currentProfile: {
    displayName: string;
    email: string;
    bio: string;
    location: string;
    website: string;
    avatar: string | null;
  };
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentProfile
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    avatar: null as File | null,
    avatarPreview: null as string | null,
  });

  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Initialize form data when modal opens or currentProfile changes
  useEffect(() => {
    if (isOpen && currentProfile) {
      setProfileData({
        displayName: currentProfile.displayName || '',
        email: currentProfile.email || '',
        bio: currentProfile.bio || '',
        location: currentProfile.location || '',
        website: currentProfile.website || '',
        avatar: null,
        avatarPreview: currentProfile.avatar || null,
      });
      setUploadError(null);
    }
  }, [isOpen, currentProfile]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setUploadError(null);

    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please select a valid image file (JPG, PNG, GIF, WebP, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setUploadError('File size must be less than 10MB');
      return;
    }

    // Clean up previous preview URL if it exists
    if (profileData.avatarPreview && profileData.avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(profileData.avatarPreview);
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    
    setProfileData(prev => ({
      ...prev,
      avatar: file,
      avatarPreview: previewUrl
    }));

    // Clear the input value so the same file can be selected again if needed
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleUploadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setUploadError(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploadError(null);

    try {
      let avatarUrl = profileData.avatarPreview;

      // Upload file to Supabase Storage if a new file was selected
      if (profileData.avatar instanceof File) {
        const fileExt = profileData.avatar.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { data, error } = await supabase.storage
          .from('profiles')
          .upload(filePath, profileData.avatar);

        if (error) {
          console.error('Error uploading avatar:', error);
          setUploadError('Failed to upload image. Please try again.');
          setLoading(false);
          return;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('profiles')
          .getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      // Prepare data for saving
      const dataToSave = {
        displayName: profileData.displayName,
        email: profileData.email,
        bio: profileData.bio,
        location: profileData.location,
        website: profileData.website,
        avatar: avatarUrl
      };

      onSave(dataToSave);
      setTimeout(() => {
        onClose();

        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[10000] flex items-center space-x-2';
        successMessage.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>Profile updated successfully!</span>
        `;
        document.body.appendChild(successMessage);
        
        setTimeout(() => {
          if (document.body.contains(successMessage)) {
            document.body.removeChild(successMessage);
          }
        }, 3000);
      }, 500);
    } catch (error) {
      console.error('Error saving profile:', error);
      setUploadError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOld = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploadError(null);
    
    try {
      let avatarData = profileData.avatarPreview;
      
      // Convert file to base64 if a new file was selected
      if (profileData.avatar) {
        try {
          avatarData = await convertFileToBase64(profileData.avatar);
        } catch (error) {
          setUploadError('Failed to process image. Please try again.');
          setLoading(false);
          return;
        }
      }
      
      // Prepare data for saving
      const dataToSave = {
        displayName: profileData.displayName,
        email: profileData.email,
        bio: profileData.bio,
        location: profileData.location,
        website: profileData.website,
        avatarPreview: avatarData
      };
      
      onSave(dataToSave);
      onClose();
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[10000] flex items-center space-x-2';
      successMessage.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Profile updated successfully!</span>
      `;
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      setUploadError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleRemovePhoto = () => {
    // Clean up preview URL if it exists
    if (profileData.avatarPreview && profileData.avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(profileData.avatarPreview);
    }
    
    setProfileData(prev => ({
      ...prev,
      avatar: null,
      avatarPreview: null
    }));
    setUploadError(null);
  };

  // Clean up object URLs when component unmounts or modal closes
  useEffect(() => {
    return () => {
      if (profileData.avatarPreview && profileData.avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(profileData.avatarPreview);
      }
    };
  }, [profileData.avatarPreview]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center border-4 border-white shadow-lg">
                {profileData.avatarPreview ? (
                  <img 
                    src={profileData.avatarPreview} 
                    alt="Profile Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-2xl">
                    {(profileData.displayName?.charAt(0) || 'U').toUpperCase()}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleUploadClick}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors shadow-lg border-2 border-white"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              multiple={false}
            />
            
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-3">
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload new photo</span>
                </button>
                
                {profileData.avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-red-600 hover:text-red-700 font-medium text-sm px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <p className="text-xs text-gray-500 mb-1">
                JPG, PNG, GIF or WebP. Max size 5MB.
              </p>
              
              {uploadError && (
                <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  {uploadError}
                </p>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Display Name *
              </label>
              <input
                type="text"
                value={profileData.displayName}
                onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your display name"
                required
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address *
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Location
              </label>
              <input
                type="text"
                value={profileData.location}
                onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="City, Country"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4 inline mr-2" />
                Website
              </label>
              <input
                type="url"
                value={profileData.website}
                onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={profileData.bio}
              onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Tell us about yourself..."
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG, GIF or WebP. Max size 10MB.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !!uploadError}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;