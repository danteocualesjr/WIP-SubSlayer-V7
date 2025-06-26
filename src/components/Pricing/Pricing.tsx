import React, { useState } from 'react';
import { Check, Star, Zap, Building2, Mail, ArrowRight, Sparkles } from 'lucide-react';

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
      popular: false,
      features: [
        'Track up to 5 subscriptions',
        'Email reminders 3 days before renewal',
        'Monthly spend overview',
        'Basic analytics',
        'Cost simulator (1 scenario only)',
      ],
      cta: 'Get Started',
      gradient: 'from-gray-500 to-gray-600',
      bgGradient: 'from-gray-50 to-white',
      borderColor: 'border-gray-200',
    },
    {
      id: 'individual',
      name: 'Individual',
      description: 'For power users who actively manage subscriptions',
      monthlyPrice: 9.99,
      annualPrice: 99,
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
      gradient: 'from-purple-600 to-blue-600',
      bgGradient: 'from-purple-50 to-blue-50',
      borderColor: 'border-purple-200',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For startups and teams managing multiple tools/licenses',
      monthlyPrice: 99,
      annualPrice: 990,
      popular: false,
      features: [
        'Everything in Individual',
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

  const calculateSavings = (monthlyPrice: number, annualPrice: number) => {
    if (monthlyPrice === 0) return 0;
    const monthlyCost = monthlyPrice * 12;
    return Math.round(((monthlyCost - annualPrice) / monthlyCost) * 100);
  };

  const handleContactSales = () => {
    setShowContactForm(true);
  };

  const ContactForm = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Contact Sales</h3>
          <button
            onClick={() => setShowContactForm(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Work Email *
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your work email"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your company name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Size
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option>1-10 employees</option>
              <option>11-50 employees</option>
              <option>51-200 employees</option>
              <option>200+ employees</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Tell us about your needs..."
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowContactForm(false)}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          <span>Choose Your Plan</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          Simple, transparent pricing
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Take control of your subscriptions with plans designed for every need. 
          Start free and upgrade as you grow.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center space-x-4">
          <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isAnnual ? 'bg-purple-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isAnnual ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
            Annual
          </span>
          {isAnnual && (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
              Save 17%
            </span>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
          const savings = calculateSavings(plan.monthlyPrice, plan.annualPrice);
          
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-8 transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? 'ring-2 ring-purple-500 shadow-lg scale-105 z-10'
                  : 'border border-gray-200 hover:border-gray-300'
              }`}
              style={{
                background: plan.popular
                  ? 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
                  : 'white'
              }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-1 shadow-lg">
                    <Star className="w-4 h-4 fill-current" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}>
                  {plan.id === 'free' && <Zap className="w-8 h-8 text-white" />}
                  {plan.id === 'individual' && <Star className="w-8 h-8 text-white" />}
                  {plan.id === 'enterprise' && <Building2 className="w-8 h-8 text-white" />}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{plan.description}</p>
              </div>

              {/* Pricing */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center space-x-1">
                  <span className="text-5xl font-bold text-gray-900">
                    ${plan.id === 'enterprise' ? (isAnnual ? price : `${price}+`) : price}
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
                
                {plan.id === 'enterprise' && (
                  <p className="text-sm text-gray-500 mt-2">Starting price per month</p>
                )}
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={plan.id === 'enterprise' ? handleContactSales : undefined}
                className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                  plan.popular
                    ? `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-lg hover:scale-105`
                    : plan.id === 'enterprise'
                      ? `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-lg hover:scale-105`
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                <span>{plan.cta}</span>
                {plan.id === 'enterprise' ? (
                  <Mail className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </div>
          );
        })}
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
                Our Free plan lets you try SubSlayer with up to 5 subscriptions. For Individual and 
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
                Yes! We offer 50% off Individual and Enterprise plans for qualified nonprofit 
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
      {showContactForm && <ContactForm />}

      {/* Bottom CTA */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-emerald-500 rounded-3xl p-8 md:p-12 text-center text-white">
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
  );
};

export default Pricing;