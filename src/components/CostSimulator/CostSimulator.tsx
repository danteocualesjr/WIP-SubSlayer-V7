import React, { useState } from 'react';
import { Calculator, TrendingDown, DollarSign, Calendar, PieChart, BarChart3, Target, Zap, Star, ArrowRight } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { Subscription } from '../../types/subscription';

interface CostSimulatorProps {
  subscriptions: Subscription[];
}

const CostSimulator: React.FC<CostSimulatorProps> = ({ subscriptions }) => {
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>([]);
  const [simulationPeriod, setSimulationPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');

  const toggleSubscription = (id: string) => {
    setSelectedSubscriptions(prev =>
      prev.includes(id)
        ? prev.filter(subId => subId !== id)
        : [...prev, id]
    );
  };

  const currentTotalMonthly = activeSubscriptions.reduce((sum, sub) => {
    const monthlyCost = sub.billingCycle === 'monthly' ? sub.cost : sub.cost / 12;
    return sum + monthlyCost;
  }, 0);

  const potentialSavingsMonthly = selectedSubscriptions.reduce((sum, id) => {
    const subscription = activeSubscriptions.find(sub => sub.id === id);
    if (!subscription) return sum;
    const monthlyCost = subscription.billingCycle === 'monthly' ? subscription.cost : subscription.cost / 12;
    return sum + monthlyCost;
  }, 0);

  const newTotalMonthly = currentTotalMonthly - potentialSavingsMonthly;
  const currentTotalAnnual = currentTotalMonthly * 12;
  const potentialSavingsAnnual = potentialSavingsMonthly * 12;
  const newTotalAnnual = newTotalMonthly * 12;

  const savingsPercentage = currentTotalMonthly > 0 
    ? ((potentialSavingsMonthly / currentTotalMonthly) * 100).toFixed(1)
    : '0';

  // Prepare data for charts
  const pieChartData = [
    {
      name: 'Remaining Subscriptions',
      value: newTotalMonthly,
      color: '#10B981',
      fill: '#10B981'
    },
    {
      name: 'Potential Savings',
      value: potentialSavingsMonthly,
      color: '#EF4444',
      fill: '#EF4444'
    }
  ];

  // Category breakdown for savings
  const categoryBreakdown = selectedSubscriptions.reduce((acc, id) => {
    const subscription = activeSubscriptions.find(sub => sub.id === id);
    if (!subscription) return acc;
    
    const category = subscription.category || 'Uncategorized';
    const monthlyCost = subscription.billingCycle === 'monthly' ? subscription.cost : subscription.cost / 12;
    
    if (!acc[category]) {
      acc[category] = { category, amount: 0, count: 0, subscriptions: [] };
    }
    
    acc[category].amount += monthlyCost;
    acc[category].count += 1;
    acc[category].subscriptions.push(subscription.name);
    
    return acc;
  }, {} as Record<string, { category: string; amount: number; count: number; subscriptions: string[] }>);

  const categoryData = Object.values(categoryBreakdown).map((item, index) => ({
    ...item,
    color: ['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#06B6D4', '#8B5CF6'][index % 6]
  }));

  // Timeline projection (next 12 months)
  const timelineData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() + i);
    return {
      month: month.toLocaleDateString('en-US', { month: 'short' }),
      current: currentTotalMonthly,
      withSavings: newTotalMonthly,
      savings: potentialSavingsMonthly
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-4 min-w-[200px]">
          <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-sm text-gray-600">{entry.name}:</span>
              <span className="text-sm font-bold text-gray-900">
                ${entry.value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-white rounded-full -translate-y-16 translate-x-16 sm:-translate-y-32 sm:translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-48 sm:h-48 bg-white rounded-full translate-y-12 -translate-x-12 sm:translate-y-24 sm:-translate-x-24"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300" />
            <h1 className="text-2xl sm:text-3xl font-bold">Cost Simulator</h1>
          </div>
          <p className="text-white/90 text-base sm:text-lg mb-6">
            Visualize your potential savings by simulating subscription cancellations
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5 text-yellow-300" />
                <p className="text-white/80 text-sm font-medium">Current Monthly</p>
              </div>
              <p className="text-2xl font-bold">${currentTotalMonthly.toFixed(2)}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingDown className="w-5 h-5 text-green-300" />
                <p className="text-white/80 text-sm font-medium">Potential Savings</p>
              </div>
              <p className="text-2xl font-bold">${potentialSavingsMonthly.toFixed(2)}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-blue-300" />
                <p className="text-white/80 text-sm font-medium">New Monthly</p>
              </div>
              <p className="text-2xl font-bold">${newTotalMonthly.toFixed(2)}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="w-5 h-5 text-purple-300" />
                <p className="text-white/80 text-sm font-medium">Savings %</p>
              </div>
              <p className="text-2xl font-bold">{savingsPercentage}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setViewMode('overview')}
            className={`px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
              viewMode === 'overview'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
              viewMode === 'detailed'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Detailed Analysis</span>
          </button>
        </div>
      </div>

      {/* Savings Visualizations */}
      {selectedSubscriptions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Savings Breakdown Pie Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100/50">
            <div className="flex items-center space-x-3 mb-6">
              <PieChart className="w-6 h-6 text-purple-500" />
              <h3 className="text-lg font-bold text-gray-900">Savings Breakdown</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-sm text-gray-700 font-medium">{value}</span>}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <p className="text-2xl font-bold text-red-600">${potentialSavingsMonthly.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Monthly savings potential</p>
            </div>
          </div>

          {/* 12-Month Projection */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100/50">
            <div className="flex items-center space-x-3 mb-6">
              <TrendingDown className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-bold text-gray-900">12-Month Projection</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="current" 
                    stroke="#EF4444" 
                    strokeWidth={3}
                    name="Current Spending"
                    dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="withSavings" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    name="With Savings"
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <p className="text-2xl font-bold text-green-600">${potentialSavingsAnnual.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Total annual savings</p>
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown (Detailed View) */}
      {viewMode === 'detailed' && categoryData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100/50">
          <div className="flex items-center space-x-3 mb-6">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-bold text-gray-900">Savings by Category</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bar Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="category" 
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="amount" 
                    fill="#8B5CF6"
                    radius={[4, 4, 0, 0]}
                    name="Monthly Savings"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Details */}
            <div className="space-y-4">
              {categoryData.map((category, index) => (
                <div 
                  key={category.category}
                  className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <h4 className="font-semibold text-gray-900">{category.category}</h4>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      ${category.amount.toFixed(2)}/mo
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{category.count} subscription{category.count !== 1 ? 's' : ''}</span>
                    <span>${(category.amount * 12).toFixed(2)}/year</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      {category.subscriptions.join(', ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Impact Summary */}
      {selectedSubscriptions.length > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-bold text-gray-900">Savings Impact</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white/50 rounded-xl">
              <p className="text-3xl font-bold text-green-600 mb-1">
                ${potentialSavingsMonthly.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Monthly Savings</p>
              <p className="text-xs text-gray-500 mt-1">
                That's {((potentialSavingsMonthly / currentTotalMonthly) * 100).toFixed(0)}% of your current spending
              </p>
            </div>
            
            <div className="text-center p-4 bg-white/50 rounded-xl">
              <p className="text-3xl font-bold text-green-600 mb-1">
                ${potentialSavingsAnnual.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Annual Savings</p>
              <p className="text-xs text-gray-500 mt-1">
                Enough for a nice vacation or emergency fund
              </p>
            </div>
            
            <div className="text-center p-4 bg-white/50 rounded-xl">
              <p className="text-3xl font-bold text-green-600 mb-1">
                {selectedSubscriptions.length}
              </p>
              <p className="text-sm text-gray-600">Subscriptions to Cancel</p>
              <p className="text-xs text-gray-500 mt-1">
                Simplify your digital life
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Selection */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Select Subscriptions to Cancel</h3>
          <button
            onClick={() => setSelectedSubscriptions([])}
            className="text-purple-600 hover:text-purple-700 font-medium text-sm"
          >
            Clear All
          </button>
        </div>

        {activeSubscriptions.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No active subscriptions to simulate</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSubscriptions.map((subscription) => {
              const isSelected = selectedSubscriptions.includes(subscription.id);
              const monthlyCost = subscription.billingCycle === 'monthly' ? subscription.cost : subscription.cost / 12;

              return (
                <div
                  key={subscription.id}
                  onClick={() => toggleSubscription(subscription.id)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isSelected
                      ? 'border-red-300 bg-red-50 shadow-md scale-105'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
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
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected ? 'bg-red-500 border-red-500' : 'border-gray-300'
                    }`}>
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Monthly cost:</span>
                    <span className={`font-semibold ${isSelected ? 'text-red-600' : 'text-gray-900'}`}>
                      ${monthlyCost.toFixed(2)}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="mt-2 text-xs text-red-600 font-medium">
                      Annual savings: ${(monthlyCost * 12).toFixed(2)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {selectedSubscriptions.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1 flex items-center space-x-2">
                <span>Ready to save ${potentialSavingsMonthly.toFixed(2)}/month?</span>
                <ArrowRight className="w-4 h-4 text-green-600" />
              </h4>
              <p className="text-sm text-gray-600">
                This simulation shows potential savings. You can proceed to cancel or modify your selected subscriptions.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedSubscriptions([])}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Reset
              </button>
              <button className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2">
                <span>Proceed with Cancellations</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostSimulator;