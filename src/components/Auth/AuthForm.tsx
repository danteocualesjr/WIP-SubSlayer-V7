import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, CreditCard, Sparkles, Shield, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl backdrop-blur-sm border border-white/20 transform hover:scale-105 transition-all duration-300">
            <CreditCard className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
            SubSlayer
          </h1>
          <p className="text-white/80 text-lg">Take control of your subscriptions</p>
        </div>

        {/* Auth Form */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-3">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-white/80 text-lg">
              {isSignUp 
                ? 'Start managing your subscriptions today' 
                : 'Sign in to your account'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-3">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-3">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-14 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
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
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-4 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl hover:scale-105 transform"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <User className="w-5 h-5" />
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle Form */}
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
              }}
              className="text-white/80 hover:text-white transition-colors text-lg font-medium"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="text-white/80 group hover:text-white transition-colors">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/10 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="font-medium">Track Subscriptions</p>
          </div>
          <div className="text-white/80 group hover:text-white transition-colors">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/10 group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-6 h-6" />
            </div>
            <p className="font-medium">Save Money</p>
          </div>
          <div className="text-white/80 group hover:text-white transition-colors">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/10 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-6 h-6" />
            </div>
            <p className="font-medium">Get Reminders</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;