import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useSettings } from './useSettings';
import { Subscription } from '../types/subscription';
import { supabase } from '../lib/supabase';

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
    const newNotifications: NotificationItem[] = [];
    
    subscriptions.forEach(subscription => {
      if (subscription.status !== 'active') return;
      
      const renewalDate = new Date(subscription.nextBilling);
      const daysUntil = Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Check if we should notify about this subscription based on selected reminder day
      // Ensure reminderDays is treated as an array
      const reminderDaysArray = Array.isArray(settings.reminderDays) ? settings.reminderDays : [settings.reminderDays];
      if (reminderDaysArray.includes(daysUntil)) {
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
            
            // Send email notification if enabled
            if (settings.emailNotifications && user?.email) {
              const emailSubject = notification.title;
              const nextBillingDate = new Date();
              nextBillingDate.setDate(nextBillingDate.getDate() + (notification.daysUntil || 0));
              
              const emailHtmlContent = `
                <p>Hello,</p>
                <p>${notification.message}.</p>
                <p>Subscription: <strong>${notification.subscriptionName}</strong></p>
                <p>Cost: <strong>$${notification.amount?.toFixed(2)}</strong></p>
                <p>Next Billing Date: <strong>${nextBillingDate.toLocaleDateString()}</strong></p>
                <p>Manage your subscriptions in SubSlayer: <a href="${window.location.origin}">Go to SubSlayer</a></p>
                <p>Thank you,<br>The SubSlayer Team</p>
              `;
              
              // Get the current session for authentication
              supabase.auth.getSession().then(({ data: { session } }) => {
                if (session?.access_token) {
                  fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-renewal-email`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${session.access_token}`
                    },
                    body: JSON.stringify({
                      to: user.email,
                      subject: emailSubject,
                      htmlContent: emailHtmlContent,
                    }),
                  })
                  .then(response => response.json())
                  .then(data => {
                    if (data.error) {
                      console.error('Error sending email:', data.error);
                    } else {
                      console.log('Email sent successfully:', data.message);
                    }
                  })
                  .catch(error => console.error('Network error sending email:', error));
                }
              });
            }
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