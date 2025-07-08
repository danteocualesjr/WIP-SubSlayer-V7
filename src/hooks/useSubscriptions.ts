import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Subscription } from '../types/subscription';
import { useAuth } from './useAuth';
import { SUBSCRIPTIONS_STORAGE_PREFIX } from '../lib/constants';

export function useSubscriptions() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    } else {
      setSubscriptions([]);
      setLoading(false);
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from Supabase first
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .order('created_at', { ascending: false });
  
        if (error) {
          console.warn('Error fetching from Supabase, falling back to local storage:', error);
          throw error;
        }
  
        // Transform database format to app format
        const transformedData: Subscription[] = data.map((sub) => ({
          id: sub.id,
          name: sub.name,
          description: sub.description || undefined,
          cost: Number(sub.cost),
          currency: sub.currency,
          billingCycle: sub.billing_cycle,
          nextBilling: sub.next_billing,
          category: sub.category || '',
          status: sub.status,
          color: sub.color || '#8B5CF6',
          createdAt: sub.created_at,
        }));
  
        setSubscriptions(transformedData);
        
        // Save to local storage as backup
        localStorage.setItem(`${SUBSCRIPTIONS_STORAGE_PREFIX}${user?.id}`, JSON.stringify(transformedData));
        
        // Trigger notification check
        window.dispatchEvent(new CustomEvent('subscriptionsLoaded', { 
          detail: { subscriptions: transformedData } 
        }));
        
        return;
      } catch (supabaseError) {
        // If Supabase fetch fails, try local storage
        console.log('Falling back to local storage for subscriptions');
        
        const storageKeys = [
          `${SUBSCRIPTIONS_STORAGE_PREFIX}${user?.id}`,
          `subscriptions_${user?.id}`,
        ];
        
        let savedSubscriptions = null;
        
        // Try each storage key until we find valid subscriptions
        for (const key of storageKeys) {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const parsed = JSON.parse(data);
              if (Array.isArray(parsed)) {
                savedSubscriptions = parsed;
                console.log(`Found subscriptions using key: ${key}`);
                break;
              }
            } catch (e) {
              console.warn(`Failed to parse subscriptions for key ${key}:`, e);
            }
          }
        }
        
        if (savedSubscriptions) {
          setSubscriptions(savedSubscriptions);
          
          // Migrate to new storage key if needed
          if (!localStorage.getItem(`${SUBSCRIPTIONS_STORAGE_PREFIX}${user?.id}`)) {
            localStorage.setItem(`${SUBSCRIPTIONS_STORAGE_PREFIX}${user?.id}`, JSON.stringify(savedSubscriptions));
            console.log('Migrated subscriptions to new storage key format');
          }
          
          // Trigger notification check
          window.dispatchEvent(new CustomEvent('subscriptionsLoaded', { 
            detail: { subscriptions: savedSubscriptions } 
          }));
        } else {
          // No subscriptions found in local storage
          setSubscriptions([]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const addSubscription = async (subscriptionData: Omit<Subscription, 'id' | 'createdAt'>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          name: subscriptionData.name,
          description: subscriptionData.description || null,
          cost: subscriptionData.cost,
          currency: subscriptionData.currency,
          billing_cycle: subscriptionData.billingCycle,
          next_billing: subscriptionData.nextBilling,
          category: subscriptionData.category || null,
          status: subscriptionData.status,
          color: subscriptionData.color || '#8B5CF6',
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const newSubscription: Subscription = {
        id: data.id,
        name: data.name,
        description: data.description || undefined,
        cost: Number(data.cost),
        currency: data.currency,
        billingCycle: data.billing_cycle,
        nextBilling: data.next_billing,
        category: data.category || '',
        status: data.status,
        color: data.color || '#8B5CF6',
        createdAt: data.created_at,
      };

      const updatedSubscriptions = [newSubscription, ...subscriptions];
      setSubscriptions(updatedSubscriptions);

      // Save to local storage as backup
      localStorage.setItem(`${SUBSCRIPTIONS_STORAGE_PREFIX}${user.id}`, JSON.stringify(updatedSubscriptions));
      
      // Trigger events for other hooks
      window.dispatchEvent(new CustomEvent('subscriptionChanged'));
      window.dispatchEvent(new CustomEvent('subscriptionsLoaded', { 
        detail: { subscriptions: updatedSubscriptions } 
      }));
      
      return { data: newSubscription, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const updateSubscription = async (id: string, subscriptionData: Omit<Subscription, 'id' | 'createdAt'>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          name: subscriptionData.name,
          description: subscriptionData.description || null,
          cost: subscriptionData.cost,
          currency: subscriptionData.currency,
          billing_cycle: subscriptionData.billingCycle,
          next_billing: subscriptionData.nextBilling,
          category: subscriptionData.category || null,
          status: subscriptionData.status,
          color: subscriptionData.color || '#8B5CF6',
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      const updatedSubscription: Subscription = {
        id: data.id,
        name: data.name,
        description: data.description || undefined,
        cost: Number(data.cost),
        currency: data.currency,
        billingCycle: data.billing_cycle,
        nextBilling: data.next_billing,
        category: data.category || '',
        status: data.status,
        color: data.color || '#8B5CF6',
        createdAt: data.created_at,
      };

      const updatedSubscriptions = subscriptions.map(sub => sub.id === id ? updatedSubscription : sub);
      setSubscriptions(updatedSubscriptions);

      // Save to local storage as backup
      localStorage.setItem(`${SUBSCRIPTIONS_STORAGE_PREFIX}${user.id}`, JSON.stringify(updatedSubscriptions));
      
      // Trigger events
      window.dispatchEvent(new CustomEvent('subscriptionChanged'));
      window.dispatchEvent(new CustomEvent('subscriptionsLoaded', { 
        detail: { subscriptions: updatedSubscriptions } 
      }));
      
      return { data: updatedSubscription, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const deleteSubscription = async (id: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from local state
      const updatedSubscriptions = subscriptions.filter(sub => sub.id !== id);
      setSubscriptions(updatedSubscriptions);

      // Save to local storage as backup
      localStorage.setItem(`${SUBSCRIPTIONS_STORAGE_PREFIX}${user.id}`, JSON.stringify(updatedSubscriptions));
      
      // Trigger events
      window.dispatchEvent(new CustomEvent('subscriptionChanged'));
      window.dispatchEvent(new CustomEvent('subscriptionsLoaded', { 
        detail: { subscriptions: updatedSubscriptions } 
      }));
      
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const toggleSubscriptionStatus = async (id: string) => {
    const subscription = subscriptions.find(sub => sub.id === id);
    if (!subscription) return { error: 'Subscription not found' };

    const newStatus = subscription.status === 'active' ? 'paused' : 'active';
    
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({ status: newStatus })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      const updatedSubscriptions = subscriptions.map(sub =>
        sub.id === id ? { ...sub, status: newStatus } : sub
      );
      
      setSubscriptions(updatedSubscriptions);

      // Save to local storage as backup
      localStorage.setItem(`${SUBSCRIPTIONS_STORAGE_PREFIX}${user.id}`, JSON.stringify(updatedSubscriptions));
      
      // Trigger events
      window.dispatchEvent(new CustomEvent('subscriptionChanged'));
      window.dispatchEvent(new CustomEvent('subscriptionsLoaded', { 
        detail: { subscriptions: updatedSubscriptions } 
      }));
      
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const bulkDeleteSubscriptions = async (ids: string[]) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .in('id', ids);

      if (error) throw error;

      // Remove from local state
      const updatedSubscriptions = subscriptions.filter(sub => !ids.includes(sub.id));
      setSubscriptions(updatedSubscriptions);

      // Save to local storage as backup
      localStorage.setItem(`${SUBSCRIPTIONS_STORAGE_PREFIX}${user.id}`, JSON.stringify(updatedSubscriptions));
      
      // Trigger events
      window.dispatchEvent(new CustomEvent('subscriptionChanged'));
      window.dispatchEvent(new CustomEvent('subscriptionsLoaded', { 
        detail: { subscriptions: updatedSubscriptions } 
      }));
      
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  return {
    subscriptions,
    loading,
    error,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    toggleSubscriptionStatus,
    bulkDeleteSubscriptions,
    refetch: fetchSubscriptions,
  };
}