import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Grid3X3, List, Trash2, X, Calendar as CalendarIcon, ArrowUpDown, ArrowUp, ArrowDown, CreditCard, Sparkles } from 'lucide-react';
import SubscriptionCard from './SubscriptionCard';
import SubscriptionListItem from './SubscriptionListItem';
import CalendarView from './CalendarView';
import AddSubscriptionModal from './AddSubscriptionModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { SparklesCore } from '../ui/sparkles';
import { Subscription } from '../../types/subscription';

interface SubscriptionsProps {
  subscriptions: Subscription[];
  onAddSubscription: (subscription: Omit<Subscription, 'id' | 'createdAt'>) => void;
  onEditSubscription: (id: string, subscription: Omit<Subscription, 'id' | 'createdAt'>) => void;
  onDeleteSubscription: (id: string) => void;
  onToggleSubscriptionStatus: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
}

type SortField = 'name' | 'category' | 'cost' | 'nextBilling' | 'status' | 'createdAt';
type SortDirection = 'asc' | 'desc';

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
  
  // Load view mode from localStorage, default to 'grid' if not found
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>(() => {
    const savedViewMode = localStorage.getItem('subscriptions-view-mode');
    return (savedViewMode as 'grid' | 'list' | 'calendar') || 'grid';
  });
  
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<Subscription | null>(null);
  const [isMultipleDelete, setIsMultipleDelete] = useState(false);

  // Save view mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('subscriptions-view-mode', viewMode);
  }, [viewMode]);

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-purple-600" />
      : <ArrowDown className="w-4 h-4 text-purple-600" />;
  };

  const sortSubscriptions = (subs: Subscription[]) => {
    return [...subs].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'category':
          aValue = (a.category || 'Uncategorized').toLowerCase();
          bValue = (b.category || 'Uncategorized').toLowerCase();
          break;
        case 'cost':
          // Convert to monthly cost for fair comparison
          aValue = a.billingCycle === 'monthly' ? a.cost : a.cost / 12;
          bValue = b.billingCycle === 'monthly' ? b.cost : b.cost / 12;
          break;
        case 'nextBilling':
          aValue = new Date(a.nextBilling).getTime();
          bValue = new Date(b.nextBilling).getTime();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || subscription.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || subscription.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const sortedSubscriptions = sortSubscriptions(filteredSubscriptions);

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

  const handleDeleteClick = (subscription: Subscription) => {
    setSubscriptionToDelete(subscription);
    setIsMultipleDelete(false);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (subscriptionToDelete) {
      onDeleteSubscription(subscriptionToDelete.id);
    }
    setSubscriptionToDelete(null);
  };

  const handleSelectSubscription = (id: string) => {
    setSelectedSubscriptions(prev => 
      prev.includes(id) 
        ? prev.filter(subId => subId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedSubscriptions.length === sortedSubscriptions.length) {
      setSelectedSubscriptions([]);
    } else {
      setSelectedSubscriptions(sortedSubscriptions.map(sub => sub.id));
    }
  };

  const handleBulkDelete = () => {
    setIsMultipleDelete(true);
    setShowDeleteModal(true);
  };

  const handleBulkDeleteConfirm = () => {
    if (onBulkDelete) {
      onBulkDelete(selectedSubscriptions);
    } else {
      selectedSubscriptions.forEach(id => {
        onDeleteSubscription(id);
      });
    }
    setSelectedSubscriptions([]);
    setIsSelectionMode(false);
  };

  const handleCancelSelection = () => {
    setSelectedSubscriptions([]);
    setIsSelectionMode(false);
  };

  const totalMonthlySpend = sortedSubscriptions.reduce((sum, sub) => {
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
        {/* Calendar Hero Section */}
        <div className="relative bg-gradient-to-br from-purple-900 via-violet-800 to-purple-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white overflow-hidden">
          {/* Sparkles Background */}
          <div className="absolute inset-0 w-full h-full">
            <SparklesCore
              id="calendar-sparkles"
              background="transparent"
              minSize={0.3}
              maxSize={1.0}
              particleDensity={60}
              className="w-full h-full"
              particleColor="#ffffff"
              speed={0.6}
            />
          </div>

          {/* Gradient Overlays */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/3 w-80 h-80 bg-gradient-to-r from-purple-400/30 to-violet-400/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gradient-to-r from-violet-400/30 to-purple-400/30 rounded-full blur-3xl"></div>
          </div>

          {/* Radial gradient to prevent sharp edges */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-900/50 via-violet-800/50 to-purple-700/50 [mask-image:radial-gradient(800px_400px_at_center,transparent_20%,white)]"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              <CalendarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300" />
              <h1 className="text-2xl sm:text-4xl font-bold">Subscription Calendar</h1>
            </div>
            <p className="text-lg sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl">
              Visualize your renewal dates and never miss a payment again
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center">
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                viewMode === 'list'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span>List View</span>
            </button>
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
      {/* Enhanced Hero Section with Sparkles */}
      <div className="relative bg-gradient-to-br from-purple-900 via-violet-800 to-purple-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white overflow-hidden">
        {/* Sparkles Background */}
        <div className="absolute inset-0 w-full h-full">
          <SparklesCore
            id="subscriptions-sparkles"
            background="transparent"
            minSize={0.4}
            maxSize={1.2}
            particleDensity={100}
            className="w-full h-full"
            particleColor="#ffffff"
            speed={1.0}
          />
        </div>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-violet-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-violet-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        </div>

        {/* Radial gradient to prevent sharp edges */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-900/50 via-violet-800/50 to-purple-700/50 [mask-image:radial-gradient(800px_400px_at_center,transparent_20%,white)]"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4 sm:mb-6">
            <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300" />
            <h1 className="text-2xl sm:text-4xl font-bold">Subscription Management</h1>
          </div>
          <p className="text-lg sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl">
            Take complete control of your recurring subscriptions and optimize your spending
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                <CreditCard className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-300" />
                <p className="text-white/80 text-xs sm:text-sm font-medium">Total Services</p>
              </div>
              <p className="text-lg sm:text-3xl font-bold">{subscriptions.length}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-green-300" />
                <p className="text-white/80 text-xs sm:text-sm font-medium">Active</p>
              </div>
              <p className="text-lg sm:text-3xl font-bold">{subscriptions.filter(sub => sub.status === 'active').length}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                <Filter className="w-4 h-4 sm:w-6 sm:h-6 text-orange-300" />
                <p className="text-white/80 text-xs sm:text-sm font-medium">Paused</p>
              </div>
              <p className="text-lg sm:text-3xl font-bold">{subscriptions.filter(sub => sub.status === 'paused').length}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 col-span-2 sm:col-span-1">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                <Plus className="w-4 h-4 sm:w-6 sm:h-6 text-pink-300" />
                <p className="text-white/80 text-xs sm:text-sm font-medium">Monthly Total</p>
              </div>
              <p className="text-lg sm:text-3xl font-bold">${totalMonthlySpend.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <p className="text-gray-600">Manage all your recurring subscriptions in one place</p>
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
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg"
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
                  {selectedSubscriptions.length} of {sortedSubscriptions.length} selected
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
              {selectedSubscriptions.length === sortedSubscriptions.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-6">
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

      {/* Filters, Sort, and View Toggle */}
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
        <div className="flex flex-wrap gap-3">
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
          
          {/* Sort Dropdown */}
          <select
            value={`${sortField}-${sortDirection}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split('-') as [SortField, SortDirection];
              setSortField(field);
              setSortDirection(direction);
            }}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="cost-desc">Highest Cost</option>
            <option value="cost-asc">Lowest Cost</option>
            <option value="nextBilling-asc">Next Billing (Soon)</option>
            <option value="nextBilling-desc">Next Billing (Later)</option>
            <option value="category-asc">Category A-Z</option>
            <option value="category-desc">Category Z-A</option>
            <option value="status-asc">Status A-Z</option>
            <option value="status-desc">Status Z-A</option>
          </select>
          
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1">
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
      {sortedSubscriptions.length === 0 ? (
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
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Subscription</span>
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSubscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onEdit={handleEdit}
              onDelete={onDeleteSubscription}
              onToggleStatus={onToggleSubscriptionStatus}
              isSelectionMode={isSelectionMode}
              isSelected={selectedSubscriptions.includes(subscription.id)}
              onSelect={handleSelectSubscription}
              onDeleteClick={handleDeleteClick}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600">
              {isSelectionMode && <div className="col-span-1">Select</div>}
              <div className={isSelectionMode ? "col-span-3" : "col-span-4"}>
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
                >
                  <span>Service</span>
                  {getSortIcon('name')}
                </button>
              </div>
              <div className="col-span-2">
                <button
                  onClick={() => handleSort('category')}
                  className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
                >
                  <span>Category</span>
                  {getSortIcon('category')}
                </button>
              </div>
              <div className="col-span-2">
                <button
                  onClick={() => handleSort('cost')}
                  className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
                >
                  <span>Cost</span>
                  {getSortIcon('cost')}
                </button>
              </div>
              <div className="col-span-2">
                <button
                  onClick={() => handleSort('nextBilling')}
                  className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
                >
                  <span>Next Billing</span>
                  {getSortIcon('nextBilling')}
                </button>
              </div>
              <div className="col-span-1">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
                >
                  <span>Status</span>
                  {getSortIcon('status')}
                </button>
              </div>
              <div className="col-span-1">Actions</div>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {sortedSubscriptions.map((subscription) => (
              <SubscriptionListItem
                key={subscription.id}
                subscription={subscription}
                onEdit={handleEdit}
                onDelete={onDeleteSubscription}
                onToggleStatus={onToggleSubscriptionStatus}
                isSelectionMode={isSelectionMode}
                isSelected={selectedSubscriptions.includes(subscription.id)}
                onSelect={handleSelectSubscription}
                onDeleteClick={handleDeleteClick}
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={isMultipleDelete ? handleBulkDeleteConfirm : handleDeleteConfirm}
        subscription={subscriptionToDelete}
        isMultiple={isMultipleDelete}
        count={selectedSubscriptions.length}
      />
    </div>
  );
};

export default Subscriptions;