import { Subscription, SpendingData, CategoryData } from '../types/subscription';

export const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    name: 'Netflix',
    description: 'Video streaming service',
    cost: 15.99,
    currency: 'USD',
    billingCycle: 'monthly',
    nextBilling: '2025-02-15',
    category: 'Entertainment',
    status: 'active',
    color: '#E50914',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Spotify Premium',
    description: 'Music streaming service',
    cost: 9.99,
    currency: 'USD',
    billingCycle: 'monthly',
    nextBilling: '2025-02-08',
    category: 'Entertainment',
    status: 'active',
    color: '#1DB954',
    createdAt: '2024-02-08'
  },
  {
    id: '3',
    name: 'Adobe Creative Suite',
    description: 'Design and creative tools',
    cost: 52.99,
    currency: 'USD',
    billingCycle: 'monthly',
    nextBilling: '2025-02-12',
    category: 'Productivity',
    status: 'active',
    color: '#FF0000',
    createdAt: '2024-01-12'
  },
  {
    id: '4',
    name: 'GitHub Pro',
    description: 'Code repository hosting',
    cost: 4.00,
    currency: 'USD',
    billingCycle: 'monthly',
    nextBilling: '2025-02-20',
    category: 'Development',
    status: 'active',
    color: '#24292e',
    createdAt: '2024-03-20'
  },
  {
    id: '5',
    name: 'Figma Professional',
    description: 'Design collaboration platform',
    cost: 144.00,
    currency: 'USD',
    billingCycle: 'annual',
    nextBilling: '2025-08-15',
    category: 'Productivity',
    status: 'active',
    color: '#F24E1E',
    createdAt: '2024-08-15'
  }
];

export const mockSpendingData: SpendingData[] = [
  { month: 'Jul', amount: 82.97 },
  { month: 'Aug', amount: 82.97 },
  { month: 'Sep', amount: 82.97 },
  { month: 'Oct', amount: 95.89 },
  { month: 'Nov', amount: 89.65 },
  { month: 'Dec', amount: 102.34 },
  { month: 'Jan', amount: 82.97 }
];

export const mockCategoryData: CategoryData[] = [
  { name: 'Entertainment', value: 25.98, color: '#8B5CF6' },
  { name: 'Productivity', value: 52.99, color: '#3B82F6' },
  { name: 'Development', value: 4.00, color: '#10B981' },
  { name: 'Design', value: 12.00, color: '#F59E0B' }
];