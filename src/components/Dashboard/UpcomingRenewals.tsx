import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
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

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upcoming Renewals</h3>
        <p className="text-sm text-gray-600">Next 30 days</p>
      </div>

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
      </div>
    </div>
  );
};

export default UpcomingRenewals;