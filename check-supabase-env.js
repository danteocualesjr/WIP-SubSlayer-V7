import fetch from 'node-fetch';

async function checkSupabaseEnv() {
  try {
    // Get environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    
    if (!supabaseUrl) {
      console.error('Error: VITE_SUPABASE_URL environment variable is not set');
      return;
    }
    
    console.log('Checking Supabase environment variables...');
    console.log('Supabase URL:', supabaseUrl);
    
    // Make a GET request to the debug endpoint
    const response = await fetch(`${supabaseUrl}/functions/v1/send-renewal-email?debug=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('Error response status:', response.status);
      console.error('Error response text:', await response.text());
      return;
    }
    
    const result = await response.json();
    
    console.log('\nDebug response:', JSON.stringify(result, null, 2));
    
    if (result.environment) {
      console.log('\nEnvironment check:');
      console.log('- SendGrid API Key configured:', result.environment.hasSendgridApiKey ? 'Yes' : 'No');
      console.log('- Sender Email configured:', result.environment.hasSenderEmail ? 'Yes' : 'No');
      console.log('- Sender Email domain:', result.environment.senderEmailDomain);
      console.log('- Sender Email:', result.environment.senderEmail);
    }
    
  } catch (error) {
    console.error('Error checking Supabase environment:', error);
  }
}

checkSupabaseEnv();