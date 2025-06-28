import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { Subscription } from '../../types/subscription';
import { useSettings } from '../../hooks/useSettings';

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (subscription: Omit<Subscription, 'id' | 'createdAt'>) => void;
  subscription?: Subscription;
}

const AddSubscriptionModal: React.FC<AddSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  subscription
}) => {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cost: '',
    currency: settings.currency || 'USD',
    billingCycle: 'monthly' as 'monthly' | 'annual',
    nextBilling: '',
    category: '',
    status: 'active' as 'active' | 'cancelled' | 'paused',
    color: '#8B5CF6'
  });

  const categories = [
    'AI', 'Entertainment', 'Productivity', 'Development', 'Design', 'Education', 
    'Health & Fitness', 'News & Media', 'Music', 'Storage', 'Social Media', 'Other'
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿' },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
    { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
    { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
    { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
    { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
    { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
    { code: 'CLP', name: 'Chilean Peso', symbol: '$' },
    { code: 'COP', name: 'Colombian Peso', symbol: '$' },
    { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'EGP', name: 'Egyptian Pound', symbol: '£' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
    { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
    { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼' },
    { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك' },
    { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب' },
    { code: 'OMR', name: 'Omani Rial', symbol: '﷼' },
    { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
    { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا' },
    { code: 'LBP', name: 'Lebanese Pound', symbol: '£' },
    { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
    { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
    { code: 'LKR', name: 'Sri Lankan Rupee', symbol: '₨' },
    { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨' },
    { code: 'AFN', name: 'Afghan Afghani', symbol: '؋' },
    { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K' },
    { code: 'LAK', name: 'Lao Kip', symbol: '₭' },
    { code: 'KHR', name: 'Cambodian Riel', symbol: '៛' },
    { code: 'BND', name: 'Brunei Dollar', symbol: 'B$' },
    { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$' },
    { code: 'MOP', name: 'Macanese Pataca', symbol: 'MOP$' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
    { code: 'FJD', name: 'Fijian Dollar', symbol: 'FJ$' },
    { code: 'PGK', name: 'Papua New Guinea Kina', symbol: 'K' },
    { code: 'WST', name: 'Samoan Tala', symbol: 'T' },
    { code: 'TOP', name: 'Tongan Paʻanga', symbol: 'T$' },
    { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'VT' },
    { code: 'SBD', name: 'Solomon Islands Dollar', symbol: 'SI$' },
    { code: 'NCL', name: 'CFP Franc', symbol: '₣' },
  ];

  // Limited to 7 colors as requested
  const colors = [
    '#8B5CF6', // Purple
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Orange
    '#EF4444', // Red
    '#F97316', // Orange-Red
    '#84CC16'  // Lime Green
  ];

  // Initialize form data when modal opens or subscription changes
  useEffect(() => {
    if (isOpen) {
      if (subscription) {
        // Pre-fill form with existing subscription data
        setFormData({
          name: subscription.name || '',
          description: subscription.description || '',
          cost: subscription.cost?.toString() || '',
          currency: subscription.currency || settings.currency || 'USD',
          billingCycle: subscription.billingCycle || 'monthly',
          nextBilling: subscription.nextBilling || '',
          category: subscription.category || '',
          status: subscription.status || 'active',
          color: subscription.color || '#8B5CF6'
        });
      } else {
        // Reset form for new subscription with user's default currency
        setFormData({
          name: '',
          description: '',
          cost: '',
          currency: settings.currency || 'USD',
          billingCycle: 'monthly',
          nextBilling: '',
          category: '',
          status: 'active',
          color: '#8B5CF6'
        });
      }
    }
  }, [isOpen, subscription, settings.currency]);

  // Prevent modal from closing when clicking outside or losing focus
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      const handleVisibilityChange = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
      };

      const handleWindowBlur = (e: Event) => {
        e.preventDefault();
      };

      const handleWindowFocus = (e: Event) => {
        e.preventDefault();
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('blur', handleWindowBlur);
      window.addEventListener('focus', handleWindowFocus);

      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleWindowBlur);
        window.removeEventListener('focus', handleWindowFocus);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.cost || !formData.nextBilling) return;

    onAdd({
      ...formData,
      cost: parseFloat(formData.cost),
    });
    onClose();
  };

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={handleBackdropClick}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999
      }}
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-100"
        onClick={handleModalContentClick}
      >
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {subscription ? 'Edit Subscription' : 'Add New Subscription'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl sm:rounded-2xl transition-colors"
            type="button"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Service Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-purple-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
              placeholder="e.g., ChatGPT Plus, Netflix, Spotify"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-purple-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
              placeholder="Brief description"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cost *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-purple-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-purple-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
              >
                {currencies.slice(0, 10).map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Billing Cycle
            </label>
            <select
              value={formData.billingCycle}
              onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as 'monthly' | 'annual' })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-purple-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
            >
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Next Billing Date *
            </label>
            <input
              type="date"
              value={formData.nextBilling}
              onChange={(e) => setFormData({ ...formData, nextBilling: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-purple-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-purple-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Color
            </label>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 hover:scale-110 ${
                    formData.color === color ? 'border-gray-900 scale-110 shadow-lg' : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 sm:px-6 py-2 sm:py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl sm:rounded-2xl font-semibold transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{subscription ? 'Update' : 'Add'} Subscription</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubscriptionModal;