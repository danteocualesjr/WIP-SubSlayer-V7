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

      {/* Collapse Toggle Button */}
      <div className={`px-4 py-2 ${isCollapsed ? 'flex justify-center' : 'flex justify-end'}`}>
        <button
          onClick={toggleSidebar}
          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 group"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
          ) : (
            <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className={`flex-1 space-y-2 transition-all duration-300 ${
        isCollapsed ? 'px-2' : 'px-4'
      }`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
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
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                  <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className={`border-t border-purple-200/50 space-y-2 transition-all duration-300 ${
        isCollapsed ? 'px-2 py-4' : 'px-4 py-4'
      }`}>
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
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
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                  <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;