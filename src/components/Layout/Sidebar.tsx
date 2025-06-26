import React, { useState, useEffect } from 'react';
import { BarChart3, CreditCard, Calculator, Home, Bell, User, Settings, Sword, DollarSign, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  // Load collapsed state from localStorage, default to false
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Save collapsed state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
    
    // Dispatch custom event to notify other components about sidebar state change
    window.dispatchEvent(new CustomEvent('sidebarToggle', { 
      detail: { isCollapsed } 
    }));
  }, [isCollapsed]);

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

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-white via-purple-50/30 to-blue-50/30 backdrop-blur-xl border-r border-purple-200/50 z-40 flex flex-col shadow-xl transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Logo */}
      <div className={`p-6 border-b border-purple-200/50 transition-all duration-300 ${
        isCollapsed ? 'px-4' : 'px-6'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center transform rotate-12 shadow-lg flex-shrink-0">
            <Sword className="w-7 h-7 text-white transform -rotate-12" />
          </div>
          {!isCollapsed && (
            <div className="transition-opacity duration-300">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                SubSlayer
              </span>
              <div className="flex items-center space-x-1 mt-1">
                <Sparkles className="w-3 h-3 text-purple-500" />
                <span className="text-xs text-purple-600 font-medium">Beta</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <div className="absolute -right-3 top-8 z-50">
        <button
          onClick={toggleSidebar}
          className="w-6 h-6 bg-white border border-purple-200 rounded-full flex items-center justify-center text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-all duration-200 shadow-md hover:shadow-lg"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className={`flex-1 p-4 space-y-2 transition-all duration-300 ${
        isCollapsed ? 'px-2' : 'px-4'
      }`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center rounded-2xl font-medium transition-all duration-300 group relative ${
                  isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'
                } ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25 scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:scale-105'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 flex-shrink-0 ${
                  activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'
                }`} />
                {!isCollapsed && <span className="transition-opacity duration-300">{item.label}</span>}
              </button>
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                  <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className={`p-4 border-t border-purple-200/50 space-y-2 transition-all duration-300 ${
        isCollapsed ? 'px-2' : 'px-4'
      }`}>
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center rounded-2xl font-medium transition-all duration-300 group relative ${
                  isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'
                } ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25 scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:scale-105'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 flex-shrink-0 ${
                  activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'
                }`} />
                {!isCollapsed && <span className="transition-opacity duration-300">{item.label}</span>}
              </button>
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                  <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;