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
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-emerald-500 rounded-3xl p-8 text-white">
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

      {/* Quick Actions */}
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