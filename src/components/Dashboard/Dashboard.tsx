import React from 'react';
import { DollarSign, TrendingUp, CreditCard, Calendar } from 'lucide-react';
import StatsCard from './StatsCard';
import SpendingChart from './SpendingChart';
import UpcomingRenewals from './UpcomingRenewals';
import { Subscription, SpendingData } from '../../types/subscription';

interface DashboardProps {
  subscriptions: Subscription[];
  spendingData: SpendingData[];
}

const Dashboard: React.FC<DashboardProps> = ({ subscriptions, spendingData }) => {
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-emerald-500 rounded-3xl p-8 text-white">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Welcome back to SubSlayer</h1>
          <p className="text-xl text-white/90 mb-6">
            Take control of your subscriptions and maximize your savings
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
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
              <p className="text-white/80 text-sm font-medium">Monthly Change</p>
              <p className="text-2xl font-bold">
                {Number(spendingChange) >= 0 ? '+' : ''}{spendingChange}%
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-white/80 text-sm font-medium">Upcoming Renewals</p>
              <p className="text-2xl font-bold">{upcomingRenewalsCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Monthly Total"
          value={`$${monthlyTotal.toFixed(2)}`}
          change={`${Number(spendingChange) >= 0 ? '+' : ''}${spendingChange}%`}
          changeType={Number(spendingChange) >= 0 ? 'negative' : 'positive'}
          icon={DollarSign}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatsCard
          title="Annual Projection"
          value={`$${annualTotal.toFixed(2)}`}
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatsCard
          title="Active Subscriptions"
          value={activeSubscriptions.length.toString()}
          icon={CreditCard}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
        <StatsCard
          title="Avg. Cost per Service"
          value={
            activeSubscriptions.length > 0
              ? `$${(monthlyTotal / activeSubscriptions.length).toFixed(2)}`
              : '$0.00'
          }
          icon={Calendar}
          gradient="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>

      {/* Charts and Upcoming Renewals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SpendingChart data={spendingData} />
        <UpcomingRenewals subscriptions={subscriptions} />
      </div>
    </div>
  );
};

export default Dashboard;