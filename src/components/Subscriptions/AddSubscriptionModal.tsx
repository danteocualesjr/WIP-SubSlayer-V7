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
    description: subscription?.description || '',
    cost: subscription?.cost || '',
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
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={handleBackdropClick}
    >
      {/* ... rest of the JSX ... */}
    </div>
  );
};

export default AddSubscriptionModal;