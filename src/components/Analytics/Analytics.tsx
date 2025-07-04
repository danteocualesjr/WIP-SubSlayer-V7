import React from 'react';
import { TrendingUp, DollarSign, Calendar, PieChart, Sparkles, Star, BarChart3, Target } from 'lucide-react';
import StatsCard from '../Dashboard/StatsCard';
import SpendingChart from '../Dashboard/SpendingChart';
import CategoryChart from './CategoryChart';
import { SparklesCore } from '../ui/sparkles';
import { Subscription, SpendingData, CategoryData } from '../../types/subscription';

interface AnalyticsProps {
  
  subscriptions: Subscription[];
  spendingData: SpendingData[];
  categoryData: CategoryData[];
  spendingLoading?: boolean;
  
}

const Analytics: React.FC<AnalyticsProps> = ({ 
  
  subscriptions, 
  spendingData, 
  categoryData, 
  spendingLoading = false 
  
}) => {
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  
  const monthlyTotal = activeSubscriptions.reduce((sum, sub) => {
    if (sub.billingCycle === 'monthly') {
      return sum + sub.cost;
    } else {
      return sum + (sub.cost / 12);
    }
  }, 0);

  const annualTotal = monthlyTotal * 12;
  
  const averagePerSubscription = activeSubscriptions.length > 0 
    ? monthlyTotal / activeSubscriptions.length 
    : 0;

  const mostExpensiveCategory = categoryData.length > 0 
    ? categoryData.reduce((max, current) => 
        current.value > max.value ? current : max, categoryData[0]
      )
    : { name: 'N/A', value: 0, color: '#8B5CF6' };

  const upcomingRenewals = activeSubscriptions.filter(sub => {
    const renewalDate = new Date(sub.nextBilling);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return renewalDate >= now && renewalDate <= thirtyDaysFromNow;
  }).length;

  // Calculate year-over-year growth
  const currentMonthSpending = spendingData[spendingData.length - 1]?.amount || 0;
  const sixMonthsAgo = spendingData[spendingData.length - 7]?.amount || 0;
  const growthRate = sixMonthsAgo > 0 
    ? ((currentMonthSpending - sixMonthsAgo) / sixMonthsAgo * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Enhanced Hero Section with Sparkles */}
      <div className="relative bg-gradient-to-br from-purple-900 via-violet-800 to-purple-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white overflow-hidden">
        {/* Sparkles Background */}
        <div className="absolute inset-0 w-full h-full">
          <SparklesCore
            id="analytics-sparkles"
            background="transparent"
            minSize={0.3}
            maxSize={1.4}
            particleDensity={120}
            className="w-full h-full"
            particleColor="#ffffff"
            speed={1.2}
          />
        </div>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 opacity-25">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/30 to-violet-400/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-violet-400/30 to-purple-400/30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-violet-400/20 rounded-full blur-3xl"></div>
        </div>

        {/* Radial gradient to prevent sharp edges */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-900/50 via-violet-800/50 to-purple-700/50 [mask-image:radial-gradient(800px_400px_at_center,transparent_20%,white)]"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4 sm:mb-6">
            <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300" />
            <h1 className="text-2xl sm:text-4xl font-bold">Analytics</h1>
          </div>
          <p className="text-lg sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl">
            Deep dive into your subscription spending patterns and discover optimization opportunities
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
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
                <Target className="w-4 h-4 sm:w-6 sm:h-6 text-blue-300" />
                <p className="text-white/80 text-xs sm:text-sm font-medium">Average Cost</p>
              </div>
              <p className="text-lg sm:text-3xl font-bold">${averagePerSubscription.toFixed(2)}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-orange-300" />
                <p className="text-white/80 text-xs sm:text-sm font-medium">Growth Rate</p>
              </div>
              <p className="text-lg sm:text-3xl font-bold">{Number(growthRate) >= 0 ? '+' : ''}{growthRate}%</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 col-span-2 sm:col-span-3 lg:col-span-1">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-pink-300" />
                <p className="text-white/80 text-xs sm:text-sm font-medium">Upcoming Renewals</p>
              </div>
              <p className="text-lg sm:text-3xl font-bold">{upcomingRenewals}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Average per Subscription"
          value={`$${averagePerSubscription.toFixed(2)}`}
          icon={DollarSign}
          gradient="bg-gradient-to-br from-purple-500 to-violet-600"
        />
        <StatsCard
          title="Growth Rate (6m)"
          value={`${Number(growthRate) >= 0 ? '+' : ''}${growthRate}%`}
          changeType={Number(growthRate) >= 0 ? 'negative' : 'positive'}
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-blue-500 to-violet-600"
        />
        <StatsCard
          title="Upcoming Renewals"
          value={upcomingRenewals.toString()}
          icon={Calendar}
          gradient="bg-gradient-to-br from-emerald-500 to-green-600"
        />
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 hover:scale-105 transform group">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-sm font-medium text-gray-600 mb-3">Top Category</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 break-words leading-tight" title={mostExpensiveCategory.name}>
                {mostExpensiveCategory.name}
              </p>
            </div>
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
              <PieChart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <SpendingChart data={spendingData} loading={spendingLoading} />
        <CategoryChart data={categoryData} />
      </div>

      {/* Detailed Breakdown */}
      {activeSubscriptions.length > 0 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg border border-purple-100/50">
          <div className="flex items-center space-x-3 mb-6 sm:mb-8">
            <Star className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Subscription Breakdown</h3>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {activeSubscriptions
              .sort((a, b) => {
                const aCost = a.billingCycle === 'monthly' ? a.cost : a.cost / 12;
                const bCost = b.billingCycle === 'monthly' ? b.cost : b.cost / 12;
                return bCost - aCost;
              })
              .map((subscription) => {
                const monthlyCost = subscription.billingCycle === 'monthly' ? subscription.cost : subscription.cost / 12;
                const percentage = monthlyTotal > 0 ? (monthlyCost / monthlyTotal * 100).toFixed(1) : '0';
                
                return (
                  <div key={subscription.id} className="flex items-center justify-between p-4 sm:p-6 bg-gradient-to-r from-purple-50/50 to-violet-50/50 rounded-xl sm:rounded-2xl border border-purple-100/50 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                      <div
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0"
                        style={{ backgroundColor: subscription.color || '#8B5CF6' }}
                      >
                        {subscription.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-900 truncate">{subscription.name}</h4>
                        <p className="text-sm text-gray-600 truncate">{subscription.category || 'Uncategorized'}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="font-bold text-gray-900 text-base sm:text-lg">${monthlyCost.toFixed(2)}/mo</p>
                      <p className="text-sm text-purple-600 font-medium">{percentage}% of total</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {activeSubscriptions.length === 0 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-lg border border-purple-100/50 text-center">
          <PieChart className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4 sm:mb-6" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">No Active Subscriptions</h3>
          <p className="text-gray-600">Add some subscriptions to see detailed analytics and insights.</p>
        </div>
      )}
    </div>
  );
};

export default Analytics;