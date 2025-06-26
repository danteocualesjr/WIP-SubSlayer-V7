import React from 'react';
import { TrendingUp, DollarSign, Calendar, PieChart, Sparkles, Star } from 'lucide-react';
import StatsCard from '../Dashboard/StatsCard';
import SpendingChart from '../Dashboard/SpendingChart';
import CategoryChart from './CategoryChart';
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
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-300" />
            <h1 className="text-3xl font-bold">Analytics</h1>
          </div>
          <p className="text-white/90 text-lg">Deep insights into your subscription spending patterns</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Average per Subscription"
          value={`$${averagePerSubscription.toFixed(2)}`}
          icon={DollarSign}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatsCard
          title="Growth Rate (6m)"
          value={`${Number(growthRate) >= 0 ? '+' : ''}${growthRate}%`}
          changeType={Number(growthRate) >= 0 ? 'negative' : 'positive'}
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatsCard
          title="Upcoming Renewals"
          value={upcomingRenewals.toString()}
          icon={Calendar}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
        <StatsCard
          title="Top Category"
          value={mostExpensiveCategory.name}
          icon={PieChart}
          gradient="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SpendingChart data={spendingData} loading={spendingLoading} />
        <CategoryChart data={categoryData} />
      </div>

      {/* Detailed Breakdown */}
      {activeSubscriptions.length > 0 && (
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100/50">
          <div className="flex items-center space-x-3 mb-8">
            <Star className="w-6 h-6 text-purple-500" />
            <h3 className="text-xl font-bold text-gray-900">Subscription Breakdown</h3>
          </div>
          <div className="space-y-4">
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
                  <div key={subscription.id} className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50/50 to-blue-50/50 rounded-2xl border border-purple-100/50 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg"
                        style={{ backgroundColor: subscription.color || '#8B5CF6' }}
                      >
                        {subscription.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{subscription.name}</h4>
                        <p className="text-sm text-gray-600">{subscription.category || 'Uncategorized'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-lg">${monthlyCost.toFixed(2)}/mo</p>
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
        <div className="bg-white rounded-3xl p-12 shadow-lg border border-purple-100/50 text-center">
          <PieChart className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-gray-900 mb-3">No Active Subscriptions</h3>
          <p className="text-gray-600">Add some subscriptions to see detailed analytics and insights.</p>
        </div>
      )}
    </div>
  );
};

export default Analytics;