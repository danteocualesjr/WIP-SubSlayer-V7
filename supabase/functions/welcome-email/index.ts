import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import sgMail from 'npm:@sendgrid/mail';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req) => {
  try {
    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      });
    }

    const { email, name } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      });
    }

    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY');
    const senderEmail = Deno.env.get('SENDER_EMAIL');

    if (!sendgridApiKey || !senderEmail) {
      console.warn('SendGrid not configured - skipping welcome email');
      return new Response(JSON.stringify({ 
        message: 'Welcome email skipped - SendGrid not configured',
        missing: {
          sendgridApiKey: !sendgridApiKey,
          senderEmail: !senderEmail
        }
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      });
    }

    sgMail.setApiKey(sendgridApiKey);
    
    // Generate confirmation token (in a real app, you'd store this in the database)
    const confirmationToken = crypto.randomUUID();
    const appUrl = Deno.env.get('APP_URL') || 'https://subslayer.app';
    const confirmationUrl = `${appUrl}/confirm?token=${confirmationToken}`;
    
    // Create welcome email HTML content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #8B5CF6;">Welcome to SubSlayer!</h1>
          <p style="color: #666;">Your Subscription Management Assistant</p>
        </div>
        
        <div style="background-color: #f9f5ff; border-left: 4px solid #8B5CF6; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
          <h2 style="color: #4B5563; margin-top: 0;">Thanks for signing up!</h2>
          <p style="color: #4B5563;">We're excited to help you take control of your subscriptions and save money.</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #4B5563;">Please confirm your email address</h3>
          <p style="color: #4B5563;">Click the button below to confirm your email address and activate your account:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" style="background-color: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Confirm Email Address</a>
          </div>
          
          <p style="color: #4B5563; font-size: 14px;">Or copy and paste this URL into your browser:</p>
          <p style="color: #4B5563; font-size: 14px; word-break: break-all;">${confirmationUrl}</p>
        </div>
        
        <div style="background-color: #f0f9ff; border-left: 4px solid #3B82F6; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
          <h3 style="color: #4B5563; margin-top: 0;">What's next?</h3>
          <ul style="color: #4B5563;">
            <li>Add your first subscription</li>
            <li>Set up renewal reminders</li>
            <li>Track your monthly spending</li>
            <li>Discover potential savings</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${appUrl}" style="background-color: #8B5CF6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Get Started</a>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #6B7280; text-align: center;">
          <p>© 2025 SubSlayer. All rights reserved.</p>
          <p>If you didn't create this account, please ignore this email.</p>
        </div>
      </div>
    `;
    
    const msg = {
      to: email,
      from: senderEmail,
      subject: 'Welcome to SubSlayer - Please Confirm Your Email',
      html: htmlContent,
    };

    try {
      await sgMail.send(msg);
      console.log('Welcome email sent successfully to:', email);
      return new Response(JSON.stringify({ message: 'Welcome email sent successfully' }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      });
    } catch (sendError) {
      console.error('SendGrid error:', sendError);
      
      // Don't fail the signup process if email sending fails
      return new Response(JSON.stringify({ 
        message: 'User created successfully, but welcome email failed to send',
        details: sendError.message,
        response: sendError.response?.body || null
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      });
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
    
    // Don't fail the signup process if there's an unexpected error
    return new Response(JSON.stringify({ 
      message: 'User created successfully, but welcome email encountered an error',
      details: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      },
    });
  }
});