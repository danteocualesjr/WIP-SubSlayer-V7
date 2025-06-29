import React, { useState, useEffect } from 'react';
import { BarChart3, CreditCard, Calculator, Home, Bell, User, Settings, Sword, Tag, Sparkles, Menu, X, PanelLeftClose, PanelLeftOpen, MessageSquare } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  // Load collapsed state from localStorage, default to false on desktop, true on mobile
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved) return JSON.parse(saved);
    // Default to collapsed on mobile
    return window.innerWidth < 768;
  });

  // Mobile overlay state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-collapse on mobile, restore saved state on desktop
      if (mobile) {
        setIsCollapsed(true);
        setIsMobileMenuOpen(false);
      } else {
        const saved = localStorage.getItem('sidebar-collapsed');
        setIsCollapsed(saved ? JSON.parse(saved) : false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save collapsed state to localStorage whenever it changes (only for desktop)
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
    }
    
    // Dispatch custom event to notify other components about sidebar state change
    window.dispatchEvent(new CustomEvent('sidebarToggle', { 
      detail: { isCollapsed: isMobile ? true : isCollapsed, isMobile, isMobileMenuOpen } 
    }));
  }, [isCollapsed, isMobile, isMobileMenuOpen]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'simulator', label: 'Cost Simulator', icon: Calculator },
    { id: 'chatbot', label: 'AI Assistant', icon: MessageSquare },
    { id: 'pricing', label: 'Pricing', icon: Tag }
  ];

  const bottomItems = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  // Mobile overlay backdrop
  if (isMobile && isMobileMenuOpen) {
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Mobile Sidebar */}
        <div className="fixed left-0 top-0 h-full w-80 bg-gradient-to-b from-white via-purple-50/30 to-violet-50/30 backdrop-blur-xl border-r border-purple-200/50 z-50 flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out">
          {/* Mobile Header */}
          <div className="p-6 border-b border-purple-200/50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center transform rotate-12 shadow-lg">
                <Sword className="w-7 h-7 text-white transform -rotate-12" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                  SubSlayer
                </span>
                <div className="flex items-center space-x-1 mt-1">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  <span className="text-xs text-purple-600 font-medium">Beta</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-4 rounded-2xl font-medium transition-all duration-300 text-left ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/25'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-lg">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile Bottom Navigation */}
          <div className="p-4 border-t border-purple-200/50 space-y-2">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-4 rounded-2xl font-medium transition-all duration-300 text-left ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/25'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-lg">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-3 bg-white border border-purple-200 rounded-2xl shadow-lg text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-all duration-200 md:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Desktop Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-white via-purple-50/30 to-violet-50/30 backdrop-blur-xl border-r border-purple-200/50 z-40 flex-col shadow-xl transition-all duration-300 ease-in-out hidden md:flex ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        {/* Logo */}
        <div className={`p-6 border-b border-purple-200/50 transition-all duration-300 ${
          isCollapsed ? 'px-4' : 'px-6'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center transform rotate-12 shadow-lg flex-shrink-0">
              <Sword className="w-7 h-7 text-white transform -rotate-12" />
            </div>
            {!isCollapsed && (
              <div className="transition-opacity duration-300">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
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
        <div className="absolute -right-4 top-8 z-50">
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 bg-white border border-purple-200 rounded-xl flex items-center justify-center text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-all duration-200 shadow-lg hover:shadow-xl group"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            ) : (
              <PanelLeftClose className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
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
                      ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/25 scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 hover:scale-105'
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
                      ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/25 scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 hover:scale-105'
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
    </>
  );
};

export default Sidebar;