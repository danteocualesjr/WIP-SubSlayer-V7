import React, { useState } from 'react';
import { DollarSign, TrendingUp, CreditCard, Calendar, Plus, Sparkles, Zap, Star } from 'lucide-react';
import StatsCard from './StatsCard';
import SpendingChart from './SpendingChart';
import UpcomingRenewals from './UpcomingRenewals';
import AddSubscriptionModal from '../Subscriptions/AddSubscriptionModal';
import { Subscription, SpendingData } from '../../types/subscription';

interface DashboardProps {
  subscriptions: Subscription[];
  spendingData: SpendingData[];
  spendingLoading?: boolean;
  onAddSubscription?: (subscription: Omit<Subscription, 'id' | 'createdAt'>) => void;
  onSwitchToCalendar?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  subscriptions, 
  spendingData, 
  spendingLoading = false,
  onAddSubscription,
  onSwitchToCalendar 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  
  const monthlyTotal = activeSubscriptions.reduce((sum, sub) => {
    if (sub.billingCycle === 'monthly') {
      return sum + sub.cost;
    } else {
      return sum + (sub.cost / 12);
    }
  }, 0);

  const annualTotal = monthlyTotal * 12;
  
  const lastMonthSpending = spendingData[spendingData.length - 2]?.amount || 0;
  const currentMonthSpending = spendingData[spendingData.length - 1]?.amount || 0;
  const spendingChange = lastMonthSpending > 0 
    ? ((currentMonthSpending - lastMonthSpending) / lastMonthSpending * 100).toFixed(1)
    : '0';

  // Calculate upcoming renewals in next 30 days
  const getUpcomingRenewalsCount = () => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return activeSubscriptions.filter(sub => {
      const renewalDate = new Date(sub.nextBilling);
      return renewalDate >= now && renewalDate <= thirtyDaysFromNow;
    }).length;
  };

  const upcomingRenewalsCount = getUpcomingRenewalsCount();

  const handleAddSubscription = (subscriptionData: Omit<Subscription, 'id' | 'createdAt'>) => {
    if (onAddSubscription) {
      onAddSubscription(subscriptionData);
    }
    setShowAddModal(false);
  };

  const handleSwitchToCalendar = () => {
    if (onSwitchToCalendar) {
      onSwitchToCalendar();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <Sparkles className="w-8 h-8 text-yellow-300" />
            <h1 className="text-4xl font-bold">Welcome back to SubSlayer</h1>
          </div>
          <p className="text-xl text-white/90 mb-8 max-w-2xl">
            Take control of your subscriptions and maximize your savings with our beta dashboard
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-2">
                <DollarSign className="w-6 h-6 text-yellow-300" />
                <p className="text-white/80 text-sm font-medium">Monthly Total</p>
              </div>
              <p className="text-3xl font-bold">${monthlyTotal.toFixed(2)}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-2">
                <TrendingUp className="w-6 h-6 text-green-300" />
                <p className="text-white/80 text-sm font-medium">Annual Projection</p>
              </div>
              <p className="text-3xl font-bold">${annualTotal.toFixed(2)}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-2">
                <CreditCard className="w-6 h-6 text-blue-300" />
                <p className="text-white/80 text-sm font-medium">Active Subscriptions</p>
              </div>
              <p className="text-3xl font-bold">{activeSubscriptions.length}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-2">
                <Zap className="w-6 h-6 text-orange-300" />
                <p className="text-white/80 text-sm font-medium">Paused Subscriptions</p>
              </div>
              <p className="text-3xl font-bold">
                {subscriptions.filter(sub => sub.status === 'paused').length}
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-2">
                <Calendar className="w-6 h-6 text-pink-300" />
                <p className="text-white/80 text-sm font-medium">Upcoming Renewals</p>
              </div>
              <p className="text-3xl font-bold">{upcomingRenewalsCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State for First Time Users */}
      {subscriptions.length === 0 && (
        <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-3xl p-12 border border-purple-200/50 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500 rounded-full"></div>
          </div>
          
          <div className="text-center relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <CreditCard className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Get Started with SubSlayer</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
              Start tracking your subscriptions and take control of your recurring expenses. Add your first subscription to see insights and analytics.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-10 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-3 mx-auto shadow-xl hover:shadow-2xl hover:scale-105 transform"
            >
              <Plus className="w-6 h-6" />
              <span>Add Your First Subscription</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions for Existing Users */}
      {subscriptions.length > 0 && (
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <Star className="w-6 h-6 text-purple-500" />
                <span>Quick Actions</span>
              </h3>
              <p className="text-gray-600 mt-1">Manage your subscriptions efficiently</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 rounded-2xl border border-purple-200 transition-all duration-300 text-left group hover:scale-105 transform shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Add Subscription</h4>
                  <p className="text-sm text-gray-600">Track a new service</p>
                </div>
              </div>
            </button>
            
            <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Monthly Savings</h4>
                  <p className="text-lg font-bold text-emerald-600">
                    ${(subscriptions.filter(s => s.status === 'paused').reduce((sum, s) => sum + (s.billingCycle === 'monthly' ? s.cost : s.cost / 12), 0)).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-200 shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Next Renewal</h4>
                  <p className="text-sm text-gray-600">
                    {activeSubscriptions.length > 0 
                      ? new Date(Math.min(...activeSubscriptions.map(s => new Date(s.nextBilling).getTime()))).toLocaleDateString()
                      : 'No active subscriptions'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts and Upcoming Renewals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SpendingChart data={spendingData} loading={spendingLoading} />
        <UpcomingRenewals 
          subscriptions={subscriptions} 
          onSwitchToCalendar={handleSwitchToCalendar}
        />
      </div>

      {/* Add Subscription Modal */}
      <AddSubscriptionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSubscription}
      />
    </div>
  );
};

export default Dashboard;