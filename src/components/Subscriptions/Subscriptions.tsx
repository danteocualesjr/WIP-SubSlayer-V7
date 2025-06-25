import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Grid3X3, List, Trash2, X, Calendar as CalendarIcon } from 'lucide-react';
import SubscriptionCard from './SubscriptionCard';
import SubscriptionListItem from './SubscriptionListItem';
import CalendarView from './CalendarView';
import AddSubscriptionModal from './AddSubscriptionModal';
import { Subscription } from '../../types/subscription';

interface SubscriptionsProps {
  subscriptions: Subscription[];
  onAddSubscription: (subscription: Omit<Subscription, 'id' | 'createdAt'>) => void;
  onEditSubscription: (id: string, subscription: Omit<Subscription, 'id' | 'createdAt'>) => void;
  onDeleteSubscription: (id: string) => void;
  onToggleSubscriptionStatus: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
}

const Subscriptions: React.FC<SubscriptionsProps> = ({
  subscriptions,
  onAddSubscription,
  onEditSubscription,
  onDeleteSubscription,
  onToggleSubscriptionStatus,
  onBulkDelete
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'cancelled'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('grid');
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Listen for calendar view switch event from dashboard
  useEffect(() => {
    const handleSwitchToCalendar = () => {
      setViewMode('calendar');
    };

    window.addEventListener('switchToCalendarView', handleSwitchToCalendar);
    
    return () => {
      window.removeEventListener('switchToCalendarView', handleSwitchToCalendar);
    };
  }, []);

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

  const handleSelectSubscription = (id: string) => {
    setSelectedSubscriptions(prev => 
      prev.includes(id) 
        ? prev.filter(subId => subId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedSubscriptions.length === filteredSubscriptions.length) {
      setSelectedSubscriptions([]);
    } else {
      setSelectedSubscriptions(filteredSubscriptions.map(sub => sub.id));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedSubscriptions.length} subscription(s)? This action cannot be undone.`)) {
      if (onBulkDelete) {
        onBulkDelete(selectedSubscriptions);
      } else {
        selectedSubscriptions.forEach(id => {
          onDeleteSubscription(id);
        });
      }
      setSelectedSubscriptions([]);
      setIsSelectionMode(false);
    }
  };

  const handleCancelSelection = () => {
    setSelectedSubscriptions([]);
    setIsSelectionMode(false);
  };

  const totalMonthlySpend = filteredSubscriptions.reduce((sum, sub) => {
    if (sub.status !== 'active') return sum;
    return sum + (sub.billingCycle === 'monthly' ? sub.cost : sub.cost / 12);
  }, 0);

  const selectedMonthlyCost = selectedSubscriptions.reduce((sum, id) => {
    const subscription = subscriptions.find(sub => sub.id === id);
    if (!subscription || subscription.status !== 'active') return sum;
    return sum + (subscription.billingCycle === 'monthly' ? subscription.cost : subscription.cost / 12);
  }, 0);

  // If calendar view is selected, show only the calendar
  if (viewMode === 'calendar') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Subscription Calendar</h1>
            <p className="text-gray-600">View your renewals in calendar format</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Add Subscription</span>
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center">
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                viewMode === 'grid'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                viewMode === 'list'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                viewMode === 'calendar'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Calendar</span>
            </button>
          </div>
        </div>

        <CalendarView subscriptions={subscriptions} />

        {/* Add/Edit Modal */}
        <AddSubscriptionModal
          isOpen={showAddModal}
          onClose={handleModalClose}
          onAdd={handleAddOrEdit}
          subscription={editingSubscription || undefined}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-gray-600">Manage all your recurring subscriptions</p>
        </div>
        <div className="flex space-x-3">
          {!isSelectionMode ? (
            <>
              <button
                onClick={() => setIsSelectionMode(true)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <span>Select</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Add Subscription</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCancelSelection}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              {selectedSubscriptions.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete ({selectedSubscriptions.length})</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Selection Mode Banner */}
      {isSelectionMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-blue-600">
                <span className="font-medium">
                  {selectedSubscriptions.length} of {filteredSubscriptions.length} selected
                </span>
                {selectedSubscriptions.length > 0 && (
                  <span className="ml-2 text-sm">
                    (${selectedMonthlyCost.toFixed(2)}/month potential savings)
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleSelectAll}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              {selectedSubscriptions.length === filteredSubscriptions.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>
      )}

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

      {/* Filters and View Toggle */}
      <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
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
          
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Grid View"
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="List View"
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'calendar'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Calendar View"
            >
              <CalendarIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Subscriptions Display */}
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
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onEdit={handleEdit}
              onDelete={onDeleteSubscription}
              onToggleStatus={onToggleSubscriptionStatus}
              isSelectionMode={isSelectionMode}
              isSelected={selectedSubscriptions.includes(subscription.id)}
              onSelect={handleSelectSubscription}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600">
              {isSelectionMode && <div className="col-span-1">Select</div>}
              <div className={isSelectionMode ? "col-span-3" : "col-span-4"}>Service</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Cost</div>
              <div className="col-span-2">Next Billing</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Actions</div>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {filteredSubscriptions.map((subscription) => (
              <SubscriptionListItem
                key={subscription.id}
                subscription={subscription}
                onEdit={handleEdit}
                onDelete={onDeleteSubscription}
                onToggleStatus={onToggleSubscriptionStatus}
                isSelectionMode={isSelectionMode}
                isSelected={selectedSubscriptions.includes(subscription.id)}
                onSelect={handleSelectSubscription}
              />
            ))}
          </div>
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