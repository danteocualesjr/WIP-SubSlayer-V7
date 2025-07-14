import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sword, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { SparklesCore } from '../ui/sparkles';

const AuthForm: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'info' | 'warning' | 'error'} | null>(null);
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const [resendEmail, setResendEmail] = useState('');

  const { signUp, signIn, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
        } else {
          setMessage({
            text: 'Check your email for the confirmation link! You need to confirm your email before you can sign in.',
            type: 'success'
          });
          setShowResendConfirmation(true);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          // Check if the error is about email confirmation
          if (error.message?.includes('Email not confirmed')) {
            setMessage({
              text: 'Please confirm your email address before signing in. Check your inbox for a confirmation link.',
              type: 'warning'
            });
            setShowResendConfirmation(true);
            setResendEmail(email);
          } else {
            setError(error.message);
          }
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      const emailToResend = resendEmail || email;
      
      if (!emailToResend) {
        setError('Please enter your email address');
        setLoading(false);
        return;
      }
      
      // Call the resend confirmation endpoint
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resend-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailToResend }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setMessage({
          text: 'Confirmation email has been resent. Please check your inbox.',
          type: 'success'
        });
      }
    } catch (err) {
      setError('An unexpected error occurred while resending the confirmation email');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('An unexpected error occurred during Google sign-in');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoClick = () => {
    // Navigate back to landing page by reloading the page
    // This will trigger the landing page to show since user is not authenticated
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-800 to-purple-700 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Sparkles Background */}
      <div className="absolute inset-0 w-full h-full">
        <SparklesCore
          id="auth-sparkles"
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
        {/* Logo */}
        <div className="text-center mb-8">
          <button
            onClick={handleLogoClick}
            className="inline-flex items-center space-x-3 mb-8 hover:opacity-80 transition-opacity group"
          >
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center transform rotate-12 group-hover:rotate-6 transition-transform duration-300">
              <Sword className="w-5 h-5 text-purple-600 transform -rotate-12 group-hover:-rotate-6 transition-transform duration-300" />
            </div>
            <span className="text-2xl font-bold text-white">
              SubSlayer
            </span>
          </button>
          
          <h1 className="text-4xl font-bold text-white mb-3">
            Welcome back
          </h1>
          <p className="text-white/80 text-lg">
            Sign in to your account
          </p>
        </div>

        {/* Auth Form */}
        <div className="space-y-6">
          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-800">G</span>
                </div>
                <span className="font-medium">Continue with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-white/60">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-3">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
                  <Mail className="text-white/80 w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/15 rounded-2xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 border-0 outline-none [&::placeholder]:text-white/60"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-white/90 text-sm font-medium">
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    className="text-white/60 hover:text-white/80 text-sm underline transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
                  <Lock className="text-white/80 w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-14 py-4 bg-white/15 rounded-2xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 border-0 outline-none [&::placeholder]:text-white/60"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white transition-colors z-10"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && !message && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-200 flex-shrink-0 mt-0.5" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              </div>
            )}
            {message && (
              <div className={`${
                message.type === 'success' ? 'bg-green-500/20 border-green-400/30 text-green-200' :
                message.type === 'warning' ? 'bg-yellow-500/20 border-yellow-400/30 text-yellow-200' :
                message.type === 'error' ? 'bg-red-500/20 border-red-400/30 text-red-200' :
                'bg-blue-500/20 border-blue-400/30 text-blue-200'
              } border rounded-2xl p-4 backdrop-blur-sm`}>
                <div className="flex items-start space-x-3">
                  {message.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                  {message.type === 'warning' && <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                  {message.type === 'error' && <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                  {message.type === 'info' && <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            )}

            {/* Resend Confirmation Section */}
            {showResendConfirmation && (
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-2xl p-4 backdrop-blur-sm">
                <h4 className="text-blue-200 font-medium mb-2">Didn't receive the confirmation email?</h4>
                {!resendEmail && (
                  <div className="mb-3">
                    <input
                      type="email"
                      value={resendEmail || email}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white/15 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 border-0 outline-none mb-2"
                      placeholder="Confirm your email address"
                    />
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={loading}
                  className="w-full bg-blue-600/50 hover:bg-blue-600/70 text-white py-2 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Resend Confirmation Email</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 py-4 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl border-0 outline-none"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Sign up' : 'Sign In'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Form */}
          <div className="text-center mt-4">
            <span className="text-white/60">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            </span>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null); 
                setShowResendConfirmation(false);
              }}
              className="text-white hover:text-white/80 transition-colors font-medium underline"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </div>

          {/* Terms and Privacy */}
          <div className="text-center text-xs text-white/50">
            <span>By continuing, you agree to our </span>
            <button className="underline hover:text-white/70 transition-colors">
              Terms of Service
            </button>
            <span> and </span>
            <button className="underline hover:text-white/70 transition-colors">
              Privacy Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;