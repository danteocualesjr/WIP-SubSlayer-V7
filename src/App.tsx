import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import Subscriptions from './components/Subscriptions/Subscriptions';
import Analytics from './components/Analytics/Analytics';
import CostSimulator from './components/CostSimulator/CostSimulator';
import Notifications from './components/Notifications/Notifications';
import Settings from './components/Settings/Settings';
import Profile from './components/Profile/Profile';
import Pricing from './components/Pricing/Pricing';
import SwordiePage from './components/Swordie/SwordiePage';
import AuthForm from './components/Auth/AuthForm';
import LandingPage from './components/Landing/LandingPage';
import SuccessPage from './components/Success/SuccessPage';
import ChatbotWidget from './components/Chatbot/ChatbotWidget';
import { useAuth } from './hooks/useAuth';
import { useSubscriptions } from './hooks/useSubscriptions';
import { useSpendingData } from './hooks/useSpendingData';
import { useSettings } from './hooks/useSettings';
import { useNotifications } from './hooks/useNotifications';

function App() {
  
  const { user, loading: authLoading } = useAuth();
  const { settings } = useSettings();
  const { generateRenewalNotifications } = useNotifications();
  const {
    
    subscriptions,
    loading: subscriptionsLoading,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    toggleSubscriptionStatus,
    bulkDeleteSubscriptions,
  } = useSubscriptions();
  
  const { spendingData, loading: spendingLoading } = useSpendingData();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [showSuccessPage, setShowSuccessPage] = useState(false);

  // Check for success page on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (window.location.pathname === '/success' || urlParams.get('success') === 'true') {
      setShowSuccessPage(true);
      // Clean up URL
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  // Listen for sign out events
  useEffect(() => {
    const handleSignOut = () => {
      setShowAuthForm(true);
      setShowLandingPage(false);
    };

    window.addEventListener('userSignedOut', handleSignOut);
    
    return () => {
      window.removeEventListener('userSignedOut', handleSignOut);
    };
  }, []);

  // Move all useCallback and useMemo hooks to the top, before any conditional returns
  const handleEditSubscription = useCallback((id: string, subscriptionData: any) => {
    updateSubscription(id, subscriptionData);
  }, [updateSubscription]);

  const handleBulkDelete = useCallback((ids: string[]) => {
    bulkDeleteSubscriptions(ids);
  }, [bulkDeleteSubscriptions]);

  const handleSwitchToCalendar = useCallback(() => {
    setActiveTab('subscriptions');
    // Small delay to ensure the subscriptions component is rendered
    setTimeout(() => {
      // This will be handled by the Subscriptions component to switch to calendar view
      const event = new CustomEvent('switchToCalendarView');
      window.dispatchEvent(event);
    }, 100);
  }, []);

  const handleGetStarted = useCallback(() => {
    setShowLandingPage(false);
    setShowAuthForm(true);
  }, []);

  const handleSuccessPageClose = useCallback(() => {
    setShowSuccessPage(false);
  }, []);

  // Update category data based on current subscriptions
  const currentCategoryData = useMemo(() => {
    const categoryTotals = subscriptions
      .filter(sub => sub.status === 'active')
      .reduce((acc, sub) => {
        const monthlyCost = sub.billingCycle === 'monthly' ? sub.cost : sub.cost / 12;
        const category = sub.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + monthlyCost;
        return acc;
      }, {} as Record<string, number>);

    const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#F97316', '#84CC16', '#06B6D4', '#EC4899'];
    
    return Object.entries(categoryTotals).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  }, [subscriptions]);

  const renderActiveTab = useCallback(() => {
    if (subscriptionsLoading && (activeTab === 'dashboard' || activeTab === 'subscriptions' || activeTab === 'analytics' || activeTab === 'simulator')) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            subscriptions={subscriptions} 
            spendingData={spendingData}
            spendingLoading={spendingLoading}
            onAddSubscription={addSubscription}
            onEditSubscription={handleEditSubscription}
            onSwitchToCalendar={handleSwitchToCalendar}
          />
        );
      case 'subscriptions':
        return (
          <Subscriptions
            subscriptions={subscriptions}
            onAddSubscription={addSubscription}
            onEditSubscription={handleEditSubscription}
            onDeleteSubscription={deleteSubscription}
            onToggleSubscriptionStatus={toggleSubscriptionStatus}
            onBulkDelete={handleBulkDelete}
          />
        );
      case 'analytics':
        return (
          <Analytics
            subscriptions={subscriptions}
            spendingData={spendingData}
            categoryData={currentCategoryData}
            spendingLoading={spendingLoading}
          />
        );
      case 'simulator':
        return <CostSimulator subscriptions={subscriptions} />;
      case 'swordie':
        return <SwordiePage />;
      case 'notifications':
        return <Notifications subscriptions={subscriptions} />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <Profile subscriptions={subscriptions} />;
      case 'pricing':
        return <Pricing />;
      default:
        return (
          <Dashboard 
            subscriptions={subscriptions} 
            spendingData={spendingData}
            spendingLoading={spendingLoading}
            onAddSubscription={addSubscription}
            onEditSubscription={handleEditSubscription}
            onSwitchToCalendar={handleSwitchToCalendar}
          />
        );
    }
  }, [
    activeTab,
    subscriptions,
    spendingData,
    spendingLoading,
    subscriptionsLoading,
    currentCategoryData,
    addSubscription,
    handleEditSubscription,
    deleteSubscription,
    toggleSubscriptionStatus,
    handleBulkDelete,
    handleSwitchToCalendar
  ]);

  // Listen for sidebar toggle events
  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.isCollapsed);
      setIsMobile(event.detail.isMobile);
      setIsMobileMenuOpen(event.detail.isMobileMenuOpen);
    };

    // Get initial state
    const saved = localStorage.getItem('sidebar-collapsed');
    const mobile = window.innerWidth < 768;
    setSidebarCollapsed(mobile ? true : (saved ? JSON.parse(saved) : false));
    setIsMobile(mobile);

    window.addEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    
    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    };
  }, []);

  // Listen for navigation events from header
  useEffect(() => {
    const handleNavigateToProfile = () => {
      setActiveTab('profile');
    };

    window.addEventListener('navigateToProfile', handleNavigateToProfile);
    
    return () => {
      window.removeEventListener('navigateToProfile', handleNavigateToProfile);
    };
  }, []);

  // Listen for tab navigation events from dashboard components
  useEffect(() => {
    const handleNavigateToTab = (event: CustomEvent) => {
      const { tab } = event.detail;
      setActiveTab(tab);
    };

    window.addEventListener('navigateToTab', handleNavigateToTab as EventListener);
    
    return () => {
      window.removeEventListener('navigateToTab', handleNavigateToTab as EventListener);
    };
  }, []);

  // Apply theme from settings
  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', settings.theme === 'dark');
    }
  }, [settings.theme]);

  // Generate notifications when subscriptions load or change
  useEffect(() => {
    const handleSubscriptionsLoaded = (event: CustomEvent) => {
      const { subscriptions: loadedSubscriptions } = event.detail;
      generateRenewalNotifications(loadedSubscriptions);
    };

    window.addEventListener('subscriptionsLoaded', handleSubscriptionsLoaded as EventListener);
    
    return () => {
      window.removeEventListener('subscriptionsLoaded', handleSubscriptionsLoaded as EventListener);
    };
  }, [generateRenewalNotifications]);

  // Check for notifications periodically (every 5 minutes)
  useEffect(() => {
    if (user && subscriptions.length > 0) {
      const interval = setInterval(() => {
        generateRenewalNotifications(subscriptions);
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [user, subscriptions, generateRenewalNotifications]);

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Show success page if requested
  if (showSuccessPage && user) {
    return <SuccessPage />;
  }

  // Show landing page if not authenticated and not showing auth form
  if (!user && !showAuthForm && showLandingPage) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  // Show auth form if not authenticated and auth form is requested
  if (!user && showAuthForm) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <Header />
      <main className={`px-4 sm:px-6 lg:px-8 py-4 sm:py-8 transition-all duration-300 ${
        isMobile ? 'ml-0 pt-16' : (sidebarCollapsed ? 'ml-20' : 'ml-64')
      }`}>
        <div className="max-w-7xl mx-auto pb-16 sm:pb-0">
          {renderActiveTab()}
        </div>
      </main>
      
      {/* Chatbot Widget - Only show on non-Swordie pages */}
      {activeTab !== 'swordie' && <ChatbotWidget />}
    </div>
  );
}

export default App;