// Script to send test email notifications
const sendTestEmails = async () => {
  try {
    const recipients = [
      'danteocualesjr@gmail.com',
      'dante@nativestack.ai'
    ];
    
    // Get the current date and add 3 days
    const now = new Date();
    const renewalDate = new Date(now);
    renewalDate.setDate(now.getDate() + 3);
    
    // Format the date for display
    const formattedDate = renewalDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Example subscription details
    const subscription = {
      name: "Netflix Premium",
      cost: 19.99,
      billingCycle: "monthly",
      nextBilling: renewalDate.toISOString().split('T')[0]
    };
    
    console.log('Sending test emails to:', recipients.join(', '));
    
    // Send emails to each recipient
    for (const recipient of recipients) {
      const emailSubject = `Subscription Renewal Reminder: ${subscription.name}`;
      
      const emailHtmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #8B5CF6; margin-bottom: 10px;">SubSlayer</h1>
            <p style="color: #6B7280; font-size: 16px;">Your Subscription Management Assistant</p>
          </div>
          
          <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1F2937; margin-top: 0;">Important Reminder</h2>
            <p style="color: #4B5563; font-size: 16px;">Your <strong>${subscription.name}</strong> subscription is renewing in <strong>3 days</strong> on ${formattedDate}.</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #1F2937; margin-bottom: 10px;">Subscription Details:</h3>
            <ul style="color: #4B5563; padding-left: 20px;">
              <li><strong>Service:</strong> ${subscription.name}</li>
              <li><strong>Amount:</strong> $${subscription.cost.toFixed(2)}</li>
              <li><strong>Billing Cycle:</strong> ${subscription.billingCycle}</li>
              <li><strong>Next Billing Date:</strong> ${formattedDate}</li>
            </ul>
          </div>
          
          <div style="background-color: #EEF2FF; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #4F46E5; font-size: 16px;">
              <strong>Need to cancel?</strong> Make sure to do it before the renewal date to avoid being charged.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #6B7280; font-size: 14px;">
              This is a test email sent from SubSlayer. If you received this by mistake, please ignore it.
            </p>
          </div>
        </div>
      `;
      
      console.log(`Sending email to ${recipient}...`);
      
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-renewal-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            to: recipient,
            subject: emailSubject,
            htmlContent: emailHtmlContent,
          }),
        });
        
        const result = await response.json();
        
        if (result.error) {
          console.error(`Error sending email to ${recipient}:`, result.error);
        } else {
          console.log(`✅ Email sent successfully to ${recipient}`);
        }
      } else {
        console.error('No valid session found. Please sign in first.');
      }
    }
  } catch (error) {
    console.error('Error sending test emails:', error);
  }
};

// Import Supabase client
import { supabase } from './src/lib/supabase.ts';

// Execute the function
sendTestEmails();