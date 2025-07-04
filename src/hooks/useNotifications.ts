import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useSettings } from './useSettings';
import { Subscription } from '../types/subscription';

export interface NotificationItem {
  id: string;
  type: 'renewal' | 'overdue' | 'savings' | 'digest';
  title: string;
  message: string;
  subscriptionId?: string;
  subscriptionName?: string;
  amount?: number;
  daysUntil?: number;
  urgent: boolean;
  read: boolean;
  createdAt: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadNotifications();
    } else {
      setNotifications([]);
      setLoading(false);
    }
  }, [user]);

  const loadNotifications = () => {
    try {
      setLoading(true);
      const savedNotifications = localStorage.getItem(`notifications_${user?.id}`);
      
      if (savedNotifications) {
        const parsedNotifications = JSON.parse(savedNotifications);
        setNotifications(parsedNotifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveNotifications = (newNotifications: NotificationItem[]) => {
    if (!user) return;
    
    try {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(newNotifications));
      setNotifications(newNotifications);
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  const generateRenewalNotifications = (subscriptions: Subscription[]) => {
    if (!user || !settings.emailNotifications) return;

    const now = new Date();
    const reminderThreshold = new Date(now.getTime() + settings.reminderDays * 24 * 60 * 60 * 1000);
    
    const newNotifications: NotificationItem[] = [];
    
    subscriptions.forEach(subscription => {
      if (subscription.status !== 'active') return;
      
      const renewalDate = new Date(subscription.nextBilling);
      const daysUntil = Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Check if we should notify about this subscription
      if (daysUntil <= settings.reminderDays && daysUntil >= 0) {
        // Check if we already have a notification for this subscription and timeframe
        const existingNotification = notifications.find(n => 
          n.subscriptionId === subscription.id && 
          n.type === 'renewal' && 
          Math.abs((n.daysUntil || 0) - daysUntil) <= 1
        );
        
        if (!existingNotification) {
          const isUrgent = daysUntil <= 3;
          
          newNotifications.push({
            id: `renewal-${subscription.id}-${daysUntil}`,
            type: 'renewal',
            title: `${subscription.name} renewal ${daysUntil === 0 ? 'today' : `in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`}`,
            message: `Your ${subscription.name} subscription will renew ${daysUntil === 0 ? 'today' : `in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`} for $${subscription.cost.toFixed(2)}`,
            subscriptionId: subscription.id,
            subscriptionName: subscription.name,
            amount: subscription.cost,
            daysUntil,
            urgent: isUrgent,
            read: false,
            createdAt: new Date().toISOString(),
          });
        }
      }
      
      // Check for overdue subscriptions
      if (daysUntil < 0) {
        const existingOverdue = notifications.find(n => 
          n.subscriptionId === subscription.id && 
          n.type === 'overdue'
        );
        
        if (!existingOverdue) {
          newNotifications.push({
            id: `overdue-${subscription.id}`,
            type: 'overdue',
            title: `${subscription.name} payment overdue`,
            message: `Your ${subscription.name} subscription payment is ${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? '' : 's'} overdue`,
            subscriptionId: subscription.id,
            subscriptionName: subscription.name,
            amount: subscription.cost,
            daysUntil,
            urgent: true,
            read: false,
            createdAt: new Date().toISOString(),
          });
        }
      }
    });
    
    if (newNotifications.length > 0) {
      const updatedNotifications = [...notifications, ...newNotifications];
      saveNotifications(updatedNotifications);
      
      // Send browser notifications if enabled
      if (settings.pushNotifications) {
        newNotifications.forEach(notification => {
          sendBrowserNotification(notification);
        });
      }
    }
  };

  const sendBrowserNotification = (notification: NotificationItem) => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/vite.svg',
          badge: '/vite.svg',
          tag: notification.id,
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/vite.svg',
              badge: '/vite.svg',
              tag: notification.id,
            });
          }
        });
      }
    }
  };

  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    saveNotifications(updatedNotifications);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updatedNotifications);
  };

  const deleteNotification = (id: string) => {
    const updatedNotifications = notifications.filter(n => n.id !== id);
    saveNotifications(updatedNotifications);
  };

  const clearAllNotifications = () => {
    saveNotifications([]);
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const getUrgentNotifications = () => {
    return notifications.filter(n => n.urgent && !n.read);
  };

  return {
    notifications,
    loading,
    generateRenewalNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getUnreadCount,
    getUrgentNotifications,
    sendBrowserNotification,
  };
}