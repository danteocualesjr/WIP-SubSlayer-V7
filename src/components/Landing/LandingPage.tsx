import React, { useState } from 'react';
import { 
  Sword, 
  ArrowRight, 
  Check, 
  Star, 
  TrendingUp, 
  Shield, 
  Zap, 
  Calendar, 
  DollarSign, 
  Bell,
  Users,
  BarChart3,
  CreditCard,
  Sparkles,
  Play,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { SparklesCore } from '../ui/sparkles';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: CreditCard,
      title: 'Smart Tracking',
      description: 'Automatically track all your subscriptions in one place with intelligent categorization and cost analysis.',
      image: '/api/placeholder/600/400'
    },
    {
      icon: Bell,
      title: 'Never Miss a Payment',
      description: 'Get timely reminders before renewals and avoid unwanted charges with customizable notifications.',
      image: '/api/placeholder/600/400'
    },
    {
      icon: BarChart3,
      title: 'Powerful Analytics',
      description: 'Visualize your spending patterns and discover optimization opportunities with detailed insights.',
      image: '/api/placeholder/600/400'
    },
    {
      icon: Sword,
      title: 'AI Assistant',
      description: 'Chat with Swordie AI for personalized recommendations and instant answers about your subscriptions.',
      image: '/api/placeholder/600/400'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Product Manager',
      company: 'TechCorp',
      avatar: '/api/placeholder/64/64',
      content: 'SubSlayer helped me save over $200/month by identifying subscriptions I forgot about. The AI insights are incredibly helpful!',
      rating: 5
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Freelance Designer',
      company: 'Independent',
      avatar: '/api/placeholder/64/64',
      content: 'As a freelancer managing multiple tools, SubSlayer keeps me organized and helps me track business expenses effortlessly.',
      rating: 5
    },
    {
      name: 'Emily Watson',
      role: 'Startup Founder',
      company: 'InnovateLab',
      avatar: '/api/placeholder/64/64',
      content: 'The calendar view and renewal predictions have been game-changers for our startup\'s budget planning.',
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        'Track up to 5 subscriptions',
        'Basic analytics',
        'Email reminders',
        'Mobile app access'
      ],
      cta: 'Get Started Free',
      popular: false
    },
    {
      name: 'Pro',
      price: 9.99,
      period: 'month',
      description: 'For power users',
      features: [
        'Unlimited subscriptions',
        'Advanced analytics & insights',
        'AI-powered recommendations',
        'Custom categories & tags',
        'Export data',
        'Priority support'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Team',
      price: 29.99,
      period: 'month',
      description: 'For teams and businesses',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'Admin controls',
        'Bulk management',
        'API access',
        'Dedicated support'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const stats = [
    { number: '50K+', label: 'Active Users' },
    { number: '$2M+', label: 'Saved Monthly' },
    { number: '99.9%', label: 'Uptime' },
    { number: '4.9/5', label: 'User Rating' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl flex items-center justify-center transform rotate-12">
                <Sword className="w-6 h-6 text-white transform -rotate-12" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                SubSlayer
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Reviews</a>
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
                <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Reviews</a>
                <button
                  onClick={onGetStarted}
                  className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl w-full"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Sparkles Background */}
        <div className="absolute inset-0 w-full h-full">
          <SparklesCore
            id="hero-sparkles"
            background="transparent"
            minSize={0.3}
            maxSize={1.0}
            particleDensity={50}
            className="w-full h-full"
            particleColor="#8B5CF6"
            speed={0.5}
          />
        </div>

        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-violet-50"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Trusted by 50,000+ users worldwide</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Slay Your
              <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent block">
                Subscription Chaos
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Take control of your recurring expenses with intelligent tracking, AI-powered insights, 
              and never miss another renewal again.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 transform flex items-center space-x-2"
              >
                <span>Start Free Today</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Play className="w-5 h-5 text-purple-600 ml-1" />
                </div>
                <span className="font-medium">Watch Demo</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything you need to
              <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent"> master subscriptions</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From intelligent tracking to AI-powered insights, SubSlayer provides all the tools 
              you need to optimize your subscription spending.
            </p>
          </div>

          {/* Feature Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                      activeFeature === index
                        ? 'bg-white shadow-lg border-2 border-purple-200'
                        : 'bg-white/50 hover:bg-white hover:shadow-md'
                    }`}
                    onClick={() => setActiveFeature(index)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        activeFeature === index
                          ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white'
                          : 'bg-purple-100 text-purple-600'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Feature Preview */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div className="aspect-video bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    {React.createElement(features[activeFeature].icon, { className: "w-8 h-8 text-white" })}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{features[activeFeature].title}</h4>
                  <p className="text-gray-600 text-sm">{features[activeFeature].description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why choose SubSlayer?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of users who have transformed their subscription management experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Save Money</h3>
              <p className="text-gray-600">
                Users save an average of $200+ per month by identifying and canceling unused subscriptions.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Stay Protected</h3>
              <p className="text-gray-600">
                Never get surprised by unexpected charges with intelligent renewal reminders and alerts.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Optimize Spending</h3>
              <p className="text-gray-600">
                Get AI-powered insights and recommendations to optimize your subscription portfolio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Loved by users worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our community has to say about their SubSlayer experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role} at {testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your needs. Start free and upgrade as you grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative p-8 rounded-2xl border-2 transition-all duration-300 ${
                  plan.popular
                    ? 'border-purple-500 shadow-xl scale-105 bg-white'
                    : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-500">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={onGetStarted}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-900 via-violet-800 to-purple-700 relative overflow-hidden">
        {/* Sparkles Background */}
        <div className="absolute inset-0 w-full h-full">
          <SparklesCore
            id="cta-sparkles"
            background="transparent"
            minSize={0.3}
            maxSize={1.2}
            particleDensity={80}
            className="w-full h-full"
            particleColor="#ffffff"
            speed={0.8}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to slay your subscription chaos?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have taken control of their subscriptions. 
            Start your free account today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={onGetStarted}
              className="bg-white text-purple-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-100 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 transform flex items-center space-x-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-white/80 text-sm">No credit card required • Free forever plan available</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl flex items-center justify-center transform rotate-12">
                  <Sword className="w-6 h-6 text-white transform -rotate-12" />
                </div>
                <span className="text-2xl font-bold">SubSlayer</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Take control of your subscription chaos with intelligent tracking, 
                AI-powered insights, and never miss another renewal again.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-gray-400 text-sm">4.9/5 from 2,000+ reviews</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">
              © 2024 SubSlayer. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;