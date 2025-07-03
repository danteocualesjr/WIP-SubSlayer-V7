import { useState } from 'react';

interface ExtractedSubscriptionData {
  name?: string;
  cost?: number;
  currency?: string;
  billingCycle?: 'monthly' | 'annual';
  nextBilling?: string;
  category?: string;
  description?: string;
}

interface ServiceData {
  keywords: string[];
  data: Omit<ExtractedSubscriptionData, 'nextBilling'>;
}

export function useImageAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Define subscription services data
  const serviceDatabase: ServiceData[] = [
    {
      keywords: ['netflix'],
      data: {
        name: 'Netflix',
        cost: 15.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Entertainment',
        description: 'Netflix streaming subscription'
      }
    },
    {
      keywords: ['spotify'],
      data: {
        name: 'Spotify Premium',
        cost: 9.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Music',
        description: 'Spotify music streaming service'
      }
    },
    {
      keywords: ['adobe', 'creative'],
      data: {
        name: 'Adobe Creative Cloud',
        cost: 52.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Design',
        description: 'Adobe Creative Cloud subscription'
      }
    },
    {
      keywords: ['disney'],
      data: {
        name: 'Disney+',
        cost: 7.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Entertainment',
        description: 'Disney+ streaming service'
      }
    },
    {
      keywords: ['amazon', 'prime'],
      data: {
        name: 'Amazon Prime',
        cost: 14.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Entertainment',
        description: 'Amazon Prime membership'
      }
    },
    {
      keywords: ['hbo', 'max'],
      data: {
        name: 'HBO Max',
        cost: 15.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Entertainment',
        description: 'HBO Max streaming service'
      }
    },
    {
      keywords: ['youtube', 'yt premium'],
      data: {
        name: 'YouTube Premium',
        cost: 11.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Entertainment',
        description: 'YouTube Premium subscription'
      }
    },
    {
      keywords: ['apple music', 'itunes'],
      data: {
        name: 'Apple Music',
        cost: 10.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Music',
        description: 'Apple Music streaming service'
      }
    },
    {
      keywords: ['microsoft', 'office', '365'],
      data: {
        name: 'Microsoft 365',
        cost: 6.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Productivity',
        description: 'Microsoft 365 subscription'
      }
    },
    {
      keywords: ['chatgpt', 'openai'],
      data: {
        name: 'ChatGPT Plus',
        cost: 20.00,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'AI',
        description: 'ChatGPT Plus subscription'
      }
    },
    {
      keywords: ['github', 'copilot'],
      data: {
        name: 'GitHub Copilot',
        cost: 10.00,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Development',
        description: 'GitHub Copilot AI coding assistant'
      }
    },
    {
      keywords: ['notion'],
      data: {
        name: 'Notion',
        cost: 8.00,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Productivity',
        description: 'Notion workspace subscription'
      }
    }
  ];

  const analyzeImage = async (file: File): Promise<ExtractedSubscriptionData | null> => {
    setLoading(true);
    setError(null);

    try {
      // Get the file type to determine processing approach
      const fileType = file.type;
      
      // Different processing for different file types
      if (fileType.startsWith('image/')) {
        return processImageFile(file);
      } else if (fileType === 'application/pdf') {
        return processPdfFile(file);
      } else if (fileType === 'text/plain') {
        return processTextFile(file);
      } else {
        throw new Error('Unsupported file type');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze file';
      setError(errorMessage);
      console.error('File analysis error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const processImageFile = async (file: File): Promise<ExtractedSubscriptionData> => {
    // Get file name without extension for better matching
    const fileName = file.name.toLowerCase().replace(/\.[^/.]+$/, "");
    
    // Find matching service
    const matchedService = serviceDatabase.find(service =>
      service.keywords.some(keyword => fileName.includes(keyword))
    );

    if (matchedService) {
      return {
        ...matchedService.data,
        nextBilling: getNextMonthDate()
      };
    }

    // Default to a generic subscription
    return {
      name: 'New Subscription',
      cost: 9.99,
      currency: 'USD',
      billingCycle: 'monthly',
      nextBilling: new Date().toISOString().split('T')[0],
      category: 'Other',
      description: 'Subscription details'
    };
  };

  const processPdfFile = async (file: File): Promise<ExtractedSubscriptionData> => {
    return {
      name: 'PDF Subscription',
      cost: 12.99,
      currency: 'USD',
      billingCycle: 'monthly',
      nextBilling: getNextMonthDate(),
      category: 'Other',
      description: 'Subscription from PDF document'
    };
  };

  const processTextFile = async (file: File): Promise<ExtractedSubscriptionData> => {
    return {
      name: 'Text Document Subscription',
      cost: 14.99,
      currency: 'USD',
      billingCycle: 'monthly',
      nextBilling: getNextMonthDate(),
      category: 'Other',
      description: 'Subscription from text document'
    };
  };

  // Helper function to get a date for next month
  const getNextMonthDate = (): string => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    return nextMonth.toISOString().split('T')[0];
  };

  return {
    analyzeImage,
    loading,
    error,
  };
}