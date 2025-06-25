import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Subscription } from '../../types/subscription';

interface CalendarViewProps {
  subscriptions: Subscription[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ subscriptions }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getSubscriptionsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
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
          className={`h-24 border border-gray-100 p-2 transition-all duration-200 ${
            isCurrentDay 
              ? 'bg-purple-50 border-purple-200' 
              : isPast 
                ? 'bg-gray-50' 
                : 'bg-white hover:bg-gray-50'
          }`}
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
            {daySubscriptions.slice(0, 2).map((subscription, index) => (
              <div
                key={subscription.id}
                className="text-xs px-2 py-1 rounded-md text-white font-medium truncate"
                style={{ backgroundColor: subscription.color || '#8B5CF6' }}
                title={`${subscription.name} - $${subscription.cost}`}
              >
                {subscription.name}
              </div>
            ))}
            {daySubscriptions.length > 2 && (
              <div className="text-xs text-gray-500 px-2">
                +{daySubscriptions.length - 2} more
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
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
            </div>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              Today
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Month Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Renewals This Month</p>
            <p className="text-2xl font-bold text-purple-600">{totalRenewalsThisMonth}</p>
          </div>
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-emerald-600">${totalAmountThisMonth.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Average per Renewal</p>
            <p className="text-2xl font-bold text-orange-600">
              ${totalRenewalsThisMonth > 0 ? (totalAmountThisMonth / totalRenewalsThisMonth).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-0 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-600 bg-gray-50 border border-gray-100">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
          {renderCalendarDays()}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-100 border border-purple-200 rounded"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-600 rounded"></div>
            <span>Subscription Renewal</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
            <span>Past Date</span>
          </div>
        </div>
      </div>

      {/* Upcoming Renewals List for Current Month */}
      {totalRenewalsThisMonth > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Renewals in {monthNames[currentDate.getMonth()]}
          </h3>
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
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                      isUrgent 
                        ? 'bg-red-50 border-red-200' 
                        : isPast 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                        style={{ backgroundColor: subscription.color || '#8B5CF6' }}
                      >
                        {subscription.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{subscription.name}</h4>
                        <p className="text-sm text-gray-600">
                          {renewalDate.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-gray-900">
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
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Renewals in {monthNames[currentDate.getMonth()]}
          </h3>
          <p className="text-gray-600">
            You don't have any subscription renewals scheduled for this month.
          </p>
        </div>
      )}
    </div>
  );
};

export default CalendarView;