import React, { useState } from 'react';
import { Calendar, DollarSign, Sword, Trash2, Edit, Check, Bell } from 'lucide-react';
import { Subscription } from '../../types/subscription';
import { useSettings } from '../../hooks/useSettings';
import CancellationConfirmModal from './CancellationConfirmModal';

interface SubscriptionListItemProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onDeleteClick?: (subscription: Subscription) => void;
}

const SubscriptionListItem: React.FC<SubscriptionListItemProps> = ({
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

  const handleRowClick = (e: React.MouseEvent) => {
    // Prevent row click when clicking on action buttons
    const target = e.target as HTMLElement;
    if (target.closest('.actions-menu') || target.closest('button')) {
      return;
    }

    if (isSelectionMode) {
      if (onSelect) {
        onSelect(subscription.id);
      }
      return;
    }

    // Open edit modal when clicking anywhere on the row
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
        className={`px-6 py-4 transition-all duration-300 ${
          isSelectionMode 
            ? `cursor-pointer ${isSelected ? 'bg-purple-50' : 'hover:bg-purple-50/50'}`
            : 'hover:bg-purple-50/50 cursor-pointer hover:shadow-md'
        }`}
        onClick={handleRowClick}
      >
        <div className="grid grid-cols-12 gap-4 items-center">
          {/* Selection Checkbox */}
          {isSelectionMode && (
            <div className="col-span-1" onClick={handleSelectClick}>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
              }`}>
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>
          )}

          {/* Service */}
          <div className={isSelectionMode ? "col-span-3" : "col-span-3"}>
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: subscription.color || '#8B5CF6' }}
              >
                {subscription.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">{subscription.name}</h4>
                {subscription.description && (
                  <p className="text-sm text-gray-600 line-clamp-1 mb-1">{subscription.description}</p>
                )}
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                  <div 
                    className={`h-full rounded-full ${
                      isUrgent ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">Progress</div>
              </div>
            </div>
            
          </div>

          {/* Category */}
          <div className="col-span-2">
            <span className="text-sm text-gray-600">{subscription.category || 'Uncategorized'}</span>
          </div>

          {/* Cost */}
          <div className="col-span-2">
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-gray-900">
                ${subscription.cost.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500">{subscription.billingCycle === 'monthly' ? ' monthly' : ' annually'}</span>
            </div>
          </div>

          {/* Next Billing */}
          <div className="col-span-2">
            <div className="flex flex-col">
              <span className="text-sm text-gray-900">
                {formatDate(subscription.nextBilling)}
              </span>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium w-fit ${
                isUrgent 
                  ? 'bg-red-100 text-red-700' 
                  : isWarning 
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
              }`}>
                {daysUntil} days left
              </div>
            </div>
          </div>

          {/* Reminder Days */}
          <div className="col-span-1">
            <div className="flex items-center space-x-1">
              <Bell className="w-3 h-3 text-gray-400" />
              <span className="text-sm text-gray-600">{settings.reminderDays}d</span>
            </div>
          </div>

          {/* Status */}
          <div className="col-span-1">
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

          {/* Actions */}
          <div className="col-span-1 actions-menu">
            {!isSelectionMode && (
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleEditClick}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  title="Edit subscription"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelClick}
                  className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
                  title={subscription.status === 'active' ? 'Cancel subscription' : 'Reactivate subscription'}
                >
                  <Sword className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  title="Delete subscription"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
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

export default SubscriptionListItem;