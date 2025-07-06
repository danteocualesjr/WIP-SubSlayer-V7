import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Subscription } from '../../types/subscription';
import { useSettings } from '../../hooks/useSettings';

interface MiniCalendarProps {
  subscriptions: Subscription[];
  onSwitchToCalendar?: () => void;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ subscriptions, onSwitchToCalendar }) => {
  const { formatCurrency } = useSettings();
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
    <div className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 group">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <CalendarIcon className="w-5 h-5 text-white" />
          </div>
          <h4 className="text-lg font-bold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h4>
        </div>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Month Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-4 border border-purple-100">
          <p className="text-xs text-gray-600 mb-1 font-medium">Renewals</p>
          <p className="text-2xl font-bold text-purple-600">{totalRenewalsThisMonth}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-100">
          <p className="text-xs text-gray-600 mb-1 font-medium">Amount</p>
          <p className="text-2xl font-bold text-emerald-600">${totalAmountThisMonth.toFixed(2)}</p>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {dayNames.map((day, index) => (
          <div key={index} className="text-center text-xs font-semibold text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {renderCalendarDays()}
      </div>
      
      {/* Tooltip for subscription renewals */}
      {tooltipInfo.visible && (
        <div 
          className="fixed z-50 bg-white rounded-xl shadow-xl border border-purple-100 p-3 w-64 max-h-80 overflow-y-auto"
          style={{ 
            left: tooltipInfo.x,
            top: tooltipInfo.y - 10,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center justify-between">
            <span>Renewals on {tooltipInfo.date.toLocaleDateString()}</span>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              {tooltipInfo.subscriptions.length}
            </span>
          </h4>
          <div className="space-y-3">
            {tooltipInfo.subscriptions.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-8 h-8 rounded-md flex items-center justify-center text-white text-xs font-semibold"
                    style={{ backgroundColor: sub.color || '#8B5CF6' }}
                  >
                    {sub.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{sub.name}</p>
                    <p className="text-xs text-gray-500">{sub.category || 'Uncategorized'}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-900">${sub.cost.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
            <span className="text-sm text-gray-600">Total</span>
            <span className="text-sm font-bold text-purple-700">
              ${tooltipInfo.subscriptions.reduce((sum, sub) => sum + sub.cost, 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 text-xs text-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-100 border border-purple-200 rounded-lg"></div>
          <span className="font-medium">Today</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full shadow-sm"></div>
          <span className="font-medium">Renewal</span>
        </div>
      </div>
    </div>
  );
};

export default MiniCalendar;