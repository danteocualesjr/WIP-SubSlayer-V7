import React, { useState } from 'react';
import { Bell, Settings as SettingsIcon, Check, X, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import { Subscription } from '../../types/subscription';

interface NotificationsProps {
  subscriptions: Subscription[];
}

const Notifications: React.FC<NotificationsProps> = ({ subscriptions }) => {
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    daysBeforeRenewal: 7,
    weeklyDigest: true,
    monthlyReport: true,
    priceChanges: true,
  });

  const getUpcomingRenewals = () => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + notificationSettings.daysBeforeRenewal * 24 * 60 * 60 * 1000);
    
    return subscriptions
      .filter(sub => {
        const renewalDate = new Date(sub.nextBilling);
        return renewalDate >= now && renewalDate <= futureDate && sub.status === 'active';
      })
      .sort((a, b) => new Date(a.nextBilling).getTime() - new Date(b.nextBilling).getTime());
  };

  const getOverdueSubscriptions = () => {
    const now = new Date();
    return subscriptions.filter(sub => {
      const renewalDate = new Date(sub.nextBilling);
      return renewalDate < now && sub.status === 'active';
    });
  };

  const upcomingRenewals = getUpcomingRenewals();
  const overdueSubscriptions = getOverdueSubscriptions();

  const mockNotifications = [
    {
      id: '1',
      type: 'renewal',
      title: 'Upcoming Renewal',
      message: 'Netflix will renew in 2 days for $15.99',
      time: '2 hours ago',
      read: false,
      urgent: true,
    },
    {
      id: '2',
      type: 'savings',
      title: 'Savings Opportunity',
      message: 'You could save $12/month by switching to annual billing for Spotify',
      time: '1 day ago',
      read: false,
      urgent: false,
    },
    {
      id: '3',
      type: 'digest',
      title: 'Weekly Digest',
      message: 'Your subscription spending this week: $45.99',
      time: '3 days ago',
      read: true,
      urgent: false,
    },
  ];

  const [notifications, setNotifications] = useState(mockNotifications);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-600">Stay updated on your subscription renewals and savings opportunities</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
            <Bell className="w-4 h-4" />
            <span className="text-sm font-medium">{unreadCount} unread</span>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-purple-600 hover:text-purple-700 font-medium text-sm"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100">
          <div className="flex items-center space-x-3 mb-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="font-semibold text-gray-900">Urgent</h3>
          </div>
          <p className="text-2xl font-bold text-red-600">{overdueSubscriptions.length}</p>
          <p className="text-sm text-gray-600">Overdue renewals</p>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100">
          <div className="flex items-center space-x-3 mb-3">
            <Calendar className="w-6 h-6 text-yellow-600" />
            <h3 className="font-semibold text-gray-900">Upcoming</h3>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{upcomingRenewals.length}</p>
          <p className="text-sm text-gray-600">Renewals in {notificationSettings.daysBeforeRenewal} days</p>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
          <div className="flex items-center space-x-3 mb-3">
            <DollarSign className="w-6 h-6 text-green-600" />
            <h3 className="font-semibold text-gray-900">Potential Savings</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">$24.99</p>
          <p className="text-sm text-gray-600">Monthly savings available</p>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <SettingsIcon className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Email Notifications</h4>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
              <button
                onClick={() => setNotificationSettings(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.emailNotifications ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Push Notifications</h4>
                <p className="text-sm text-gray-600">Receive browser notifications</p>
              </div>
              <button
                onClick={() => setNotificationSettings(prev => ({ ...prev, pushNotifications: !prev.pushNotifications }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.pushNotifications ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Weekly Digest</h4>
                <p className="text-sm text-gray-600">Weekly spending summary</p>
              </div>
              <button
                onClick={() => setNotificationSettings(prev => ({ ...prev, weeklyDigest: !prev.weeklyDigest }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.weeklyDigest ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.weeklyDigest ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Monthly Report</h4>
                <p className="text-sm text-gray-600">Monthly analytics report</p>
              </div>
              <button
                onClick={() => setNotificationSettings(prev => ({ ...prev, monthlyReport: !prev.monthlyReport }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.monthlyReport ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.monthlyReport ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Price Changes</h4>
                <p className="text-sm text-gray-600">Alert on subscription price changes</p>
              </div>
              <button
                onClick={() => setNotificationSettings(prev => ({ ...prev, priceChanges: !prev.priceChanges }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.priceChanges ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.priceChanges ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Renewal Reminder (days before)
              </label>
              <select
                value={notificationSettings.daysBeforeRenewal}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, daysBeforeRenewal: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value={1}>1 day</option>
                <option value={3}>3 days</option>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Notifications</h3>
        
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  notification.read 
                    ? 'bg-gray-50 border-gray-200' 
                    : notification.urgent
                      ? 'bg-red-50 border-red-200'
                      : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className={`font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      )}
                      {notification.urgent && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-700'} mb-2`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400">{notification.time}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 text-green-600 hover:text-green-700 hover:bg-green-100 rounded transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                      title="Delete notification"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;