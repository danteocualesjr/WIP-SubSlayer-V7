import React, { useState } from 'react';
import { User, Mail, Calendar, Shield, Award, TrendingUp, DollarSign, CreditCard, Edit2, Camera } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Subscription } from '../../types/subscription';

interface ProfileProps {
  subscriptions: Subscription[];
}

const Profile: React.FC<ProfileProps> = ({ subscriptions }) => {
  const { user, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    displayName: user?.email?.split('@')[0] || '',
    email: user?.email || '',
    bio: 'Subscription management enthusiast',
    location: 'New York, NY',
    website: '',
    joinDate: user?.created_at || new Date().toISOString(),
  });

  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  const totalMonthlySpend = activeSubscriptions.reduce((sum, sub) => {
    return sum + (sub.billingCycle === 'monthly' ? sub.cost : sub.cost / 12);
  }, 0);
  const totalAnnualSpend = totalMonthlySpend * 12;
  const averagePerSubscription = activeSubscriptions.length > 0 ? totalMonthlySpend / activeSubscriptions.length : 0;

  const memberSince = new Date(profile.joinDate).toLocaleDateString('en-US', {
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

  const handleSaveProfile = () => {
    // Here you would typically save to your backend
    console.log('Saving profile:', profile);
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your profile information and view your subscription statistics</p>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-emerald-500 rounded-3xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-6 md:space-y-0">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white font-bold text-3xl">
                {profile.displayName.charAt(0).toUpperCase() || 'U'}
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white text-purple-600 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold mb-2">{profile.displayName}</h2>
              <p className="text-white/90 mb-1">{profile.email}</p>
              <p className="text-white/80 text-sm">Member since {memberSince}</p>
              {profile.location && (
                <p className="text-white/80 text-sm">{profile.location}</p>
              )}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center space-x-2"
            >
              <Edit2 className="w-4 h-4" />
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Profile Form */}
          {isEditing && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profile.displayName}
                    onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={profile.website}
                    onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Subscription Statistics */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Subscription Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4">
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
                        ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'
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
                  <p className="text-sm font-medium text-gray-900">Email</p>
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
                  <p className="text-sm font-medium text-gray-900">Account Type</p>
                  <p className="text-sm text-gray-600">Premium</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;