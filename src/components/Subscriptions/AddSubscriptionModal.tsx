import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Sparkles, Search, Star } from 'lucide-react';
import { Subscription } from '../../types/subscription';
import { useSettings } from '../../hooks/useSettings';

interface AddSubscriptionModalProps {
  
  isOpen: boolean;
  onClose: () => void;
  onAdd: (subscription: Omit<Subscription, 'id' | 'createdAt'>) => void;
  subscription?: Subscription;
  
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
  subscription
}) => {
  const { settings } = useSettings();
  const [showPopularServices, setShowPopularServices] = useState(!subscription);
  const [searchTerm, setSearchTerm] = useState('');
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

  // Updated colors with black as the last color
  const colors = [
    '#8B5CF6', // Purple
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Orange
    '#EF4444', // Red
    '#F97316', // Orange-Red
    '#000000'  // Black (changed from lime green)
  ];

  // Popular services database
  const popularServices: PopularService[] = [
    // AI & Productivity
    { name: 'ChatGPT Plus', category: 'AI', color: '#10A37F', description: 'AI assistant for writing, coding, and analysis', commonPrices: { monthly: 20 }, billingCycle: 'monthly' },
    { name: 'Claude Pro', category: 'AI', color: '#D97706', description: 'Advanced AI assistant by Anthropic', commonPrices: { monthly: 20 }, billingCycle: 'monthly' },
    { name: 'Cursor Windsurf', category: 'AI', color: '#000000', description: 'AI-powered code editor with advanced features', commonPrices: { monthly: 20 }, billingCycle: 'monthly' },
    { name: 'Claude Code', category: 'AI', color: '#D97706', description: 'AI coding assistant by Anthropic', commonPrices: { monthly: 20 }, billingCycle: 'monthly' },
    { name: 'Replit', category: 'AI', color: '#F26207', description: 'AI-powered collaborative coding platform', commonPrices: { monthly: 20 }, billingCycle: 'monthly' },
    { name: 'Bolt.new', category: 'AI', color: '#8B5CF6', description: 'AI web development platform', commonPrices: { monthly: 20 }, billingCycle: 'monthly' },
    { name: 'Lovable', category: 'AI', color: '#EC4899', description: 'AI-powered app development platform', commonPrices: { monthly: 20 }, billingCycle: 'monthly' },
    { name: 'v0', category: 'AI', color: '#000000', description: 'AI UI generator by Vercel', commonPrices: { monthly: 20 }, billingCycle: 'monthly' },
    { name: 'GitHub Copilot', category: 'Development', color: '#000000', description: 'AI-powered code completion', commonPrices: { monthly: 10 }, billingCycle: 'monthly' },
    { name: 'Notion', category: 'Productivity', color: '#000000', description: 'All-in-one workspace for notes and docs', commonPrices: { monthly: 8, annual: 96 }, billingCycle: 'monthly' },
    { name: 'Obsidian', category: 'Productivity', color: '#7C3AED', description: 'Knowledge management and note-taking', commonPrices: { monthly: 8 }, billingCycle: 'monthly' },
    
    // Entertainment
    { name: 'Netflix', category: 'Entertainment', color: '#E50914', description: 'Streaming movies and TV shows', commonPrices: { monthly: 15.49 }, billingCycle: 'monthly' },
    { name: 'Disney+', category: 'Entertainment', color: '#113CCF', description: 'Disney, Marvel, Star Wars content', commonPrices: { monthly: 7.99, annual: 79.99 }, billingCycle: 'monthly' },
    { name: 'Hulu', category: 'Entertainment', color: '#1CE783', description: 'TV shows and movies streaming', commonPrices: { monthly: 7.99 }, billingCycle: 'monthly' },
    { name: 'Amazon Prime Video', category: 'Entertainment', color: '#00A8E1', description: 'Prime video streaming service', commonPrices: { monthly: 8.99, annual: 139 }, billingCycle: 'annual' },
    { name: 'HBO Max', category: 'Entertainment', color: '#8B5CF6', description: 'Premium HBO content and movies', commonPrices: { monthly: 15.99 }, billingCycle: 'monthly' },
    { name: 'Paramount+', category: 'Entertainment', color: '#0064FF', description: 'CBS and Paramount content', commonPrices: { monthly: 5.99 }, billingCycle: 'monthly' },
    { name: 'Apple TV+', category: 'Entertainment', color: '#000000', description: 'Apple original shows and movies', commonPrices: { monthly: 6.99 }, billingCycle: 'monthly' },
    { name: 'Peacock', category: 'Entertainment', color: '#000000', description: 'NBCUniversal streaming service', commonPrices: { monthly: 5.99 }, billingCycle: 'monthly' },
    { name: 'Discovery+', category: 'Entertainment', color: '#0077C8', description: 'Discovery Channel content', commonPrices: { monthly: 4.99 }, billingCycle: 'monthly' },
    
    // Music
    { name: 'Spotify Premium', category: 'Music', color: '#1DB954', description: 'Music streaming service', commonPrices: { monthly: 10.99 }, billingCycle: 'monthly' },
    { name: 'Apple Music', category: 'Music', color: '#FA243C', description: 'Apple music streaming service', commonPrices: { monthly: 10.99 }, billingCycle: 'monthly' },
    { name: 'YouTube Music', category: 'Music', color: '#FF0000', description: 'Google music streaming service', commonPrices: { monthly: 10.99 }, billingCycle: 'monthly' },
    { name: 'Amazon Music Unlimited', category: 'Music', color: '#FF9900', description: 'Amazon music streaming', commonPrices: { monthly: 10.99 }, billingCycle: 'monthly' },
    { name: 'Tidal', category: 'Music', color: '#000000', description: 'High-fidelity music streaming', commonPrices: { monthly: 10.99 }, billingCycle: 'monthly' },
    
    // Development & Design
    { name: 'Adobe Creative Cloud', category: 'Design', color: '#FF0000', description: 'Creative suite for designers', commonPrices: { monthly: 52.99, annual: 599.88 }, billingCycle: 'monthly' },
    { name: 'Figma', category: 'Design', color: '#F24E1E', description: 'Collaborative design tool', commonPrices: { monthly: 12, annual: 144 }, billingCycle: 'monthly' },
    { name: 'Canva Pro', category: 'Design', color: '#00C4CC', description: 'Design tool for non-designers', commonPrices: { monthly: 12.99, annual: 119.99 }, billingCycle: 'annual' },
    { name: 'GitHub Pro', category: 'Development', color: '#000000', description: 'Advanced GitHub features', commonPrices: { monthly: 4 }, billingCycle: 'monthly' },
    { name: 'Vercel Pro', category: 'Development', color: '#000000', description: 'Frontend deployment platform', commonPrices: { monthly: 20 }, billingCycle: 'monthly' },
    { name: 'Netlify Pro', category: 'Development', color: '#00C7B7', description: 'Web development platform', commonPrices: { monthly: 19 }, billingCycle: 'monthly' },
    
    // Cloud Storage
    { name: 'Google Drive', category: 'Storage', color: '#4285F4', description: 'Cloud storage by Google', commonPrices: { monthly: 1.99 }, billingCycle: 'monthly' },
    { name: 'Dropbox Plus', category: 'Storage', color: '#0061FF', description: 'Cloud storage and file sync', commonPrices: { monthly: 9.99, annual: 119.88 }, billingCycle: 'annual' },
    { name: 'iCloud+', category: 'Storage', color: '#007AFF', description: 'Apple cloud storage service', commonPrices: { monthly: 0.99 }, billingCycle: 'monthly' },
    { name: 'OneDrive', category: 'Storage', color: '#0078D4', description: 'Microsoft cloud storage', commonPrices: { monthly: 1.99 }, billingCycle: 'monthly' },
    
    // Business & Productivity
    { name: 'Microsoft 365', category: 'Productivity', color: '#D83B01', description: 'Office suite and productivity tools', commonPrices: { monthly: 6.99, annual: 69.99 }, billingCycle: 'annual' },
    { name: 'Slack Pro', category: 'Productivity', color: '#4A154B', description: 'Team communication platform', commonPrices: { monthly: 7.25 }, billingCycle: 'monthly' },
    { name: 'Zoom Pro', category: 'Productivity', color: '#2D8CFF', description: 'Video conferencing platform', commonPrices: { monthly: 14.99, annual: 149.90 }, billingCycle: 'annual' },
    { name: 'Asana Premium', category: 'Productivity', color: '#F06A6A', description: 'Project management tool', commonPrices: { monthly: 10.99, annual: 119.88 }, billingCycle: 'annual' },
    { name: 'Trello Power-Ups', category: 'Productivity', color: '#0079BF', description: 'Enhanced project boards', commonPrices: { monthly: 5, annual: 60 }, billingCycle: 'annual' },
    
    // Security
    { name: '1Password', category: 'Productivity', color: '#0094F0', description: 'Password manager', commonPrices: { monthly: 2.99, annual: 35.88 }, billingCycle: 'annual' },
    { name: 'LastPass Premium', category: 'Productivity', color: '#D32D27', description: 'Password management service', commonPrices: { monthly: 3, annual: 36 }, billingCycle: 'annual' },
    { name: 'Dashlane Premium', category: 'Productivity', color: '#00B388', description: 'Password manager and VPN', commonPrices: { monthly: 4.99, annual: 59.88 }, billingCycle: 'annual' },
    { name: 'NordVPN', category: 'Productivity', color: '#4687FF', description: 'VPN service for privacy', commonPrices: { monthly: 11.95, annual: 59.88 }, billingCycle: 'annual' },
    { name: 'ExpressVPN', category: 'Productivity', color: '#DA020E', description: 'Premium VPN service', commonPrices: { monthly: 12.95, annual: 99.95 }, billingCycle: 'annual' },
    
    // Education & Learning
    { name: 'MasterClass', category: 'Education', color: '#000000', description: 'Online classes by experts', commonPrices: { annual: 180 }, billingCycle: 'annual' },
    { name: 'Skillshare Premium', category: 'Education', color: '#00FF88', description: 'Creative online courses', commonPrices: { monthly: 13.75, annual: 99 }, billingCycle: 'annual' },
    { name: 'Coursera Plus', category: 'Education', color: '#0056D3', description: 'University courses online', commonPrices: { monthly: 39, annual: 399 }, billingCycle: 'annual' },
    { name: 'Udemy Pro', category: 'Education', color: '#A435F0', description: 'Professional development courses', commonPrices: { monthly: 29.99, annual: 360 }, billingCycle: 'annual' },
    { name: 'LinkedIn Learning', category: 'Education', color: '#0077B5', description: 'Professional skill development', commonPrices: { monthly: 29.99, annual: 239.88 }, billingCycle: 'annual' },
    { name: 'Duolingo Plus', category: 'Education', color: '#58CC02', description: 'Language learning app', commonPrices: { monthly: 6.99, annual: 83.88 }, billingCycle: 'annual' },
    
    // Health & Fitness
    { name: 'Peloton App', category: 'Health & Fitness', color: '#000000', description: 'Fitness classes and workouts', commonPrices: { monthly: 12.99 }, billingCycle: 'monthly' },
    { name: 'MyFitnessPal Premium', category: 'Health & Fitness', color: '#0072CE', description: 'Nutrition and fitness tracking', commonPrices: { monthly: 9.99, annual: 49.99 }, billingCycle: 'annual' },
    { name: 'Headspace', category: 'Health & Fitness', color: '#FF6B35', description: 'Meditation and mindfulness', commonPrices: { monthly: 12.99, annual: 69.99 }, billingCycle: 'annual' },
    { name: 'Calm', category: 'Health & Fitness', color: '#2F80ED', description: 'Sleep and meditation app', commonPrices: { monthly: 14.99, annual: 69.99 }, billingCycle: 'annual' },
    { name: 'Strava Premium', category: 'Health & Fitness', color: '#FC4C02', description: 'Advanced fitness tracking', commonPrices: { monthly: 5, annual: 60 }, billingCycle: 'annual' },
    
    // News & Media
    { name: 'The New York Times', category: 'News & Media', color: '#000000', description: 'Digital news subscription', commonPrices: { monthly: 17, annual: 204 }, billingCycle: 'annual' },
    { name: 'The Wall Street Journal', category: 'News & Media', color: '#000000', description: 'Business news subscription', commonPrices: { monthly: 38.99, annual: 467.88 }, billingCycle: 'annual' },
    { name: 'Medium', category: 'News & Media', color: '#000000', description: 'Premium articles and stories', commonPrices: { monthly: 5, annual: 50 }, billingCycle: 'annual' },
    { name: 'Substack Pro', category: 'News & Media', color: '#FF6719', description: 'Newsletter platform', commonPrices: { monthly: 10 }, billingCycle: 'monthly' },
    
    // Gaming
    { name: 'Xbox Game Pass', category: 'Entertainment', color: '#107C10', description: 'Gaming subscription service', commonPrices: { monthly: 14.99 }, billingCycle: 'monthly' },
    { name: 'PlayStation Plus', category: 'Entertainment', color: '#003791', description: 'PlayStation gaming service', commonPrices: { monthly: 9.99, annual: 59.99 }, billingCycle: 'annual' },
    { name: 'Nintendo Switch Online', category: 'Entertainment', color: '#E60012', description: 'Nintendo online gaming', commonPrices: { annual: 19.99 }, billingCycle: 'annual' },
    { name: 'Steam Deck', category: 'Entertainment', color: '#000000', description: 'PC gaming platform', commonPrices: { monthly: 5.99 }, billingCycle: 'monthly' },
    
    // Communication
    { name: 'Discord Nitro', category: 'Social Media', color: '#5865F2', description: 'Enhanced Discord features', commonPrices: { monthly: 9.99, annual: 99.99 }, billingCycle: 'annual' },
    { name: 'Telegram Premium', category: 'Social Media', color: '#0088CC', description: 'Enhanced messaging features', commonPrices: { monthly: 4.99 }, billingCycle: 'monthly' },
    { name: 'WhatsApp Business', category: 'Social Media', color: '#25D366', description: 'Business messaging platform', commonPrices: { monthly: 0 }, billingCycle: 'monthly' },
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
        setShowPopularServices(false);
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
        setShowPopularServices(true);
      }
      setSearchTerm('');
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

  // Filter popular services based on search term
  const filteredServices = popularServices.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group services by category
  const servicesByCategory = filteredServices.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, PopularService[]>);

  const handleServiceSelect = (service: PopularService) => {
    const defaultPrice = service.billingCycle === 'monthly' 
      ? service.commonPrices.monthly 
      : service.commonPrices.annual || service.commonPrices.monthly;

    setFormData({
      name: service.name,
      description: service.description,
      cost: defaultPrice?.toString() || '',
      currency: settings.currency || 'USD',
      billingCycle: service.billingCycle,
      nextBilling: '',
      category: service.category,
      status: 'active',
      color: service.color
    });
    setShowPopularServices(false);
  };

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
        className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-100"
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

        {/* Popular Services Section */}
        {showPopularServices && !subscription && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-900">Popular Services</h3>
              </div>
              <button
                onClick={() => setShowPopularServices(false)}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                Add Custom
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Services Grid */}
            <div className="max-h-96 overflow-y-auto space-y-6">
              {Object.entries(servicesByCategory).map(([category, services]) => (
                <div key={category}>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 sticky top-0 bg-white py-1">
                    {category}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {services.map((service) => (
                      <button
                        key={service.name}
                        onClick={() => handleServiceSelect(service)}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-left group"
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                          style={{ backgroundColor: service.color }}
                        >
                          {service.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors truncate">
                            {service.name}
                          </h5>
                          <p className="text-xs text-gray-600 truncate">{service.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {service.commonPrices.monthly && (
                              <span className="text-xs font-medium text-green-600">
                                ${service.commonPrices.monthly}/mo
                              </span>
                            )}
                            {service.commonPrices.annual && (
                              <span className="text-xs font-medium text-blue-600">
                                ${service.commonPrices.annual}/yr
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {filteredServices.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">No services found</p>
                <button
                  onClick={() => setShowPopularServices(false)}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Add custom subscription
                </button>
              </div>
            )}
          </div>
        )}

        {/* Manual Form */}
        {(!showPopularServices || subscription) && (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {!subscription && (
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Subscription Details</h3>
                <button
                  type="button"
                  onClick={() => setShowPopularServices(true)}
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                >
                  Choose from Popular
                </button>
              </div>
            )}

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
        )}
      </div>
    </div>
  );
};

export default AddSubscriptionModal;