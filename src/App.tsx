import React, { useState, useEffect } from 'react';
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
import AuthForm from './components/Auth/AuthForm';
import { useAuth } from './hooks/useAuth';
import { useSubscriptions } from './hooks/useSubscriptions';
import { useSpendingData } from './hooks/useSpendingData';

function App() {
  const { user, loading: authLoading } = useAuth();
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

  const handleEditSubscription = (id: string, subscriptionData: any) => {
    updateSubscription(id, subscriptionData);
  };

  const handleBulkDelete = (ids: string[]) => {
    bulkDeleteSubscriptions(ids);
  };

  const handleSwitchToCalendar = () => {
    setActiveTab('subscriptions');
    // Small delay to ensure the subscriptions component is rendered
    setTimeout(() => {
      // This will be handled by the Subscriptions component to switch to calendar view
      const event = new CustomEvent('switchToCalendarView');
      window.dispatchEvent(event);
    }, 100);
  };

  // Update category data based on current subscriptions
  const updateCategoryData = () => {
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
  };

  const currentCategoryData = updateCategoryData();

  const renderActiveTab = () => {
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
            onSwitchToCalendar={handleSwitchToCalendar}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <Header />
      <main className="ml-64 px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {renderActiveTab()}
        </div>
      </main>
    </div>
  );
}

export default App;