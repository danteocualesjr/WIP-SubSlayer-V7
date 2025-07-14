import { createClient } from '@supabase/supabase-js';

async function testWelcomeEmail() {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Call the welcome-email function directly
    const response = await fetch(`${supabaseUrl}/functions/v1/welcome-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({
        email: 'danteocualesjr@gmail.com',
        name: 'Dante'
      }),
    });
    
    const result = await response.json();
    
    if (result.error) {
      console.error('Error sending welcome email:', result.error);
      console.error('Details:', result.details);
    } else {
      console.log('Welcome email sent successfully:', result.message);
    }
  } catch (error) {
    console.error('Error in test script:', error);
  }
}

testWelcomeEmail();