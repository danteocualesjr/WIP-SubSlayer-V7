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
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-2xl font-bold text-gray-900">Monthly Spending Trend</h3>
            <span className="text-purple-600 font-medium">Last 6 months</span>
          </div>
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
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-2xl font-bold text-gray-900">Monthly Spending Trend</h3>
            <span className="text-purple-600 font-medium">Last 6 months</span>
          </div>
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-4 min-w-[160px]">
          <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-purple-600"></div>
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
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="none" stroke="#f1f5f9" horizontal={true} vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#9ca3af"
              fontSize={14}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#9ca3af"
              fontSize={14}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
              domain={[0, 'dataMax + 20']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#a855f7"
              strokeWidth={3}
              fill="url(#colorGradient)"
              dot={false}
              activeDot={{ r: 6, fill: '#a855f7', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="none" stroke="#f1f5f9" horizontal={true} vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#9ca3af"
              fontSize={14}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#9ca3af"
              fontSize={14}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
              domain={[0, 'dataMax + 20']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="amount" 
              fill="#a855f7"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header with Chart Type Toggle */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-2xl font-bold text-gray-900">Monthly Spending Trend</h3>
          <span className="text-purple-600 font-medium">Last 6 months</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SpendingChart;