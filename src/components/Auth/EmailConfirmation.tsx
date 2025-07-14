import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader, ArrowRight, Sword } from 'lucide-react';
import { SparklesCore } from '../ui/sparkles';
import { supabase } from '../../lib/supabase';

interface EmailConfirmationProps {
  onComplete: () => void;
}

const EmailConfirmation: React.FC<EmailConfirmationProps> = ({ onComplete }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Get token from URL
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (!token) {
          setStatus('error');
          setMessage('Invalid confirmation link. No token provided.');
          return;
        }

        // Call the confirm_user_email function
        const { data, error } = await supabase.rpc('confirm_user_email', {
          token_input: token
        });

        if (error) {
          console.error('Error confirming email:', error);
          setStatus('error');
          setMessage('Failed to confirm your email. The link may have expired or is invalid.');
          return;
        }

        if (data === true) {
          setStatus('success');
          setMessage('Your email has been confirmed successfully!');
          
          // Clean up URL
          window.history.replaceState({}, document.title, '/');
        } else {
          setStatus('error');
          setMessage('Failed to confirm your email. The link may have expired or is invalid.');
        }
      } catch (error) {
        console.error('Error during email confirmation:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again later.');
      }
    };

    confirmEmail();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-800 to-purple-700 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Sparkles Background */}
      <div className="absolute inset-0 w-full h-full">
        <SparklesCore
          id="confirmation-sparkles"
          background="transparent"
          minSize={0.4}
          maxSize={1.8}
          particleDensity={150}
          className="w-full h-full"
          particleColor="#ffffff"
          speed={0.5}
        />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center shadow-2xl">
          {/* Logo */}
          <div className="inline-flex items-center space-x-3 mb-8 hover:opacity-80 transition-opacity group">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center transform rotate-12 group-hover:rotate-6 transition-transform duration-300">
              <Sword className="w-6 h-6 text-purple-600 transform -rotate-12 group-hover:-rotate-6 transition-transform duration-300" />
            </div>
            <span className="text-2xl font-bold text-white">
              SubSlayer
            </span>
          </div>
          
          {/* Status Icon */}
          <div className="mb-6">
            {status === 'loading' && (
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                <Loader className="w-10 h-10 text-white animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-10 h-10 text-white" />
              </div>
            )}
          </div>
          
          {/* Message */}
          <h2 className="text-2xl font-bold text-white mb-4">
            {status === 'loading' ? 'Verifying Your Email' : 
             status === 'success' ? 'Email Confirmed!' : 
             'Confirmation Failed'}
          </h2>
          <p className="text-white/90 text-lg mb-8">
            {message}
          </p>
          
          {/* Action Button */}
          {status !== 'loading' && (
            <button
              onClick={onComplete}
              className="bg-white hover:bg-gray-100 text-purple-600 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 mx-auto shadow-xl hover:shadow-2xl"
            >
              <span>{status === 'success' ? 'Continue to Dashboard' : 'Back to Sign In'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;