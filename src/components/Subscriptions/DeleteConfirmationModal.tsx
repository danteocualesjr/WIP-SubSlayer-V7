import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { Subscription } from '../../types/subscription';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  subscription: Subscription | null;
  isMultiple?: boolean;
  count?: number;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  subscription,
  isMultiple = false,
  count = 1
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={handleModalContentClick}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isMultiple ? 'Remove Subscriptions' : 'Remove Subscription'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          {isMultiple ? (
            <div>
              <p className="text-gray-700 mb-4">
                Are you sure you want to remove <span className="font-semibold">{count} subscriptions</span> from your list? 
                This action cannot be undone.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">
                  ⚠️ All selected subscriptions and their data will be permanently removed from your list.
                </p>
              </div>
            </div>
          ) : subscription ? (
            <div>
              <p className="text-gray-700 mb-4">
                Are you sure you want to remove <span className="font-semibold">"{subscription.name}"</span> from your list? 
                This action cannot be undone.
              </p>
              
              {/* Subscription Preview */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                    style={{ backgroundColor: subscription.color || '#8B5CF6' }}
                  >
                    {subscription.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{subscription.name}</h4>
                    <p className="text-sm text-gray-600">
                      ${subscription.cost.toFixed(2)}/{subscription.billingCycle}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">
                  ⚠️ This subscription and all its data will be permanently removed from your list.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-700">
              Are you sure you want to remove this subscription from your list? This action cannot be undone.
            </p>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Remove {isMultiple ? `${count} Items` : 'Subscription'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;