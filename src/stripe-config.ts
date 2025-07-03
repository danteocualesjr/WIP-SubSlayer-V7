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
    monthlyPriceId: 'price_1RbBQTCIxTxdP6phlkFN2tER', // $9.99/month
    annualPriceId: 'price_1RbBQTCIxTxdP6phlkFN2tER', // You'll need to create an annual price in Stripe for $99/year
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