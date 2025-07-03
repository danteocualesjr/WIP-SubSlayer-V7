export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SWDsXvUHMQVVfC',
    priceId: 'price_1RbBQTCIxTxdP6phlkFN2tER',
    name: 'SubSlayer',
    description: 'SubSlayer is a proactive subscription manager that helps you track, manage, and cancel subscriptions before they renew. Never get blindsided by forgotten trials or surprise charges again. SubSlayer gives you a clean dashboard of all your active subscriptions, sends reminders before renewals, and even helps you calculate your potential savings. Built for anyone tired of wasting money on unused services.',
    mode: 'subscription'
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id);
};