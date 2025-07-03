import { useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

interface CheckoutSessionRequest {
  priceId: string;
  mode: 'payment' | 'subscription';
  successUrl?: string;
  cancelUrl?: string;
}

interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export function useStripe() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async ({
    priceId,
    mode,
    successUrl,
    cancelUrl
  }: CheckoutSessionRequest): Promise<CheckoutSessionResponse | null> => {
    if (!user) {
      setError('User must be authenticated');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: priceId,
          mode,
          success_url: successUrl || `${window.location.origin}/success`,
          cancel_url: cancelUrl || `${window.location.origin}/pricing`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Enhanced error handling for Stripe configuration issues
        if (errorData.error?.includes('recurring price') || 
            errorData.error?.includes('subscription mode') ||
            errorData.error?.includes('one-time') ||
            errorData.error?.includes('recurring')) {
          throw new Error(
            `This subscription plan is not properly configured. The price needs to be set up as a recurring subscription in Stripe. Please contact support for assistance.`
          );
        }
        
        // Handle other common Stripe errors
        if (errorData.error?.includes('price') && errorData.error?.includes('not found')) {
          throw new Error('This pricing plan is currently unavailable. Please try a different plan or contact support.');
        }
        
        if (errorData.error?.includes('customer')) {
          throw new Error('There was an issue with your account. Please try again or contact support.');
        }
        
        throw new Error(errorData.error || 'Unable to process payment. Please try again or contact support.');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Checkout session creation failed:', err);
      
      // Log additional debugging information for developers
      if (process.env.NODE_ENV === 'development') {
        console.error('Debug info:', {
          priceId,
          mode,
          userId: user?.id,
          timestamp: new Date().toISOString()
        });
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  const redirectToCheckout = async (checkoutData: CheckoutSessionRequest) => {
    const session = await createCheckoutSession(checkoutData);
    
    if (session?.url) {
      window.location.href = session.url;
    }
  };

  return {
    createCheckoutSession,
    redirectToCheckout,
    loading,
    error,
  };
}