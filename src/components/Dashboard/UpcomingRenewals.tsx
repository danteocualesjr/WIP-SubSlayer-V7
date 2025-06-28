import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, Grid3X3 } from 'lucide-react';
import { Subscription } from '../../types/subscription';
import { useSettings } from '../../hooks/useSettings';

interface UpcomingRenewalsProps {
  subscriptions: Subscription[];
  onSwitchToCalendar?: () => void;
  onEditSubscription?: (subscription: Subscription) => void;
}

const UpcomingRenewals: React.FC<UpcomingRenewalsProps> = ({ 
  subscriptions, 
  onSwitchToCalendar,
  onEditSubscription 
}) => {
  const { settings, formatDate } = useSettings();
  const [viewMode, setViewMode] = useState<'list' | 'mini-calendar'>('list');

  const getUpcomingRenewals = () => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return subscriptions
      .filter(sub => {
        const renewalDate = new Date(sub.nextBilling);
        return renewalDate >= now && renewalDate <= thirtyDaysFromNow && sub.status === 'active';
      })
      .sort((a, b) => new Date(a.nextBilling).getTime() - new Date(b.nextBilling).getTime())
      .slice(0, 5);
  };

  const getDaysUntilRenewal = (date: string) => {
    const now = new Date();
    const renewalDate = new Date(date);
    const diffTime = renewalDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const upcomingRenewals = getUpcomingRenewals();

  const handleSubscriptionClick = (subscription: Subscription) => {
    if (onEditSubscription) {
      onEditSubscription(subscription);
    }
  };

  const handleViewAllSubscriptions = () => {
    // Navigate to subscriptions tab
    const event = new CustomEvent('navigateToTab', { detail: { tab: 'subscriptions' } });
    window.dispatchEvent(event);
  };

  const renderMiniCalendar = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateString = date.toISOString().split('T')[0];
      const dayRenewals = subscriptions.filter(sub => 
        sub.nextBilling === dateString && sub.status === 'active'
      );
      const isToday = date.toDateString() === now.toDateString();
      
      days.push(
        <div
          key={day}
          className={`h-8 flex items-center justify-center text-xs relative ${
            isToday 
              ? 'bg-purple-100 text-purple-700 rounded-lg font-semibold' 
              : dayRenewals.length > 0
                ? 'bg-red-50 text-red-700 rounded-lg font-medium'
                : 'text-gray-600'
          }`}
        >
          {day}
          {dayRenewals.length > 0 && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
          )}
        </div>
      );
    }
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    
    return (
      <div className="space-y-3">
        <div className="text-center">
          <h4 className="font-medium text-gray-900">
            {monthNames[currentMonth]} {currentYear}
          </h4>
        </div>
        
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 font-medium">
          {dayNames.map((day, index) => (
            <div key={index} className="text-center">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-600 pt-2 border-t">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Renewal</span>
          </div>
        </div>
        
        {/* View All Subscriptions Button */}
        <button
          onClick={handleViewAllSubscriptions}
          className="w-full mt-3 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-sm font-medium transition-colors"
        >
          View All Subscriptions
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Upcoming Renewals</h3>
          <p className="text-sm text-gray-600">Next 30 days</p>
        </div>
        <div className="flex items-center space-x-2">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="List View"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('mini-calendar')}
              className={`p-1.5 rounded transition-all duration-200 ${
                viewMode === 'mini-calendar'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Calendar View"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'mini-calendar' ? (
        renderMiniCalendar()
      ) : (
        <div className="space-y-4">
          {upcomingRenewals.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No upcoming renewals in the next 30 days</p>
            </div>
          ) : (
            upcomingRenewals.map((subscription) => {
              const daysUntil = getDaysUntilRenewal(subscription.nextBilling);
              const isUrgent = daysUntil <= 3;
              
              return (
                <div
                  key={subscription.id}
                  onClick={() => handleSubscriptionClick(subscription)}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 cursor-pointer hover:shadow-sm group"
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-sm group-hover:shadow-md transition-shadow"
                      style={{ backgroundColor: subscription.color || '#8B5CF6' }}
                    >
                      {subscription.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                        {subscription.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {formatDate(subscription.nextBilling)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                      ${subscription.cost.toFixed(2)}
                    </span>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                      isUrgent 
                        ? 'bg-red-100 text-red-700 group-hover:bg-red-200' 
                        : daysUntil <= 7 
                          ? 'bg-yellow-100 text-yellow-700 group-hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 group-hover:bg-green-200'
                    }`}>
                      {isUrgent && <AlertCircle className="w-3 h-3" />}
                      <span>{daysUntil} days</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          {/* View All Subscriptions Button */}
          {upcomingRenewals.length > 0 && (
            <button
              onClick={handleViewAllSubscriptions}
              className="w-full mt-4 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>View All Subscriptions</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UpcomingRenewals;