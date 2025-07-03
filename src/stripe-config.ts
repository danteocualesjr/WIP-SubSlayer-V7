export interface StripeProduct {
  id: string;
  monthlyPriceId: string;
  annualPriceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SWDsXvUHMQVVfC',
    // TODO: Replace these with actual recurring Price IDs from your Stripe Dashboard
    // These are placeholder values and need to be updated with real Stripe Price IDs
    // 1. Go to your Stripe Dashboard (https://dashboard.stripe.com)
    // 2. Navigate to Products > SubSlayer (or create the product if it doesn't exist)
    // 3. Create two recurring prices:
    //    - Monthly: $9.99/month
    //    - Annual: $99/year
    // 4. Copy the Price IDs (they start with 'price_') and replace the values below
    monthlyPriceId: 'price_REPLACE_WITH_ACTUAL_MONTHLY_PRICE_ID', // Replace with actual monthly recurring price ID
    annualPriceId: 'price_REPLACE_WITH_ACTUAL_ANNUAL_PRICE_ID',   // Replace with actual annual recurring price ID
    name: 'SubSlayer',
    description: 'SubSlayer is a proactive subscription manager that helps you track, manage, and cancel subscriptions before they renew. Never get blindsided by forgotten trials or surprise charges again. SubSlayer gives you a clean dashboard of all your active subscriptions, sends reminders before renewals, and even helps you calculate your potential savings. Built for anyone tired of wasting money on unused services.',
    mode: 'subscription'
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => 
    product.monthlyPriceId === priceId || product.annualPriceId === priceId
  );
};

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id);
};