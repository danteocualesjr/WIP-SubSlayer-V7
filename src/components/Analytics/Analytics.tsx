import React from 'react';
import { TrendingUp, DollarSign, Calendar, PieChart } from 'lucide-react';
import StatsCard from '../Dashboard/StatsCard';
import SpendingChart from '../Dashboard/SpendingChart';
import CategoryChart from './CategoryChart';
import { Subscription, SpendingData, CategoryData } from '../../types/subscription';

interface AnalyticsProps {
  subscriptions: Subscription[];
  spendingData: SpendingData[];
  categoryData: CategoryData[];
}

const Analytics: React.FC<AnalyticsProps> = ({ subscriptions, spendingData, categoryData }) => {
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

  const mostExpensiveCategory = categoryData.reduce((max, current) => 
    current.value > max.value ? current : max, categoryData[0] || { name: 'N/A', value: 0, color: '#8B5CF6' }
  );

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Deep insights into your subscription spending patterns</p>
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
        <SpendingChart data={spendingData} />
        <CategoryChart data={categoryData} />
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Subscription Breakdown</h3>
        <div className="space-y-4">
          {activeSubscriptions
            .sort((a, b) => {
              const aCost = a.billingCycle === 'monthly' ? a.cost : a.cost / 12;
              const bCost = b.billingCycle === 'monthly' ? b.cost : b.cost / 12;
              return bCost - aCost;
            })
            .map((subscription) => {
              const monthlyCost = subscription.billingCycle === 'monthly' ? subscription.cost : subscription.cost / 12;
              const percentage = (monthlyCost / monthlyTotal * 100).toFixed(1);
              
              return (
                <div key={subscription.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                      style={{ backgroundColor: subscription.color || '#8B5CF6' }}
                    >
                      {subscription.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{subscription.name}</h4>
                      <p className="text-sm text-gray-600">{subscription.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${monthlyCost.toFixed(2)}/mo</p>
                    <p className="text-sm text-gray-600">{percentage}% of total</p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Analytics;