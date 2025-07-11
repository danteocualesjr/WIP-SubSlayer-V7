import React, { useState } from 'react';
import { Calendar, DollarSign, Sword, Trash2, Edit, Check, Bell } from 'lucide-react';
import { Subscription } from '../../types/subscription';
import { useSettings } from '../../hooks/useSettings';
import CancellationConfirmModal from './CancellationConfirmModal';

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
  const { formatDate, settings } = useSettings();
  const [showCancelModal, setShowCancelModal] = useState(false);

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
  
  // Calculate progress for billing cycle
  const calculateProgress = () => {
    const now = new Date();
    const renewalDate = new Date(subscription.nextBilling);
    
    if (subscription.billingCycle === 'monthly') {
      // For monthly subscriptions, calculate days since last billing
      const lastBillingDate = new Date(renewalDate);
      lastBillingDate.setMonth(lastBillingDate.getMonth() - 1);
      
      const totalDays = Math.round((renewalDate.getTime() - lastBillingDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysElapsed = Math.round((now.getTime() - lastBillingDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return Math.min(Math.max(0, (daysElapsed / totalDays) * 100), 100);
    } else {
      // For annual subscriptions
      const lastBillingDate = new Date(renewalDate);
      lastBillingDate.setFullYear(lastBillingDate.getFullYear() - 1);
      
      const totalDays = Math.round((renewalDate.getTime() - lastBillingDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysElapsed = Math.round((now.getTime() - lastBillingDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return Math.min(Math.max(0, (daysElapsed / totalDays) * 100), 100);
    }
  };
  
  const progressPercentage = calculateProgress();

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent card click when clicking on action buttons or in selection mode
    if (isSelectionMode) {
      if (onSelect) {
        onSelect(subscription.id);
      }
      return;
    }

    // Check if the click was on the actions menu or its children
    const target = e.target as HTMLElement;
    if (target.closest('.actions-menu') || target.closest('button')) {
      return;
    }

    // Open edit modal when clicking anywhere on the card
    onEdit(subscription);
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(subscription.id);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteClick) {
      onDeleteClick(subscription);
    } else {
      onDelete(subscription.id);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(subscription);
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCancelModal(true);
  };

  const handleCancelConfirm = () => {
    onToggleStatus(subscription.id);
  };

  return (
    <>
      <div 
        className={`bg-white rounded-2xl p-4 sm:p-6 shadow-sm border transition-all duration-300 relative hover:shadow-lg hover:border-purple-300 ${
          isSelectionMode 
            ? `cursor-pointer ${isSelected ? 'border-purple-300 bg-purple-50 shadow-md' : 'border-gray-100 hover:border-gray-300'}`
            : 'border-gray-100 hover:shadow-md hover:border-purple-200 cursor-pointer'
        }`}
        onClick={handleCardClick}
      >
        {/* Selection Checkbox */}
        {isSelectionMode && (
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4" onClick={handleSelectClick}>
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
              isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
            }`}>
              {isSelected && <Check className="w-3 h-3 text-white" />}
            </div>
          </div>
        )}

        {/* Action Icons */}
        {!isSelectionMode && (
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 actions-menu">
            <div className="flex items-center space-x-1">
              <button
                onClick={handleEditClick}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                title="Edit subscription"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancelClick}
                className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
                title={subscription.status === 'active' ? 'Cancel subscription' : 'Reactivate subscription'}
              >
                <Sword className="w-4 h-4" />
              </button>
              <button
                onClick={handleDeleteClick}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                title="Delete subscription"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Subscription Info */}
        <div className={`flex items-start space-x-3 sm:space-x-4 mb-3 sm:mb-4 ${isSelectionMode ? 'ml-8' : ''}`}>
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: subscription.color || '#8B5CF6' }}
          >
            {subscription.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{subscription.name}</h3>
            {subscription.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-1">{subscription.description}</p>
            )}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex items-center space-x-1">
                <span className="text-base sm:text-lg font-bold text-gray-900">
                  ${subscription.cost.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500">{subscription.billingCycle === 'monthly' ? ' monthly' : ' annually'}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                subscription.status === 'active' 
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {subscription.status === 'active' ? 'Active' : 'Cancelled'}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                isUrgent ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">Progress</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                isUrgent ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Next Billing and Reminder */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Next billing:</span>
            <span className="text-sm font-medium text-gray-900">
              {formatDate(subscription.nextBilling)}
            </span>
          </div>
          <div>
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
              isUrgent 
                ? 'bg-red-100 text-red-700' 
                : isWarning 
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-green-100 text-green-700'
            }`}>
              <span>{daysUntil} days left</span>
            </div>
          </div>
        </div>

        {/* Click to edit hint (only show when not in selection mode) */}
        {!isSelectionMode && (
          <div className="absolute inset-0 rounded-2xl bg-purple-500/0 hover:bg-purple-500/5 transition-all duration-300 pointer-events-none group-hover:bg-purple-500/5" />
        )}
      </div>

      {/* Cancellation Confirmation Modal */}
      <CancellationConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelConfirm}
        subscription={subscription}
      />
    </>
  );
};

export default SubscriptionCard;