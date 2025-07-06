import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, DollarSign, Clock, Info, CreditCard } from 'lucide-react';
import { Subscription } from '../../types/subscription';
import { useSettings } from '../../hooks/useSettings';

interface CalendarViewProps {
  subscriptions: Subscription[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ subscriptions }) => {
  const { formatDate } = useSettings();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [tooltipInfo, setTooltipInfo] = useState<{
    visible: boolean;
    x: number;
    y: number;
    date: Date | null;
    subscriptions: Subscription[];
  }>({
    visible: false,
    x: 0,
    y: 0,
    date: null,
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

  const goToToday = () => {
    setCurrentDate(new Date());
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
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setTooltipInfo({
        visible: true,
        x: rect.left + rect.width / 2,
        y: rect.top,
        date: date,
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
        <div key={`empty-${i}`} className="h-24 bg-gray-50 border border-gray-100"></div>
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const daySubscriptions = getSubscriptionsForDate(date);
      const isCurrentDay = isToday(date);
      const isPast = isPastDate(date);

      days.push(
        <div
          key={day}
          className={`h-24 border border-gray-100 p-2 transition-all duration-200 relative ${
            isCurrentDay 
              ? 'bg-purple-50 border-purple-200' 
              : isPast 
                ? 'bg-gray-50' 
                : 'bg-white hover:bg-gray-50'
          }`}
          onMouseEnter={(e) => handleDayMouseEnter(e, date)}
          onMouseLeave={handleDayMouseLeave}
        >
          <div className={`text-sm font-medium mb-1 ${
            isCurrentDay 
              ? 'text-purple-700' 
              : isPast 
                ? 'text-gray-400' 
                : 'text-gray-900'
          }`}>
            {day}
          </div>
          
          <div className="space-y-1">
            {daySubscriptions.slice(0, 3).map((subscription, index) => (
              <div
                key={subscription.id}
                className="text-xs px-2 py-1 rounded-md text-white font-medium truncate"
                style={{ backgroundColor: subscription.color || '#8B5CF6' }}
                title={`${subscription.name} - $${subscription.cost}`}
              >
                {subscription.name}
              </div>
            ))}
            {daySubscriptions.length > 3 && (
              <div className="text-xs text-gray-500 px-2">
                +{daySubscriptions.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-purple-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-purple-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
              <CalendarIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-800 to-violet-700 bg-clip-text text-transparent">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <p className="text-gray-600">Subscription renewal calendar</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors font-medium shadow-sm"
            >
              Today
            </button>
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Month Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-5 border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 transform">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center shadow-md">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-gray-600 font-medium">Renewals</p>
            </div>
            <p className="text-3xl font-bold text-purple-600">{totalRenewalsThisMonth}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 transform">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-md">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-gray-600 font-medium">Total Amount</p>
            </div>
            <p className="text-3xl font-bold text-emerald-600">${totalAmountThisMonth.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-5 border border-orange-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 transform">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md">
                <Info className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-gray-600 font-medium">Average</p>
            </div>
            <p className="text-3xl font-bold text-orange-600">
              ${totalRenewalsThisMonth > 0 ? (totalAmountThisMonth / totalRenewalsThisMonth).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-0 mb-3">
          {dayNames.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-bold text-gray-700 bg-gray-50/70 border-b-2 border-gray-100">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {renderCalendarDays()}
        </div>

        {/* Legend */}
        <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-gray-600 bg-gray-50 py-4 px-6 rounded-xl">
          <div className="flex items-center space-x-2 group">
            <div className="w-4 h-4 bg-purple-100 border border-purple-200 rounded-lg group-hover:scale-125 transition-transform"></div>
            <span className="font-semibold">Today</span>
          </div>
          <div className="flex items-center space-x-2 group">
            <div className="w-4 h-4 bg-purple-500 rounded-full shadow-sm group-hover:scale-125 transition-transform"></div>
            <span className="font-semibold">Subscription Renewal</span>
          </div>
          <div className="flex items-center space-x-2 group">
            <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded-lg group-hover:scale-125 transition-transform"></div>
            <span className="font-semibold">Past Date</span>
          </div>
        </div>
      </div>

      {/* Tooltip for subscription details */}
      {tooltipInfo.visible && tooltipInfo.date && (
        <div 
          className="fixed z-50 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-purple-200 p-5 w-80 max-h-96 overflow-y-auto"
          style={{ 
            left: tooltipInfo.x,
            top: tooltipInfo.y - 10,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-bold text-gray-900">
              {tooltipInfo.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </h4>
            <span className="text-xs font-semibold px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
              {tooltipInfo.subscriptions.length} renewals
            </span>
          </div>
          
          <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
            {tooltipInfo.subscriptions.map((subscription) => (
              <div 
                key={subscription.id} 
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-100 shadow-sm"
              >
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-xs shadow-md"
                    style={{ backgroundColor: subscription.color || '#8B5CF6' }}
                  >
                    {subscription.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{subscription.name}</p>
                    <p className="text-xs text-gray-500 font-medium">{subscription.category || 'Uncategorized'}</p>
                  </div>
                </div>
                <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">${subscription.cost.toFixed(2)}</span>
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

      {/* Upcoming Renewals List for Current Month */}
      {totalRenewalsThisMonth > 0 && (
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Renewals in {monthNames[currentDate.getMonth()]}
            </h3>
          </div>
          <div className="space-y-3">
            {subscriptions
              .filter(sub => {
                const renewalDate = new Date(sub.nextBilling);
                return renewalDate.getMonth() === currentDate.getMonth() &&
                       renewalDate.getFullYear() === currentDate.getFullYear() &&
                       sub.status === 'active';
              })
              .sort((a, b) => new Date(a.nextBilling).getTime() - new Date(b.nextBilling).getTime())
              .map((subscription) => {
                const renewalDate = new Date(subscription.nextBilling);
                const today = new Date();
                const daysUntil = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const isUrgent = daysUntil <= 3 && daysUntil >= 0;
                const isPast = daysUntil < 0;

                return (
                  <div
                    key={subscription.id}
                    className={`flex items-center justify-between p-5 rounded-xl border transition-all duration-200 ${
                      isUrgent 
                        ? 'bg-red-50 border-red-200 shadow-md' 
                        : isPast 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-md"
                        style={{ backgroundColor: subscription.color || '#8B5CF6' }}
                      >
                        {subscription.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{subscription.name}</h4>
                        <p className="text-sm text-gray-600 font-medium">
                          {formatDate(subscription.nextBilling)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                        ${subscription.cost.toFixed(2)}
                      </span>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isPast 
                          ? 'bg-gray-200 text-gray-600' 
                          : isUrgent 
                            ? 'bg-red-100 text-red-700' 
                            : daysUntil <= 7 
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                      }`}>
                        {isPast 
                          ? `${Math.abs(daysUntil)} days ago` 
                          : daysUntil === 0 
                            ? 'Today' 
                            : `${daysUntil} days`
                        }
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalRenewalsThisMonth === 0 && (
        <div className="bg-white rounded-3xl p-12 shadow-lg border border-purple-100/50 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CalendarIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            No Renewals in {monthNames[currentDate.getMonth()]}
          </h3>
          <p className="text-gray-600 text-lg max-w-md mx-auto">
            You don't have any subscription renewals scheduled for this month.
          </p>
        </div>
      )}
    </div>
  );
};

export default CalendarView;