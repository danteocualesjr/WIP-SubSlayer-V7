// Test script to send a renewal notification email
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

async function sendTestEmail() {
  try {
    // Get the current session for authentication
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      console.error('No valid session found. Please sign in first.');
      return;
    }

    // Prepare email content
    const emailSubject = 'SubSlayer: Netflix Subscription Renewal';
    const nextBillingDate = new Date();
    nextBillingDate.setDate(nextBillingDate.getDate() + 3); // 3 days from now
    
    const emailHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #8B5CF6;">SubSlayer</h1>
          <p style="color: #666;">Your Subscription Management Assistant</p>
        </div>
        
        <div style="background-color: #f9f5ff; border-left: 4px solid #8B5CF6; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
          <h2 style="color: #4B5563; margin-top: 0;">Upcoming Subscription Renewal</h2>
          <p style="color: #4B5563;">Your <strong>Netflix</strong> subscription will renew in <strong>3 days</strong>.</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #4B5563;">Subscription Details:</h3>
          <ul style="color: #4B5563; padding-left: 20px;">
            <li><strong>Service:</strong> Netflix</li>
            <li><strong>Cost:</strong> $15.49</li>
            <li><strong>Renewal Date:</strong> ${nextBillingDate.toLocaleDateString()}</li>
            <li><strong>Billing Cycle:</strong> Monthly</li>
          </ul>
        </div>
        
        <div style="background-color: #f0f9ff; border-left: 4px solid #3B82F6; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
          <h3 style="color: #4B5563; margin-top: 0;">Need to cancel?</h3>
          <p style="color: #4B5563;">If you want to cancel this subscription, visit <a href="https://www.netflix.com/cancelplan" style="color: #3B82F6; text-decoration: none;">Netflix's cancellation page</a>.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.VITE_APP_URL || 'https://subslayer.app'}" style="background-color: #8B5CF6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Manage Your Subscriptions</a>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #6B7280; text-align: center;">
          <p>This is a test notification from SubSlayer.</p>
          <p>© 2025 SubSlayer. All rights reserved.</p>
        </div>
      </div>
    `;
    
    // Send the email
    const response = await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/send-renewal-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        to: 'danteocualesjr@gmail.com',
        subject: emailSubject,
        htmlContent: emailHtmlContent,
      }),
    });
    
    const result = await response.json();
    
    if (result.error) {
      console.error('Error sending email:', result.error);
      console.error('Details:', result.details);
    } else {
      console.log('Email sent successfully:', result.message);
    }
  } catch (error) {
    console.error('Error in test script:', error);
  }
}

sendTestEmail();