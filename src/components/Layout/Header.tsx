import React, { useState, useEffect } from 'react';
import { Bell, User, Search, LogOut, Sparkles, Crown } from 'lucide-react';
import NotificationDetailsModal from '../Notifications/NotificationDetailsModal';
import { useAuth } from '../../hooks/useAuth';
import { useEffect, useState } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { useNotifications } from '../../hooks/useNotifications';
import { useSubscription } from '../../hooks/useSubscription';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { notifications, markAsRead, markAllAsRead, deleteNotification, getUnreadCount } = useNotifications();
  const { subscription, getSubscriptionProduct, isActive } = useSubscription();
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [showNotificationDetails, setShowNotificationDetails] = useState<boolean>(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Listen for sidebar toggle events
  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.isCollapsed);
      setIsMobile(event.detail.isMobile);
      setIsMobileMenuOpen(event.detail.isMobileMenuOpen);
    };

    // Get initial state
    const saved = localStorage.getItem('sidebar-collapsed');
    const mobile = window.innerWidth < 768;
    setSidebarCollapsed(mobile ? true : (saved ? JSON.parse(saved) : false));
    setIsMobile(mobile);

    window.addEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    
    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const unreadCount = getUnreadCount();
  const subscriptionProduct = getSubscriptionProduct();
  const hasActiveSubscription = isActive();

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getPlanDisplay = () => {
    if (hasActiveSubscription && subscriptionProduct) {
      return {
        name: subscriptionProduct.name,
        icon: Crown,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50'
      };
    }
    
    return {
      name: 'Free Plan',
      icon: Sparkles,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    };
  };

  const handleNotificationClick = (notification: any) => {
    setSelectedNotification(notification);
    setShowNotificationDetails(true);
    setShowNotifications(false);
  };

  const handleNotificationMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleNotificationDelete = (id: string) => {
    deleteNotification(id);
  };

  const planDisplay = getPlanDisplay();
  const PlanIcon = planDisplay.icon;

  return (
    <>
    <header className={`bg-white/80 backdrop-blur-2xl border-b border-purple-200/50 sticky top-0 z-30 shadow-sm transition-all duration-300 ${
      isMobile ? 'ml-0' : (sidebarCollapsed ? 'ml-20' : 'ml-64')
    }`}>
      <div className={`px-3 sm:px-6 lg:px-8 ${isMobile ? 'pl-16' : ''}`}>
        <div className="flex justify-between items-center h-16">
          {/* Search Bar */}
          <div className="flex-1 max-w-lg hidden sm:block">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search subscriptions..."
                className="w-full pl-12 pr-4 py-2 sm:py-3 bg-gradient-to-r from-purple-50/50 to-blue-50/50 border border-purple-200/50 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-purple-400 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-1 sm:space-x-4 ml-auto">
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1.5 sm:p-3 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl sm:rounded-2xl transition-all duration-300 relative group"
              >
                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-lg">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-12 sm:top-14 bg-white/95 backdrop-blur-xl border border-purple-200/50 rounded-2xl shadow-2xl py-3 z-50 w-[calc(100vw-2rem)] sm:w-80 max-h-96 overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 border-b border-purple-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span>Notifications</span>
                      </h3>
                      {unreadCount > 0 && (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                            {unreadCount} new
                          </span>
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                          >
                            Mark all read
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 sm:px-6 py-8 text-center text-gray-500">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      notifications
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 10)
                        .map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`px-4 sm:px-6 py-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 border-b border-purple-50 last:border-b-0 transition-all duration-300 ${
                              !notification.read ? 'bg-gradient-to-r from-purple-50/50 to-blue-50/50' : ''
                            } cursor-pointer`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
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
                                    {formatTimeAgo(notification.createdAt)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 ml-2">
                                {!notification.read && (
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    className="p-1 text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded transition-colors"
                                    title="Mark as read"
                                  >
                                    <div className="w-2 h-2 bg-purple-600 rounded-full" />
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteNotification(notification.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
                                  title="Delete notification"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                  
                  {notifications.length > 10 && (
                    <div className="px-4 sm:px-6 py-4 border-t border-purple-100">
                      <button className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors">
                        View all notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="flex items-center space-x-1 sm:space-x-4 pl-1 sm:pl-4 border-l border-purple-200/50">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {profile.displayName || user?.email?.split('@')[0] || 'User'}
                </p>
                <div className={`flex items-center space-x-1 ${planDisplay.bgColor} px-2 py-1 rounded-full`}>
                  <PlanIcon className={`w-3 h-3 ${planDisplay.color}`} />
                  <p className={`text-xs ${planDisplay.color} font-medium`}>{planDisplay.name}</p>
                </div>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white hover:shadow-lg hover:scale-110 transition-all duration-300 overflow-hidden border-2 border-white shadow-lg"
                >
                  {profile.avatar ? (
                    <img 
                      src={profile.avatar} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
                
                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 top-10 sm:top-12 bg-white/95 backdrop-blur-xl border border-purple-200/50 rounded-2xl shadow-2xl py-3 z-50 min-w-[180px] w-[calc(100vw-2rem)] sm:w-auto">
                    <div className="px-4 sm:px-6 py-3 border-b border-purple-100">
                      <p className="text-sm font-medium text-gray-900">
                        {profile.displayName || user?.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs text-gray-600">{profile.email || user?.email}</p>
                      <div className={`flex items-center space-x-1 mt-2 ${planDisplay.bgColor} px-2 py-1 rounded-full w-fit`}>
                        <PlanIcon className={`w-3 h-3 ${planDisplay.color}`} />
                        <span className={`text-xs ${planDisplay.color} font-medium`}>{planDisplay.name}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        window.dispatchEvent(new CustomEvent('navigateToProfile'));
                      }}
                      className="flex items-center space-x-3 w-full px-4 sm:px-6 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-300"
                    >
                      <User className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-3 w-full px-4 sm:px-6 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-300"
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
          className="fixed inset-0 z-20" 
          onClick={() => {
            setShowNotifications(false);
            setShowProfileMenu(false);
          }}
        />
      )}
    </header>

      {/* Notification Details Modal */}
      <NotificationDetailsModal
        isOpen={showNotificationDetails}
        onClose={() => setShowNotificationDetails(false)}
        notification={selectedNotification}
        onMarkAsRead={handleNotificationMarkAsRead}
        onDelete={handleNotificationDelete}
      />
    </>
  );
};

export default Header;