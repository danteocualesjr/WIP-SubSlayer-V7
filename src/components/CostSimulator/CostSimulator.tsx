import React, { useState } from 'react';
import { Calculator, TrendingDown, DollarSign, Calendar, Target, Zap, Sparkles } from 'lucide-react';
import { SparklesCore } from '../ui/sparkles';
import { Subscription } from '../../types/subscription';

interface CostSimulatorProps {
  subscriptions: Subscription[];
}

const CostSimulator: React.FC<CostSimulatorProps> = ({ subscriptions }) => {
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>([]);
  const [simulationPeriod, setSimulationPeriod] = useState<'monthly' | 'annual'>('monthly');

  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');

  const toggleSubscription = (id: string) => {
    setSelectedSubscriptions(prev =>
      prev.includes(id)
        ? prev.filter(subId => subId !== id)
        : [...prev, id]
    );
  };

  const currentTotalMonthly = activeSubscriptions.reduce((sum, sub) => {
    const monthlyCost = sub.billingCycle === 'monthly' ? sub.cost : sub.cost / 12;
    return sum + monthlyCost;
  }, 0);

  const potentialSavingsMonthly = selectedSubscriptions.reduce((sum, id) => {
    const subscription = activeSubscriptions.find(sub => sub.id === id);
    if (!subscription) return sum;
    const monthlyCost = subscription.billingCycle === 'monthly' ? subscription.cost : subscription.cost / 12;
    return sum + monthlyCost;
  }, 0);

  const newTotalMonthly = currentTotalMonthly - potentialSavingsMonthly;
  const currentTotalAnnual = currentTotalMonthly * 12;
  const potentialSavingsAnnual = potentialSavingsMonthly * 12;
  const newTotalAnnual = newTotalMonthly * 12;

  const savingsPercentage = currentTotalMonthly > 0 
    ? ((potentialSavingsMonthly / currentTotalMonthly) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-8">
      {/* Enhanced Hero Section with Sparkles */}
      <div className="relative bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white overflow-hidden">
        {/* Sparkles Background */}
        <div className="absolute inset-0 w-full h-full">
          <SparklesCore
            id="cost-simulator-sparkles"
            background="transparent"
            minSize={0.5}
            maxSize={1.6}
            particleDensity={90}
            className="w-full h-full"
            particleColor="#ffffff"
            speed={1.4}
          />
        </div>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 opacity-25">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/30 to-violet-400/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-violet-400/30 to-indigo-400/30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        </div>

        {/* Radial gradient to prevent sharp edges */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-600/50 via-violet-600/50 to-indigo-600/50 [mask-image:radial-gradient(800px_400px_at_center,transparent_20%,white)]"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4 sm:mb-6">
            <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300" />
            <h1 className="text-2xl sm:text-4xl font-bold">Cost Simulator</h1>
          </div>
          <p className="text-lg sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl">
            Explore potential savings by simulating subscription cancellations and optimize your spending
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-300" />
                <p className="text-white/80 text-xs sm:text-sm font-medium">Current Monthly</p>
              </div>
              <p className="text-lg sm:text-3xl font-bold">${currentTotalMonthly.toFixed(2)}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                <TrendingDown className="w-4 h-4 sm:w-6 sm:h-6 text-green-300" />
                <p className="text-white/80 text-xs sm:text-sm font-medium">Potential Savings</p>
              </div>
              <p className="text-lg sm:text-3xl font-bold">${potentialSavingsMonthly.toFixed(2)}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                <Target className="w-4 h-4 sm:w-6 sm:h-6 text-blue-300" />
                <p className="text-white/80 text-xs sm:text-sm font-medium">New Total</p>
              </div>
              <p className="text-lg sm:text-3xl font-bold">${newTotalMonthly.toFixed(2)}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-orange-300" />
                <p className="text-white/80 text-xs sm:text-sm font-medium">Savings %</p>
              </div>
              <p className="text-lg sm:text-3xl font-bold">{savingsPercentage}%</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 col-span-2 sm:col-span-3 lg:col-span-1">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-pink-300" />
                <p className="text-white/80 text-xs sm:text-sm font-medium">Selected</p>
              </div>
              <p className="text-lg sm:text-3xl font-bold">{selectedSubscriptions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current vs Simulated Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Current Spending</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly</span>
              <span className="font-bold text-gray-900">${currentTotalMonthly.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Annual</span>
              <span className="font-bold text-gray-900">${currentTotalAnnual.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-600">Active Subscriptions</span>
              <span className="font-bold text-gray-900">{activeSubscriptions.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">After Cancellations</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly</span>
              <span className="font-bold text-emerald-700">${newTotalMonthly.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Annual</span>
              <span className="font-bold text-emerald-700">${newTotalAnnual.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-600">Potential Savings</span>
              <span className="font-bold text-emerald-700">-{savingsPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Savings Summary */}
      {selectedSubscriptions.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <Calculator className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Potential Savings</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <p className="text-2xl font-bold text-red-600">${potentialSavingsMonthly.toFixed(2)}</p>
              <p className="text-sm text-red-700">Monthly Savings</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <p className="text-2xl font-bold text-red-600">${potentialSavingsAnnual.toFixed(2)}</p>
              <p className="text-sm text-red-700">Annual Savings</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <p className="text-2xl font-bold text-red-600">{selectedSubscriptions.length}</p>
              <p className="text-sm text-red-700">Subscriptions to Cancel</p>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Selection */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Select Subscriptions to Cancel</h3>
          <button
            onClick={() => setSelectedSubscriptions([])}
            className="text-purple-600 hover:text-purple-700 font-medium text-sm"
          >
            Clear All
          </button>
        </div>

        {activeSubscriptions.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No active subscriptions to simulate</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSubscriptions.map((subscription) => {
              const isSelected = selectedSubscriptions.includes(subscription.id);
              const monthlyCost = subscription.billingCycle === 'monthly' ? subscription.cost : subscription.cost / 12;

              return (
                <div
                  key={subscription.id}
                  onClick={() => toggleSubscription(subscription.id)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-red-300 bg-red-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                        style={{ backgroundColor: subscription.color || '#8B5CF6' }}
                      >
                        {subscription.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{subscription.name}</h4>
                        <p className="text-sm text-gray-600">{subscription.category}</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected ? 'bg-red-500 border-red-500' : 'border-gray-300'
                    }`}>
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Monthly cost:</span>
                    <span className={`font-semibold ${isSelected ? 'text-red-600' : 'text-gray-900'}`}>
                      ${monthlyCost.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {selectedSubscriptions.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Ready to save ${potentialSavingsMonthly.toFixed(2)}/month?</h4>
              <p className="text-sm text-gray-600">
                This simulation shows potential savings. You can proceed to cancel or modify your selected subscriptions.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedSubscriptions([])}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Reset
              </button>
              <button className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg font-medium transition-all duration-200">
                Proceed with Cancellations
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostSimulator;