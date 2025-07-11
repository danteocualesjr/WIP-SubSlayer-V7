import fetch from 'node-fetch';

async function debugEmailFunction() {
  try {
    // Get the current session for authentication
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    
    if (!supabaseUrl) {
      console.error('Error: VITE_SUPABASE_URL environment variable is not set');
      return;
    }
    
    // Make a GET request to the debug endpoint
    const response = await fetch(`${supabaseUrl}/functions/v1/send-renewal-email?debug=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    console.log('Debug response:', JSON.stringify(result, null, 2));
    
    if (result.environment) {
      console.log('\nEnvironment check:');
      console.log('- SendGrid API Key configured:', result.environment.hasSendgridApiKey ? 'Yes' : 'No');
      console.log('- Sender Email configured:', result.environment.hasSenderEmail ? 'Yes' : 'No');
      console.log('- Sender Email domain:', result.environment.senderEmailDomain);
    }
    
  } catch (error) {
    console.error('Error debugging email function:', error);
  }
}

debugEmailFunction();