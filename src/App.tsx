import React, { useState } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import Subscriptions from './components/Subscriptions/Subscriptions';
import Analytics from './components/Analytics/Analytics';
import CostSimulator from './components/CostSimulator/CostSimulator';
import { mockSubscriptions, mockSpendingData, mockCategoryData } from './data/mockData';
import { Subscription } from './types/subscription';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions);

  const addSubscription = (subscriptionData: Omit<Subscription, 'id' | 'createdAt'>) => {
    const newSubscription: Subscription = {
      ...subscriptionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setSubscriptions(prev => [...prev, newSubscription]);
  };

  const editSubscription = (id: string, subscriptionData: Omit<Subscription, 'id' | 'createdAt'>) => {
    setSubscriptions(prev => 
      prev.map(sub => 
        sub.id === id 
          ? { ...subscriptionData, id, createdAt: sub.createdAt }
          : sub
      )
    );
  };

  const deleteSubscription = (id: string) => {
    setSubscriptions(prev => prev.filter(sub => sub.id !== id));
  };

  const toggleSubscriptionStatus = (id: string) => {
    setSubscriptions(prev =>
      prev.map(sub =>
        sub.id === id
          ? { ...sub, status: sub.status === 'active' ? 'paused' : 'active' }
          : sub
      )
    );
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
            onEditSubscription={editSubscription}
            onDeleteSubscription={deleteSubscription}
            onToggleSubscriptionStatus={toggleSubscriptionStatus}
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