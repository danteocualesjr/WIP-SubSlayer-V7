import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Calendar, DollarSign, Search, Star, Check } from 'lucide-react';
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
    cost: subscription?.cost ? subscription?.cost.toString() : '',
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
  const { subscription: userSubscription, isActive } = useSubscription();
  const isFreeTier = !isActive();
  
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
    {
      name: 'Spotify',
      category: 'Entertainment',
      color: '#1DB954',
      description: 'Music streaming service',
      commonPrices: { monthly: 9.99, annual: 99 },
      billingCycle: 'monthly'
    },
    {
      name: 'Amazon Prime',
      category: 'Shopping',
      color: '#00A8E1',
      description: 'Free shipping and streaming',
      commonPrices: { monthly: 14.99, annual: 139 },
      billingCycle: 'monthly'
    },
    {
      name: 'Disney+',
      category: 'Entertainment',
      color: '#0063E5',
      description: 'Disney streaming service',
      commonPrices: { monthly: 7.99, annual: 79.99 },
      billingCycle: 'monthly'
    },
    {
      name: 'YouTube Premium',
      category: 'Entertainment',
      color: '#FF0000',
      description: 'Ad-free YouTube and music',
      commonPrices: { monthly: 11.99, annual: 119.99 },
      billingCycle: 'monthly'
    },
    {
      name: 'Apple Music',
      category: 'Entertainment',
      color: '#FA243C',
      description: 'Music streaming service',
      commonPrices: { monthly: 9.99, annual: 99 },
      billingCycle: 'monthly'
    },
    {
      name: 'HBO Max',
      category: 'Entertainment',
      color: '#5822B4',
      description: 'HBO streaming service',
      commonPrices: { monthly: 15.99, annual: 149.99 },
      billingCycle: 'monthly'
    },
    {
      name: 'Hulu',
      category: 'Entertainment',
      color: '#1CE783',
      description: 'TV and movie streaming',
      commonPrices: { monthly: 7.99, annual: 79.99 },
      billingCycle: 'monthly'
    },
    {
      name: 'Adobe Creative Cloud',
      category: 'Productivity',
      color: '#FF0000',
      description: 'Creative software suite',
      commonPrices: { monthly: 52.99, annual: 599.88 },
      billingCycle: 'monthly'
    },
    {
      name: 'Microsoft 365',
      category: 'Productivity',
      color: '#0078D4',
      description: 'Office suite and cloud storage',
      commonPrices: { monthly: 6.99, annual: 69.99 },
      billingCycle: 'monthly'
    },
    {
      name: 'Dropbox',
      category: 'Storage',
      color: '#0061FF',
      description: 'Cloud storage and file sharing',
      commonPrices: { monthly: 11.99, annual: 119.88 },
      billingCycle: 'monthly'
    },
    {
      name: 'Google One',
      category: 'Storage',
      color: '#4285F4',
      description: 'Google cloud storage',
      commonPrices: { monthly: 1.99, annual: 19.99 },
      billingCycle: 'monthly'
    }
  ];

  const filteredServices = popularServices.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.cost) {
      newErrors.cost = 'Cost is required';
    } else if (isNaN(parseFloat(formData.cost)) || parseFloat(formData.cost) < 0) {
      newErrors.cost = 'Cost must be a valid number';
    }
    
    if (!formData.nextBilling) {
      newErrors.nextBilling = 'Next billing date is required';
    }
    
    setErrors(newErrors);
    
    // If no errors, submit form
    if (Object.keys(newErrors).length === 0) {
      onAdd({
        name: formData.name,
        description: formData.description,
        cost: parseFloat(formData.cost),
        currency: formData.currency,
        billingCycle: formData.billingCycle as 'monthly' | 'annual',
        nextBilling: formData.nextBilling,
        category: formData.category,
        status: 'active',
        color: formData.color
      });
      onClose();
    }
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
        cost: subscription.cost ? subscription.cost.toString() : '',
        currency: subscription.currency,
        billingCycle: subscription.billingCycle,
        nextBilling: subscription.nextBilling,
        category: subscription.category || '',
        color: subscription.color || '#8B5CF6'
      });
    }
  }, [subscription]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
  };

  const colors = [
    '#8B5CF6', // Purple
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#84CC16', // Lime
    '#9333EA'  // Violet
  ];

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
        
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-gray-600 mb-6">
            {subscription 
              ? 'Update your subscription details below' 
              : 'Enter your subscription details below or choose from popular services'}
          </p>
          
          {/* Popular Services */}
          {!subscription && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Popular Services</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
              
              {showPopularServices && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {filteredServices.slice(0, 6).map((service, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleServiceSelect(service)}
                      className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-left"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                        style={{ backgroundColor: service.color }}
                      >
                        {service.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{service.name}</p>
                        <p className="text-xs text-gray-500">${service.commonPrices.monthly?.toFixed(2)}/mo</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Subscription Form */}
          <div className="space-y-6">
            {/* Service Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="e.g., Netflix, Spotify, etc."
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Brief description of the service"
                rows={2}
              />
            </div>
            
            {/* Cost and Billing Cycle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="cost"
                    value={formData.cost}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.cost ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.cost && (
                  <p className="mt-1 text-sm text-red-600">{errors.cost}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Cycle *
                </label>
                <select
                  name="billingCycle"
                  value={formData.billingCycle}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
            </div>
            
            {/* Next Billing Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Billing Date *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="nextBilling"
                  value={formData.nextBilling}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.nextBilling ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.nextBilling && (
                <p className="mt-1 text-sm text-red-600">{errors.nextBilling}</p>
              )}
            </div>
            
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Productivity">Productivity</option>
                <option value="Utilities">Utilities</option>
                <option value="Shopping">Shopping</option>
                <option value="Storage">Storage</option>
                <option value="Health & Fitness">Health & Fitness</option>
                <option value="Education">Education</option>
                <option value="Finance">Finance</option>
                <option value="News">News</option>
                <option value="Social">Social</option>
                <option value="Gaming">Gaming</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="grid grid-cols-6 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorChange(color)}
                    className={`w-10 h-10 rounded-lg transition-all duration-200 ${
                      formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {formData.color === color && (
                      <Check className="w-5 h-5 text-white mx-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
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
        </form>
        
        <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
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