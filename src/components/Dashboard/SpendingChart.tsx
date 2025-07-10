import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, Activity, Zap } from 'lucide-react';
import { SpendingData } from '../../types/subscription';

interface SpendingChartProps {
  data: SpendingData[];
  loading?: boolean;
}

const SpendingChart: React.FC<SpendingChartProps> = ({ data, loading = false }) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300">
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Monthly Spending Trend</h3>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
            <p className="text-gray-500 font-medium">Loading spending data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300">
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Monthly Spending Trend</h3>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <Activity className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No spending data available</h4>
            <p className="text-gray-500">Add some subscriptions to see your spending trends</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total and average
  const totalSpent = data.reduce((sum, item) => sum + item.amount, 0);
  const averageSpending = totalSpent / data.length;
  const highestMonth = Math.max(...data.map(item => item.amount));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-xl border border-purple-200/50 rounded-2xl shadow-2xl p-6 min-w-[200px]">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 shadow-lg"></div>
            <p className="text-sm font-semibold text-gray-900">{label}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Amount:</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                ${payload[0].value.toFixed(2)}
              </span>
            </div>
            <div className="h-px bg-gradient-to-r from-purple-200 to-violet-200"></div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">vs Average:</span>
              <span className={`font-medium ${payload[0].value > averageSpending ? 'text-red-500' : 'text-green-500'}`}>
                {payload[0].value > averageSpending ? '+' : ''}
                ${(payload[0].value - averageSpending).toFixed(2)}
              </span>
            </div>
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
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                <stop offset="50%" stopColor="#3B82F6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="50%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#f1f5f9" 
              strokeOpacity={0.6}
              vertical={false}
            />
            <XAxis 
              dataKey="month" 
              stroke="#64748b"
              fontSize={12}
              fontWeight={500}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              fontWeight={500}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="url(#lineGradient)"
              strokeWidth={4}
              fill="url(#colorGradient)"
              dot={{ 
                fill: '#8B5CF6', 
                strokeWidth: 3, 
                r: 6,
                stroke: '#fff',
                filter: 'url(#glow)'
              }}
              activeDot={{ 
                r: 8, 
                fill: '#8B5CF6', 
                stroke: '#fff', 
                strokeWidth: 3,
                filter: 'url(#glow)',
                style: { cursor: 'pointer' }
              }}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="50%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#f1f5f9" 
              strokeOpacity={0.6}
              vertical={false}
            />
            <XAxis 
              dataKey="month" 
              stroke="#64748b"
              fontSize={12}
              fontWeight={500}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              fontWeight={500}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="amount" 
              fill="url(#barGradient)"
              radius={[12, 12, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 group">
      {/* Enhanced Header with Metrics */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Monthly Spending Trend</h3>
        </div>
        
        {/* Chart Type Selector - Icons Only */}
        <div className="flex bg-gray-100 rounded-2xl p-1.5 shadow-inner">
          <button
            onClick={() => setChartType('area')}
            className={`p-3 rounded-xl transition-all duration-200 ${
              chartType === 'area'
                ? 'bg-white text-purple-600 shadow-lg scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
            title="Area Chart"
          >
            <Zap className="w-4 h-4" />
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`p-3 rounded-xl transition-all duration-200 ${
              chartType === 'bar'
                ? 'bg-white text-purple-600 shadow-lg scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
            title="Bar Chart"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chart Container with Enhanced Styling */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-violet-50/30 rounded-2xl"></div>
        <div className="relative h-60 sm:h-80 p-4 overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Enhanced Footer with Insights */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-600 to-violet-600"></div>
              <span className="text-gray-600">Monthly spending</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gray-300"></div>
              <span className="text-gray-600">Average: ${averageSpending.toFixed(2)}</span>
            </div>
          </div>
          <div className="text-gray-500">
            Peak: ${highestMonth.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpendingChart;