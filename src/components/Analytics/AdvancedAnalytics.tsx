import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Calendar, PieChart as PieChartIcon, Sparkles, Star, BarChart3, Target, Zap } from 'lucide-react';
import { Subscription, CategoryData } from '../../types/subscription';

interface AdvancedAnalyticsProps {
  subscriptions: Subscription[];
  categoryData: CategoryData[];
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ 
  subscriptions,
  categoryData
}) => {
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  
  // Calculate monthly vs annual distribution
  const billingCycleData = [
    { name: 'Monthly', value: activeSubscriptions.filter(sub => sub.billingCycle === 'monthly').length },
    { name: 'Annual', value: activeSubscriptions.filter(sub => sub.billingCycle === 'annual').length }
  ];

  // Calculate subscription cost distribution
  const getCostRanges = () => {
    const ranges = [
      { range: '$0-$5', min: 0, max: 5, count: 0 },
      { range: '$5-$10', min: 5, max: 10, count: 0 },
      { range: '$10-$20', min: 10, max: 20, count: 0 },
      { range: '$20-$50', min: 20, max: 50, count: 0 },
      { range: '$50+', min: 50, max: Infinity, count: 0 }
    ];

    activeSubscriptions.forEach(sub => {
      const monthlyCost = sub.billingCycle === 'monthly' ? sub.cost : sub.cost / 12;
      const range = ranges.find(r => monthlyCost >= r.min && monthlyCost < r.max);
      if (range) range.count++;
    });

    return ranges.map(r => ({ name: r.range, value: r.count }));
  };

  const costDistribution = getCostRanges();

  // Calculate renewal frequency
  const getUpcomingRenewals = () => {
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(now.getMonth() + 1);
    
    const days = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        count: 0
      });
    }
    
    activeSubscriptions.forEach(sub => {
      const renewalDate = new Date(sub.nextBilling);
      if (renewalDate >= now && renewalDate <= nextMonth) {
        const dayIndex = Math.floor((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (dayIndex >= 0 && dayIndex < 30) {
          days[dayIndex].count++;
        }
      }
    });
    
    return days.filter(day => day.count > 0).map(day => ({
      name: new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value: day.count
    }));
  };

  const renewalFrequency = getUpcomingRenewals();

  // Colors for charts
  const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#F97316'];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg border border-purple-100/50">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Advanced Analytics</h2>
            <p className="text-gray-600">Deeper insights into your subscription patterns</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Subscription Cost Distribution */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center shadow-md">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Cost Distribution</h3>
            </div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={60} />
                  <Tooltip 
                    formatter={(value: number) => [`${value} subscriptions`, 'Count']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '12px',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Billing Cycle Distribution */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Billing Cycle</h3>
            </div>
            <div className="h-60 flex items-center justify-center">
              {billingCycleData[0].value === 0 && billingCycleData[1].value === 0 ? (
                <div className="text-center">
                  <p className="text-gray-500">No active subscriptions</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={billingCycleData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {billingCycleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value} subscriptions`, 'Count']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '12px',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Renewal Frequency */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Renewal Frequency</h3>
            </div>
            <div className="h-60">
              {renewalFrequency.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">No upcoming renewals in the next 30 days</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={renewalFrequency}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip 
                      formatter={(value: number) => [`${value} renewals`, 'Count']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '12px',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Category Spending Comparison */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Category Spending</h3>
            </div>
            <div className="h-60">
              {categoryData.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">No category data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '12px',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg border border-purple-100/50">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">AI-Powered Insights</h2>
            <p className="text-gray-600">Smart recommendations based on your subscription patterns</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100 hover:shadow-lg transition-all duration-300">
            <h3 className="font-semibold text-gray-900 mb-3">Potential Savings</h3>
            <p className="text-gray-700 mb-4">
              Based on your subscription patterns, we've identified potential savings opportunities:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start space-x-2">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <span>Consider annual plans for frequently used services to save up to 17%</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <span>Review subscriptions with similar functionality to eliminate redundancies</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <span>Pause seasonal subscriptions when not in use</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 hover:shadow-lg transition-all duration-300">
            <h3 className="font-semibold text-gray-900 mb-3">Usage Optimization</h3>
            <p className="text-gray-700 mb-4">
              Maximize the value of your current subscriptions:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start space-x-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                </div>
                <span>Your highest spending category is {categoryData[0]?.name || 'Entertainment'}</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                </div>
                <span>Consider family or group plans for multiple subscriptions</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                </div>
                <span>Set calendar reminders for free trial expirations</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;