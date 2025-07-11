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

    if (!sendgridApiKey || !senderEmail) {
      return new Response(JSON.stringify({ error: 'SendGrid API key or sender email not configured in Supabase secrets.' }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      });
    }

    sgMail.setApiKey(sendgridApiKey);

    const msg = {
      to: to,
      from: senderEmail, // Use the email address verified in SendGrid
      subject: subject,
      html: htmlContent,
    };

    await sgMail.send(msg);

    return new Response(JSON.stringify({ message: 'Email sent successfully' }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      },
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      },
    });
  }
});