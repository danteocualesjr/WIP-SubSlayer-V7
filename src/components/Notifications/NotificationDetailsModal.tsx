import React from 'react';
import { X, Calendar, DollarSign, AlertTriangle, Clock, Bell, CheckCircle, Info } from 'lucide-react';
import { NotificationItem } from '../../hooks/useNotifications';
import { useSettings } from '../../hooks/useSettings';

interface NotificationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: NotificationItem | null;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const NotificationDetailsModal: React.FC<NotificationDetailsModalProps> = ({
  isOpen,
  onClose,
  notification,
  onMarkAsRead,
  onDelete
}) => {
  const { formatDate, formatCurrency } = useSettings();

  if (!isOpen || !notification) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleMarkAsRead = () => {
    if (onMarkAsRead && !notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(notification.id);
      onClose();
    }
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'renewal':
        return Calendar;
      case 'overdue':
        return AlertTriangle;
      case 'savings':
        return DollarSign;
      case 'digest':
        return Bell;
      default:
        return Info;
    }
  };

  const getNotificationColor = () => {
    switch (notification.type) {
      case 'renewal':
        return notification.urgent ? 'text-red-600 bg-red-100' : 'text-blue-600 bg-blue-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      case 'savings':
        return 'text-green-600 bg-green-100';
      case 'digest':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusBadge = () => {
    if (notification.urgent) {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <AlertTriangle className="w-3 h-3" />
          <span>Urgent</span>
        </span>
      );
    }
    
    if (!notification.read) {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          <Bell className="w-3 h-3" />
          <span>New</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle className="w-3 h-3" />
        <span>Read</span>
      </span>
    );
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const Icon = getNotificationIcon();

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000] p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor()}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Notification Details</h2>
              <p className="text-sm text-gray-500">{formatTimeAgo(notification.createdAt)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            {getStatusBadge()}
          </div>

          {/* Title */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{notification.title}</h3>
            <p className="text-gray-600 leading-relaxed">{notification.message}</p>
          </div>

          {/* Details */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm">Details</h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Type</p>
                <p className="font-medium text-gray-900 capitalize">{notification.type}</p>
              </div>
              
              <div>
                <p className="text-gray-500 mb-1">Created</p>
                <p className="font-medium text-gray-900">{formatDate(notification.createdAt)}</p>
              </div>
              
              {notification.subscriptionName && (
                <div className="col-span-2">
                  <p className="text-gray-500 mb-1">Subscription</p>
                  <p className="font-medium text-gray-900">{notification.subscriptionName}</p>
                </div>
              )}
              
              {notification.amount && (
                <div>
                  <p className="text-gray-500 mb-1">Amount</p>
                  <p className="font-medium text-gray-900">{formatCurrency(notification.amount)}</p>
                </div>
              )}
              
              {notification.daysUntil !== undefined && (
                <div>
                  <p className="text-gray-500 mb-1">Days Until Renewal</p>
                  <p className="font-medium text-gray-900">
                    {notification.daysUntil === 0 ? 'Today' : 
                     notification.daysUntil < 0 ? `${Math.abs(notification.daysUntil)} days overdue` :
                     `${notification.daysUntil} days`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Priority Indicator */}
          {notification.urgent && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-900 mb-1">High Priority</h4>
                  <p className="text-sm text-red-800">
                    This notification requires immediate attention. Please review your subscription renewal details.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-100 space-y-3">
          {!notification.read && (
            <button
              onClick={handleMarkAsRead}
              className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Mark as Read</span>
            </button>
          )}
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailsModal;