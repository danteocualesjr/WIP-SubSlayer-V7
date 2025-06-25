import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { SpendingData } from '../types/subscription';

export function useSpendingData() {
  const { user } = useAuth();
  const [spendingData, setSpendingData] = useState<SpendingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      generateSpendingData();
    } else {
      setSpendingData([]);
      setLoading(false);
    }

    // Listen for subscription changes to refresh spending data
    const handleSubscriptionChange = () => {
      if (user) {
        generateSpendingData();
      }
    };

    window.addEventListener('subscriptionChanged', handleSubscriptionChange);
    
    return () => {
      window.removeEventListener('subscriptionChanged', handleSubscriptionChange);
    };
  }, [user]);

  const generateSpendingData = async () => {
    try {
      setLoading(true);
      
      // Get all subscriptions for the user
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      // Generate spending data for the last 7 months
      const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
      const currentDate = new Date();
      
      const spendingByMonth = months.map((month, index) => {
        // For the current month (Jan), show actual current spending
        if (index === 6) { // January (current month)
          let currentMonthTotal = 0;
          
          subscriptions?.forEach(sub => {
            if (sub.status === 'active') {
              // Convert to monthly cost
              const monthlyCost = sub.billing_cycle === 'monthly' 
                ? Number(sub.cost) 
                : Number(sub.cost) / 12;
              currentMonthTotal += monthlyCost;
            }
          });
          
          return {
            month,
            amount: Number(currentMonthTotal.toFixed(2))
          };
        }
        
        // For previous months, simulate historical data based on creation dates
        const monthDate = new Date(2024, 6 + index, 1); // July 2024 = month 6
        let monthlyTotal = 0;
        
        subscriptions?.forEach(sub => {
          const createdDate = new Date(sub.created_at);
          
          // Only include subscriptions that were created before or during this month
          if (createdDate <= monthDate && sub.status === 'active') {
            // Convert to monthly cost
            const monthlyCost = sub.billing_cycle === 'monthly' 
              ? Number(sub.cost) 
              : Number(sub.cost) / 12;
            monthlyTotal += monthlyCost;
          }
        });

        // Add some realistic variation to historical data (±10%)
        const variation = 0.9 + Math.random() * 0.2; // Random between 0.9 and 1.1
        monthlyTotal *= variation;

        return {
          month,
          amount: Number(monthlyTotal.toFixed(2))
        };
      });

      setSpendingData(spendingByMonth);
    } catch (err) {
      console.error('Error generating spending data:', err);
      // Fallback to empty data
      setSpendingData([
        { month: 'Jul', amount: 0 },
        { month: 'Aug', amount: 0 },
        { month: 'Sep', amount: 0 },
        { month: 'Oct', amount: 0 },
        { month: 'Nov', amount: 0 },
        { month: 'Dec', amount: 0 },
        { month: 'Jan', amount: 0 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return {
    spendingData,
    loading,
    refetch: generateSpendingData
  };
}