import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon, Sparkles, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { CategoryData } from '../../types/subscription';

interface CategoryChartProps {
  data: CategoryData[];
}

const CategoryChart: React.FC<CategoryChartProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(new Set());

  const toggleCategoryVisibility = (categoryName: string) => {
    const newHidden = new Set(hiddenCategories);
    if (newHidden.has(categoryName)) {
      newHidden.delete(categoryName);
    } else {
      newHidden.add(categoryName);
    }
    setHiddenCategories(newHidden);
  };

  const visibleData = data.filter(item => !hiddenCategories.has(item.name));
  const totalAmount = visibleData.reduce((sum, item) => sum + item.value, 0);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices smaller than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const isActive = activeIndex === index;

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={isActive ? 14 : 12}
        fontWeight="700"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          transition: 'all 0.3s ease'
        }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalAmount) * 100).toFixed(1);
      
      return (
        <div className="bg-white/95 backdrop-blur-xl border border-purple-200/50 rounded-2xl shadow-2xl p-6 min-w-[200px]">
          <div className="flex items-center space-x-3 mb-3">
            <div 
              className="w-4 h-4 rounded-full shadow-lg" 
              style={{ backgroundColor: data.color }}
            ></div>
            <p className="text-sm font-semibold text-gray-900">{data.name}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Amount:</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                ${data.value.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Percentage:</span>
              <span className="text-lg font-bold text-gray-900">{percentage}%</span>
            </div>
            <div className="h-px bg-gradient-to-r from-purple-200 to-violet-200"></div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">of total spending</span>
              <span className="font-medium text-gray-700">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
    setHoveredCategory(visibleData[index]?.name || null);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
    setHoveredCategory(null);
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Spending by Category</h3>
              <p className="text-gray-600">Distribution of your subscription costs</p>
            </div>
          </div>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <PieChartIcon className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No category data available</h4>
            <p className="text-gray-500">Add subscriptions with categories to see the breakdown</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 group">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Spending by Category</h3>
            <p className="text-gray-600">Distribution of your subscription costs</p>
          </div>
        </div>
        
        {/* Total Amount Display */}
        <div className="text-right">
          <p className="text-sm text-gray-600 font-medium">Total Spending</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
            ${totalAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Chart Container with Enhanced Styling */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-violet-50/30 rounded-2xl"></div>
        <div className="relative h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {visibleData.map((entry, index) => (
                  <filter key={`glow-${index}`} id={`glow-${index}`}>
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                ))}
              </defs>
              <Pie
                data={visibleData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={120}
                innerRadius={40}
                fill="#8884d8"
                dataKey="value"
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {visibleData.map((entry, index) => {
                  const isActive = activeIndex === index;
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke={isActive ? '#fff' : 'none'}
                      strokeWidth={isActive ? 3 : 0}
                      style={{
                        filter: isActive ? `url(#glow-${index})` : 'none',
                        transform: isActive ? 'scale(1.05)' : 'scale(1)',
                        transformOrigin: 'center',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                    />
                  );
                })}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Center Content */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center bg-white/80 backdrop-blur-sm rounded-full p-4 shadow-lg">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-900">{visibleData.length}</p>
            <p className="text-xs text-gray-600">Categories</p>
          </div>
        </div>
      </div>

      {/* Interactive Legend */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Categories</h4>
          <p className="text-sm text-gray-500">Click to show/hide</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.map((entry, index) => {
            const isHidden = hiddenCategories.has(entry.name);
            const isHovered = hoveredCategory === entry.name;
            const percentage = ((entry.value / totalAmount) * 100).toFixed(1);
            
            return (
              <button
                key={entry.name}
                onClick={() => toggleCategoryVisibility(entry.name)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 text-left ${
                  isHidden 
                    ? 'bg-gray-50 border-gray-200 opacity-50' 
                    : isHovered
                      ? 'bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 shadow-lg scale-105'
                      : 'bg-gradient-to-r from-gray-50 to-white border-gray-200 hover:border-purple-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full shadow-lg transition-all duration-300 ${
                        isHovered ? 'scale-125' : 'scale-100'
                      }`}
                      style={{ backgroundColor: isHidden ? '#d1d5db' : entry.color }}
                    />
                    {isHidden ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${isHidden ? 'text-gray-400' : 'text-gray-900'}`}>
                      {entry.name}
                    </p>
                    <p className={`text-sm ${isHidden ? 'text-gray-400' : 'text-gray-600'}`}>
                      {percentage}% of total
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className={`font-bold ${isHidden ? 'text-gray-400' : 'text-gray-900'}`}>
                    ${entry.value.toFixed(2)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Enhanced Footer with Insights */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-600 to-violet-600"></div>
              <span className="text-gray-600">Active categories</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gray-300"></div>
              <span className="text-gray-600">Hidden: {hiddenCategories.size}</span>
            </div>
          </div>
          <div className="text-gray-500">
            Largest: {data.length > 0 ? data.reduce((max, current) => current.value > max.value ? current : max).name : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryChart;