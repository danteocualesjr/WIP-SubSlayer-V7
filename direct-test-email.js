import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

async function sendTestEmail() {
  try {
    // Get environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Error: Supabase environment variables are not set');
      return;
    }
    
    console.log('Supabase URL:', supabaseUrl);
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get the current session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      console.error('No valid session found. Please sign in first.');
      return;
    }
    
    console.log('Session found, user is authenticated');
    
    // Prepare email content
    const emailSubject = 'SubSlayer: Test Email';
    
    const emailHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #8B5CF6;">SubSlayer</h1>
          <p style="color: #666;">Test Email</p>
        </div>
        
        <div style="background-color: #f9f5ff; border-left: 4px solid #8B5CF6; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
          <h2 style="color: #4B5563; margin-top: 0;">This is a test email</h2>
          <p style="color: #4B5563;">If you're receiving this, your email configuration is working correctly!</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${supabaseUrl}" style="background-color: #8B5CF6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to SubSlayer</a>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #6B7280; text-align: center;">
          <p>This is a test email from SubSlayer.</p>
          <p>© 2025 SubSlayer. All rights reserved.</p>
        </div>
      </div>
    `;
    
    console.log('Sending test email to: danteocualesjr@gmail.com');
    
    // Send the email
    const response = await fetch(`${supabaseUrl}/functions/v1/send-renewal-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        to: 'danteocualesjr@gmail.com',
        subject: emailSubject,
        htmlContent: emailHtmlContent,
        debug: true
      }),
    });
    
    if (!response.ok) {
      console.error('Error response status:', response.status);
      console.error('Error response text:', await response.text());
      return;
    }
    
    const result = await response.json();
    
    if (result.error) {
      console.error('Error sending email:', result.error);
      console.error('Details:', result.details);
      
      if (result.missing) {
        console.error('Missing configuration:', result.missing);
      }
      
      if (result.response) {
        console.error('SendGrid response:', result.response);
      }
    } else {
      console.log('Email sent successfully:', result.message);
    }
  } catch (error) {
    console.error('Error in test script:', error);
  }
}

sendTestEmail();
async function sendTestEmail() {
  try {
    // Get environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Error: Supabase environment variables are not set');
      return;
    }
    
    console.log('Supabase URL:', supabaseUrl);
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get the current session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      console.error('No valid session found. Please sign in first.');
      return;
    }
    
    console.log('Session found, user is authenticated');
    
    // Prepare email content
    const emailSubject = 'SubSlayer: Test Email';
    
    const emailHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #8B5CF6;">SubSlayer</h1>
          <p style="color: #666;">Test Email</p>
        </div>
        
        <div style="background-color: #f9f5ff; border-left: 4px solid #8B5CF6; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
          <h2 style="color: #4B5563; margin-top: 0;">This is a test email</h2>
          <p style="color: #4B5563;">If you're receiving this, your email configuration is working correctly!</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${supabaseUrl}" style="background-color: #8B5CF6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to SubSlayer</a>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #6B7280; text-align: center;">
          <p>This is a test email from SubSlayer.</p>
          <p>© 2025 SubSlayer. All rights reserved.</p>
        </div>
      </div>
    `;
    
    console.log('Sending test email to: danteocualesjr@gmail.com');
    
    // Send the email
    const response = await fetch(`${supabaseUrl}/functions/v1/send-renewal-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        to: 'danteocualesjr@gmail.com',
        subject: emailSubject,
        htmlContent: emailHtmlContent,
        debug: true
      }),
    });
    
    if (!response.ok) {
      console.error('Error response status:', response.status);
      console.error('Error response text:', await response.text());
      return;
    }
    
    const result = await response.json();
    
    if (result.error) {
      console.error('Error sending email:', result.error);
      console.error('Details:', result.details);
      
      if (result.missing) {
        console.error('Missing configuration:', result.missing);
      }
      
      if (result.response) {
        console.error('SendGrid response:', result.response);
      }
    } else {
      console.log('Email sent successfully:', result.message);
    }
  } catch (error) {
    console.error('Error in test script:', error);
  }
}

sendTestEmail();