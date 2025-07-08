export interface StripeProduct {
  id: string;
  monthlyPriceId: string | null;
  annualPriceId: string | null;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  testMonthlyPriceId?: string | null;
  testAnnualPriceId?: string | null;
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SWDsXvUHMQVVfC',
    monthlyPriceId: 'price_1RglYeCIxTxdP6ph0ajymCf0',
    annualPriceId: 'price_1RglaECIxTxdP6phSEknl1IE',
    testMonthlyPriceId: 'price_1RglYeCIxTxdP6ph0ajymCf0', // Replace with your actual test price ID
    testAnnualPriceId: 'price_1RglaECIxTxdP6phSEknl1IE',  // Replace with your actual test price ID
    name: 'SubSlayer Pro',
    description: 'SubSlayer is a proactive subscription manager that helps you track, manage, and cancel subscriptions before they renew. Never get blindsided by forgotten trials or surprise charges again. SubSlayer gives you a clean dashboard of all your active subscriptions, sends reminders before renewals, and even helps you calculate your potential savings. Built for anyone tired of wasting money on unused services.',
    mode: 'subscription'
  }
];

export const getProductByPriceId = (priceId: string, isTestMode = false): StripeProduct | undefined => {
  if (isTestMode) {
    return stripeProducts.find(product => 
      product.testMonthlyPriceId === priceId || product.testAnnualPriceId === priceId
    );
  }
  return stripeProducts.find(product => 
    product.monthlyPriceId === priceId || product.annualPriceId === priceId
  );
};

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id);
};

export const getPriceId = (productId: string, isAnnual: boolean, isTestMode = false): string | null => {
  const product = getProductById(productId);
  if (!product) return null;
  
  if (isTestMode) {
    return isAnnual ? product.testAnnualPriceId : product.testMonthlyPriceId;
  }
  return isAnnual ? product.annualPriceId : product.monthlyPriceId;
};