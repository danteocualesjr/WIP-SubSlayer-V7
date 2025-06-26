import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  gradient: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  gradient
}) => {
  const changeColorClass = {
    positive: 'text-emerald-600 bg-emerald-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50'
  }[changeType];

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 hover:scale-105 transform group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-3">{title}</p>
          <p className="text-4xl font-bold text-gray-900 mb-3">{value}</p>
          {change && (
            <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${changeColorClass}`}>
              {change}
            </div>
          )}
        </div>
        <div className={`w-16 h-16 rounded-2xl ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;