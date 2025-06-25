import React, { useState } from 'react';
import { DollarSign, TrendingUp, CreditCard, Calendar, Plus } from 'lucide-react';
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
}

const Dashboard: React.FC<DashboardProps> = ({ 
  subscriptions, 
  spendingData, 
  spendingLoading = false,
  onAddSubscription 
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

  return (
    <div className="space-y-8">
      {/* Header with Add Button */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between space-y-6 lg:space-y-0">
        <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-emerald-500 rounded-3xl p-8 text-white flex-1 lg:mr-6">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold mb-4">Welcome back to SubSlayer</h1>
            <p className="text-xl text-white/90 mb-6">
              Take control of your subscriptions and maximize your savings
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <p className="text-white/80 text-sm font-medium">Monthly Total</p>
                <p className="text-2xl font-bold">${monthlyTotal.toFixed(2)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <p className="text-white/80 text-sm font-medium">Annual Projection</p>
                <p className="text-2xl font-bold">${annualTotal.toFixed(2)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <p className="text-white/80 text-sm font-medium">Active Subscriptions</p>
                <p className="text-2xl font-bold">{activeSubscriptions.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <p className="text-white/80 text-sm font-medium">Paused Subscriptions</p>
                <p className="text-2xl font-bold">
                  {subscriptions.filter(sub => sub.status === 'paused').length}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <p className="text-white/80 text-sm font-medium">Upcoming Renewals</p>
                <p className="text-2xl font-bold">{upcomingRenewalsCount}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Add Subscription Button */}
        <div className="lg:self-start">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white hover:bg-gray-50 text-purple-600 px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg border border-gray-200 hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Add Subscription</span>
          </button>
        </div>
      </div>

      {/* Empty State for First Time Users */}
      {subscriptions.length === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Started with SubSlayer</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start tracking your subscriptions and take control of your recurring expenses. Add your first subscription to see insights and analytics.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 mx-auto shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Subscription</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions for Existing Users */}
      {subscriptions.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-600">Manage your subscriptions efficiently</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 rounded-xl border border-purple-200 transition-all duration-200 text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Add Subscription</h4>
                  <p className="text-sm text-gray-600">Track a new service</p>
                </div>
              </div>
            </button>
            
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Monthly Savings</h4>
                  <p className="text-sm text-emerald-600 font-semibold">
                    ${(subscriptions.filter(s => s.status === 'paused').reduce((sum, s) => sum + (s.billingCycle === 'monthly' ? s.cost : s.cost / 12), 0)).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Next Renewal</h4>
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
        <UpcomingRenewals subscriptions={subscriptions} />
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