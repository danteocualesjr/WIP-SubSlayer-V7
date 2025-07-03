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
      keywords: ['netflix', 'netflix.com'],
      data: {
        name: 'Netflix',
        cost: 15.49,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Entertainment',
        description: 'Netflix streaming subscription'
      }
    },
    {
      keywords: ['spotify', 'spotify.com'],
      data: {
        name: 'Spotify Premium',
        cost: 10.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Music',
        description: 'Spotify music streaming service'
      }
    },
    {
      keywords: ['adobe', 'creative cloud', 'photoshop', 'illustrator', 'indesign'],
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
      keywords: ['disney', 'disney+', 'disneyplus'],
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
      keywords: ['amazon', 'prime', 'amazon prime'],
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
      keywords: ['hbo', 'max', 'hbo max'],
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
      keywords: ['youtube', 'youtube premium', 'yt premium'],
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
      keywords: ['microsoft', 'office', '365', 'microsoft 365'],
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
      keywords: ['chatgpt', 'openai', 'gpt', 'chatgpt plus'],
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
    },
    {
      keywords: ['hulu'],
      data: {
        name: 'Hulu',
        cost: 7.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Entertainment',
        description: 'Hulu streaming service'
      }
    },
    {
      keywords: ['paramount', 'paramount+'],
      data: {
        name: 'Paramount+',
        cost: 5.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Entertainment',
        description: 'Paramount+ streaming service'
      }
    },
    {
      keywords: ['apple tv', 'apple tv+'],
      data: {
        name: 'Apple TV+',
        cost: 6.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Entertainment',
        description: 'Apple TV+ streaming service'
      }
    },
    {
      keywords: ['dropbox'],
      data: {
        name: 'Dropbox Plus',
        cost: 9.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Storage',
        description: 'Dropbox cloud storage'
      }
    },
    {
      keywords: ['google one', 'google drive'],
      data: {
        name: 'Google One',
        cost: 1.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Storage',
        description: 'Google cloud storage'
      }
    },
    {
      keywords: ['icloud', 'icloud+'],
      data: {
        name: 'iCloud+',
        cost: 0.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Storage',
        description: 'Apple iCloud storage'
      }
    },
    {
      keywords: ['canva', 'canva pro'],
      data: {
        name: 'Canva Pro',
        cost: 12.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Design',
        description: 'Canva Pro design tool'
      }
    },
    {
      keywords: ['figma'],
      data: {
        name: 'Figma',
        cost: 12.00,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Design',
        description: 'Figma design tool'
      }
    },
    {
      keywords: ['slack'],
      data: {
        name: 'Slack',
        cost: 7.25,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Productivity',
        description: 'Slack team communication'
      }
    },
    {
      keywords: ['zoom'],
      data: {
        name: 'Zoom Pro',
        cost: 14.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Productivity',
        description: 'Zoom video conferencing'
      }
    },
    {
      keywords: ['asana'],
      data: {
        name: 'Asana Premium',
        cost: 10.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Productivity',
        description: 'Asana project management'
      }
    },
    {
      keywords: ['trello'],
      data: {
        name: 'Trello Premium',
        cost: 5.00,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Productivity',
        description: 'Trello project management'
      }
    },
    {
      keywords: ['1password'],
      data: {
        name: '1Password',
        cost: 2.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Productivity',
        description: '1Password password manager'
      }
    },
    {
      keywords: ['lastpass'],
      data: {
        name: 'LastPass Premium',
        cost: 3.00,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Productivity',
        description: 'LastPass password manager'
      }
    },
    {
      keywords: ['dashlane'],
      data: {
        name: 'Dashlane Premium',
        cost: 4.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Productivity',
        description: 'Dashlane password manager'
      }
    },
    {
      keywords: ['nordvpn', 'nord vpn'],
      data: {
        name: 'NordVPN',
        cost: 11.95,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Productivity',
        description: 'NordVPN service'
      }
    },
    {
      keywords: ['expressvpn', 'express vpn'],
      data: {
        name: 'ExpressVPN',
        cost: 12.95,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Productivity',
        description: 'ExpressVPN service'
      }
    },
    {
      keywords: ['masterclass'],
      data: {
        name: 'MasterClass',
        cost: 15.00,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Education',
        description: 'MasterClass online courses'
      }
    },
    {
      keywords: ['skillshare'],
      data: {
        name: 'Skillshare Premium',
        cost: 13.75,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Education',
        description: 'Skillshare online courses'
      }
    },
    {
      keywords: ['coursera'],
      data: {
        name: 'Coursera Plus',
        cost: 39.00,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Education',
        description: 'Coursera online courses'
      }
    },
    {
      keywords: ['udemy'],
      data: {
        name: 'Udemy Pro',
        cost: 29.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Education',
        description: 'Udemy online courses'
      }
    },
    {
      keywords: ['linkedin learning', 'linkedin premium'],
      data: {
        name: 'LinkedIn Learning',
        cost: 29.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Education',
        description: 'LinkedIn Learning courses'
      }
    },
    {
      keywords: ['duolingo', 'duolingo plus'],
      data: {
        name: 'Duolingo Plus',
        cost: 6.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Education',
        description: 'Duolingo language learning'
      }
    },
    {
      keywords: ['peloton'],
      data: {
        name: 'Peloton App',
        cost: 12.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Health & Fitness',
        description: 'Peloton fitness app'
      }
    },
    {
      keywords: ['myfitnesspal', 'my fitness pal'],
      data: {
        name: 'MyFitnessPal Premium',
        cost: 9.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Health & Fitness',
        description: 'MyFitnessPal fitness tracking'
      }
    },
    {
      keywords: ['headspace'],
      data: {
        name: 'Headspace',
        cost: 12.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Health & Fitness',
        description: 'Headspace meditation app'
      }
    },
    {
      keywords: ['calm'],
      data: {
        name: 'Calm',
        cost: 14.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Health & Fitness',
        description: 'Calm meditation app'
      }
    },
    {
      keywords: ['strava'],
      data: {
        name: 'Strava Premium',
        cost: 5.00,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Health & Fitness',
        description: 'Strava fitness tracking'
      }
    },
    {
      keywords: ['nyt', 'new york times', 'ny times'],
      data: {
        name: 'The New York Times',
        cost: 17.00,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'News & Media',
        description: 'New York Times digital subscription'
      }
    },
    {
      keywords: ['wsj', 'wall street journal'],
      data: {
        name: 'The Wall Street Journal',
        cost: 38.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'News & Media',
        description: 'Wall Street Journal subscription'
      }
    },
    {
      keywords: ['medium'],
      data: {
        name: 'Medium',
        cost: 5.00,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'News & Media',
        description: 'Medium membership'
      }
    },
    {
      keywords: ['substack'],
      data: {
        name: 'Substack',
        cost: 10.00,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'News & Media',
        description: 'Substack newsletter subscription'
      }
    },
    {
      keywords: ['xbox', 'game pass'],
      data: {
        name: 'Xbox Game Pass',
        cost: 14.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Entertainment',
        description: 'Xbox Game Pass subscription'
      }
    },
    {
      keywords: ['playstation', 'ps plus', 'ps+'],
      data: {
        name: 'PlayStation Plus',
        cost: 9.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Entertainment',
        description: 'PlayStation Plus subscription'
      }
    },
    {
      keywords: ['nintendo', 'switch online'],
      data: {
        name: 'Nintendo Switch Online',
        cost: 3.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Entertainment',
        description: 'Nintendo Switch Online subscription'
      }
    },
    {
      keywords: ['discord', 'nitro'],
      data: {
        name: 'Discord Nitro',
        cost: 9.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Social Media',
        description: 'Discord Nitro subscription'
      }
    },
    {
      keywords: ['telegram', 'premium'],
      data: {
        name: 'Telegram Premium',
        cost: 4.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'Social Media',
        description: 'Telegram Premium subscription'
      }
    }
  ];

  const analyzeImage = async (file: File): Promise<ExtractedSubscriptionData | null> => {
    setLoading(true);
    setError(null);

    try {
      // Extract text from file name and type
      const fileName = file.name.toLowerCase();
      const fileType = file.type;
      
      // Create a reader to extract text from the file if possible
      const reader = new FileReader();
      
      // Process the file based on its type
      if (fileType.startsWith('image/')) {
        // For images, we'll use the file name and try to match it with our database
        return await processImageFile(file, fileName);
      } else if (fileType === 'application/pdf') {
        // For PDFs, we'll try to extract text content
        return await processPdfFile(file);
      } else if (fileType === 'text/plain') {
        // For text files, we'll read the content
        return await processTextFile(file);
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

  const processImageFile = async (file: File, fileName: string): Promise<ExtractedSubscriptionData> => {
    // Try to match the file name with our database
    let matchedService: ServiceData | undefined;
    
    // First, try to find an exact match
    for (const service of serviceDatabase) {
      if (service.keywords.some(keyword => fileName.includes(keyword))) {
        matchedService = service;
        break;
      }
    }
    
    // If no exact match, try to find a partial match
    if (!matchedService) {
      // Extract words from the file name
      const words = fileName.replace(/[^a-zA-Z0-9]/g, ' ').split(' ').filter(word => word.length > 2);
      
      // Try to match each word with our database
      for (const word of words) {
        const matchingService = serviceDatabase.find(service => 
          service.keywords.some(keyword => keyword.includes(word) || word.includes(keyword))
        );
        
        if (matchingService) {
          matchedService = matchingService;
          break;
        }
      }
    }

    // If we found a match, return the data with a next billing date
    if (matchedService) {
      return {
        ...matchedService.data,
        nextBilling: getNextMonthDate()
      };
    }

    // If no match was found, try to extract information from the file name
    const costMatch = fileName.match(/\$?(\d+(\.\d{1,2})?)/);
    const cost = costMatch ? parseFloat(costMatch[1]) : 9.99;
    
    // Try to determine if it's monthly or annual
    const isAnnual = fileName.includes('annual') || 
                     fileName.includes('yearly') || 
                     fileName.includes('year') || 
                     fileName.includes('yr');
    
    // Try to extract a name from the file name
    let name = 'New Subscription';
    const nameMatch = fileName.match(/([a-zA-Z]+)/);
    if (nameMatch && nameMatch[1].length > 2) {
      name = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
    }

    // Return a generic subscription with extracted data
    return {
      name,
      cost,
      currency: 'USD',
      billingCycle: isAnnual ? 'annual' : 'monthly',
      nextBilling: getNextMonthDate(),
      category: 'Other',
      description: 'Subscription details'
    };
  };

  const processPdfFile = async (file: File): Promise<ExtractedSubscriptionData> => {
    // For PDFs, we'll try to extract information from the file name
    const fileName = file.name.toLowerCase();
    
    // Try to match the file name with our database
    for (const service of serviceDatabase) {
      if (service.keywords.some(keyword => fileName.includes(keyword))) {
        return {
          ...service.data,
          nextBilling: getNextMonthDate()
        };
      }
    }

    // If no match was found, return a generic subscription
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
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          if (!text) {
            throw new Error('Failed to read text file');
          }
          
          // Try to extract subscription information from the text
          const textLower = text.toLowerCase();
          
          // Try to match with our database
          for (const service of serviceDatabase) {
            if (service.keywords.some(keyword => textLower.includes(keyword))) {
              resolve({
                ...service.data,
                nextBilling: getNextMonthDate()
              });
              return;
            }
          }
          
          // Try to extract cost
          const costMatch = text.match(/\$?(\d+(\.\d{1,2})?)/);
          const cost = costMatch ? parseFloat(costMatch[1]) : 14.99;
          
          // Try to determine if it's monthly or annual
          const isAnnual = textLower.includes('annual') || 
                           textLower.includes('yearly') || 
                           textLower.includes('year') || 
                           textLower.includes('yr');
          
          // Try to extract a name
          let name = 'Text Document Subscription';
          const lines = text.split('\n');
          if (lines.length > 0 && lines[0].trim().length > 0) {
            name = lines[0].trim();
          }
          
          resolve({
            name,
            cost,
            currency: 'USD',
            billingCycle: isAnnual ? 'annual' : 'monthly',
            nextBilling: getNextMonthDate(),
            category: 'Other',
            description: 'Subscription from text document'
          });
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read text file'));
      };
      
      reader.readAsText(file);
    });
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