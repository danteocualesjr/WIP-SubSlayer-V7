import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, DollarSign, Clock } from 'lucide-react';
import { Subscription } from '../../types/subscription';
import { useSettings } from '../../hooks/useSettings';

interface MiniCalendarProps {
  subscriptions: Subscription[];
  onSwitchToCalendar?: () => void;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ subscriptions, onSwitchToCalendar }) => {
  const { formatCurrency, formatDate } = useSettings();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tooltipInfo, setTooltipInfo] = useState<{
    visible: boolean;
    x: number;
    y: number;
    date: Date;
    subscriptions: Subscription[];
  }>({
    visible: false,
    x: 0,
    y: 0,
    date: new Date(),
    subscriptions: []
  });

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getSubscriptionsForDate = (date: Date) => {
    // Format the date to YYYY-MM-DD format for comparison
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    return subscriptions.filter(sub => 
      sub.nextBilling === dateString && sub.status === 'active'
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDayMouseEnter = (e: React.MouseEvent, date: Date) => {
    const daySubscriptions = getSubscriptionsForDate(date);
    if (daySubscriptions.length > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipInfo({
        visible: true,
        x: rect.left + rect.width / 2,
        y: rect.top,
        date,
        subscriptions: daySubscriptions
      });
    }
  };

  const handleDayMouseLeave = () => {
    setTooltipInfo(prev => ({ ...prev, visible: false }));
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-8 bg-gray-50/50 rounded-lg"></div>
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const daySubscriptions = getSubscriptionsForDate(date);
      const isCurrentDay = isToday(date);
      const isPast = isPastDate(date);

      const hasRenewals = daySubscriptions.length > 0;

      days.push(
        <div
          key={day}
          className={`h-8 flex items-center justify-center text-xs font-medium relative transition-all duration-200 rounded-lg cursor-default ${
            isCurrentDay 
              ? 'bg-purple-100 text-purple-700 shadow-sm' 
              : isPast 
                ? 'text-gray-400' 
                : hasRenewals ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-700'
          }`}
          onMouseEnter={hasRenewals ? (e) => handleDayMouseEnter(e, date) : undefined}
          onMouseLeave={hasRenewals ? handleDayMouseLeave : undefined}
        >
          {day}
          {hasRenewals && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full shadow-sm"></div>
          )}
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const totalRenewalsThisMonth = subscriptions.filter(sub => {
    const renewalDate = new Date(sub.nextBilling);
    return renewalDate.getMonth() === currentDate.getMonth() &&
           renewalDate.getFullYear() === currentDate.getFullYear() &&
           sub.status === 'active';
  }).length;

  const totalAmountThisMonth = subscriptions
    .filter(sub => {
      const renewalDate = new Date(sub.nextBilling);
      return renewalDate.getMonth() === currentDate.getMonth() &&
             renewalDate.getFullYear() === currentDate.getFullYear() &&
             sub.status === 'active';
    })
    .reduce((sum, sub) => sum + sub.cost, 0);

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 group overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-purple-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-purple-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
      
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <CalendarIcon className="w-5 h-5 text-white" />
          </div>
          <h4 className="text-xl font-bold bg-gradient-to-r from-purple-800 to-violet-700 bg-clip-text text-transparent">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h4>
        </div>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Month Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-4 border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 transform">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center shadow-md">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs text-gray-600 font-medium">Renewals</p>
          </div>
          <p className="text-3xl font-bold text-purple-600">{totalRenewalsThisMonth}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 transform">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center shadow-md">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs text-gray-600 font-medium">Amount</p>
          </div>
          <p className="text-3xl font-bold text-emerald-600">${totalAmountThisMonth.toFixed(2)}</p>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {dayNames.map((day, index) => (
          <div key={index} className="text-center text-xs font-bold text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-8">
        {renderCalendarDays()}
      </div>
      
      {/* Tooltip for subscription renewals */}
      {tooltipInfo.visible && (
        <div 
          className="fixed z-50 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-purple-200 p-4 w-72 max-h-96 overflow-y-auto"
          style={{ 
            left: tooltipInfo.x,
            top: tooltipInfo.y - 10,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-bold text-gray-900">
              {tooltipInfo.date.toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </h4>
            <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
              {tooltipInfo.subscriptions.length}
            </span>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {tooltipInfo.subscriptions.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-100 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-semibold shadow-md"
                    style={{ backgroundColor: sub.color || '#8B5CF6' }}
                  >
                    {sub.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{sub.name}</p>
                    <p className="text-xs text-gray-500 font-medium">{sub.category || 'Uncategorized'}</p>
                  </div>
                </div>
                <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">${sub.cost.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Total</span>
            <span className="text-base font-bold text-purple-700">
              ${tooltipInfo.subscriptions.reduce((sum, sub) => sum + sub.cost, 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center space-x-8 text-xs text-gray-600 bg-gray-50 py-3 px-4 rounded-xl">
        <div className="flex items-center space-x-2 group">
          <div className="w-4 h-4 bg-purple-100 border border-purple-200 rounded-lg group-hover:scale-125 transition-transform"></div>
          <span className="font-semibold">Today</span>
        </div>
        <div className="flex items-center space-x-2 group">
          <div className="w-4 h-4 bg-purple-500 rounded-full shadow-sm group-hover:scale-125 transition-transform"></div>
          <span className="font-semibold">Renewal</span>
        </div>
      </div>
    </div>
  );
};

export default MiniCalendar;