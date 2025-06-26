import React, { useState, useEffect } from 'react';
import { Bell, User, Search, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Listen for sidebar toggle events
  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.isCollapsed);
    };

    // Get initial state
    const saved = localStorage.getItem('sidebar-collapsed');
    setSidebarCollapsed(saved ? JSON.parse(saved) : false);

    window.addEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    
    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  // Mock notifications data
  const notifications = [
    {
      id: '1',
      title: 'Netflix renewal in 2 days',
      message: 'Your Netflix subscription will renew on June 28th for $15.99',
      time: '2 hours ago',
      read: false,
      urgent: true,
    },
    {
      id: '2',
      title: 'Spotify payment processed',
      message: 'Your monthly Spotify payment of $9.99 was processed successfully',
      time: '1 day ago',
      read: false,
      urgent: false,
    },
    {
      id: '3',
      title: 'Weekly spending summary',
      message: 'You spent $45.99 on subscriptions this week',
      time: '3 days ago',
      read: true,
      urgent: false,
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className={`bg-white/80 backdrop-blur-2xl border-b border-purple-200/50 sticky top-0 z-30 shadow-sm transition-all duration-300 ${
      sidebarCollapsed ? 'ml-20' : 'ml-64'
    }`}>
      <div className="px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Search Bar */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search subscriptions..."
                className="w-full pl-12 pr-4 py-3 bg-gradient-to-r from-purple-50/50 to-blue-50/50 border border-purple-200/50 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-purple-400"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-2xl transition-all duration-300 relative group"
              >
                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-lg animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-14 bg-white/95 backdrop-blur-xl border border-purple-200/50 rounded-2xl shadow-2xl py-3 z-50 w-80">
                  <div className="px-6 py-4 border-b border-purple-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span>Notifications</span>
                      </h3>
                      {unreadCount > 0 && (
                        <span className="text-xs bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-6 py-8 text-center text-gray-500">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-6 py-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 border-b border-purple-50 last:border-b-0 transition-all duration-300 ${
                            !notification.read ? 'bg-gradient-to-r from-purple-50/50 to-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              !notification.read ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gray-300'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className={`text-sm font-medium ${
                                  !notification.read ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                  {notification.title}
                                </h4>
                                {notification.urgent && (
                                  <span className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="px-6 py-4 border-t border-purple-100">
                    <button className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="flex items-center space-x-4 pl-4 border-l border-purple-200/50">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {profile.displayName || user?.email?.split('@')[0] || 'User'}
                </p>
                <div className="flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  <p className="text-xs text-purple-600 font-medium">Pro Plan</p>
                </div>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center text-white hover:shadow-lg hover:scale-110 transition-all duration-300 overflow-hidden border-2 border-white shadow-lg"
                >
                  {profile.avatar ? (
                    <img 
                      src={profile.avatar} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </button>
                
                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 top-12 bg-white/95 backdrop-blur-xl border border-purple-200/50 rounded-2xl shadow-2xl py-3 z-50 min-w-[180px]">
                    <div className="px-6 py-3 border-b border-purple-100">
                      <p className="text-sm font-medium text-gray-900">
                        {profile.displayName || user?.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs text-gray-600">{profile.email || user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        window.dispatchEvent(new CustomEvent('navigateToProfile'));
                      }}
                      className="flex items-center space-x-3 w-full px-6 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-300"
                    >
                      <User className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-3 w-full px-6 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-300"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showProfileMenu) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowNotifications(false);
            setShowProfileMenu(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;