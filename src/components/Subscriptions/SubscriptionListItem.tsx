import React from 'react';
import { Calendar, DollarSign, MoreVertical, Pause, Trash2, Edit } from 'lucide-react';
import { Subscription } from '../../types/subscription';

interface SubscriptionListItemProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const SubscriptionListItem: React.FC<SubscriptionListItemProps> = ({
  subscription,
  onEdit,
  onDelete,
  onToggleStatus
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

  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Service */}
        <div className="col-span-4 flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
            style={{ backgroundColor: subscription.color || '#8B5CF6' }}
          >
            {subscription.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{subscription.name}</h4>
            {subscription.description && (
              <p className="text-sm text-gray-600 truncate">{subscription.description}</p>
            )}
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
            <span className="text-sm text-gray-500">/{subscription.billingCycle}</span>
          </div>
        </div>

        {/* Next Billing */}
        <div className="col-span-2">
          <div className="flex flex-col">
            <span className="text-sm text-gray-900">
              {new Date(subscription.nextBilling).toLocaleDateString()}
            </span>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium w-fit ${
              isUrgent 
                ? 'bg-red-100 text-red-700' 
                : isWarning 
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-green-100 text-green-700'
            }`}>
              {daysUntil} days
            </div>
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
        <div className="col-span-1 relative">
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
                onClick={() => {
                  onDelete(subscription.id);
                  setShowActions(false);
                }}
                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionListItem;