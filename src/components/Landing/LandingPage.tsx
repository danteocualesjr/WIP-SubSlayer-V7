import React, { useState } from 'react';
import { Sword, ArrowRight, Check, Star, Zap, Shield, TrendingUp, Calendar, DollarSign, Users, ChevronDown, Menu, X, Sparkles, Target, Brain, BarChart3, Play, Mail } from 'lucide-react';
import { SparklesCore } from '../ui/sparkles';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState<string | null>(null);

  const features = [
    {
      icon: Sword,
      title: "Slay Subscription Chaos",
      description: "Take complete control of your recurring payments with our intelligent tracking system."
    },
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Get personalized recommendations from Swordie AI to optimize your spending."
    },
    {
      icon: Calendar,
      title: "Never Miss a Renewal",
      description: "Smart notifications ensure you're always aware of upcoming charges."
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Visualize your spending patterns with beautiful charts and detailed breakdowns."
    },
    {
      icon: Target,
      title: "Cost Simulator",
      description: "Model different scenarios to find the perfect subscription portfolio."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your financial data is protected with enterprise-grade security."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      avatar: "SC",
      content: "SubSlayer helped me save $200/month by identifying subscriptions I forgot about. The AI insights are incredibly helpful!",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Freelance Designer",
      avatar: "MR",
      content: "The calendar view is a game-changer. I can see all my renewals at a glance and plan my budget accordingly.",
      rating: 5
    },
    {
      name: "Emily Watson",
      role: "Startup Founder",
      avatar: "EW",
      content: "Managing team subscriptions was a nightmare until SubSlayer. Now everything is organized and transparent.",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      monthlyPriceId: null,
      annualPriceId: null,
      description: "Perfect for getting started",
      features: [
        "Track up to 5 subscriptions",
        "Email reminders",
        "Monthly spend overview",
        "Basic analytics",
        "Cost simulator (1 scenario only)"
      ],
      cta: "Get Started Free",
      popular: false,
      gradient: "from-gray-500 to-gray-600",
      bgGradient: "from-gray-50 to-white",
      borderColor: "border-gray-200"
    },
    {
      name: "Pro",
      monthlyPriceId: "price_1RglYeCIxTxdP6ph0ajymCf0",
      annualPriceId: "price_1RglaECIxTxdP6phSEknl1IE",
      monthlyPrice: 9.99,
      annualPrice: 99,
      description: "For power users",
      features: [
        "Unlimited subscriptions",
        "Custom renewal reminders (1–7 days)",
        "Full cost simulator access",
        "Monthly and annual spend tracking",
        "Smart insights (duplicate/unused subscriptions)",
        "Categorization with tags (Work, Entertainment)",
        "CSV export of history",
        "Priority support"
      ],
      cta: "Start Pro Trial",
      popular: true,
      gradient: "from-purple-600 to-violet-600",
      bgGradient: "from-purple-50 to-violet-50",
      borderColor: "border-purple-200"
    },
    {
      name: "Enterprise",
      monthlyPriceId: null,
      annualPriceId: null,
      monthlyPrice: null,
      annualPrice: null,
      description: "For teams and businesses",
      features: [
        "Everything in Pro",
        "Unlimited users",
        "Team dashboards & role-based access",
        "Company-wide subscription reporting",
        "Renewal controls (pause/assign/approve)",
        "Slack/Email admin alerts",
        "Accounting integrations (QuickBooks, Xero)",
        "SSO & Google Workspace integration",
        "Dedicated success manager"
      ],
      cta: "Contact Sales",
      popular: false,
      gradient: "from-emerald-600 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50",
      borderColor: "border-emerald-200"
    }
  ];

  const stats = [
    { number: "$3,300", label: "Average yearly savings" },
    { number: "15+", label: "Subscriptions tracked per user" },
    { number: "24/7", label: "Monitoring & alerts" }
  ];

  const handleContactSales = () => {
    setShowContact(true);
  };

  const handleComingSoon = (page: string) => {
    setShowComingSoon(page);
  };

  const ContactPage = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Contact Sales</h3>
          <button
            onClick={() => setShowContact(false)}
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
            onClick={() => setShowContact(false)}
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white py-3 rounded-lg font-medium transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  const ComingSoonModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">{showComingSoon}</h3>
          <button
            onClick={() => setShowComingSoon(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon!</h4>
          <p className="text-gray-600 mb-6">
            We're working hard to bring you amazing {showComingSoon?.toLowerCase()} content. Stay tuned for updates!
          </p>
          
          <button
            onClick={() => setShowComingSoon(null)}
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white py-3 rounded-lg font-medium transition-all duration-200"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white relative">
      {/* Bolt Badge - Fixed position in lower left */}
      <a 
        href="https://bolt.new" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 transition-all duration-300 hover:scale-110 hover:shadow-lg"
      >
        <img 
          src="/bolt-badge.svg" 
          alt="Powered by Bolt.new" 
          className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-lg"
        />
      </a>

      {/* Hero Section with Navigation - Seamless Purple Background */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Unified Purple Gradient Background for both nav and hero */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-violet-800 to-purple-700"></div>
        
        {/* Sparkles Background */}
        <div className="absolute inset-0 w-full h-full">
          <SparklesCore
            id="hero-sparkles"
            background="transparent"
            minSize={0.4}
            maxSize={1.2}
            particleDensity={120}
            className="w-full h-full"
            particleColor="#ffffff"
            speed={1.0}
          />
        </div>

        {/* Gradient Overlays for depth */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-violet-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-violet-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-purple-400/10 to-violet-400/10 rounded-full blur-3xl"></div>
        </div>

        {/* Navigation - Now part of the hero section */}
        <nav className="relative z-50 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center transform rotate-12 shadow-lg border border-white/30">
                  <Sword className="w-6 h-6 text-white transform -rotate-12" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">
                    SubSlayer
                  </span>
                  <div className="flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-purple-300" />
                    <span className="text-xs text-purple-200 font-medium">Beta</span>
                  </div>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-white/80 hover:text-white font-medium transition-colors">Features</a>
                <a href="#demo" className="text-white/80 hover:text-white font-medium transition-colors">Demo</a>
                <a href="#pricing" className="text-white/80 hover:text-white font-medium transition-colors">Pricing</a>
                <a href="#testimonials" className="text-white/80 hover:text-white font-medium transition-colors">Reviews</a>
                <button
                  onClick={onGetStarted}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl border border-white/30 hover:border-white/50"
                >
                  Get Started
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden backdrop-blur-xl border-t border-white/10">
              <div className="px-4 py-4 space-y-4">
                <a href="#features" className="block text-white/80 hover:text-white font-medium transition-colors">Features</a>
                <a href="#demo" className="block text-white/80 hover:text-white font-medium transition-colors">Demo</a>
                <a href="#pricing" className="block text-white/80 hover:text-white font-medium transition-colors">Pricing</a>
                <a href="#testimonials" className="block text-white/80 hover:text-white font-medium transition-colors">Reviews</a>
                <button
                  onClick={onGetStarted}
                  className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 border border-white/30"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Content */}
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white/90 px-6 py-3 rounded-full text-sm font-medium mb-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Introducing SubSlayer - Now in Beta</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white relative z-20 mb-8 leading-tight">
            Slay Your
            <br />
            <span className="text-white">
              Subscription
            </span>
            <br />
            Chaos
          </h1>

          {/* Subtitle */}
          <p className="text-white/90 text-xl md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed">
            Take complete control of your recurring payments with intelligent tracking, 
            AI-powered insights, and beautiful analytics. Never overpay again.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
            <button
              onClick={onGetStarted}
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 transform flex items-center space-x-2"
            >
              <span>Start Free Today</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="text-white/90 hover:text-white font-semibold text-lg flex items-center space-x-2 transition-colors group">
              <span>Watch Demo</span>
              <div className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 border border-white/20 group-hover:scale-110">
                <ArrowRight className="w-5 h-5" />
              </div>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-white/80 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to
              <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent"> Master </span>
              Your Subscriptions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From intelligent tracking to AI-powered insights, SubSlayer gives you the tools to optimize your subscription spending.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-gradient-to-br from-white to-purple-50/50 rounded-2xl p-8 border border-purple-100 hover:shadow-xl transition-all duration-300 hover:scale-105 transform group">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Meet Your Subscription Slayer Section */}
      <section id="demo" className="py-20 bg-gradient-to-br from-purple-900 via-violet-800 to-purple-700 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/30 to-violet-400/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-violet-400/30 to-purple-400/30 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Meet Your Subscription Slayer
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              SubSlayer is the ultimate weapon against subscription chaos. Track, analyze, 
              and optimize all your recurring expenses in one powerful dashboard.
            </p>
          </div>

          {/* Video Demo Container */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">See SubSlayer in Action</h3>
                <p className="text-white/80">Watch how easy it is to take control of your subscriptions</p>
              </div>

              {/* YouTube Video Embed */}
              <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                <div className="aspect-video">
                  <iframe
                    src="https://www.youtube.com/embed/qq_iZdAP9hg"
                    title="SubSlayer Demo - Subscription Management Platform"
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center mt-8">
                <button
                  onClick={onGetStarted}
                  className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 transform flex items-center space-x-2 mx-auto"
                >
                  <span>Try SubSlayer Free</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-purple-50 to-violet-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Loved by
              <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent"> Users </span>
              
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how SubSlayer is helping people take control of their subscription spending.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
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
              Simple,
              <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent"> Transparent </span>
              Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Choose the plan that's right for you. Start free and upgrade as you grow.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-12">
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
                  Save up to 17%
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => {
              const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
              const savings = plan.monthlyPrice > 0 ? Math.round(((plan.monthlyPrice * 12 - plan.annualPrice) / (plan.monthlyPrice * 12)) * 100) : 0;
              
              return (
                <div
                  key={index}
                  className={`relative rounded-2xl p-8 transition-all duration-300 hover:shadow-xl bg-gradient-to-br ${
                    plan.popular
                      ? 'ring-2 ring-purple-500 shadow-lg scale-105 z-10 bg-white'
                      : `border ${plan.borderColor} hover:border-gray-300 ${plan.bgGradient}`
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
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center space-x-1 min-h-[60px]">
                      <span className="text-5xl font-bold text-gray-900">
                        {plan.name === 'Free' ? '$0' : 
                         plan.name === 'Enterprise' ? 'Custom' : 
                         `$${price}`}
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
                    onClick={plan.cta === 'Contact Sales' ? handleContactSales : onGetStarted}
                    className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
                      plan.popular
                        ? `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-lg hover:scale-105`
                        : plan.cta === 'Contact Sales'
                          ? `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-lg hover:scale-105`
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Purple Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-violet-800 to-purple-700"></div>
        
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

        {/* Gradient Overlays */}
        <div className="absolute inset-0 opacity-25">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/30 to-violet-400/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-violet-400/30 to-purple-400/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Slay Your Subscription Chaos?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have taken control of their recurring payments. Start your journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGetStarted}
              className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={handleContactSales}
              className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition-colors border border-white/30"
            >
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center transform rotate-12">
                  <Sword className="w-6 h-6 text-white transform -rotate-12" />
                </div>
                <span className="text-2xl font-bold">SubSlayer</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                The ultimate subscription management platform. Take control of your recurring payments with intelligent tracking and AI-powered insights.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                  <span className="text-sm font-bold">𝕏</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                  <span className="text-sm font-bold">in</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                  <span className="text-sm font-bold">f</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><button onClick={() => handleComingSoon('Integrations')} className="hover:text-white transition-colors text-left">Integrations</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => handleComingSoon('About')} className="hover:text-white transition-colors text-left">About</button></li>
                <li><button onClick={() => handleComingSoon('Blog')} className="hover:text-white transition-colors text-left">Blog</button></li>
                <li><button onClick={() => handleComingSoon('Careers')} className="hover:text-white transition-colors text-left">Careers</button></li>
                <li><button onClick={handleContactSales} className="hover:text-white transition-colors text-left">Contact</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 SubSlayer by NativeStack AI LLC. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <button onClick={() => handleComingSoon('Privacy Policy')} className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</button>
              <button onClick={() => handleComingSoon('Terms of Service')} className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</button>
              <button onClick={() => handleComingSoon('Cookie Policy')} className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      {showContact && <ContactPage />}

      {/* Coming Soon Modal */}
      {showComingSoon && <ComingSoonModal />}
    </div>
  );
};

export default LandingPage;