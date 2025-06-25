import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, Activity, Zap } from 'lucide-react';
import { SpendingData } from '../../types/subscription';

interface SpendingChartProps {
  data: SpendingData[];
  loading?: boolean;
}

const SpendingChart: React.FC<SpendingChartProps> = ({ data, loading = false }) => {
  const [chartType, setChartType] = useState<'area' | 'line' | 'bar'>('area');

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Spending Trend</h3>
          <p className="text-sm text-gray-600">Track your subscription costs over time</p>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Spending Trend</h3>
          <p className="text-sm text-gray-600">Track your subscription costs over time</p>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No spending data available</p>
            <p className="text-sm text-gray-400">Add some subscriptions to see your spending trends</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate trend metrics
  const currentMonth = data[data.length - 1]?.amount || 0;
  const previousMonth = data[data.length - 2]?.amount || 0;
  const changeAmount = currentMonth - previousMonth;
  const changePercentage = previousMonth > 0 ? ((changeAmount / previousMonth) * 100) : 0;
  const isPositive = changeAmount >= 0;

  // Calculate total and average
  const totalSpent = data.reduce((sum, item) => sum + item.amount, 0);
  const averageSpending = totalSpent / data.length;
  const highestMonth = Math.max(...data.map(item => item.amount));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-4 min-w-[160px]">
          <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-600"></div>
            <span className="text-sm text-gray-600">Amount:</span>
            <span className="text-lg font-bold text-gray-900">${payload[0].value.toFixed(2)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
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
            <Area
              type="monotone"
              dataKey="amount"
              stroke="url(#lineGradient)"
              strokeWidth={3}
              fill="url(#colorGradient)"
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: '#8B5CF6', stroke: '#fff', strokeWidth: 2 }}
            />
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </AreaChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
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
              dataKey="amount" 
              stroke="url(#lineGradient)" 
              strokeWidth={4}
              dot={{ fill: '#8B5CF6', strokeWidth: 3, r: 6 }}
              activeDot={{ r: 8, fill: '#8B5CF6', stroke: '#fff', strokeWidth: 3 }}
            />
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
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
            <Bar 
              dataKey="amount" 
              fill="url(#barGradient)"
              radius={[8, 8, 0, 0]}
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </BarChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header with Chart Type Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Spending Trend</h3>
          <p className="text-sm text-gray-600">Track your subscription costs over time</p>
        </div>
        
        {/* Chart Type Selector */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setChartType('area')}
            className={`p-2 rounded-lg transition-all duration-200 ${
              chartType === 'area'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Area Chart"
          >
            <Zap className="w-4 h-4" />
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`p-2 rounded-lg transition-all duration-200 ${
              chartType === 'line'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Line Chart"
          >
            <Activity className="w-4 h-4" />
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`p-2 rounded-lg transition-all duration-200 ${
              chartType === 'bar'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Bar Chart"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <p className="text-sm font-medium text-gray-700">This Month</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">${currentMonth.toFixed(2)}</p>
          <div className="flex items-center space-x-1 mt-1">
            {isPositive ? (
              <TrendingUp className="w-3 h-3 text-red-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-green-500" />
            )}
            <span className={`text-xs font-medium ${isPositive ? 'text-red-600' : 'text-green-600'}`}>
              {isPositive ? '+' : ''}{changePercentage.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-700 mb-1">Average</p>
          <p className="text-2xl font-bold text-emerald-600">${averageSpending.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">per month</p>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-700 mb-1">Highest</p>
          <p className="text-2xl font-bold text-orange-600">${highestMonth.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">peak spending</p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-700 mb-1">Total</p>
          <p className="text-2xl font-bold text-blue-600">${totalSpent.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">all time</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isPositive ? 'bg-red-100' : 'bg-green-100'
            }`}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-red-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-green-600" />
              )}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Monthly Change</h4>
              <p className="text-sm text-gray-600">
                {isPositive ? 'Increased' : 'Decreased'} by ${Math.abs(changeAmount).toFixed(2)} 
                ({Math.abs(changePercentage).toFixed(1)}%) from last month
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Spending Pattern</h4>
              <p className="text-sm text-gray-600">
                {currentMonth > averageSpending 
                  ? `${((currentMonth / averageSpending - 1) * 100).toFixed(0)}% above average`
                  : `${((1 - currentMonth / averageSpending) * 100).toFixed(0)}% below average`
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpendingChart;