import React, { useState } from 'react';
import { DollarSign, TrendingUp, CreditCard, Calendar, Plus, Sparkles, Zap, Star } from 'lucide-react';
import StatsCard from './StatsCard';
import SpendingChart from './SpendingChart';
import UpcomingRenewals from './UpcomingRenewals';
import AddSubscriptionModal from '../Subscriptions/AddSubscriptionModal';
import { SparklesCore } from '../ui/sparkles';
import { Subscription, SpendingData } from '../../types/subscription';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';

interface DashboardProps {
  subscriptions: Subscription[];
  spendingData: SpendingData[];
  spendingLoading?: boolean;
  onAddSubscription?: (subscription: Omit<Subscription, 'id' | 'createdAt'>) => void;
  onEditSubscription?: (id: string, subscription: Omit<Subscription, 'id' | 'createdAt'>) => void;
  onSwitchToCalendar?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  subscriptions, 
  spendingData, 
  spendingLoading = false,
  onAddSubscription,
  onEditSubscription,
  onSwitchToCalendar 
}) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  
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

  // Get user's display name
  const getUserName = () => {
    if (profile.displayName) {
      return profile.displayName;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const handleAddSubscription = (subscriptionData: Omit<Subscription, 'id' | 'createdAt'>) => {
    if (onAddSubscription) {
      onAddSubscription(subscriptionData);
    }
    setShowAddModal(false);
    setEditingSubscription(null);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setShowAddModal(true);
  };

  const handleSaveEdit = (subscriptionData: Omit<Subscription, 'id' | 'createdAt'>) => {
    if (editingSubscription && onEditSubscription) {
      onEditSubscription(editingSubscription.id, subscriptionData);
    }
    setShowAddModal(false);
    setEditingSubscription(null);
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setEditingSubscription(null);
  };

  const handleSwitchToCalendar = () => {
    if (onSwitchToCalendar) {
      onSwitchToCalendar();
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Reduced Hero Section with Sparkles */}
      <div className="relative bg-gradient-to-br from-purple-900 via-violet-800 to-purple-700 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white overflow-hidden">
        {/* Sparkles Background */}
        <div className="absolute inset-0 w-full h-full">
          <SparklesCore
            id="dashboard-sparkles"
            background="transparent"
            minSize={0.4}
            maxSize={1.2}
            particleDensity={80}
            className="w-full h-full"
            particleColor="#ffffff"
            speed={0.8}
          />
        </div>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-violet-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-violet-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        </div>

        {/* Radial gradient to prevent sharp edges */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-900/50 via-violet-800/50 to-purple-700/50 [mask-image:radial-gradient(800px_400px_at_center,transparent_20%,white)]"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-3 sm:mb-4">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Welcome back, {getUserName()}</h1>
          </div>
          <p className="text-base sm:text-lg text-white/90 mb-4 sm:mb-6 max-w-2xl">
            Take control of your subscriptions and maximize your savings
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300" />
                <p className="text-white/80 text-xs font-medium">Monthly Total</p>
              </div>
              <p className="text-sm sm:text-lg lg:text-xl font-bold">${monthlyTotal.toFixed(2)}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-300" />
                <p className="text-white/80 text-xs font-medium">Annual Projection</p>
              </div>
              <p className="text-sm sm:text-lg lg:text-xl font-bold">${annualTotal.toFixed(2)}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-blue-300" />
                <p className="text-white/80 text-xs font-medium">Active Subscriptions</p>
              </div>
              <p className="text-sm sm:text-lg lg:text-xl font-bold">{activeSubscriptions.length}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-orange-300" />
                <p className="text-white/80 text-xs font-medium">Cancelled</p>
              </div>
              <p className="text-sm sm:text-lg lg:text-xl font-bold">
                {subscriptions.filter(sub => sub.status === 'cancelled').length}
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 col-span-2 sm:col-span-1">
              <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-pink-300" />
                <p className="text-white/80 text-xs font-medium">Upcoming Renewals</p>
              </div>
              <p className="text-sm sm:text-lg lg:text-xl font-bold">{upcomingRenewalsCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State for First Time Users */}
      {subscriptions.length === 0 && (
        <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-purple-50 rounded-2xl sm:rounded-3xl p-8 sm:p-12 border border-purple-200/50 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-16 h-16 sm:w-32 sm:h-32 bg-purple-500 rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-24 sm:h-24 bg-violet-500 rounded-full"></div>
          </div>
          
          <div className="text-center relative z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl">
              <CreditCard className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Get Started with SubSlayer</h3>
            <p className="text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto text-base sm:text-lg">
              Start tracking your subscriptions and take control of your recurring expenses. Add your first subscription to see insights and analytics.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 flex items-center space-x-2 sm:space-x-3 mx-auto shadow-xl hover:shadow-2xl hover:scale-105 transform"
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Add Your First Subscription</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions for Existing Users */}
      {subscriptions.length > 0 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg border border-purple-100/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center space-x-2">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                <span>Quick Actions</span>
              </h3>
              <p className="text-gray-600 mt-1">Manage your subscriptions efficiently</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 rounded-xl sm:rounded-2xl border border-purple-200 transition-all duration-300 text-left group hover:scale-105 transform shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Add Subscription</h4>
                  <p className="text-sm text-gray-600">Track a new service</p>
                </div>
              </div>
            </button>
            
            <div className="p-4 sm:p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl sm:rounded-2xl border border-emerald-200 shadow-lg">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Monthly Savings</h4>
                  <p className="text-lg font-bold text-emerald-600">
                    ${(subscriptions.filter(s => s.status === 'cancelled').reduce((sum, s) => sum + (s.billingCycle === 'monthly' ? s.cost : s.cost / 12), 0)).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl sm:rounded-2xl border border-orange-200 shadow-lg sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <SpendingChart data={spendingData} loading={spendingLoading} />
        <UpcomingRenewals 
          subscriptions={subscriptions} 
          onSwitchToCalendar={handleSwitchToCalendar}
          onEditSubscription={handleEditSubscription}
        />
      </div>

      {/* Add/Edit Subscription Modal */}
      <AddSubscriptionModal
        isOpen={showAddModal}
        onClose={handleModalClose}
        onAdd={editingSubscription ? handleSaveEdit : handleAddSubscription}
        subscription={editingSubscription || undefined}
      />
    </div>
  );
};

export default Dashboard;