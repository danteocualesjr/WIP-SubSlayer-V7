import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sword } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { SparklesCore } from '../ui/sparkles';

const AuthForm: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const { signUp, signIn } = useAuth();

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
          setMessage('Check your email for the confirmation link!');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Placeholder for Google sign-in functionality
    console.log('Google sign-in clicked');
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
            className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all duration-300"
          >
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-gray-800">G</span>
            </div>
            <span className="font-medium">Continue with Google</span>
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
            {error && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}
            {message && (
              <div className="bg-green-500/20 border border-green-400/30 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-green-200 text-sm">{message}</p>
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
          <div className="text-center">
            <span className="text-white/60">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            </span>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
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