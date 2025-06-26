import React from 'react';
import { BarChart3, CreditCard, Calculator, Home, Bell, User, Settings, Sword, DollarSign, Sparkles } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'simulator', label: 'Cost Simulator', icon: Calculator },
    { id: 'pricing', label: 'Pricing', icon: DollarSign }
  ];

  const bottomItems = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-white via-purple-50/30 to-blue-50/30 backdrop-blur-xl border-r border-purple-200/50 z-40 flex flex-col shadow-xl">
      {/* Logo */}
      <div className="p-6 border-b border-purple-200/50">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center transform rotate-12 shadow-lg">
            <Sword className="w-7 h-7 text-white transform -rotate-12" />
          </div>
          <div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              SubSlayer
            </span>
            <div className="flex items-center space-x-1 mt-1">
              <Sparkles className="w-3 h-3 text-purple-500" />
              <span className="text-xs text-purple-600 font-medium">Premium</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-medium transition-all duration-300 group ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25 scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:scale-105'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-300 ${
                activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'
              }`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-purple-200/50 space-y-2">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-medium transition-all duration-300 group ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25 scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:scale-105'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-300 ${
                activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'
              }`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;