import React from 'react';
import { Check, Star, Zap, Building2, Mail, AlertCircle, RefreshCw } from 'lucide-react';
import { useStripe } from '../../hooks/useStripe';
import { useAuth } from '../../hooks/useAuth';
import { stripeProducts } from '../../stripe-config';

interface PricingCardProps {
  plan: {
    name: string;
    monthlyPrice: number;
    annualPrice: number;
    description: string;
    features: string[];
    cta: string;
    popular: boolean;
    gradient: string;
    monthlyPriceId: string | null; 
    annualPriceId: string | null; 
  };
  isAnnual: boolean;
  onContactSales?: () => void;
  onGetStarted?: () => void;
}

const PricingCard: React.FC<PricingCardProps> = ({ 
  plan, 
  isAnnual, 
  onContactSales, 
  onGetStarted 
}) => {
  const { user } = useAuth();
  const { redirectToCheckout, loading, error } = useStripe();

  const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
  const savings = plan.monthlyPrice > 0 ? Math.round(((plan.monthlyPrice * 12 - plan.annualPrice) / (plan.monthlyPrice * 12)) * 100) : 0;

  const handlePurchase = async () => {
    // Handle Free plan - no payment needed
    if (plan.monthlyPrice === 0 && plan.annualPrice === 0) {
      if (onGetStarted) {
        onGetStarted();
      }
      return;
    }

    // Handle Contact Sales
    if (plan.cta === 'Contact Sales') {
      onContactSales?.();
      return;
    }

    // Require authentication for paid plans
    if (!user) {
      onGetStarted?.();
      return;
    }

    // Determine the correct priceId based on the billing cycle
    const selectedPriceId = isAnnual ? plan.annualPriceId : plan.monthlyPriceId;

    if (!selectedPriceId) {
      console.error('No Stripe Price ID found for the selected plan and billing cycle.');
      return;
    }

    try {
      await redirectToCheckout({
        priceId: selectedPriceId,
        mode: 'subscription',
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/pricing`,
      });
    } catch (error) {
      console.error('Failed to redirect to checkout:', error);
    }
  };

  const getIcon = () => {
    if (plan.name === 'Free') return Zap;
    if (plan.name === 'Pro') return Star;
    if (plan.name === 'Enterprise') return Building2;
    return Star;
  };

  const Icon = getIcon();

  return (
    <div
      className={`relative rounded-2xl p-8 transition-all duration-300 hover:shadow-xl ${
        plan.popular
          ? 'ring-2 ring-purple-500 shadow-lg scale-105 z-10 bg-white'
          : 'border border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-1 shadow-lg">
            <Star className="w-4 h-4 fill-current" />
            <span>Most Popular</span>
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <p className="text-gray-600 mb-4">{plan.description}</p>
        <div className="flex items-baseline justify-center space-x-1">
          <span className="text-5xl font-bold text-gray-900">
            ${plan.name === 'Enterprise' ? (isAnnual ? price : `${price}+`) : price}
          </span>
          {plan.monthlyPrice > 0 && (
            <span className="text-gray-500 text-lg">
              /{isAnnual ? 'year' : 'month'}
            </span>
          )}
        </div>
        
        {isAnnual && plan.monthlyPrice > 0 && savings > 0 && (
          <div className="mt-2">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              Save {savings}% annually
            </span>
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800 mb-1">Payment Error</h4>
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Try again</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 mb-8">
        {plan.features.map((feature, featureIndex) => (
          <div key={featureIndex} className="flex items-start space-x-3">
            <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="text-gray-700">{feature}</span>
          </div>
        ))}
      </div>

      <button
        onClick={handlePurchase}
        disabled={loading}
        className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
          plan.popular
            ? `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-lg hover:scale-105`
            : plan.cta === 'Contact Sales'
              ? `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-lg hover:scale-105`
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <span>{plan.cta}</span>
            {plan.cta === 'Contact Sales' && <Mail className="w-4 h-4" />}
          </>
        )}
      </button>
    </div>
  );
};

export default PricingCard;