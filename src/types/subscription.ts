export interface Subscription {
  id: string;
  name: string;
  description?: string;
  cost: number;
  currency: string;
  billingCycle: 'monthly' | 'annual';
  nextBilling: string;
  category: string;
  status: 'active' | 'cancelled' | 'paused';
  logo?: string;
  color?: string;
  createdAt: string;
}

export interface SpendingData {
  month: string;
  amount: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface NotificationSettings {
  daysBeforeRenewal: number;
  emailNotifications: boolean;
  pushNotifications: boolean;
}