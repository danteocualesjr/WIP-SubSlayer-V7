import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Shield, Award, TrendingUp, DollarSign, CreditCard, Edit2, Camera, MapPin, Globe, Sparkles } from 'lucide-react';
import { SparklesCore } from '../ui/sparkles';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { Subscription } from '../../types/subscription';
import ProfileEditModal from './ProfileEditModal';

interface ProfileProps {
  subscriptions: Subscription[];
}

const Profile: React.FC<ProfileProps> = ({ subscriptions }) => {
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading, saveProfile, refetch } = useProfile();
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Force profile reload when component mounts
  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user, refetch]);

  // Listen for navigation event from header
  useEffect(() => {
    const handleNavigateToProfile = () => {
      setShowEditModal(true);
    };

    window.addEventListener('navigateToProfile', handleNavigateToProfile);
    
    return () => {
      window.removeEventListener('navigateToProfile', handleNavigateToProfile);
    };
  }, []);

  // Force profile reload when component mounts
  useEffect(() => {
    if (user && !profileLoaded) {
      // Add a delay to ensure auth is fully initialized
      const timer = setTimeout(() => {
        console.log('Forcing profile reload');
        setProfileLoaded(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [user, profileLoaded]);

  // Show loading spinner while checking auth and loading profile
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }
  
  // Ensure we have a valid profile object with required properties
  const safeProfile = {
    displayName: profile?.displayName || user?.email?.split('@')[0] || 'User',
    email: profile?.email || user?.email || '',
    bio: profile?.bio || 'Subscription management enthusiast',
    joinDate: profile?.joinDate || new Date().toISOString()
  };

  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  const totalMonthlySpend = activeSubscriptions.reduce((sum, sub) => {
    return sum + (sub.billingCycle === 'monthly' ? sub.cost : sub.cost / 12);
  }, 0);
  const totalAnnualSpend = totalMonthlySpend * 12;
  const averagePerSubscription = activeSubscriptions.length > 0 ? totalMonthlySpend / activeSubscriptions.length : 0;

  const memberSince = new Date(safeProfile.joinDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });

  const achievements = [
    {
      id: 1,
      title: 'First Subscription',
      description: 'Added your first subscription',
      icon: CreditCard,
      earned: subscriptions.length > 0,
      date: subscriptions.length > 0 ? subscriptions[0]?.createdAt : null,
    },
    {
      id: 2,
      title: 'Budget Tracker',
      description: 'Track 5+ subscriptions',
      icon: TrendingUp,
      earned: subscriptions.length >= 5,
      date: subscriptions.length >= 5 ? subscriptions[4]?.createdAt : null,
    },
    {
      id: 3,
      title: 'Money Saver',
      description: 'Paused or cancelled a subscription',
      icon: DollarSign,
      earned: subscriptions.some(sub => sub.status === 'paused' || sub.status === 'cancelled'),
      date: subscriptions.find(sub => sub.status === 'paused' || sub.status === 'cancelled')?.createdAt,
    },
    {
      id: 4,
      title: 'Power User',
      description: 'Track 10+ subscriptions',
      icon: Award,
      earned: subscriptions.length >= 10,
      date: subscriptions.length >= 10 ? subscriptions[9]?.createdAt : null,
    },
  ];

  const earnedAchievements = achievements.filter(a => a.earned);

  const handleSaveProfile = (profileData: any) => {
    const result = saveProfile({
      displayName: profileData.displayName,
      email: profileData.email,
      bio: profileData.bio,
      location: profileData.location,
      website: profileData.website,
      avatar: profileData.avatarPreview || profile.avatar,
    });

    if (result.success) {
      console.log('Profile saved successfully');
    } else {
      console.error('Failed to save profile:', result.error);
      alert('Failed to save profile. Please try again.');
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Hero Section with Sparkles */}
      <div className="relative bg-gradient-to-br from-purple-900 via-violet-800 to-purple-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white overflow-hidden">
        {/* Sparkles Background */}
        <div className="absolute inset-0 w-full h-full">
          <SparklesCore
            id="profile-sparkles"
            background="transparent"
            minSize={0.4}
            maxSize={1.4}
            particleDensity={90}
            className="w-full h-full"
            particleColor="#ffffff"
            speed={0.8}
          />
        </div>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 opacity-25">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/30 to-violet-400/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-violet-400/30 to-purple-400/30 rounded-full blur-3xl"></div>
        </div>

        {/* Radial gradient to prevent sharp edges */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-900/50 via-violet-800/50 to-purple-700/50 [mask-image:radial-gradient(800px_400px_at_center,transparent_20%,white)]"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-6 md:space-y-0">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white font-bold text-3xl overflow-hidden">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar || ''} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (profile.displayName ? profile.displayName.charAt(0).toUpperCase() : 'U')
                  )}
                </div>
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-white text-purple-600 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold mb-2">{safeProfile.displayName}</h2>
                <p className="text-white/90 mb-1 flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{safeProfile.email}</span>
                </p>
                <p className="text-white/80 text-sm flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {memberSince || 'recently'}</span>
                </p>
                {profile.location && (
                  <p className="text-white/80 text-sm flex items-center space-x-2 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </p>
                )}
                {profile.website && (
                  <p className="text-white/80 text-sm flex items-center space-x-2 mt-1">
                    <Globe className="w-4 h-4" />
                    <a 
                      href={profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                    >
                      {profile.website}
                    </a>
                  </p>
                )}
                {profile.bio && (
                  <p className="text-white/90 text-sm mt-2 max-w-md">{profile.bio || safeProfile.bio}</p>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center space-x-2"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={handleSignOut}
                className="px-6 py-3 bg-red-500/20 backdrop-blur-sm text-white rounded-xl hover:bg-red-500/30 transition-all duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subscription Statistics */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Subscription Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <h4 className="font-medium text-gray-900">Total Subscriptions</h4>
                </div>
                <p className="text-2xl font-bold text-purple-600">{subscriptions.length}</p>
                <p className="text-sm text-gray-600">{activeSubscriptions.length} active</p>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-medium text-gray-900">Monthly Spending</h4>
                </div>
                <p className="text-2xl font-bold text-emerald-600">${totalMonthlySpend.toFixed(2)}</p>
                <p className="text-sm text-gray-600">${totalAnnualSpend.toFixed(2)} annually</p>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  <h4 className="font-medium text-gray-900">Average Cost</h4>
                </div>
                <p className="text-2xl font-bold text-orange-600">${averagePerSubscription.toFixed(2)}</p>
                <p className="text-sm text-gray-600">per subscription</p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-gray-900">Achievements</h4>
                </div>
                <p className="text-2xl font-bold text-blue-600">{earnedAchievements.length}</p>
                <p className="text-sm text-gray-600">of {achievements.length} earned</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {subscriptions.slice(0, 5).map((subscription) => (
                <div key={subscription.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-xs"
                    style={{ backgroundColor: subscription.color || '#8B5CF6' }}
                  >
                    {subscription.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Added {subscription.name}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(subscription.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    ${subscription.cost.toFixed(2)}
                  </span>
                </div>
              ))}
              {subscriptions.length === 0 && (
                <p className="text-gray-500 text-center py-4">No activity yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Achievements Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
            <div className="space-y-4">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-xl border transition-all duration-200 ${
                      achievement.earned
                        ? 'bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        achievement.earned ? 'bg-purple-600 text-white' : 'bg-gray-400 text-white'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className={`font-medium ${
                        achievement.earned ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {achievement.title}
                      </h4>
                    </div>
                    <p className={`text-sm ${
                      achievement.earned ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {achievement.description}
                    </p>
                    {achievement.earned && achievement.date && (
                      <p className="text-xs text-purple-600 mt-1">
                        Earned {new Date(achievement.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email Address</p>
                  <p className="text-sm text-gray-600">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Member Since</p>
                  <p className="text-sm text-gray-600">{memberSince}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Plan Type</p>
                  <p className="text-sm text-gray-600">Pro</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveProfile}
        currentProfile={profile}
      />
    </div>
  );
};

export default Profile;