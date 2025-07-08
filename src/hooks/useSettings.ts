import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { SETTINGS_STORAGE_PREFIX } from '../lib/constants';

export interface AppSettings {
  currency: string;
  dateFormat: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  monthlyReport: boolean;
  dataSharing: boolean;
  analytics: boolean;
  reminderDays: number;
}

const defaultSettings: AppSettings = {
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  theme: 'light',
  language: 'en',
  timezone: 'America/New_York',
  emailNotifications: true,
  pushNotifications: true,
  weeklyDigest: true,
  monthlyReport: true,
  dataSharing: false,
  analytics: true,
  reminderDays: 7,
};

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Load settings on mount and when user changes
  useEffect(() => {
    if (user) {
      loadSettings();
    } else if (!user) {
      setSettings(defaultSettings);
      setLoading(false);
    }
  }, [user]);

  // Apply theme changes to document
  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  const loadSettings = () => {
    try {
      setLoading(true);
      const savedSettings = localStorage.getItem(`${SETTINGS_STORAGE_PREFIX}${user?.id}`);
      
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      } else {
        // Try legacy storage key
        const legacySettings = localStorage.getItem(`settings_${user?.id}`);
        if (legacySettings) {
          try {
            const parsedSettings = JSON.parse(legacySettings);
            setSettings({ ...defaultSettings, ...parsedSettings });
            
            // Migrate to new key format
            localStorage.setItem(`${SETTINGS_STORAGE_PREFIX}${user?.id}`, legacySettings);
            console.log('Migrated settings to new storage key format');
          } catch (e) {
            console.warn('Failed to parse legacy settings:', e);
            setSettings(defaultSettings);
          }
        } else {
          setSettings(defaultSettings);
        }
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = (newSettings: Partial<AppSettings>) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      localStorage.setItem(`${SETTINGS_STORAGE_PREFIX}${user.id}`, JSON.stringify(updatedSettings));
      
      // Also update legacy storage for backward compatibility
      localStorage.setItem(`settings_${user.id}`, JSON.stringify(updatedSettings));
      
      // Apply theme immediately if changed
      if (newSettings.theme) {
        applyTheme(newSettings.theme);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error saving settings:', error);
      return { success: false, error: 'Failed to save settings' };
    }
  };

  const applyTheme = (theme: 'light' | 'dark' | 'auto') => {
    const root = document.documentElement;
    
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  };

  const resetSettings = () => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      setSettings(defaultSettings);
      localStorage.removeItem(`${SETTINGS_STORAGE_PREFIX}${user.id}`);
      localStorage.removeItem(`settings_${user.id}`); // Also remove legacy storage
      applyTheme(defaultSettings.theme);
      return { success: true };
    } catch (error) {
      console.error('Error resetting settings:', error);
      return { success: false, error: 'Failed to reset settings' };
    }
  };

  const exportData = () => {
    try {
      const data = {
        settings,
        exportDate: new Date().toISOString(),
        userId: user?.id,
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subslayer-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Error exporting data:', error);
      return { success: false, error: 'Failed to export data' };
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    
    switch (settings.dateFormat) {
      case 'DD/MM/YYYY':
        return d.toLocaleDateString('en-GB');
      case 'YYYY-MM-DD':
        return d.toISOString().split('T')[0];
      case 'MMMM DD, YYYY':
        return d.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'MM/DD/YYYY':
      default:
        return d.toLocaleDateString('en-US');
    }
  };

  const formatCurrency = (amount: number) => {
    const currencyMap: Record<string, { symbol: string; locale: string }> = {
      USD: { symbol: '$', locale: 'en-US' },
      EUR: { symbol: '€', locale: 'de-DE' },
      GBP: { symbol: '£', locale: 'en-GB' },
      JPY: { symbol: '¥', locale: 'ja-JP' },
      CAD: { symbol: 'C$', locale: 'en-CA' },
      AUD: { symbol: 'A$', locale: 'en-AU' },
    };

    const currency = currencyMap[settings.currency] || currencyMap.USD;
    
    try {
      return new Intl.NumberFormat(currency.locale, {
        style: 'currency',
        currency: settings.currency,
      }).format(amount);
    } catch {
      return `${currency.symbol}${amount.toFixed(2)}`;
    }
  };

  return {
    settings,
    loading,
    saveSettings,
    resetSettings,
    exportData,
    formatDate,
    formatCurrency,
    refetch: loadSettings,
  };
}