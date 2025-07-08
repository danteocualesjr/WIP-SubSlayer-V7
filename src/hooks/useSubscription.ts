import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { getProductByPriceId } from '../stripe-config';

interface SubscriptionData {
  customerId: string;
  subscriptionId: string | null;
  status: string;
  priceId: string | null;
  currentPeriodStart: number | null;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  paymentMethodBrand: string | null;
  paymentMethodLast4: string | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        setSubscription({
          customerId: data.customer_id,
          subscriptionId: data.subscription_id,
          status: data.subscription_status,
          priceId: data.price_id,
          currentPeriodStart: data.current_period_start,
          currentPeriodEnd: data.current_period_end,
          cancelAtPeriodEnd: data.cancel_at_period_end,
          paymentMethodBrand: data.payment_method_brand,
          paymentMethodLast4: data.payment_method_last4,
        });
      } else {
        setSubscription(null);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionProduct = () => {
    if (!subscription?.priceId) return null;
    return getProductByPriceId(subscription.priceId);
  };

  const isActive = () => {
    return subscription?.status === 'active';
  };

  const isPaused = () => {
    return subscription?.status === 'paused';
  };

  const isCanceled = () => {
    return subscription?.status === 'canceled';
  };

  const isTrialing = () => {
    return subscription?.status === 'trialing';
  };

  const getCurrentPeriodEnd = () => {
    if (!subscription?.currentPeriodEnd) return null;
    return new Date(subscription.currentPeriodEnd * 1000);
  };

  const getCurrentPeriodStart = () => {
    if (!subscription?.currentPeriodStart) return null;
    return new Date(subscription.currentPeriodStart * 1000);
  };

  return {
    subscription,
    loading,
    error,
    refetch: fetchSubscription,
    getSubscriptionProduct,
    isActive,
    isPaused,
    isCanceled,
    isTrialing,
    getCurrentPeriodEnd,
    getCurrentPeriodStart,
  };
}