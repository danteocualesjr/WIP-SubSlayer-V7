import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, ArrowRight } from 'lucide-react';
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

  const handleViewAllSubscriptions = () => {
    // Navigate to subscriptions tab
    window.dispatchEvent(new CustomEvent('navigateToTab', { 
      detail: { tab: 'subscriptions' } 
    }));
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 group">
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-3">Upcoming Renewals</h3>
        <p className="text-gray-600">Next 30 days</p>
      </div>

      <div className="space-y-4">
        {upcomingRenewals.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No upcoming renewals</h4>
            <p className="text-gray-500 text-sm">You don't have any subscription renewals in the next 30 days</p>
          </div>
        ) : (
          upcomingRenewals.map((subscription) => {
            const daysUntil = getDaysUntilRenewal(subscription.nextBilling);
            const isUrgent = daysUntil <= 3;
            
            return (
              <div
                key={subscription.id}
                onClick={() => handleSubscriptionClick(subscription)}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-2xl hover:from-purple-50 hover:to-violet-50 transition-all duration-200 cursor-pointer hover:shadow-md group/item border border-gray-100 hover:border-purple-200"
              >
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-lg group-hover/item:shadow-xl transition-shadow duration-200 flex-shrink-0"
                    style={{ backgroundColor: subscription.color || '#8B5CF6' }}
                  >
                    {subscription.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover/item:text-purple-700 transition-colors">
                      {subscription.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {formatDate(subscription.nextBilling)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-gray-900 group-hover/item:text-purple-700 transition-colors">
                    ${subscription.cost.toFixed(2)}{subscription.billingCycle === 'monthly' ? ' monthly' : ' annually'}
                  </span>
                  <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    isUrgent 
                      ? 'bg-red-100 text-red-700 group-hover/item:bg-red-200' 
                      : daysUntil <= 7 
                        ? 'bg-yellow-100 text-yellow-700 group-hover/item:bg-yellow-200'
                        : 'bg-green-100 text-green-700 group-hover/item:bg-green-200'
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

      {/* View All Subscriptions Button */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <button
          onClick={handleViewAllSubscriptions}
          className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 text-purple-700 rounded-2xl font-semibold transition-all duration-200 border border-purple-200 hover:border-purple-300 group/button shadow-sm hover:shadow-md"
        >
          <span>View All Subscriptions</span>
          <ArrowRight className="w-5 h-5 group-hover/button:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
};

export default UpcomingRenewals;