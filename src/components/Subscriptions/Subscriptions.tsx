import React, { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import SubscriptionCard from './SubscriptionCard';
import AddSubscriptionModal from './AddSubscriptionModal';
import { Subscription } from '../../types/subscription';

interface SubscriptionsProps {
  subscriptions: Subscription[];
  onAddSubscription: (subscription: Omit<Subscription, 'id' | 'createdAt'>) => void;
  onEditSubscription: (id: string, subscription: Omit<Subscription, 'id' | 'createdAt'>) => void;
  onDeleteSubscription: (id: string) => void;
  onToggleSubscriptionStatus: (id: string) => void;
}

const Subscriptions: React.FC<SubscriptionsProps> = ({
  subscriptions,
  onAddSubscription,
  onEditSubscription,
  onDeleteSubscription,
  onToggleSubscriptionStatus
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'cancelled'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = Array.from(new Set(subscriptions.map(sub => sub.category).filter(Boolean)));

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || subscription.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || subscription.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setShowAddModal(true);
  };

  const handleAddOrEdit = (subscriptionData: Omit<Subscription, 'id' | 'createdAt'>) => {
    if (editingSubscription) {
      onEditSubscription(editingSubscription.id, subscriptionData);
      setEditingSubscription(null);
    } else {
      onAddSubscription(subscriptionData);
    }
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setEditingSubscription(null);
  };

  const totalMonthlySpend = filteredSubscriptions.reduce((sum, sub) => {
    if (sub.status !== 'active') return sum;
    return sum + (sub.billingCycle === 'monthly' ? sub.cost : sub.cost / 12);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-gray-600">Manage all your recurring subscriptions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{subscriptions.length}</p>
            <p className="text-sm text-gray-600">Total Subscriptions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {subscriptions.filter(sub => sub.status === 'active').length}
            </p>
            <p className="text-sm text-gray-600">Active</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {subscriptions.filter(sub => sub.status === 'paused').length}
            </p>
            <p className="text-sm text-gray-600">Paused</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">${totalMonthlySpend.toFixed(2)}</p>
            <p className="text-sm text-gray-600">Monthly Total</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search subscriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="flex space-x-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Subscriptions Grid */}
      {filteredSubscriptions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
              ? 'Try adjusting your filters or search terms'
              : 'Get started by adding your first subscription'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && filterCategory === 'all' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Subscription</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onEdit={handleEdit}
              onDelete={onDeleteSubscription}
              onToggleStatus={onToggleSubscriptionStatus}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AddSubscriptionModal
        isOpen={showAddModal}
        onClose={handleModalClose}
        onAdd={handleAddOrEdit}
        subscription={editingSubscription || undefined}
      />
    </div>
  );
};

export default Subscriptions;