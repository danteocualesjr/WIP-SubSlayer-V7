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
      // Convert file to base64
      const base64 = await fileToBase64(file);
      
      // Use a combination of OCR and pattern matching to extract subscription data
      const extractedText = await extractTextFromImage(base64);
      const subscriptionData = parseSubscriptionData(extractedText);
      
      return subscriptionData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze image';
      setError(errorMessage);
      console.error('Image analysis error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const extractTextFromImage = async (base64Image: string): Promise<string> => {
    // For now, we'll use a simple pattern matching approach
    // In a production environment, you would integrate with OCR services like:
    // - Google Cloud Vision API
    // - AWS Textract
    // - Azure Computer Vision
    // - Tesseract.js for client-side OCR
    
    // Simulate OCR extraction with common subscription patterns
    // This is a placeholder that would be replaced with actual OCR
    return simulateOCRExtraction(base64Image);
  };

  const simulateOCRExtraction = (base64Image: string): string => {
    // This is a simulation - in reality, you'd call an OCR service
    // For demo purposes, we'll return some sample text that might be found in subscription screenshots
    const sampleTexts = [
      "Netflix Premium Plan $15.99/month Next billing: January 15, 2024",
      "Spotify Premium $9.99 monthly subscription Renews: Feb 1, 2024",
      "Adobe Creative Cloud $52.99/month Professional plan Next payment: March 10, 2024",
      "Microsoft 365 Personal $6.99/month Annual billing: $69.99 Expires: April 20, 2024",
      "Disney+ Premium $7.99 per month Entertainment subscription Next billing date: May 5, 2024"
    ];
    
    // Return a random sample for demo purposes
    return sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
  };

  const parseSubscriptionData = (text: string): ExtractedSubscriptionData => {
    const data: ExtractedSubscriptionData = {};

    // Extract service name (common patterns)
    const namePatterns = [
      /^([A-Za-z\s]+?)(?:\s+(?:Premium|Pro|Plus|Basic|Standard|Plan))/i,
      /^([A-Za-z\s]+?)(?:\s+\$)/i,
      /(Netflix|Spotify|Adobe|Microsoft|Disney|Apple|Google|Amazon|Hulu|HBO|Paramount|Peacock|Discovery|Crunchyroll|YouTube|Twitch|Zoom|Slack|Notion|Figma|Canva|Dropbox|OneDrive|iCloud)/i
    ];

    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match) {
        data.name = match[1]?.trim() || match[0]?.trim();
        break;
      }
    }

    // Extract cost and currency
    const costPatterns = [
      /\$(\d+\.?\d*)/,
      /(\d+\.?\d*)\s*(?:USD|dollars?)/i,
      /€(\d+\.?\d*)/,
      /£(\d+\.?\d*)/,
      /(\d+\.?\d*)\s*(?:EUR|euros?)/i,
      /(\d+\.?\d*)\s*(?:GBP|pounds?)/i
    ];

    for (const pattern of costPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.cost = parseFloat(match[1]);
        
        // Determine currency from pattern
        if (text.includes('$') || /USD|dollars?/i.test(text)) {
          data.currency = 'USD';
        } else if (text.includes('€') || /EUR|euros?/i.test(text)) {
          data.currency = 'EUR';
        } else if (text.includes('£') || /GBP|pounds?/i.test(text)) {
          data.currency = 'GBP';
        } else {
          data.currency = 'USD'; // Default
        }
        break;
      }
    }

    // Extract billing cycle
    if (/annual|yearly|year/i.test(text)) {
      data.billingCycle = 'annual';
    } else if (/month|monthly/i.test(text)) {
      data.billingCycle = 'monthly';
    }

    // Extract next billing date
    const datePatterns = [
      /(?:next billing|renews?|expires?|payment).*?(\d{1,2}\/\d{1,2}\/\d{4})/i,
      /(?:next billing|renews?|expires?|payment).*?(\d{4}-\d{2}-\d{2})/i,
      /(?:next billing|renews?|expires?|payment).*?(\w+ \d{1,2}, \d{4})/i,
      /(\d{1,2}\/\d{1,2}\/\d{4})/,
      /(\d{4}-\d{2}-\d{2})/,
      /(\w+ \d{1,2}, \d{4})/
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        const dateStr = match[1];
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          data.nextBilling = parsedDate.toISOString().split('T')[0];
          break;
        }
      }
    }

    // If no date found, default to next month
    if (!data.nextBilling) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      data.nextBilling = nextMonth.toISOString().split('T')[0];
    }

    // Determine category based on service name
    if (data.name) {
      const name = data.name.toLowerCase();
      if (/netflix|disney|hulu|hbo|paramount|peacock|discovery|crunchyroll|prime video/i.test(name)) {
        data.category = 'Entertainment';
      } else if (/spotify|apple music|youtube music|tidal|amazon music/i.test(name)) {
        data.category = 'Music';
      } else if (/adobe|figma|canva|sketch/i.test(name)) {
        data.category = 'Design';
      } else if (/microsoft|google|notion|slack|zoom|dropbox|onedrive|icloud/i.test(name)) {
        data.category = 'Productivity';
      } else if (/github|vercel|netlify|aws|azure/i.test(name)) {
        data.category = 'Development';
      } else {
        data.category = 'Other';
      }
    }

    // Generate description
    if (data.name && data.cost && data.billingCycle) {
      data.description = `${data.name} subscription - ${data.billingCycle} billing`;
    }

    return data;
  };

  return {
    analyzeImage,
    loading,
    error,
  };
}