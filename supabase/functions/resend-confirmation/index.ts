import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

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

    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      });
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Supabase configuration missing' }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the user by email
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      });
    }

    // Call the resend_confirmation_email function
    const { data, error } = await supabase.rpc('resend_confirmation_email', {
      user_id_input: userData.id
    });

    if (error) {
      return new Response(JSON.stringify({ error: 'Failed to resend confirmation email' }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        },
      });
    }

    return new Response(JSON.stringify({ message: 'Confirmation email resent successfully' }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      },
    });
  } catch (error) {
    console.error('Error resending confirmation email:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      },
    });
  }
});