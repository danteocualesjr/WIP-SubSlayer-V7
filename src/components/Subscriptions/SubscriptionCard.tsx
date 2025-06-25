import React from 'react';
import { Calendar, DollarSign, MoreVertical, Pause, Trash2, Edit, Check } from 'lucide-react';
import { Subscription } from '../../types/subscription';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onDeleteClick?: (subscription: Subscription) => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onEdit,
  onDelete,
  onToggleStatus,
  isSelectionMode = false,
  isSelected = false,
  onSelect,
  onDeleteClick
}) => {
  const [showActions, setShowActions] = React.useState(false);

  const getDaysUntilRenewal = () => {
    const now = new Date();
    const renewalDate = new Date(subscription.nextBilling);
    const diffTime = renewalDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntil = getDaysUntilRenewal();
  const isUrgent = daysUntil <= 3;
  const isWarning = daysUntil <= 7 && daysUntil > 3;

  const handleCardClick = () => {
    if (isSelectionMode && onSelect) {
      onSelect(subscription.id);
    }
  };

  const handleDeleteClick = () => {
    if (onDeleteClick) {
      onDeleteClick(subscription);
    } else {
      onDelete(subscription.id);
    }
    setShowActions(false);
  };

  return (
    <div 
      className={`bg-white rounded-2xl p-6 shadow-sm border transition-all duration-300 relative ${
        isSelectionMode 
          ? `cursor-pointer ${isSelected ? 'border-purple-300 bg-purple-50 shadow-md' : 'border-gray-100 hover:border-gray-300'}`
          : 'border-gray-100 hover:shadow-md'
      }`}
      onClick={handleCardClick}
    >
      {/* Selection Checkbox */}
      {isSelectionMode && (
        <div className="absolute top-4 left-4">
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
            isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
          }`}>
            {isSelected && <Check className="w-3 h-3 text-white" />}
          </div>
        </div>
      )}

      {/* Actions Menu */}
      {!isSelectionMode && (
        <div className="absolute top-4 right-4">
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showActions && (
              <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 min-w-[140px]">
                <button
                  onClick={() => {
                    onEdit(subscription);
                    setShowActions(false);
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    onToggleStatus(subscription.id);
                    setShowActions(false);
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Pause className="w-4 h-4" />
                  <span>{subscription.status === 'active' ? 'Pause' : 'Resume'}</span>
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subscription Info */}
      <div className={`flex items-start space-x-4 mb-4 ${isSelectionMode ? 'ml-8' : ''}`}>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: subscription.color || '#8B5CF6' }}
        >
          {subscription.name.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{subscription.name}</h3>
          {subscription.description && (
            <p className="text-sm text-gray-600 mb-2">{subscription.description}</p>
          )}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-lg font-bold text-gray-900">
                {subscription.cost.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500">/{subscription.billingCycle}</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              subscription.status === 'active' 
                ? 'bg-green-100 text-green-700'
                : subscription.status === 'paused'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
            }`}>
              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Next Billing */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Next billing:</span>
          <span className="text-sm font-medium text-gray-900">
            {new Date(subscription.nextBilling).toLocaleDateString()}
          </span>
        </div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
          isUrgent 
            ? 'bg-red-100 text-red-700' 
            : isWarning 
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-green-100 text-green-700'
        }`}>
          <span>{daysUntil} days</span>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCard;