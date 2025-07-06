import React, { useState } from 'react';
import { Check, Star, Zap, Building2, Mail, ArrowRight, Sparkles, X } from 'lucide-react';
import { SparklesCore } from '../ui/sparkles';
import PricingCard from './PricingCard';

const Pricing: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for casual users who want to try the app',
      monthlyPrice: 0,
      annualPrice: 0,
      monthlyPriceId: null,
      annualPriceId: null,
      popular: false,
      features: [
        'Track up to 7 subscriptions',
        'Email reminders 3 days before renewal',
        'Monthly spend overview',
        'Basic analytics',
        'Cost simulator (1 scenario only)'
        
      ],
      cta: 'Get Started',
      gradient: 'from-gray-500 to-gray-600',
      bgGradient: 'from-gray-50 to-white',
      borderColor: 'border-gray-200',
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For power users who actively manage subscriptions',
      monthlyPrice: 9.99,
      annualPrice: 99,
      monthlyPriceId: 'price_1RglYeCIxTxdP6ph0ajymCf0',
      annualPriceId: 'price_1RglaECIxTxdP6phSEknl1IE',
      popular: true,
      features: [
        'Unlimited subscriptions',
        'Custom renewal reminders (1–7 days)',
        'Full cost simulator access',
        'Monthly and annual spend tracking',
        'Smart insights (duplicate/unused subscriptions)',
        'Categorization with tags (Work, Entertainment)',
        'CSV export of history',
        'Priority support',
      ],
      cta: 'Upgrade Now',
      gradient: 'from-purple-600 to-violet-600',
      bgGradient: 'from-purple-50 to-violet-50',
      borderColor: 'border-purple-200',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For startups and teams managing multiple tools/licenses',
      monthlyPrice: null,
      annualPrice: null,
      monthlyPriceId: null,
      annualPriceId: null,
      popular: false,
      features: [
        'Everything in Pro',
        'Unlimited users',
        'Team dashboards & role-based access',
        'Company-wide subscription reporting',
        'Renewal controls (pause/assign/approve)',
        'Slack/Email admin alerts',
        'Accounting integrations (QuickBooks, Xero)',
        'SSO & Google Workspace integration',
        'Dedicated success manager',
      ],
      cta: 'Contact Sales',
      gradient: 'from-emerald-600 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200',
    },
  ];

  const handleContactSales = () => {
    setShowContactForm(true);
  };

  const ContactModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Contact Sales</h3>
          <button
            onClick={() => setShowContactForm(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Get in Touch</h4>
          <p className="text-gray-600 mb-6">
            Ready to transform your subscription management? Let's discuss how SubSlayer Enterprise can help your team.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">Email us directly at:</p>
            <a 
              href="mailto:dante@nativestack.ai"
              className="text-lg font-semibold text-purple-600 hover:text-purple-700 transition-colors"
            >
              dante@nativestack.ai
            </a>
          </div>
          
          <button
            onClick={() => setShowContactForm(false)}
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white py-3 rounded-lg font-medium transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Enhanced Hero Section with Sparkles */}
      <div className="relative bg-gradient-to-br from-purple-900 via-violet-800 to-purple-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white overflow-hidden">
        {/* Sparkles Background */}
        <div className="absolute inset-0 w-full h-full">
          <SparklesCore
            id="pricing-sparkles"
            background="transparent"
            minSize={0.3}
            maxSize={1.4}
            particleDensity={100}
            className="w-full h-full"
            particleColor="#ffffff"
            speed={1.0}
          />
        </div>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 opacity-25">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/30 to-violet-400/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-violet-400/30 to-purple-400/30 rounded-full blur-3xl"></div>
        </div>

        {/* Radial gradient to prevent sharp edges */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-900/50 via-violet-800/50 to-purple-700/50 [mask-image:radial-gradient(800px_400px_at_center,transparent_20%,white)]"></div>
        
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 bg-purple-100/20 text-purple-200 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Choose Your Plan</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
            Simple, transparent pricing
          </h1>
          
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Take control of your subscriptions with plans designed for every need. 
            Start free and upgrade as you grow.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-white' : 'text-white/60'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-purple-600' : 'bg-white/20'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-white' : 'text-white/60'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="bg-green-100/20 text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                Save 17%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => (
      
        <PricingCard
            key={plan.id}
            plan={{
              ...plan, // Keep all existing plan properties
              monthlyPriceId: plan.monthlyPriceId, // Pass the new monthly price ID
              annualPriceId: plan.annualPriceId,   // Pass the new annual price ID
            }}
            isAnnual={isAnnual}
            onContactSales={handleContactSales}
          />

      
        ))}
      </div>

      {/* FAQ Section */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 md:p-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about our pricing and plans.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I change plans anytime?</h4>
              <p className="text-gray-600 text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                and we'll prorate any billing differences.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-600 text-sm">
                We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. 
                Enterprise customers can also pay via bank transfer.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h4>
              <p className="text-gray-600 text-sm">
                Our Free plan lets you try SubSlayer with up to 5 subscriptions. For Pro and 
                Enterprise plans, we offer a 14-day free trial with full access.
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What happens to my data if I cancel?</h4>
              <p className="text-gray-600 text-sm">
                Your data remains accessible for 30 days after cancellation. You can export all your 
                data anytime, and we'll permanently delete it after the retention period.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Do you offer discounts for nonprofits?</h4>
              <p className="text-gray-600 text-sm">
                Yes! We offer 50% off Pro and Enterprise plans for qualified nonprofit 
                organizations. Contact our sales team for more information.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">How does billing work for teams?</h4>
              <p className="text-gray-600 text-sm">
                Enterprise plans are billed per user per month. You can add or remove team members 
                anytime, and billing adjusts automatically for the next cycle.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Sales Modal */}
      {showContactForm && <ContactModal />}

      {/* Bottom CTA */}
      <div className="bg-gradient-to-br from-purple-900 via-violet-800 to-purple-700 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
        {/* Sparkles Background */}
        <div className="absolute inset-0 w-full h-full">
          <SparklesCore
            id="cta-sparkles"
            background="transparent"
            minSize={0.2}
            maxSize={1.0}
            particleDensity={60}
            className="w-full h-full"
            particleColor="#ffffff"
            speed={0.8}
          />
        </div>
        
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to take control of your subscriptions?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have saved money and time with SubSlayer. 
            Start your journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2">
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={handleContactSales}
              className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition-colors border border-white/30"
            >
              Talk to Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;