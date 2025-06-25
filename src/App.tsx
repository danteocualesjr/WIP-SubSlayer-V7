import React, { useState } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import Subscriptions from './components/Subscriptions/Subscriptions';
import Analytics from './components/Analytics/Analytics';
import CostSimulator from './components/CostSimulator/CostSimulator';
import AuthForm from './components/Auth/AuthForm';
import { useAuth } from './hooks/useAuth';
import { useSubscriptions } from './hooks/useSubscriptions';
import { mockSpendingData } from './data/mockData';

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

  const [activeTab, setActiveTab] = useState('dashboard');

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

  // Update category data based on current subscriptions
  const updateCategoryData = () => {
    const categoryTotals = subscriptions
      .filter(sub => sub.status === 'active')
      .reduce((acc, sub) => {
        const monthlyCost = sub.billingCycle === 'monthly' ? sub.cost : sub.cost / 12;
        acc[sub.category] = (acc[sub.category] || 0) + monthlyCost;
        return acc;
      }, {} as Record<string, number>);

    const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#F97316'];
    
    return Object.entries(categoryTotals).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  };

  const currentCategoryData = updateCategoryData();

  const renderActiveTab = () => {
    if (subscriptionsLoading) {
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
            spendingData={mockSpendingData}
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
            spendingData={mockSpendingData}
            categoryData={currentCategoryData}
          />
        );
      case 'simulator':
        return <CostSimulator subscriptions={subscriptions} />;
      default:
        return (
          <Dashboard 
            subscriptions={subscriptions} 
            spendingData={mockSpendingData}
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