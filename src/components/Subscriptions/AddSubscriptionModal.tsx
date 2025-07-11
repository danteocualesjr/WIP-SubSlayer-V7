import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Sparkles, Search, Star } from 'lucide-react';
import { Subscription } from '../../types/subscription';
import { useSettings } from '../../hooks/useSettings';
import { useSubscription } from '../../hooks/useSubscription';

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (subscription: Omit<Subscription, 'id' | 'createdAt'>) => void;
  subscription?: Subscription;
  subscriptions?: Subscription[];
}

interface PopularService {
  name: string;
  category: string;
  color: string;
  description: string;
  commonPrices: {
    monthly?: number;
    annual?: number;
  };
  billingCycle: 'monthly' | 'annual';
}

const AddSubscriptionModal: React.FC<AddSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  subscription,
  subscriptions = []
}) => {
  const [formData, setFormData] = useState({
    name: subscription?.name || '',
    description: subscription?.description || undefined,
    cost: subscription?.cost?.toString() || '',
    currency: subscription?.currency || 'USD',
    billingCycle: subscription?.billingCycle || 'monthly',
    nextBilling: subscription?.nextBilling || '',
    category: subscription?.category || '',
    color: subscription?.color || '#8B5CF6'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showPopularServices, setShowPopularServices] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const modalRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();
  const { subscription: userSubscription } = useSubscription();
  
  // Ensure modal is visible
  useEffect(() => {
    if (isOpen) {
      console.log('AddSubscriptionModal is open', subscription?.name || 'new subscription');
    }
  }, [isOpen, subscription]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const popularServices: PopularService[] = [
    {
      name: 'Netflix',
      category: 'Entertainment',
      color: '#E50914',
      description: 'Streaming movies and TV shows',
      commonPrices: { monthly: 15.49, annual: 185.88 },
      billingCycle: 'monthly'
    },
    // ... rest of popular services
  ];

  const filteredServices = popularServices.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ... validation and submit logic
  };

  const handleServiceSelect = (service: PopularService) => {
    setFormData({
      ...formData,
      name: service.name,
      description: service.description,
      cost: service.commonPrices[service.billingCycle]?.toString() || '',
      billingCycle: service.billingCycle,
      category: service.category,
      color: service.color
    });
    setShowPopularServices(false);
  };

  useEffect(() => {
    if (subscription) {
      setFormData({
        name: subscription.name,
        description: subscription.description || '',
        cost: subscription.cost.toString(),
        currency: subscription.currency,
        billingCycle: subscription.billingCycle,
        nextBilling: subscription.nextBilling,
        category: subscription.category || '',
        color: subscription.color || '#8B5CF6'
      });
    }
  }, [subscription]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" onClick={handleBackdropClick}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {subscription ? 'Edit Subscription' : 'Add New Subscription'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            {subscription 
              ? 'Update your subscription details below' 
              : 'Enter your subscription details below or choose from popular services'}
          </p>
          
          {/* Form will go here */}
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {subscription ? `Editing ${subscription.name}` : 'Add New Subscription'}
            </h3>
            <p className="text-gray-600">
              This is a placeholder for the subscription form.
            </p>
          </div>
          
          {/* Free tier warning */}
          {isFreeTier && subscriptions && subscriptions.length >= 7 && !subscription && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
                <span className="text-sm font-medium text-yellow-800">
                  Free tier is limited to 7 subscriptions. Please upgrade to Premium for unlimited subscriptions.
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-lg font-medium transition-all duration-200"
          >
            {subscription ? 'Save Changes' : 'Add Subscription'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSubscriptionModal;