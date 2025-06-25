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
        // Calculate which subscriptions would have been active in each month
        const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (6 - index), 1);
        
        let monthlyTotal = 0;
        
        subscriptions?.forEach(sub => {
          const createdDate = new Date(sub.created_at);
          
          // Only include subscriptions that were created before or during this month
          if (createdDate <= monthDate) {
            // Convert to monthly cost
            const monthlyCost = sub.billing_cycle === 'monthly' 
              ? Number(sub.cost) 
              : Number(sub.cost) / 12;
            
            // Only count active subscriptions
            if (sub.status === 'active') {
              monthlyTotal += monthlyCost;
            }
          }
        });

        return {
          month,
          amount: monthlyTotal
        };
      });

      setSpendingData(spendingByMonth);
    } catch (err) {
      console.error('Error generating spending data:', err);
      setSpendingData([]);
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