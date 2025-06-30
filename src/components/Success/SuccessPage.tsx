import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, Sparkles, Gift, Star } from 'lucide-react';
import { SparklesCore } from '../ui/sparkles';
import { useSubscription } from '../../hooks/useSubscription';

const SuccessPage: React.FC = () => {
  const { subscription, loading, refetch } = useSubscription();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Refetch subscription data when component mounts
    refetch();
    
    // Hide confetti after 3 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [refetch]);

  const handleContinue = () => {
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-800 to-purple-700 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Sparkles Background */}
      <div className="absolute inset-0 w-full h-full">
        <SparklesCore
          id="success-sparkles"
          background="transparent"
          minSize={0.4}
          maxSize={1.8}
          particleDensity={showConfetti ? 200 : 100}
          className="w-full h-full"
          particleColor="#ffffff"
          speed={showConfetti ? 2.0 : 1.0}
        />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-2xl w-full relative z-10">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12 text-center shadow-2xl">
          {/* Success Icon */}
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            {showConfetti && (
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-ping"></div>
            )}
          </div>

          {/* Success Message */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome to SubSlayer!
          </h1>
          
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            🎉 Your purchase was successful! You now have access to all SubSlayer features. 
            Start taking control of your subscriptions today.
          </p>

          {/* Features Highlight */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center space-x-2">
              <Gift className="w-5 h-5" />
              <span>What's included:</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/90">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-300" />
                <span>Unlimited subscription tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-300" />
                <span>AI-powered insights</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-300" />
                <span>Advanced analytics</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-300" />
                <span>Smart notifications</span>
              </div>
            </div>
          </div>

          {/* Subscription Status */}
          {subscription && (
            <div className="bg-green-500/20 backdrop-blur-sm rounded-2xl p-4 mb-8 border border-green-400/30">
              <p className="text-green-200 text-sm">
                ✅ Your SubSlayer access is now active
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleContinue}
              className="w-full bg-white hover:bg-gray-100 text-purple-600 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl"
            >
              <span>Start Managing Subscriptions</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <p className="text-white/70 text-sm">
              Need help getting started? Check out our quick start guide or contact support.
            </p>
          </div>

          {/* Thank You Note */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-white/80 text-sm">
              Thank you for choosing SubSlayer! We're excited to help you take control of your subscriptions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;