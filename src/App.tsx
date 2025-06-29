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
import ChatbotWidget from './components/Chatbot/ChatbotWidget';
import { useAuth } from './hooks/useAuth';
import { useSubscriptions } from './hooks/useSubscriptions';
import { useSpendingData } from './hooks/useSpendingData';
import { useSettings } from './hooks/useSettings';
import { useNotifications } from './hooks/useNotifications';

// Create stable component instances to prevent re-mounting
const StableDashboard = React.memo(Dashboard);
const StableSubscriptions = React.memo(Subscriptions);
const StableAnalytics = React.memo(Analytics);
const StableCostSimulator = React.memo(CostSimulator);
const StableNotifications = React.memo(Notifications);
const StableSettings = React.memo(Settings);
const StableProfile = React.memo(Profile);
const StablePricing = React.memo(Pricing);
const StableSwordiePage = React.memo(SwordiePage);

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

  // Memoize all callback functions to prevent unnecessary re-renders
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

  // Update category data based on current subscriptions - memoized to prevent recalculation
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

  // Create stable component props to prevent re-renders
  const dashboardProps = useMemo(() => ({
    subscriptions,
    spendingData,
    spendingLoading,
    onAddSubscription: addSubscription,
    onEditSubscription: handleEditSubscription,
    onSwitchToCalendar: handleSwitchToCalendar,
  }), [subscriptions, spendingData, spendingLoading, addSubscription, handleEditSubscription, handleSwitchToCalendar]);

  const subscriptionsProps = useMemo(() => ({
    subscriptions,
    onAddSubscription: addSubscription,
    onEditSubscription: handleEditSubscription,
    onDeleteSubscription: deleteSubscription,
    onToggleSubscriptionStatus: toggleSubscriptionStatus,
    onBulkDelete: handleBulkDelete,
  }), [subscriptions, addSubscription, handleEditSubscription, deleteSubscription, toggleSubscriptionStatus, handleBulkDelete]);

  const analyticsProps = useMemo(() => ({
    subscriptions,
    spendingData,
    categoryData: currentCategoryData,
    spendingLoading,
  }), [subscriptions, spendingData, currentCategoryData, spendingLoading]);

  const costSimulatorProps = useMemo(() => ({
    subscriptions,
  }), [subscriptions]);

  const notificationsProps = useMemo(() => ({
    subscriptions,
  }), [subscriptions]);

  const profileProps = useMemo(() => ({
    subscriptions,
  }), [subscriptions]);

  // Memoize the render function to prevent unnecessary re-renders
  const renderActiveTab = useMemo(() => {
    if (subscriptionsLoading && (activeTab === 'dashboard' || activeTab === 'subscriptions' || activeTab === 'analytics' || activeTab === 'simulator')) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <StableDashboard {...dashboardProps} />;
      case 'subscriptions':
        return <StableSubscriptions {...subscriptionsProps} />;
      case 'analytics':
        return <StableAnalytics {...analyticsProps} />;
      case 'simulator':
        return <StableCostSimulator {...costSimulatorProps} />;
      case 'swordie':
        return <StableSwordiePage />;
      case 'notifications':
        return <StableNotifications {...notificationsProps} />;
      case 'settings':
        return <StableSettings />;
      case 'profile':
        return <StableProfile {...profileProps} />;
      case 'pricing':
        return <StablePricing />;
      default:
        return <StableDashboard {...dashboardProps} />;
    }
  }, [
    activeTab,
    subscriptionsLoading,
    dashboardProps,
    subscriptionsProps,
    analyticsProps,
    costSimulatorProps,
    notificationsProps,
    profileProps,
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

  // Show auth form if not authenticated
  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <Header />
      <main className={`px-4 sm:px-6 lg:px-8 py-4 sm:py-8 transition-all duration-300 ${
        isMobile ? 'ml-0' : (sidebarCollapsed ? 'ml-20' : 'ml-64')
      }`}>
        <div className="max-w-7xl mx-auto">
          {renderActiveTab}
        </div>
      </main>
      
      {/* Chatbot Widget - Only show on non-Swordie pages */}
      {activeTab !== 'swordie' && <ChatbotWidget />}
    </div>
  );
}

export default React.memo(App);