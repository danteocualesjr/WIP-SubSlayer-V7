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

export function useImageAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = async (file: File): Promise<ExtractedSubscriptionData | null> => {
    setLoading(true);
    setError(null);

    try {
      // In a real implementation, we would send the image to an OCR service
      // For this demo, we'll use a more accurate simulation
      
      // Get the file type to determine processing approach
      const fileType = file.type;
      
      // Different processing for different file types
      if (fileType.startsWith('image/')) {
        // For images, we'd normally use OCR
        return processImageFile(file);
      } else if (fileType === 'application/pdf') {
        // For PDFs, we'd extract text and analyze
        return processPdfFile(file);
      } else if (fileType === 'text/plain') {
        // For text files, we'd directly analyze the content
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
    // In a real implementation, we would use an OCR service
    // For now, we'll return more accurate data based on the file name
    
    // Get file name without extension for better matching
    const fileName = file.name.toLowerCase().replace(/\.[^/.]+$/, "");
    
    // Check for common subscription services in the filename
    if (fileName.includes('netflix')) {
      return {
        name: 'Netflix',
        cost: 15.99,
        currency: 'USD',
        billingCycle: 'monthly',
        nextBilling: getNextMonthDate(),
        category: 'Entertainment',
        description: 'Netflix streaming subscription'
      };
    } else if (fileName.includes('spotify')) {
      return {
        name: 'Spotify Premium',
        cost: 9.99,
        currency: 'USD',
        billingCycle: 'monthly',
        nextBilling: getNextMonthDate(),
        category: 'Music',
        description: 'Spotify music streaming service'
      };
    } else if (fileName.includes('adobe') || fileName.includes('creative')) {
      return {
        name: 'Adobe Creative Cloud',
        cost: 52.99,
        currency: 'USD',
        billingCycle: 'monthly',
        nextBilling: getNextMonthDate(),
        category: 'Design',
        description: 'Adobe Creative Cloud subscription'
      };
    } else if (fileName.includes('disney')) {
      return {
        name: 'Disney+',
        cost: 7.99,
        currency: 'USD',
        billingCycle: 'monthly',
        nextBilling: getNextMonthDate(),
        category: 'Entertainment',
        description: 'Disney+ streaming service'
      };
    } else if (fileName.includes('amazon') || fileName.includes('prime')) {
      return {
        name: 'Amazon Prime',
        cost: 14.99,
        currency: 'USD',
        billingCycle: 'monthly',
        nextBilling: getNextMonthDate(),
        category: 'Entertainment',
        description: 'Amazon Prime membership'
      };
    } else if (fileName.includes('hbo') || fileName.includes('max')) {
      return {
        name: 'HBO Max',
        cost: 15.99,
        currency: 'USD',
        billingCycle: 'monthly',
        nextBilling: getNextMonthDate(),
        category: 'Entertainment',
        description: 'HBO Max streaming service'
      };
    } else if (fileName.includes('youtube') || fileName.includes('yt premium')) {
      return {
        name: 'YouTube Premium',
        cost: 11.99,
        currency: 'USD',
        billingCycle: 'monthly',
        nextBilling: getNextMonthDate(),
        category: 'Entertainment',
        description: 'YouTube Premium subscription'
      };
    } else if (fileName.includes('apple') && (fileName.includes('music') || fileName.includes('itunes'))) {
      return {
        name: 'Apple Music',
        cost: 10.99,
        currency: 'USD',
        billingCycle: 'monthly',
        nextBilling: getNextMonthDate(),
        category: 'Music',
        description: 'Apple Music streaming service'
      };
    } else if (fileName.includes('microsoft') || fileName.includes('office') || fileName.includes('365')) {
      return {
        name: 'Microsoft 365',
        cost: 6.99,
        currency: 'USD',
        billingCycle: 'monthly',
        nextBilling: getNextMonthDate(),
        category: 'Productivity',
        description: 'Microsoft 365 subscription'
      };
    } else if (fileName.includes('chatgpt') || fileName.includes('openai')) {
      return {
        name: 'ChatGPT Plus',
        cost: 20.00,
        currency: 'USD',
        billingCycle: 'monthly',
        nextBilling: getNextMonthDate(),
        category: 'AI',
        description: 'ChatGPT Plus subscription'
      };
    } else if (fileName.includes('github') || fileName.includes('copilot')) {
      return {
        name: 'GitHub Copilot',
        cost: 10.00,
        currency: 'USD',
        billingCycle: 'monthly',
        nextBilling: getNextMonthDate(),
        category: 'Development',
        description: 'GitHub Copilot AI coding assistant'
      };
    } else if (fileName.includes('notion')) {
      return {
        name: 'Notion',
        cost: 8.00,
        currency: 'USD',
        billingCycle: 'monthly',
        nextBilling: getNextMonthDate(),
        category: 'Productivity',
        description: 'Notion workspace subscription'
      };
    } else {
      // Default to a generic subscription with today's date
      const today = new Date();
      return {
        name: 'New Subscription',
        cost: 9.99,
        currency: 'USD',
        billingCycle: 'monthly',
        nextBilling: today.toISOString().split('T')[0],
        category: 'Other',
        description: 'Subscription details'
      };
    }
  };

  const processPdfFile = async (file: File): Promise<ExtractedSubscriptionData> => {
    // In a real implementation, we would extract text from the PDF
    // For now, we'll return a generic subscription
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
    // In a real implementation, we would read and analyze the text content
    // For now, we'll return a generic subscription
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