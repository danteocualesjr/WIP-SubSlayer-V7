import React, { useState } from 'react';
import { DollarSign, TrendingUp, CreditCard, Calendar, Plus, Sparkles, Star } from 'lucide-react';
import StatsCard from './StatsCard';
import SpendingChart from './SpendingChart';
import CategoryChart from './CategoryChart';
import UpcomingRenewals from './UpcomingRenewals';
import MiniCalendar from './MiniCalendar';
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

  // Generate category data for pie chart
  const generateCategoryData = () => {
    const categoryTotals = activeSubscriptions.reduce((acc, sub) => {
      const monthlyCost = sub.billingCycle === 'monthly' ? sub.cost : sub.cost / 12;
      const category = sub.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + monthlyCost;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#F97316', '#84CC16', '#06B6D4', '#EC4899'];
    
    return Object.entries(categoryTotals).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  };

  const categoryData = generateCategoryData();

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
      {/* Enhanced Hero Section with Sparkles */}
      <div className="relative bg-gradient-to-br from-purple-900 via-violet-800 to-purple-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white overflow-hidden">
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            <div>
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300" />
                <h1 className="text-2xl sm:text-4xl font-bold">Welcome back, {getUserName()}</h1>
              </div>
              <p className="text-lg sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl">
                Slay your subscription chaos
              </p>
            </div>
            
            {/* Action Button */}
            <div className="flex-shrink-0">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 border border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span>Add Subscription</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-300" />
                <p className="text-white/80 text-xs sm:text-sm font-medium">Monthly Total</p>
              </div>
              <p className="text-lg sm:text-3xl font-bold">${monthlyTotal.toFixed(2)}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-green-300" />
                <p className="text-white/80 text-xs sm:text-sm font-medium">Annual Projection</p>
              </div>
              <p className="text-lg sm:text-3xl font-bold">${annualTotal.toFixed(2)}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                <CreditCard className="w-4 h-4 sm:w-6 sm:h-6 text-blue-300" />
                <p className="text-white/80 text-xs sm:text-sm font-medium">Active Subscriptions</p>
              </div>
              <p className="text-lg sm:text-3xl font-bold">{activeSubscriptions.length}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-pink-300" />
                <p className="text-white/80 text-xs sm:text-sm font-medium">Upcoming Renewals</p>
              </div>
              <p className="text-lg sm:text-3xl font-bold">{upcomingRenewalsCount}</p>
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

      {/* Charts Grid - Monthly Spending Trend and Spending by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <SpendingChart data={spendingData} loading={spendingLoading} />
        <CategoryChart data={categoryData} />
      </div>

      {/* Upcoming Renewals and Calendar View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <UpcomingRenewals 
          subscriptions={subscriptions} 
          onSwitchToCalendar={handleSwitchToCalendar}
          onEditSubscription={handleEditSubscription}
        />
        <MiniCalendar 
          subscriptions={subscriptions}
          onSwitchToCalendar={handleSwitchToCalendar}
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