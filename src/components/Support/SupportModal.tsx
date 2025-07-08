import React, { useState } from 'react';
import { X, Mail, Send, MessageSquare, HelpCircle, ThumbsUp, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FeedbackType = 'question' | 'bug' | 'feature' | 'feedback';

const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('question');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Prepare email content
      const emailContent = {
        to: 'dante@nativestack.ai',
        subject: `SubSlayer ${feedbackType.charAt(0).toUpperCase() + feedbackType.slice(1)} from ${profile.displayName || user?.email}`,
        body: `
Type: ${feedbackType}
From: ${profile.displayName || 'User'} (${user?.email})
Message:

${message}
        `,
      };
      
      // Open default email client
      const mailtoUrl = `mailto:${emailContent.to}?subject=${encodeURIComponent(emailContent.subject)}&body=${encodeURIComponent(emailContent.body)}`;
      window.open(mailtoUrl, '_blank');
      
      // Mark as submitted
      setIsSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setMessage('');
        setFeedbackType('question');
        setIsSubmitted(false);
        onClose();
      }, 3000);
    } catch (err) {
      console.error('Error sending feedback:', err);
      setError('Failed to send your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const feedbackTypes: { id: FeedbackType; label: string; icon: React.ElementType; description: string }[] = [
    { 
      id: 'question', 
      label: 'Question', 
      icon: HelpCircle,
      description: 'Ask a question about how to use SubSlayer'
    },
    { 
      id: 'bug', 
      label: 'Report a Bug', 
      icon: AlertCircle,
      description: 'Let us know if something isn\'t working correctly'
    },
    { 
      id: 'feature', 
      label: 'Feature Request', 
      icon: ThumbsUp,
      description: 'Suggest a new feature or improvement'
    },
    { 
      id: 'feedback', 
      label: 'General Feedback', 
      icon: MessageSquare,
      description: 'Share your thoughts about SubSlayer'
    }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Contact Support</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isSubmitted ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Message Sent!</h3>
            <p className="text-gray-600">
              Thank you for your feedback. We'll get back to you as soon as possible.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Feedback Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What would you like to do?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {feedbackTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFeedbackType(type.id)}
                      className={`p-3 border-2 rounded-xl transition-all duration-200 flex flex-col items-center text-center ${
                        feedbackType === type.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mb-2 ${
                        feedbackType === type.id ? 'text-purple-600' : 'text-gray-500'
                      }`} />
                      <span className={`text-sm font-medium ${
                        feedbackType === type.id ? 'text-purple-700' : 'text-gray-700'
                      }`}>
                        {type.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {feedbackTypes.find(t => t.id === feedbackType)?.description}
              </p>
            </div>

            {/* Message Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder={`Type your ${feedbackType} here...`}
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Send Message</span>
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Your message will be sent to dante@nativestack.ai
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default SupportModal;