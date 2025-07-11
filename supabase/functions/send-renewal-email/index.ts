import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import sgMail from 'npm:@sendgrid/mail';

// For debugging
const DEBUG = true;

const corsHeaders = {
  
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
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

    // Debug endpoint to check environment variables
    if (DEBUG || req.method === 'GET' || (req.method === 'POST' && req.url.includes('debug'))) {
      const params = new URL(req.url).searchParams;
      const body = req.method === 'POST' ? await req.json() : {};
      const isDebug = DEBUG || params.get('debug') === 'true' || body.debug === true;
      
      if (isDebug) {
        
        const envVars = {
          hasSendgridApiKey: !!Deno.env.get('SENDGRID_API_KEY'),
          hasSenderEmail: !!Deno.env.get('SENDER_EMAIL'),
          sendgridKeyLength: Deno.env.get('SENDGRID_API_KEY')?.length || 0,
          senderEmailDomain: Deno.env.get('SENDER_EMAIL')?.split('@')[1] || 'not-set',
          senderEmail: Deno.env.get('SENDER_EMAIL') || 'not-set',
        };
        
        return new Response(JSON.stringify({
          status: 'debug',
          environment: envVars,
          message: 'Debug information. This does not expose actual secret values.'
        }), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          },
        });
      }
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: corsHeaders
      });
    }

    const { to, subject, htmlContent } = await req.json();

    if (!to || !subject || !htmlContent) {
      return new Response(JSON.stringify({ error: 'Missing required fields: to, subject, htmlContent' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      });
    }

    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY');
    const senderEmail = Deno.env.get('SENDER_EMAIL');

    // Log for debugging
    console.log(`SendGrid API Key exists: ${!!sendgridApiKey}`);
    console.log(`Sender Email: ${senderEmail}`);

    if (!sendgridApiKey || !senderEmail) {
      return new Response(JSON.stringify({ 
        error: 'SendGrid API key or sender email not configured in Supabase secrets.',
        missing: {
          sendgridApiKey: !sendgridApiKey,
          senderEmail: !senderEmail
        }
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      });
    }

    sgMail.setApiKey(sendgridApiKey);
    
    // Use a fallback email if needed for testing
    const toEmail = to || 'test@example.com';

    const msg = {
      to: toEmail,
      from: senderEmail, // Use the email address verified in SendGrid
      subject: subject,
      html: htmlContent,
    };

    try {
      console.log(`Attempting to send email to: ${toEmail}`);
      await sgMail.send(msg);
      console.log('Email sent successfully');
      return new Response(JSON.stringify({ message: 'Email sent successfully' }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      });
    } catch (sendError) {
      console.error('SendGrid error:', sendError);
      
      // More detailed error logging
      if (sendError.response) {
        console.error('SendGrid response body:', sendError.response.body);
      }
      
      return new Response(JSON.stringify({ 
        error: 'Failed to send email via SendGrid',
        details: sendError.message,
        response: sendError.response?.body || null
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    
    // More detailed error logging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      name: error.name
    };
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: errorDetails,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      },
    });
  }
});