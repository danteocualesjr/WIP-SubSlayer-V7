export interface StripeProduct {
  id: string;
  monthlyPriceId: string;
  annualPriceId: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  mode: 'payment' | 'subscription';
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SWDsXvUHMQVVfC',
    // These Price IDs need to be updated with recurring prices from your Stripe Dashboard
    // Current IDs appear to be one-time payment prices, not recurring subscription prices
    // Please replace these with the correct recurring Price IDs from Stripe
    monthlyPriceId: 'price_1RbBQTCIxTxdP6phlkFN2tER', // Replace with recurring monthly price ID
    annualPriceId: 'price_1RbBQTCIxTxdP6phv3P5Yv0m',   // Replace with recurring annual price ID
    name: 'SubSlayer',
    description: 'SubSlayer is a proactive subscription manager that helps you track, manage, and cancel subscriptions before they renew. Never get blindsided by forgotten trials or surprise charges again. SubSlayer gives you a clean dashboard of all your active subscriptions, sends reminders before renewals, and even helps you calculate your potential savings. Built for anyone tired of wasting money on unused services.',
    monthlyPrice: 9.99,
    annualPrice: 99,
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

export const getPriceId = (productId: string, isAnnual: boolean): string | undefined => {
  const product = getProductById(productId);
  if (!product) return undefined;
  return isAnnual ? product.annualPriceId : product.monthlyPriceId;
};