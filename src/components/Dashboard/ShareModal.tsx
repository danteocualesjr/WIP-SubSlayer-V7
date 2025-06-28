import React, { useState } from 'react';
import { X, Share2, Twitter, Facebook, Linkedin, Instagram, Copy, Check } from 'lucide-react';
import { Subscription } from '../../types/subscription';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptions: Subscription[];
  monthlyTotal: number;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  subscriptions,
  monthlyTotal
}) => {
  const [customText, setCustomText] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  const cancelledSubscriptions = subscriptions.filter(sub => sub.status === 'cancelled');
  
  // Calculate savings from cancelled subscriptions
  const monthlySavings = cancelledSubscriptions.reduce((sum, sub) => {
    return sum + (sub.billingCycle === 'monthly' ? sub.cost : sub.cost / 12);
  }, 0);
  
  const annualSavings = monthlySavings * 12;
  const totalSavings = annualSavings; // Could be calculated differently based on when subscriptions were cancelled

  const defaultText = `🎉 I'm taking control of my subscriptions with SubSlayer! 

📊 My Stats:
• Managing ${activeSubscriptions.length} active subscriptions
• Saving $${monthlySavings.toFixed(2)}/month from cancelled services
• Total annual savings: $${annualSavings.toFixed(2)}

Stop the subscription chaos and start saving! 💰`;

  const shareText = customText || defaultText;
  const shareUrl = window.location.origin;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const socialPlatforms = [
    {
      name: 'X (Twitter)',
      icon: Twitter,
      color: 'bg-black hover:bg-gray-800',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`
    },
    {
      name: 'Instagram',
      icon: Instagram,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      url: '#',
      note: 'Copy text and share manually'
    }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Share Your Success</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your SubSlayer Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{activeSubscriptions.length}</p>
                <p className="text-sm text-gray-600">Active Subscriptions</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">${monthlySavings.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Monthly Savings</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">${annualSavings.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Annual Savings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Text Input */}
        <div className="p-6 border-b border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Customize your message (optional)
          </label>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder={defaultText}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              {customText ? customText.length : defaultText.length} characters
            </p>
            <button
              onClick={() => setCustomText('')}
              className="text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              Reset to default
            </button>
          </div>
        </div>

        {/* Social Media Options */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Share on Social Media</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <button
                  key={platform.name}
                  onClick={() => {
                    if (platform.name === 'Instagram') {
                      handleCopyToClipboard();
                    } else {
                      window.open(platform.url, '_blank', 'width=600,height=400');
                    }
                  }}
                  className={`flex items-center space-x-3 p-4 rounded-xl text-white font-medium transition-all duration-200 hover:scale-105 transform shadow-lg ${platform.color}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{platform.name}</span>
                  {platform.note && (
                    <span className="text-xs opacity-75">{platform.note}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Copy to Clipboard */}
          <div className="mt-4">
            <button
              onClick={handleCopyToClipboard}
              className={`w-full flex items-center justify-center space-x-3 p-4 rounded-xl font-medium transition-all duration-200 ${
                copied 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Copied to clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Copy text and link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-500 text-center">
            Help others discover SubSlayer and take control of their subscription spending! 🚀
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;