import React from 'react';
import { Bell, User, Search, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-30 ml-64">
      <div className="px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Search Bar */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search subscriptions..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-gray-600">Premium Plan</p>
              </div>
              <div className="relative group">
                <button className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white">
                  <User className="w-4 h-4" />
                </button>
                <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 min-w-[140px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;